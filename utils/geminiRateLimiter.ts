/**
 * In-memory rate limiter for Gemini API by model: enforces RPM, TPM, RPD per tier (0=free, 1=paid).
 * Call checkLimit() before a request; call recordUsage() after success. Keeps spending under control.
 */

import { getModelLimit, getTextModelOrder } from './geminiTierLimits';

interface UsageEntry {
  ts: number;
  tokens: number;
}

const MS_PER_MIN = 60_000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Per-model: rolling window of { ts, tokens }
const requestLog: Record<string, UsageEntry[]> = {};

function normalizeModelId(modelId: string): string {
  return modelId.replace(/^models\//, '').trim();
}

function getOrCreateLog(modelId: string): UsageEntry[] {
  const key = normalizeModelId(modelId);
  if (!requestLog[key]) requestLog[key] = [];
  return requestLog[key];
}

function prune(modelId: string, limit: { rpm: number; tpm: number; rpd: number }) {
  const log = getOrCreateLog(modelId);
  const now = Date.now();
  const oneDayAgo = now - MS_PER_DAY;
  const kept = log.filter((e) => e.ts > oneDayAgo);
  requestLog[normalizeModelId(modelId)] = kept.sort((a, b) => a.ts - b.ts);
}

export interface LimitCheckResult {
  allowed: boolean;
  /** If over RPM, wait this many ms then retry. */
  waitMs?: number;
  /** Reason (for logging). */
  reason?: string;
}

/**
 * Check if a request to this model is within limits. Call before generateContent.
 * Enforces RPM, TPM, RPD when the current tier has limits for this model (tier 0 = free, tier 1 = paid).
 */
export function checkLimit(modelId: string): LimitCheckResult {
  const limit = getModelLimit(modelId);
  if (!limit) return { allowed: true };

  const key = normalizeModelId(modelId);
  const log = getOrCreateLog(modelId);
  const now = Date.now();
  const oneMinAgo = now - MS_PER_MIN;
  const oneDayAgo = now - MS_PER_DAY;

  const inLastMin = log.filter((e) => e.ts > oneMinAgo);
  const inLastDay = limit.rpd === Infinity ? [] : log.filter((e) => e.ts > oneDayAgo);

  if (limit.rpd !== Infinity && inLastDay.length >= limit.rpd) {
    return { allowed: false, reason: 'RPD' };
  }
  if (inLastMin.length >= limit.rpm) {
    const oldest = inLastMin[0];
    const waitMs = Math.ceil((oldest.ts + MS_PER_MIN - now) / 1000) * 1000;
    return { allowed: false, waitMs: Math.min(waitMs, 60_000), reason: 'RPM' };
  }
  const tokensLastMin = inLastMin.reduce((s, e) => s + e.tokens, 0);
  if (limit.tpm > 0 && tokensLastMin >= limit.tpm) {
    const oldest = inLastMin[0];
    const waitMs = Math.ceil((oldest.ts + MS_PER_MIN - now) / 1000) * 1000;
    return { allowed: false, waitMs: Math.min(waitMs, 60_000), reason: 'TPM' };
  }
  return { allowed: true };
}

/**
 * Record a successful request. Call after generateContent. Pass token counts if available (for TPM).
 */
export function recordUsage(
  modelId: string,
  inputTokens?: number,
  outputTokens?: number
): void {
  const limit = getModelLimit(modelId);
  if (!limit) return;

  const tokens = (inputTokens ?? 0) + (outputTokens ?? 0) || 500;
  const log = getOrCreateLog(modelId);
  log.push({ ts: Date.now(), tokens });
  prune(modelId, limit);
}

/**
 * Returns the first model in the preferred order that has headroom (under RPD, and optionally wait for RPM).
 * Use when you want to pick a model before calling the API so spending stays within limits.
 */
export function pickModelUnderLimit(
  preferredOrder: string[]
): { model: string; waitMs?: number } {
  const first = preferredOrder[0] ?? 'gemini-3-flash-preview';
  if (!getModelLimit(first)) {
    return { model: first };
  }
  for (const model of preferredOrder) {
    const check = checkLimit(model);
    if (check.allowed) return { model };
    if (check.reason === 'RPD') continue;
    if (check.reason === 'RPM' && check.waitMs != null) {
      return { model, waitMs: check.waitMs };
    }
  }
  return { model: preferredOrder[0] ?? 'gemini-3-flash-preview' };
}

/**
 * Wait if needed (RPM), then return the model to use. Call before generateContent.
 */
export async function waitIfNeededThenModel(
  preferredOrder: string[]
): Promise<string> {
  const { model, waitMs } = pickModelUnderLimit(preferredOrder);
  if (waitMs != null && waitMs > 0) {
    await new Promise((r) => setTimeout(r, waitMs));
    const again = checkLimit(model);
    if (again.allowed) return model;
    if (again.waitMs != null && again.waitMs > 0) {
      await new Promise((r) => setTimeout(r, again.waitMs));
    }
  }
  return model;
}
