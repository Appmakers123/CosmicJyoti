/**
 * Groq API key - single key or comma-separated for rotation.
 * Set GROQ_API_KEYS=key1,key2,key3 or GROQ_API_KEY=key in .env.
 * Used when Perplexity is not available; Groq provides fast LLM inference (e.g. Llama).
 */

let keyIndex = 0;

function parseKeyList(value: string): string[] {
  if (!value || typeof value !== 'string') return [];
  return value.split(',').map((k) => k.trim()).filter(Boolean);
}

function getKeys(): string[] {
  const envKeys = process.env.GROQ_API_KEYS || '';
  const parsed = parseKeyList(envKeys);
  if (parsed.length > 0) return parsed;
  const single = process.env.GROQ_API_KEY || '';
  const fromSingle = parseKeyList(single);
  if (fromSingle.length > 0) return fromSingle;
  return [];
}

export function getNextGroqKey(): string {
  const keys = getKeys();
  if (keys.length === 0) return '';
  const key = keys[keyIndex % keys.length];
  keyIndex += 1;
  return key;
}

export function getAllGroqKeys(): string[] {
  return getKeys();
}

export function hasGroqKeys(): boolean {
  return getKeys().length > 0;
}

/** Alias for hasGroqKeys (singular name used by services). */
export const hasGroqKey = hasGroqKeys;
