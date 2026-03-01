/**
 * Free Astrology API – central client for all Vedic astrology endpoints.
 *
 * API reference (Postman): https://documenter.getpostman.com/view/14646401/2sA3XMkQ26
 * Provider: freeastrologyapi.com (JSON base: https://json.freeastrologyapi.com)
 *
 * Configure ASTROLOGY_API_KEYS in .env (comma-separated). Optional: ASTROLOGY_API_BASE_URL.
 * All requests use x-api-key header and key rotation via server/utils/astrologyApiKeys.js.
 * On Windows/corporate networks, set NODE_TLS_REJECT_UNAUTHORIZED=0 or ALLOW_INSECURE_SSL=1 (dev only) to skip TLS verify for outbound HTTPS.
 */

import https from 'https';
import axios from 'axios';
import { postWithKeyRotation } from '../utils/astrologyApiKeys.js';

const skipTlsVerify = process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0' || process.env.ALLOW_INSECURE_SSL === '1';
const axiosInstance = skipTlsVerify ? axios.create({ httpsAgent: new https.Agent({ rejectUnauthorized: false }) }) : axios;

/** Base URL – read at request time so .env is loaded (override with ASTROLOGY_API_BASE_URL) */
function getBaseUrl() {
  return (process.env.ASTROLOGY_API_BASE_URL || 'https://json.freeastrologyapi.com').replace(/\/$/, '');
}
export const BASE_URL = getBaseUrl();

/** Endpoints (paths only). Use with getBaseUrl() + ENDPOINTS[key]. */
export const ENDPOINTS = Object.freeze({
  panchang: '/panchang',
  planets: '/planets',
  horoscope: '/horoscope',
  horoscopeChartUrl: '/horoscope-chart-url',
  navamsaChartInfo: '/navamsa-chart-info',
  navamsaChartSvgCode: '/navamsa-chart-svg-code',
  completePanchang: '/complete-panchang',
});

/**
 * Full URL for an endpoint key (uses current env so BASE_URL is correct after dotenv).
 * @param {string} endpointKey - one of: panchang, planets, horoscope, horoscopeChartUrl, navamsaChartInfo, navamsaChartSvgCode, completePanchang
 * @returns {string}
 */
export function getUrl(endpointKey) {
  const path = ENDPOINTS[endpointKey];
  if (!path) throw new Error(`Unknown Free Astrology API endpoint: ${endpointKey}`);
  return `${getBaseUrl()}${path}`;
}

/**
 * POST to a Free Astrology API endpoint with key rotation.
 * @param {string} endpointKey - one of ENDPOINTS keys
 * @param {object} data - request body
 * @param {object} [config] - optional axios config (e.g. httpsAgent for TLS)
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function post(endpointKey, data, config = {}) {
  const url = getUrl(endpointKey);
  return postWithKeyRotation(axiosInstance, url, data, config);
}

export default { BASE_URL, ENDPOINTS, getUrl, post };
