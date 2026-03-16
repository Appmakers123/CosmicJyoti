# Backend API (End-to-End)

All endpoints used by the CosmicSutra frontend when `VITE_API_BASE_URL` is set.  
**Index:** `GET /api` returns a JSON list of these endpoints.

| Method | Path | Usage |
|--------|------|--------|
| POST | `/api/kundali` | Birth chart (D1) + optional AI predictions |
| POST | `/api/navamsha` | D9 chart (same birth data) |
| POST | `/api/cosmic-health` | Chart-based health analysis |
| POST | `/api/muhurat` | Auspicious timings for activity + location |
| POST | `/api/transits/generic` | Generic transits (location, rashi, date) |
| POST | `/api/gochara` | Gochara for rashi + date |
| POST | `/api/horoscope` | Daily/weekly/monthly/yearly horoscope by sign |
| POST | `/api/panchang` | Panchang for date + location |
| POST | `/api/matchmaking` | Kundali matchmaking (boy + girl charts) |
| POST | `/api/ashtakoota` | Ashtakoota score (boy + girl charts) |
| POST | `/api/ask-rishi` | AI Rishi Q&A |
| POST | `/api/tarot` | Tarot reading |
| POST | `/api/gemini-generate` | Gemini REST proxy (body: `prompt`, `modelId?`, `systemInstruction?`) |
| GET | `/api/blog-search` | Blog search by query (`q`, `limit`) |
| GET | `/api/sync` | Get user sync data (`userId`) |
| POST | `/api/sync` | Save user sync data (`userId`, `data`) |
| GET | `/health` | Liveness check |
| GET | `/api/env-check` | Which keys are set (gemini, astrology, googleMaps, tier, corsOrigin) – no values |

## Request/response (summary)

- **Kundali:** `{ name, date, time, location, lat?, lon?, tzone?, seconds?, language?, includePredictions? }` → full Kundali + optional predictions.
- **Navamsha:** same birth fields (no name required) → D9 chart.
- **Cosmic-health:** birth data + `language` → health analysis.
- **Muhurat:** `{ date, location, activity, language? }` → muhurat result.
- **Transits generic:** `{ location, rashi, date, language? }` → transits.
- **Gochara:** `{ rashi, date, language? }` → gochara.
- **Horoscope:** `{ sign, date, language?, period? }` → horoscope text.
- **Panchang:** `{ date, location, language? }` → panchang.
- **Matchmaking:** `{ boy, girl, language? }` (each: birth data) → match result.
- **Ashtakoota:** same `{ boy, girl, language? }` → ashtakoota score.
- **Ask-rishi:** `{ prompt, language?, context?, persona? }` → AI response.
- **Tarot:** `{ spread, question, language? }` → tarot reading.
- **Blog-search:** `?q=...&limit=...` → search results.
- **Sync GET:** `?userId=...` → `{ data }`. **Sync POST:** `{ userId, data }` → ok.

Frontend uses backend when `VITE_API_BASE_URL` is set; otherwise it calls direct/third-party APIs where applicable (e.g. Kundali falls back to direct astrology API if backend fails).
