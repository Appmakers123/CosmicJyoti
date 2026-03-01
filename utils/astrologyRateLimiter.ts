/**
 * Rate limiter for astrology API: 1 req/sec per key, 50 req/day per key.
 * Ensures we stay within free tier limits and avoid 429 errors.
 */

const STORAGE_KEY = 'cosmicjyoti_astrology_usage';
const ROTATION_INDEX_KEY = 'cosmicjyoti_astrology_rotation_index';
const REQUESTS_PER_SECOND = 1;
const REQUESTS_PER_DAY = 50;
const MS_PER_SECOND = 1000;

/** Round-robin index (persisted so rotation continues across page loads). */
function getRotationIndex(keys: string[]): number {
  try {
    const s = localStorage.getItem(ROTATION_INDEX_KEY);
    if (s != null) {
      const n = parseInt(s, 10);
      if (Number.isInteger(n) && n >= 0) return n % Math.max(1, keys.length);
    }
  } catch (_) {}
  return 0;
}

function setRotationIndex(index: number): void {
  try {
    localStorage.setItem(ROTATION_INDEX_KEY, String(index));
  } catch (_) {}
}

interface KeyUsage {
  lastRequestTime: number;
  dailyCount: number;
  dailyDate: string; // YYYY-MM-DD
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadUsage(keys: string[]): Record<string, KeyUsage> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, KeyUsage>;
      const today = getToday();
      // Reset daily counts for new day
      const result: Record<string, KeyUsage> = {};
      for (const key of keys) {
        const u = parsed[key];
        if (u && u.dailyDate === today) {
          result[key] = u;
        } else {
          result[key] = { lastRequestTime: 0, dailyCount: 0, dailyDate: today };
        }
      }
      return result;
    }
  } catch (e) {
    console.warn('[RateLimiter] Failed to load usage:', e);
  }
  const today = getToday();
  const result: Record<string, KeyUsage> = {};
  for (const key of keys) {
    result[key] = { lastRequestTime: 0, dailyCount: 0, dailyDate: today };
  }
  return result;
}

function saveUsage(keys: string[], usage: Record<string, KeyUsage>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  } catch (e) {
    console.warn('[RateLimiter] Failed to save usage:', e);
  }
}

/** Keys in rotation order (round-robin across multiple keys). */
function keysInRotationOrder(keys: string[]): string[] {
  if (keys.length <= 1) return keys;
  const start = getRotationIndex(keys);
  return keys.slice(start).concat(keys.slice(0, start));
}

/**
 * Pick best available key and wait if needed. Uses round-robin rotation across keys.
 */
export async function acquireKeySlot(keys: string[]): Promise<string> {
  const usage = loadUsage(keys);
  const now = Date.now();
  const today = getToday();
  const ordered = keysInRotationOrder(keys);

  for (const key of ordered) {
    const u = usage[key] || { lastRequestTime: 0, dailyCount: 0, dailyDate: today };
    if (u.dailyDate !== today) {
      u.dailyCount = 0;
      u.dailyDate = today;
    }
    if (u.dailyCount >= REQUESTS_PER_DAY) continue; // Key exhausted for today

    const elapsed = now - u.lastRequestTime;
    if (elapsed >= MS_PER_SECOND) {
      setRotationIndex((getRotationIndex(keys) + 1) % Math.max(1, keys.length));
      return key; // This key is ready
    }
  }

  // All keys either exhausted or need wait - pick the one that will be ready soonest (prefer rotation order)
  let bestKey: string | null = null;
  let bestKeyIndex = -1;
  let minWait = Infinity;
  for (let i = 0; i < ordered.length; i++) {
    const k = ordered[i];
    const u = usage[k] || { lastRequestTime: 0, dailyCount: 0, dailyDate: today };
    if (u.dailyDate !== today) u.dailyCount = 0;
    if (u.dailyCount >= REQUESTS_PER_DAY) continue;
    const wait = Math.max(0, MS_PER_SECOND - (now - u.lastRequestTime));
    if (wait < minWait) {
      minWait = wait;
      bestKey = k;
      bestKeyIndex = keys.indexOf(k);
    }
  }

  if (!bestKey) {
    throw new Error('All astrology API keys have reached daily limit (50/day). Please try again tomorrow.');
  }
  if (minWait > 0) {
    await new Promise((r) => setTimeout(r, minWait));
  }
  setRotationIndex((bestKeyIndex + 1) % Math.max(1, keys.length));
  return bestKey;
}

/**
 * Record that a key was used (call after successful request).
 */
export function recordKeyUsed(key: string, keys: string[]): void {
  const usage = loadUsage(keys);
  const u = usage[key] || { lastRequestTime: 0, dailyCount: 0, dailyDate: getToday() };
  if (u.dailyDate !== getToday()) {
    u.dailyCount = 0;
    u.dailyDate = getToday();
  }
  u.lastRequestTime = Date.now();
  u.dailyCount += 1;
  usage[key] = u;
  saveUsage(keys, usage);
}
