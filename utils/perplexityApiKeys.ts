/**
 * Perplexity API key rotation - multiple keys for load balancing and redundancy.
 * Set PERPLEXITY_API_KEYS=key1,key2,key3 in .env (comma-separated).
 * Falls back to PERPLEXITY_API_KEY if PERPLEXITY_API_KEYS is not set.
 */

let keyIndex = 0;

function getKeys(): string[] {
  const envKeys =
    (typeof process !== 'undefined' && process.env?.PERPLEXITY_API_KEYS) || '';
  if (envKeys && typeof envKeys === 'string') {
    const parsed = envKeys.split(',').map((k) => k.trim()).filter(Boolean);
    if (parsed.length > 0) return parsed;
  }
  const single =
    (typeof process !== 'undefined' && process.env?.PERPLEXITY_API_KEY) || '';
  if (single) return [single];
  return [];
}

/** Get next key in round-robin */
export function getNextPerplexityKey(): string {
  const keys = getKeys();
  if (keys.length === 0) return '';
  const key = keys[keyIndex % keys.length];
  keyIndex += 1;
  return key;
}

/** Get all keys for retry logic */
export function getAllPerplexityKeys(): string[] {
  return getKeys();
}

export function hasPerplexityKeys(): boolean {
  return getKeys().length > 0;
}
