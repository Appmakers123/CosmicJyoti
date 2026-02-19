/**
 * Astrology API key rotation utility - uses multiple keys to avoid single-point failure.
 * Respects rate limits: 1 req/sec per key, 50/day per key (in-memory for server).
 * Keys must be set in .env.local (project root) or env: ASTROLOGY_API_KEYS=key1,key2,key3
 */

function getKeys() {
  const envKeys = process.env.ASTROLOGY_API_KEYS;
  if (envKeys && typeof envKeys === 'string') {
    const parsed = envKeys.split(',').map((k) => k.trim()).filter(Boolean);
    if (parsed.length > 0) return parsed;
  }
  return [];
}

const MS_PER_SECOND = 1000;
const REQUESTS_PER_DAY = 50;
const keyLastRequest = {};
const keyDailyCount = {};
const keyDailyDate = {};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

async function acquireKeySlot(keys) {
  const now = Date.now();
  const today = getToday();
  for (const key of keys) {
    const last = keyLastRequest[key] || 0;
    let count = keyDailyCount[key] || 0;
    const date = keyDailyDate[key] || '';
    if (date !== today) {
      count = 0;
      keyDailyDate[key] = today;
    }
    if (count >= REQUESTS_PER_DAY) continue;
    if (now - last >= MS_PER_SECOND) return key;
  }
  // Wait for soonest available key
  let bestKey = null;
  let minWait = Infinity;
  for (const key of keys) {
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
    try {
      keyToUse = await acquireKeySlot(keys);
      const response = await axios.post(url, data, {
        ...config,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': keyToUse,
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

      if (shouldRetryWithNextKey(status, body) && triedKeys.size < keys.length) {
        console.warn(`Astrology API key failed (${status}), trying next key...`);
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error(`All astrology API keys failed. Last status: ${lastStatus} - ${String(lastData).slice(0, 200)}`);
}

export { getKeys, postWithKeyRotation };
