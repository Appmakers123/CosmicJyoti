/**
 * In-memory rate limiter for Gemini API by model (RPM, TPM, RPD). Use when GEMINI_TIER=paid.
 * checkLimit(modelId) before request; recordUsage(modelId, inputTokens?, outputTokens?) after success.
 */

import { getModelLimit, getTextModelOrder, getGeminiTier } from './geminiTierLimits.js';

const MS_PER_MIN = 60_000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const requestLog = {};

function normalizeModelId(modelId) {
  return String(modelId).replace(/^models\//, '').trim();
}

function getOrCreateLog(modelId) {
  const key = normalizeModelId(modelId);
  if (!requestLog[key]) requestLog[key] = [];
  return requestLog[key];
}

function prune(modelId, limit) {
  const log = getOrCreateLog(modelId);
  const now = Date.now();
  const oneDayAgo = now - MS_PER_DAY;
  const kept = log.filter((e) => e.ts > oneDayAgo);
  requestLog[normalizeModelId(modelId)] = kept.sort((a, b) => a.ts - b.ts);
}

/**
 * Check if a request to this model is within limits. Returns { allowed, waitMs?, reason? }.
 * Enforces when current tier has limits for this model (0=free, 1=paid).
 */
export function checkLimit(modelId) {
  const limit = getModelLimit(modelId);
  if (!limit) return { allowed: true };

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
    const waitMs = Math.min(
      Math.ceil((oldest.ts + MS_PER_MIN - now) / 1000) * 1000,
      60_000
    );
    return { allowed: false, waitMs, reason: 'RPM' };
  }
  const tokensLastMin = inLastMin.reduce((s, e) => s + (e.tokens || 0), 0);
  if (limit.tpm > 0 && tokensLastMin >= limit.tpm) {
    const oldest = inLastMin[0];
    const waitMs = Math.min(
      Math.ceil((oldest.ts + MS_PER_MIN - now) / 1000) * 1000,
      60_000
    );
    return { allowed: false, waitMs, reason: 'TPM' };
  }
  return { allowed: true };
}

/**
 * Record a successful request. Call after generateContent.
 */
export function recordUsage(modelId, inputTokens, outputTokens) {
  const limit = getModelLimit(modelId);
  if (!limit) return;

  const tokens = (inputTokens ?? 0) + (outputTokens ?? 0) || 500;
  const log = getOrCreateLog(modelId);
  log.push({ ts: Date.now(), tokens });
  prune(modelId, limit);
}

export { getTextModelOrder };
