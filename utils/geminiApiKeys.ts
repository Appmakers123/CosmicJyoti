/**
 * Gemini API key rotation - multiple keys for load balancing and rate-limit spread.
 * Set GEMINI_API_KEYS=key1,key2,key3 or API_KEYS=key1,key2,key3 in .env (comma-separated).
 * Falls back to single GEMINI_API_KEY or API_KEY (also supports comma-separated for multiple).
 */

let keyIndex = 0;

function parseKeyList(value: string): string[] {
  if (!value || typeof value !== 'string') return [];
  return value.split(',').map((k) => k.trim()).filter(Boolean);
}

function getKeys(): string[] {
  const fromGeminiKeys =
    (typeof process !== 'undefined' && (process as any).env?.GEMINI_API_KEYS) || '';
  let parsed = parseKeyList(fromGeminiKeys);
  if (parsed.length > 0) return parsed;
  const fromApiKeys =
    (typeof process !== 'undefined' && (process as any).env?.API_KEYS) || '';
  parsed = parseKeyList(fromApiKeys);
  if (parsed.length > 0) return parsed;
  const singleGemini =
    (typeof process !== 'undefined' && (process as any).env?.GEMINI_API_KEY) || '';
  parsed = parseKeyList(singleGemini);
  if (parsed.length > 0) return parsed;
  const singleApi =
    (typeof process !== 'undefined' && (process as any).env?.API_KEY) || '';
  parsed = parseKeyList(singleApi);
  if (parsed.length > 0) return parsed;
  return [];
}

/** Get next key in round-robin rotation */
export function getNextGeminiKey(): string {
  const keys = getKeys();
  if (keys.length === 0) return '';
  const key = keys[keyIndex % keys.length];
  keyIndex += 1;
  return key;
}

/** Get all keys (e.g. for retry with next key) */
export function getAllGeminiKeys(): string[] {
  return getKeys();
}

export function hasGeminiKeys(): boolean {
  return getKeys().length > 0;
}
