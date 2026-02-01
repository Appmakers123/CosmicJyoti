/**
 * Rate limiter for astrology API: 1 req/sec per key, 50 req/day per key.
 * Ensures we stay within free tier limits and avoid 429 errors.
 */

const STORAGE_KEY = 'cosmicjyoti_astrology_usage';
const REQUESTS_PER_SECOND = 1;
const REQUESTS_PER_DAY = 50;
const MS_PER_SECOND = 1000;

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

/**
 * Pick best available key and wait if needed to respect 1 req/sec limit.
 */
export async function acquireKeySlot(keys: string[]): Promise<string> {
  const usage = loadUsage(keys);
  const now = Date.now();
  const today = getToday();

  for (const key of keys) {
    const u = usage[key] || { lastRequestTime: 0, dailyCount: 0, dailyDate: today };
    if (u.dailyDate !== today) {
      u.dailyCount = 0;
      u.dailyDate = today;
    }
    if (u.dailyCount >= REQUESTS_PER_DAY) continue; // Key exhausted for today

    const elapsed = now - u.lastRequestTime;
    if (elapsed >= MS_PER_SECOND) {
      return key; // This key is ready
    }
    // Need to wait - but maybe another key is ready
  }

  // All keys either exhausted or need wait - pick the one that will be ready soonest
  let bestKey: string | null = null;
  let minWait = Infinity;
  for (const k of keys) {
    const u = usage[k] || { lastRequestTime: 0, dailyCount: 0, dailyDate: today };
    if (u.dailyDate !== today) u.dailyCount = 0;
    if (u.dailyCount >= REQUESTS_PER_DAY) continue;
    const wait = Math.max(0, MS_PER_SECOND - (now - u.lastRequestTime));
    if (wait < minWait) {
      minWait = wait;
      bestKey = k;
    }
  }

  if (!bestKey) {
    throw new Error('All astrology API keys have reached daily limit (50/day). Please try again tomorrow.');
  }
  if (minWait > 0) {
    await new Promise((r) => setTimeout(r, minWait));
  }
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
