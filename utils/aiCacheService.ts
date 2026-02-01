/**
 * AI Response Cache - Day-scoped local cache to reduce API calls and billing.
 * Same request same day = return cached response, no AI call.
 * Cache expires at end of day.
 */

const STORAGE_KEY = 'cosmicjyoti_ai_cache';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function simpleHash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h = ((h << 5) - h) + c;
    h = h & h;
  }
  return Math.abs(h).toString(36);
}

interface CacheStore {
  date: string;
  entries: Record<string, unknown>;
}

function getStore(): CacheStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: getToday(), entries: {} };
    const parsed = JSON.parse(raw) as CacheStore;
    if (parsed.date !== getToday()) {
      return { date: getToday(), entries: {} };
    }
    return parsed;
  } catch {
    return { date: getToday(), entries: {} };
  }
}

function saveStore(store: CacheStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.warn('[AICache] Save failed:', e);
  }
}

/** Build cache key from feature and input (stable for same inputs) */
export function buildCacheKey(feature: string, input: Record<string, unknown> | string): string {
  let str: string;
  if (typeof input === 'string') {
    str = input;
  } else {
    const keys = Object.keys(input).sort();
    const sorted: Record<string, unknown> = {};
    keys.forEach(k => { sorted[k] = input[k]; });
    str = JSON.stringify(sorted);
  }
  const hash = str.length > 200 ? simpleHash(str) : str.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 80);
  return `${feature}_${hash}`;
}

/** Get cached AI response if exists for today */
export function getCachedAI<T>(feature: string, input: Record<string, unknown> | string): T | null {
  const store = getStore();
  const key = buildCacheKey(feature, input);
  const cached = store.entries[key];
  return cached != null ? (cached as T) : null;
}

/** Save AI response to cache (day-scoped) */
export function setCachedAI<T>(feature: string, input: Record<string, unknown> | string, data: T): void {
  const store = getStore();
  store.date = getToday();
  const key = buildCacheKey(feature, input);
  store.entries[key] = data;
  // Limit entries per day to avoid quota
  const keys = Object.keys(store.entries);
  if (keys.length > 50) {
    const toKeep = keys.slice(0, 40);
    const trimmed: Record<string, unknown> = {};
    toKeep.forEach(k => { trimmed[k] = store.entries[k]; });
    store.entries = trimmed;
  }
  saveStore(store);
}
