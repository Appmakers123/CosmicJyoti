# Free Astrology API integration

CosmicJyoti uses the **Free Astrology API** (freeastrologyapi.com) for Vedic astrology data. All server-side calls go through a central module and key rotation.

## API reference

- **Postman documentation:** [Free Astrology API](https://documenter.getpostman.com/view/14646401/2sA3XMkQ26)
- **Base URL:** `https://json.freeastrologyapi.com` (override with `ASTROLOGY_API_BASE_URL`)
- **Authentication:** `x-api-key` header (keys from freeastrologyapi.com)

## Central module

**`server/lib/freeAstrologyApi.js`**

- **`BASE_URL`** – API base (from env or default)
- **`ENDPOINTS`** – path map: `panchang`, `planets`, `horoscope`, `horoscopeChartUrl`, `navamsaChartInfo`, `navamsaChartSvgCode`, `completePanchang`
- **`getUrl(endpointKey)`** – full URL for an endpoint (for use with custom axios, e.g. TLS)
- **`post(endpointKey, data, config?)`** – POST with key rotation (uses default axios)

## Where it’s used

| Service | Endpoints used |
|--------|-----------------|
| **panchangService** | `panchang` |
| **muhuratService** | `panchang` |
| **horoscopeService** | `horoscope` |
| **matchmakingService** | `planets` (×2) |
| **gocharaService** | `planets` (×2) |
| **kundaliService** | `horoscopeChartUrl`, `planets`, `navamsaChartInfo`, `navamsaChartSvgCode` |

Frontend (when backend is not used) calls the same API via `utils/astrologyApiKeys.ts` and `services/geminiService.ts` (freeastrologyapi.com and apiastro.com fallback).

## Configuration

In `.env` or `.env.local`:

```bash
# Comma-separated keys (key rotation)
ASTROLOGY_API_KEYS=key1,key2,key3

# Optional: different base URL
# ASTROLOGY_API_BASE_URL=https://json.freeastrologyapi.com
```

Keys are from [freeastrologyapi.com](https://freeastrologyapi.com). Rate limits (e.g. 1 req/sec per key, 50/day) are handled in `server/utils/astrologyApiKeys.js`.

## Adding a new endpoint

1. Add the path to **`ENDPOINTS`** in `server/lib/freeAstrologyApi.js`.
2. Use **`post('newKey', payload)`** in your service, or **`getUrl('newKey')`** with `postWithKeyRotation(axios, url, data)` if you need a custom axios (e.g. TLS).
