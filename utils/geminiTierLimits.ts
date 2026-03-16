/**
 * Gemini API tier and per-model rate limits (RPM, TPM, RPD).
 * GEMINI_TIER: 0 = free, 1 = paid (tier 1). Also accepts "free" | "paid".
 * Limits from Google AI Studio: free tier (first number) and paid tier (second number).
 * "Unlimited" stored as Infinity.
 */

export type GeminiTierNumber = 0 | 1;

export interface ModelLimit {
  rpm: number;
  tpm: number;
  rpd: number; // Infinity = Unlimited
}

/** Resolve tier from env: 0 | 1. GEMINI_TIER=0 or "free" → 0; GEMINI_TIER=1 or "paid" → 1. */
export function getGeminiTier(): GeminiTierNumber {
  const server = typeof process !== 'undefined' && process.env?.GEMINI_TIER;
  const client = typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_TIER;
  const raw = (server || client || '').toString().toLowerCase().trim();
  if (raw === '1' || raw === 'paid') return 1;
  return 0; // 0, "0", "free", or unset
}

/** Free tier (0): first value in RPM/TPM/RPD from comparison. Only Gemini 3 Flash has quota. */
const FREE_LIMITS: Record<string, ModelLimit> = {
  'gemini-3-flash-preview':   { rpm: 4,   tpm: 3_560,   rpd: 27 },
  'gemini-2.5-flash':         { rpm: 0,   tpm: 0,       rpd: 0 },
  'gemini-2.5-pro':           { rpm: 0,   tpm: 0,       rpd: 0 },
  'gemini-2.0-flash':        { rpm: 0,   tpm: 0,       rpd: 0 },
  'gemini-2-flash':          { rpm: 0,   tpm: 0,       rpd: 0 },
  'gemini-2-flash-exp':      { rpm: 0,   tpm: 0,       rpd: 0 },
  'gemini-2-flash-lite':     { rpm: 0,   tpm: 0,       rpd: 0 },
  'gemini-2.5-flash-lite':   { rpm: 0,   tpm: 0,       rpd: 0 },
  'gemini-3.1-flash-lite':   { rpm: 0,   tpm: 0,       rpd: 0 },
  'gemini-3.1-pro-preview':  { rpm: 0,   tpm: 0,       rpd: 0 },
  'gemini-2.5-flash-preview-tts': { rpm: 0, tpm: 0,   rpd: 0 },
  'gemini-2.5-pro-tts':      { rpm: 0,   tpm: 0,       rpd: 0 },
  'gemini-embedding-001':    { rpm: 0,   tpm: 0,       rpd: 0 },
  'gemini-embedding-2':      { rpm: 0,   tpm: 0,       rpd: 0 },
  'gemini-2.5-flash-image':  { rpm: 0,   tpm: 0,       rpd: 0 },
  'gemini-3-pro-image-preview': { rpm: 0, tpm: 0,     rpd: 0 },
  'gemini-3.1-flash-image':  { rpm: 0,   tpm: 0,       rpd: 0 },
  'veo-2.0-generate-001':    { rpm: 0,   tpm: 0,       rpd: 0 },
  'veo-3':                   { rpm: 0,   tpm: 0,       rpd: 0 },
};

/** Tier 1 (paid): from comparison table. Use all models; order by RPD so high-quota first. */
const PAID_LIMITS: Record<string, ModelLimit> = {
  'gemini-2.0-flash':          { rpm: 2000,  tpm: 4_000_000,  rpd: Infinity },
  'gemini-2-flash':           { rpm: 2000,  tpm: 4_000_000,  rpd: Infinity },
  'gemini-2-flash-lite':      { rpm: 4000,  tpm: 4_000_000,  rpd: Infinity },
  'gemini-2.5-flash-lite':    { rpm: 10,    tpm: 250_000,    rpd: Infinity },
  'gemini-3-flash-preview':   { rpm: 5,     tpm: 250_000,    rpd: 10_000 },
  'gemini-2.5-flash':         { rpm: 5,     tpm: 250_000,    rpd: 10_000 },
  'gemini-3.1-flash-lite':    { rpm: 15,    tpm: 250_000,    rpd: 150_000 },
  'gemini-2-flash-exp':       { rpm: 10,    tpm: 250_000,    rpd: 500 },
  'gemini-3.1-pro-preview':   { rpm: 25,    tpm: 2_000_000,  rpd: 250 },
  'gemini-2.5-pro':           { rpm: 150,   tpm: 2_000_000,  rpd: 1_000 },
  'gemini-2.5-flash-preview-tts': { rpm: 3, tpm: 10_000,    rpd: 10 },
  'gemini-2.5-pro-tts':       { rpm: 10,   tpm: 10_000,     rpd: 50 },
  'gemini-embedding-001':    { rpm: 100,   tpm: 30_000,     rpd: 1_000 },
  'text-embedding-004':       { rpm: 100,   tpm: 30_000,     rpd: 1_000 },
  'gemini-embedding-2':       { rpm: 100,   tpm: 30_000,     rpd: 1_000 },
  'gemini-2.5-flash-image':   { rpm: 500,   tpm: 500_000,    rpd: 2_000 },
  'gemini-3-pro-image-preview': { rpm: 20,  tpm: 100_000,    rpd: 250 },
  'gemini-3.1-flash-image':   { rpm: 100,   tpm: 200_000,    rpd: 1_000 },
  'veo-2.0-generate-001':     { rpm: 2,     tpm: 0,          rpd: 10 },
  'veo-3':                    { rpm: 2,     tpm: 0,          rpd: 10 },
};

function getLimitsForTier(tier: GeminiTierNumber): Record<string, ModelLimit> {
  return tier === 1 ? PAID_LIMITS : FREE_LIMITS;
}

/** Get limit for a model for the current tier. Returns undefined if unknown. */
export function getModelLimit(modelId: string): ModelLimit | undefined {
  const tier = getGeminiTier();
  const limits = getLimitsForTier(tier);
  const normalized = modelId.replace(/^models\//, '').trim();
  const limit = limits[normalized] ?? limits[normalized.replace(/-preview$/, '')];
  if (!limit) return undefined;
  if (limit.rpm === 0 && limit.tpm === 0 && limit.rpd === 0) return undefined;
  return limit;
}

/**
 * Preferred text-generation model order for the current tier.
 * Tier 0 (free): only Gemini 3 Flash has quota.
 * Tier 1 (paid): all text models, ordered by RPD (Unlimited first) to use quota efficiently.
 */
export function getTextModelOrder(): string[] {
  const tier = getGeminiTier();
  if (tier === 1) {
    return [
      'gemini-2.0-flash',
      'gemini-2-flash',
      'gemini-2-flash-lite',
      'gemini-2.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-3-flash-preview',
      'gemini-2.5-flash',
      'gemini-2-flash-exp',
      'gemini-3.1-pro-preview',
      'gemini-2.5-pro',
    ];
  }
  return ['gemini-3-flash-preview'];
}

/** Image-generation models in order (tier 1: use within RPD). Tier 0: no quota. */
export function getImageModelOrder(): string[] {
  const tier = getGeminiTier();
  if (tier === 1) {
    return ['gemini-2.5-flash-image', 'gemini-3-pro-image-preview', 'gemini-3.1-flash-image'];
  }
  return [];
}

/** TTS models in order (tier 1). */
export function getTTSModelOrder(): string[] {
  const tier = getGeminiTier();
  if (tier === 1) {
    return ['gemini-2.5-flash-preview-tts', 'gemini-2.5-pro-tts'];
  }
  return [];
}

/** Embedding models (tier 1 has quota; tier 0 no quota). */
export function getEmbeddingModelOrder(): string[] {
  const tier = getGeminiTier();
  if (tier === 1) {
    return ['gemini-embedding-001', 'gemini-embedding-2'];
  }
  return ['gemini-embedding-001'];
}

/** Default text model for the tier (first in order). */
export function getDefaultTextModel(): string {
  const order = getTextModelOrder();
  return order[0] ?? 'gemini-3-flash-preview';
}

/** Default embedding model (first in order for tier). */
export function getEmbeddingModel(): string {
  const order = getEmbeddingModelOrder();
  return order[0] ?? 'gemini-embedding-001';
}

/** Video generation (Veo) model order for tier 1. */
export function getVideoModelOrder(): string[] {
  const tier = getGeminiTier();
  if (tier === 1) {
    return ['veo-2.0-generate-001', 'veo-3'];
  }
  return ['veo-2.0-generate-001'];
}

/** Whether we are on paid tier (1). */
export function isPaidTier(): boolean {
  return getGeminiTier() === 1;
}
