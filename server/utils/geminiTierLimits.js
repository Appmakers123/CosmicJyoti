/**
 * Gemini API tier and model order for server.
 * GEMINI_TIER: 0 = free, 1 = paid (tier 1). Also accepts "free" | "paid".
 */

function getGeminiTier() {
  const raw = (process.env.GEMINI_TIER || '').toString().toLowerCase().trim();
  if (raw === '1' || raw === 'paid') return 1;
  return 0;
}

const FREE_LIMITS = {
  'gemini-3-flash-preview': { rpm: 4, tpm: 3560, rpd: 27 },
};

const PAID_LIMITS = {
  'gemini-2.0-flash': { rpm: 2000, tpm: 4_000_000, rpd: Infinity },
  'gemini-2-flash': { rpm: 2000, tpm: 4_000_000, rpd: Infinity },
  'gemini-2-flash-lite': { rpm: 4000, tpm: 4_000_000, rpd: Infinity },
  'gemini-2.5-flash-lite': { rpm: 10, tpm: 250_000, rpd: Infinity },
  'gemini-3-flash-preview': { rpm: 5, tpm: 250_000, rpd: 10_000 },
  'gemini-2.5-flash': { rpm: 5, tpm: 250_000, rpd: 10_000 },
  'gemini-3.1-flash-lite': { rpm: 15, tpm: 250_000, rpd: 150_000 },
  'gemini-2-flash-exp': { rpm: 10, tpm: 250_000, rpd: 500 },
  'gemini-3.1-pro-preview': { rpm: 25, tpm: 2_000_000, rpd: 250 },
  'gemini-2.5-pro': { rpm: 150, tpm: 2_000_000, rpd: 1_000 },
  'gemini-2.5-flash-preview-tts': { rpm: 3, tpm: 10_000, rpd: 10 },
  'gemini-embedding-001': { rpm: 100, tpm: 30_000, rpd: 1_000 },
  'gemini-embedding-2': { rpm: 100, tpm: 30_000, rpd: 1_000 },
  'gemini-2.5-flash-image': { rpm: 500, tpm: 500_000, rpd: 2_000 },
  'veo-2.0-generate-001': { rpm: 2, tpm: 0, rpd: 10 },
  'veo-3': { rpm: 2, tpm: 0, rpd: 10 },
};

function getLimitsForTier(tier) {
  return tier === 1 ? PAID_LIMITS : FREE_LIMITS;
}

function getModelLimit(modelId) {
  const tier = getGeminiTier();
  const limits = getLimitsForTier(tier);
  const key = String(modelId).replace(/^models\//, '').trim();
  const limit = limits[key] ?? limits[key.replace(/-preview$/, '')];
  if (!limit || (limit.rpm === 0 && limit.tpm === 0 && limit.rpd === 0)) return undefined;
  return limit;
}

function getTextModelOrder() {
  if (getGeminiTier() === 1) {
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

function getDefaultTextModel() {
  const order = getTextModelOrder();
  return order[0] || 'gemini-3-flash-preview';
}

export { getGeminiTier, getTextModelOrder, getDefaultTextModel, getModelLimit };
