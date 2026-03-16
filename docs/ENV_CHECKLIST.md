# End-to-end: Env keys by module

Use this to fix "keys set but module not working". **Server** = backend (e.g. `node server/index.js` or Cloud Run). **Frontend** = build-time env (Vite inlines from `.env.local` or GitHub Secrets).

## Quick check (server)

```bash
curl -s http://localhost:3001/api/env-check
```

Returns `{ gemini: true/false, astrology: true/false, googleMaps: true/false, tier: "0"|"1", corsOrigin: true/false }`. No key values are exposed.

---

## When using a backend (VITE_API_BASE_URL set or dev localhost:3001)

| Module | Server env needed | Frontend env (build) |
|--------|-------------------|----------------------|
| **Kundali** | `ASTROLOGY_API_KEYS` | — (backend handles it) |
| **Navamsha / D9** | same as Kundali | — |
| **Horoscope** | `GEMINI_API_KEYS` or `API_KEY` | — (or for fallback: Gemini key) |
| **Panchang** | `ASTROLOGY_API_KEYS`, optional `GOOGLE_API_KEY` | — |
| **Muhurat** | `ASTROLOGY_API_KEYS`, optional `GOOGLE_API_KEY` | — |
| **Matchmaking / Ashtakoota** | `ASTROLOGY_API_KEYS` | — |
| **Cosmic Health** | `GEMINI_API_KEYS` or `API_KEY` | — |
| **Ask Rishi** | `GEMINI_API_KEYS` or `API_KEY` | — |
| **Tarot** | `GEMINI_API_KEYS` or `API_KEY` | — |
| **Transits / Gochara** | `GEMINI_API_KEYS` or `API_KEY` | — |
| **Blog search** | `GEMINI_API_KEYS` or `API_KEY` | — |
| **Sync** | (no key; uses file/store) | — |
| **CORS** | `CORS_ORIGIN` = your frontend URL(s), e.g. `https://user.github.io` | — |

**Server .env.local (or Cloud Run env):**  
`GEMINI_API_KEYS=...` or `API_KEY=...`, `ASTROLOGY_API_KEYS=...`, `GEMINI_TIER=0` or `1`, and in production `CORS_ORIGIN=https://your-site.com`.

---

## When NOT using a backend (static deploy, e.g. GitHub Pages only)

| Module | Frontend env (build) |
|--------|----------------------|
| **Kundali** | `VITE_ASTROLOGY_API_KEYS` or `ASTROLOGY_API_KEYS` (inlined via Vite define) |
| **Horoscope** | `GEMINI_API_KEYS` or `API_KEY` or `VITE_GEMINI_API_KEY` |
| **Ask Rishi, Tarot, Cosmic Health, Transits, etc.** | Same Gemini key as above |
| **Panchang / Muhurat / Matchmaking** | Backend only, or use backend URL |
| **Sync** | `VITE_SYNC_API_URL` if you have a separate sync API |
| **Google Maps (Kundali location)** | `VITE_GOOGLE_API_KEY` |
| **Tier (rate limits)** | `VITE_GEMINI_TIER` = `0` or `1` |

For **GitHub Actions** build: add in **Settings → Secrets and variables → Actions**:  
`GEMINI_API_KEYS` or `API_KEY`, `ASTROLOGY_API_KEYS` or `VITE_ASTROLOGY_API_KEYS`, `VITE_GOOGLE_API_KEY`, and optionally `VITE_GEMINI_TIER`. The workflow already passes these into the build step.

---

## Common issues

1. **"Horoscope unavailable" / "AI not configured"**  
   Backend: ensure `GEMINI_API_KEYS` or `API_KEY` is in the **server** env (and restart server).  
   Static: ensure the **build** had the key (e.g. GitHub Secret `GEMINI_API_KEYS` or `API_KEY`).

2. **Kundali fails / "Astrology API keys not configured"**  
   Backend: `ASTROLOGY_API_KEYS` in server env.  
   Static: `ASTROLOGY_API_KEYS` or `VITE_ASTROLOGY_API_KEYS` in build env (both are inlined as `VITE_ASTROLOGY_API_KEYS` in the app).

3. **Backend returns 403 / CORS**  
   Set `CORS_ORIGIN` on the server to your frontend origin, e.g. `https://username.github.io` (no trailing slash). Multiple: comma-separated.

4. **429 "exceeded its spending cap"**  
   This is **Google Cloud billing**, not app tier. In Google Cloud Console → Billing, increase or remove the spending cap for the project that owns the Gemini API key.

5. **Tier not applied**  
   Server: `GEMINI_TIER=1` in server env.  
   Frontend: `VITE_GEMINI_TIER=1` in build env (inlined; tier 1 = higher in-app limits).

6. **Backup when Gemini fails**  
   The app tries the main path first (SDK or primary model). If that fails with 503, 429 (quota), or network errors, it automatically tries the **REST API** (`https://generativelanguage.googleapis.com/v1beta/models/...:generateContent`) and then the **next model** in the tier order (e.g. gemini-2.0-flash → gemini-2-flash → …). So one failing model or path does not break the feature; the product keeps working with a backup.
