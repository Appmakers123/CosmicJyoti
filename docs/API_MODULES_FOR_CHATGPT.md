# Backend API vs App Modules – ChatGPT / Add Apps Integration

## Summary: Do you have APIs for all modules?

**No.** You have backend APIs for **11 feature areas**. Many app modules (Numerology, Sade Sati, Lal Kitab, Prashna Kundali, Varshphal, Name Suggestions, Palm/Face/Dream, etc.) run **only in the frontend** (client-side or direct Gemini) and have **no** dedicated backend API. For ChatGPT “Add apps” (Actions), you can only expose what exists as HTTP APIs below.

---

## Backend APIs that exist (ready for ChatGPT Actions)

| API endpoint | Method | Purpose | Request body (main fields) |
|--------------|--------|---------|-----------------------------|
| `/api/kundali` | POST | Birth chart (D1) with optional AI predictions | `name, date, time, location, language, includePredictions` |
| `/api/navamsha` | POST | D9 chart only | `date, time, location` |
| `/api/cosmic-health` | POST | Health analysis from birth chart | `date, time, city, language` |
| `/api/muhurat` | POST | Auspicious timings for a date/location | `date, location, activity, language` |
| `/api/transits/generic` | POST | Transits by Moon sign (no birth chart) | `location, rashi, currentDate, language` |
| `/api/gochara` | POST | Personal transits (with birth details) | `birthDate, birthTime, birthLocation, currentDate, language` |
| `/api/horoscope` | POST | Daily horoscope by zodiac sign | `sign, date, language` |
| `/api/panchang` | POST | Daily Panchang for a location | `date, location, language` |
| `/api/matchmaking` | POST | Full matchmaking report (boy + girl) | `boy, girl, language` (each: name, date, time, location) |
| `/api/ashtakoota` | POST | Ashtakoota / Guna Milan only | `personA, personB, language` |
| `/api/ask-rishi` | POST | AI chat (Rishi agent) | `prompt, language, context?, persona?` |
| `/api/tarot` | POST | Tarot reading | `question, spread?, language` |

- **Health:** `GET /health` for liveness.
- **Cache (admin):** `POST /api/cache/clear`, `GET /api/cache/stats` (optional for ChatGPT).

Base URL in dev: `http://localhost:3001`. For ChatGPT you will use your public backend URL (e.g. `https://api.cosmicjyoti.com` or your deployed server).

---

## App modules with NO dedicated backend API (client-only or Gemini direct)

These are **not** available as HTTP APIs today. To expose them in ChatGPT Add apps, you’d need to add new server routes and optional backend logic.

| Module (view mode) | Current behavior | Suggested API (if you add) |
|--------------------|------------------|----------------------------|
| **Numerology** | Client-side or Gemini direct | `POST /api/numerology` (name + DOB → life path, destiny, etc.) |
| **Mobile numerology** | Client-side | `POST /api/mobile-numerology` (phone number → analysis) |
| **Sade Sati** | Client (Moon sign + dates) | `POST /api/sade-sati` (moonSign or birth details → phase, dates) |
| **Prashna Kundali** | Client / question-time chart | `POST /api/prashna-kundali` (question + date/time/location) |
| **Lal Kitab** | Static data / client | `POST /api/lal-kitab` (planet/topic → totkas/upay) |
| **Varshphal** | Client / derived from chart | `POST /api/varshphal` (birth details + year) |
| **Name suggestions** | Client / Gemini? | `POST /api/name-suggestions` (nakshatra/letters → names) |
| **Upay / Remedies** | Client / static | `POST /api/upay` or `/api/remedies` (planet/topic → remedies) |
| **Disha** | Client | `POST /api/disha` (birth + direction logic) |
| **Birthstone** | Client / static | `GET/POST /api/birthstone` (DOB or sign → gemstone) |
| **Palm reading** | Client / AI | `POST /api/palm-reading` (image or text → reading) |
| **Face reading** | Client / AI | `POST /api/face-reading` (image or text) |
| **Dream interpreter** | Client / AI | `POST /api/dream-interpret` (dream text → interpretation) |
| **Loshu Grid, I-Ching, Runes, Signature** | Client logic | Optional small APIs if you want them in ChatGPT |
| **Mantra, Rudraksh, Vastu, Gemstones, Yantra** | Static/learning content | Optional content APIs (e.g. by topic) |
| **Learning / Guides / Astro Lab / Star Legends** | Static content | Optional `GET /api/learning/:topic` if needed |
| **Appointment, AI Blog** | No backend | Only add if you build backend for them |

---

## What to use for “ChatGPT Add apps” (Actions) right now

You **can** integrate today using only the **existing** backend:

1. **Base URL**  
   Your deployed backend, e.g. `https://your-backend.cosmicjyoti.com` (no trailing slash).

2. **Authentication**  
   If your backend uses API keys or Bearer tokens, add them in the ChatGPT Action’s “Authentication” section. Today your server may allow unauthenticated requests; for production you’ll want at least an API key or similar.

3. **OpenAPI schema**  
   ChatGPT expects an OpenAPI (Swagger) spec that describes:
   - Server URL
   - Paths: e.g. `/api/kundali`, `/api/panchang`, `/api/horoscope`, `/api/ask-rishi`, etc.
   - For each path: method, request body schema (e.g. `name`, `date`, `time`, `location`, `language`), and response description.

4. **Recommended actions to expose first**  
   - `POST /api/kundali` – free kundali / birth chart  
   - `POST /api/panchang` – today’s Panchang  
   - `POST /api/horoscope` – daily horoscope by sign  
   - `POST /api/ask-rishi` – AI chat  
   - `POST /api/matchmaking` or `POST /api/ashtakoota` – compatibility  
   - `POST /api/muhurat` – muhurat  
   - `POST /api/tarot` – tarot reading  

So: **you do not have all modules as backend APIs**, but you have enough to build a useful ChatGPT “Add apps” integration. To make “all modules” available to ChatGPT, you’d need to add the missing routes (and optionally backend logic) listed in the table above and then add them to your OpenAPI spec and ChatGPT Action.

---

## File references

- **Server routes:** `server/index.js` (all `app.get` / `app.post`).
- **Frontend backend client:** `services/backendService.ts` (only the 11 features above call the backend; rest use client or Gemini direct).
- **App modes:** `types.ts` (`AppViewMode` / `ViewMode`).
