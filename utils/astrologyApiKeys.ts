/**
 * Free Astrology API (freeastrologyapi.com) - multiple keys for redundancy.
 * NOT for Gemini - Gemini uses a single API key only.
 * Respects rate limits: 1 req/sec per key, 50 req/day per key.
 * Tries keys in sequence when a request fails (quota, invalid key, etc.).
 */

import { acquireKeySlot, recordKeyUsed } from './astrologyRateLimiter';

const DEFAULT_KEYS = [
  'xiSfthVZmC3PpK0BMe4cnaVz9SXDLnnS9SiQpcTr',
  '74vQL6WJHK9dmLT9Jdyin5FDoj4Q1LmdajqMWQaq',
  'ktDiemKEyK9rH9ZPBhHCF8o0zl1Cw1bo6LHc2wRL',
  'Hx3Z1gdtCD9XYPbVcNrqG5dNqA3kWBKT1LyOTvXw',
];

function getKeys(): string[] {
  const envKeys = (typeof process !== 'undefined' && process.env?.ASTROLOGY_API_KEYS) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_ASTROLOGY_API_KEYS);
  if (envKeys && typeof envKeys === 'string') {
    const parsed = envKeys.split(',').map((k) => k.trim()).filter(Boolean);
    if (parsed.length > 0) return parsed;
  }
  return DEFAULT_KEYS;
}

let keyIndex = 0;

/** Get next key in round-robin (for simple use cases) */
export function getNextKey(): string {
  const keys = getKeys();
  const key = keys[keyIndex % keys.length];
  keyIndex += 1;
  return key;
}

/** Get all keys for retry logic */
export function getAllKeys(): string[] {
  return getKeys();
}

/** Check if an error/response suggests we should try another key */
function shouldRetryWithNextKey(status: number, body?: string): boolean {
  if (status === 401 || status === 403) return true; // Invalid/expired key
  if (status === 429) return true; // Rate limit / quota
  if (status >= 500) return true; // Server error
  if (body && (
    body.includes('API_KEY') ||
    body.includes('api key') ||
    body.includes('quota') ||
    body.includes('rate limit') ||
    body.includes('invalid key')
  )) return true;
  return false;
}

/**
 * Fetch with automatic key rotation on failure.
 * Tries each key until one succeeds or all fail.
 */
export async function fetchWithKeyRotation(
  url: string,
  options: Omit<RequestInit, 'body'> & { body?: string | Record<string, unknown> }
): Promise<Response> {
  const keys = getAllKeys();
  const body = options.body !== undefined
    ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body))
    : undefined;
  const { body: _body, ...fetchOptions } = options;

  let lastError: Error | null = null;
  let lastStatus = 0;
  let lastText = '';
  const triedKeys = new Set<string>();

  for (let attempt = 0; attempt < keys.length; attempt++) {
    try {
      // Respect rate limit: 1 req/sec per key, 50/day per key
      const keyToUse = await acquireKeySlot(keys);
      const res = await fetch(url, {
        ...fetchOptions,
        headers: {
          ...(fetchOptions.headers as Record<string, string>),
          'Content-Type': 'application/json',
          'x-api-key': keyToUse,
        },
        body,
      });

      if (res.ok) {
        recordKeyUsed(keyToUse, keys);
        return res;
      }

      const text = await res.text();
      lastStatus = res.status;
      lastText = text;
      recordKeyUsed(keyToUse, keys); // Count failed request too (API may count it)
      triedKeys.add(keyToUse);
      if (shouldRetryWithNextKey(res.status, text) && triedKeys.size < keys.length) {
        console.warn(`Astrology API key failed (${res.status}), trying next key...`);
        continue;
      }
      return new Response(text, { status: res.status, statusText: res.statusText });
    } catch (err) {
      lastError = err as Error;
      console.warn('Astrology API request failed, trying next key:', (err as Error).message);
    }
  }

  throw lastError || new Error(`All astrology API keys failed. Last status: ${lastStatus} - ${lastText.slice(0, 200)}`);
}
