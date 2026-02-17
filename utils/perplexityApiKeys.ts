/**
 * Perplexity API key rotation - multiple keys for load balancing and redundancy.
 * Set PERPLEXITY_API_KEYS=key1,key2,key3 or PERPLEXITY_API_KEY=key1,key2,key3 in .env (comma-separated).
 * Keys are used in round-robin rotation; on 429/401 we try the next key.
 */

let keyIndex = 0;

function parseKeyList(value: string): string[] {
  if (!value || typeof value !== 'string') return [];
  return value.split(',').map((k) => k.trim()).filter(Boolean);
}

function getKeys(): string[] {
  const envKeys =
    (typeof process !== 'undefined' && process.env?.PERPLEXITY_API_KEYS) || '';
  const parsed = parseKeyList(envKeys);
  if (parsed.length > 0) return parsed;
  const single =
    (typeof process !== 'undefined' && process.env?.PERPLEXITY_API_KEY) || '';
  const fromSingle = parseKeyList(single);
  if (fromSingle.length > 0) return fromSingle;
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
