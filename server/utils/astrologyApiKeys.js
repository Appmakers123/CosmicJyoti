/**
 * Astrology API key rotation utility - uses multiple keys in round-robin to spread load.
 * Respects rate limits: 1 req/sec per key, 50/day per key (in-memory for server).
 * On failure (429, 401, etc.) tries the next key automatically.
 * Keys must be set in .env.local or env: ASTROLOGY_API_KEYS=key1,key2,key3
 */

function getKeys() {
  const envKeys = process.env.ASTROLOGY_API_KEYS;
  if (envKeys && typeof envKeys === 'string') {
    const parsed = envKeys.split(',').map((k) => k.trim()).filter((k) => k.length > 0);
    if (parsed.length > 0) return parsed;
  }
  return [];
}

const MS_PER_SECOND = 1000;
const REQUESTS_PER_DAY = 50;
const keyLastRequest = {};
const keyDailyCount = {};
const keyDailyDate = {};
/** Round-robin index so we rotate across all keys evenly */
let keyRotationIndex = 0;

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

/** Keys in rotation order starting from keyRotationIndex (round-robin). */
function keysInRotationOrder(keys) {
  if (keys.length <= 1) return keys;
  const start = keyRotationIndex % keys.length;
  return keys.slice(start).concat(keys.slice(0, start));
}

async function acquireKeySlot(keys) {
  const now = Date.now();
  const today = getToday();
  const ordered = keysInRotationOrder(keys);
  for (const key of ordered) {
    const last = keyLastRequest[key] || 0;
    let count = keyDailyCount[key] || 0;
    const date = keyDailyDate[key] || '';
    if (date !== today) {
      count = 0;
      keyDailyDate[key] = today;
    }
    if (count >= REQUESTS_PER_DAY) continue;
    if (now - last >= MS_PER_SECOND) {
      keyRotationIndex = (keyRotationIndex + 1) % Math.max(1, keys.length);
      return key;
    }
  }
  // Wait for soonest available key (still prefer rotation order)
  let bestKey = null;
  let minWait = Infinity;
  for (const key of ordered) {
    let count = keyDailyCount[key] || 0;
    if (keyDailyDate[key] !== today) count = 0;
    if (count >= REQUESTS_PER_DAY) continue;
    const wait = Math.max(0, MS_PER_SECOND - (now - (keyLastRequest[key] || 0)));
    if (wait < minWait) {
      minWait = wait;
      bestKey = key;
    }
  }
  if (!bestKey) throw new Error('All astrology API keys reached daily limit. Try again tomorrow.');
  if (minWait > 0) await new Promise((r) => setTimeout(r, minWait));
  keyRotationIndex = (keys.indexOf(bestKey) + 1) % Math.max(1, keys.length);
  return bestKey;
}

function recordKeyUsed(key, keys) {
  keyLastRequest[key] = Date.now();
  const today = getToday();
  if (keyDailyDate[key] !== today) {
    keyDailyCount[key] = 0;
    keyDailyDate[key] = today;
  }
  keyDailyCount[key] = (keyDailyCount[key] || 0) + 1;
}

function shouldRetryWithNextKey(status, body) {
  if (status === 401 || status === 403) return true;
  if (status === 429) return true;
  if (status >= 500) return true;
  const bodyStr = typeof body === 'string' ? body : (body ? JSON.stringify(body) : '');
  if (bodyStr && (
    bodyStr.includes('API_KEY') ||
    bodyStr.includes('api key') ||
    bodyStr.includes('quota') ||
    bodyStr.includes('rate limit') ||
    bodyStr.includes('invalid key') ||
    bodyStr.includes('Missing Authentication Token') ||
    bodyStr.includes('Forbidden') ||
    bodyStr.includes('REQUEST_DENIED') ||
    bodyStr.includes('not authorized')
  )) return true;
  return false;
}

/**
 * Make axios POST request with automatic key rotation on failure.
 * @param {object} axios - axios instance
 * @param {string} url - API URL
 * @param {object} data - request body
 * @param {object} config - optional axios config
 * @returns {Promise<object>} axios response
 */
async function postWithKeyRotation(axios, url, data, config = {}) {
  const keys = getKeys();
  if (!keys.length) {
    throw new Error('Astrology API keys not configured. Add ASTROLOGY_API_KEYS to .env.local (comma-separated keys from freeastrologyapi.com).');
  }
  let lastError = null;
  let lastStatus = 0;
  let lastData = null;
  const triedKeys = new Set();

  let keyToUse = null;
  for (let attempt = 0; attempt < keys.length; attempt++) {
    const availableKeys = keys.filter((k) => !triedKeys.has(k));
    if (availableKeys.length === 0) break;
    try {
      keyToUse = await acquireKeySlot(availableKeys);
      if (!keyToUse || typeof keyToUse !== 'string' || !keyToUse.trim()) {
        continue;
      }
      const apiKey = keyToUse.trim();
      const response = await axios.post(url, data, {
        ...config,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          Authorization: `Bearer ${apiKey}`,
          ...(config.headers || {}),
        },
      });
      recordKeyUsed(keyToUse, keys);
      return response;
    } catch (err) {
      if (keyToUse) recordKeyUsed(keyToUse, keys);
      const status = err.response?.status || 0;
      const body = err.response?.data ? JSON.stringify(err.response.data) : err.message || '';
      lastError = err;
      lastStatus = status;
      lastData = body;
      triedKeys.add(keyToUse);

      if (shouldRetryWithNextKey(status, body)) {
        console.warn(`Astrology API key failed (${status}), trying next of ${keys.length} key(s)...`);
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error(`All astrology API keys failed. Last status: ${lastStatus} - ${String(lastData).slice(0, 200)}`);
}

export { getKeys, postWithKeyRotation };
