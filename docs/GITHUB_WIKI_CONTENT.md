# CosmicJyoti – GitHub Wiki Content

Copy the sections below into your [GitHub Wiki](https://github.com/Appmakers123/CosmicJyoti/wiki). You can use one **Home** page or split into multiple pages (e.g. Home, Setup, Deployment, Environment-Variables).

---

## Option A: Single Home page (paste all below into Wiki → Home → Edit)

---

# CosmicJyoti

**Vedic AI Astrology** – Kundali, horoscope, Panchang, compatibility, Rishi chat, and more.  
**Live:** [cosmicjyoti.com](https://www.cosmicjyoti.com)

---

## Features

| Area | Features |
|------|----------|
| **Kundali** | Janam Kundali (D1/D9), Vimshottari Dasha, AI predictions |
| **Horoscope** | Daily / weekly / monthly, personalized, multi-language |
| **Panchang** | Tithi, Nakshatra, Muhurat, auspicious timings |
| **Compatibility** | Guna Milan (Ashtakoota), matchmaking |
| **AI** | Astro Rishi chat (Gemini/Groq/Perplexity), Cosmic Health, Tarot |
| **Content** | Daily AI blog, RSS, AI videos |
| **Mobile** | Capacitor Android app, PWA-ready |

---

## Quick start

**Requirements:** Node.js 18+

```bash
git clone https://github.com/Appmakers123/CosmicJyoti.git
cd CosmicJyoti
npm install
cd server && npm install && cd ..
cp .env.example .env.local
# Edit .env.local: add API_KEY (Gemini), ASTROLOGY_API_KEYS (optional)
npm run dev:all
```

- **Frontend:** http://localhost:5173  
- **Backend:** http://localhost:3001  

**Commands:**

| Command | Description |
|---------|-------------|
| `npm run dev:all` | Run frontend + backend together (recommended) |
| `npm run dev` | Frontend only |
| `npm run dev:server` | Backend only |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

---

## Environment variables

Copy `.env.example` to `.env.local`. Main variables:

| Variable | Purpose |
|----------|---------|
| `API_KEY` / `GEMINI_API_KEY` | Gemini (Rishi, horoscope, blog, images) |
| `ASTROLOGY_API_KEYS` / `VITE_ASTROLOGY_API_KEYS` | Free Astrology API – Kundali, Panchang (comma-separated; app tries next key if one fails) |
| `VITE_GOOGLE_API_KEY` | Google Maps – Geocoding + Time Zone API (enable in Cloud Console and in key restrictions) |
| `VITE_API_BASE_URL` | Backend URL for deployed site (e.g. Render or Cloud Run). When set, API + user sync use this. |
| `VITE_GOOGLE_CLIENT_ID` | Google Sign-In (OAuth Client ID) |
| `GROQ_API_KEY` | Optional – Groq for horoscope/blog |
| `PERPLEXITY_API_KEY` | Optional – Perplexity for horoscope/blog |

See [.env.example](https://github.com/Appmakers123/CosmicJyoti/blob/main/.env.example) in the repo for the full list.

---

## Cost control (Gemini / Google AI Studio)

To keep **Gemini API spend around ₹800/month**:

1. **Set a monthly spend cap:** In [Google AI Studio → Usage](https://aistudio.google.com/usage), click **Edit spend cap** and set it to **₹800**. This hard-limits billing (overages may occur for up to ~30 minutes; resets on the 1st of each month PST).
2. **What we already do to reduce cost:**
   - **Blog search:** Query embeddings are cached for 1 hour (same search = no extra embed call).
   - **Blog embeddings:** Run only once per day (6am slot), not on every blog run.
   - **Daily blog:** 2 runs per day (6am, 6pm) instead of 4.
   - **Daily AI video:** 1 video per day (02:00 UTC).
3. **Free-tier limits** in the app (Kundali, horoscope, tarot, etc.) cap how often unsubscribed users can call AI; adjust in `utils/freeUsageLimits.ts` if needed.

---

## Deployment

### Frontend (e.g. GitHub Pages)

1. **Settings → Secrets and variables → Actions**
2. Add **`VITE_API_BASE_URL`** = your backend URL (e.g. `https://cosmicjyoti.onrender.com` or your Cloud Run URL). No trailing slash.
3. Optionally add: `API_KEY`, `ASTROLOGY_API_KEYS` or `VITE_ASTROLOGY_API_KEYS`, `VITE_GOOGLE_API_KEY`, `VITE_GOOGLE_CLIENT_ID`
4. Push to `main` or run the **Deploy to GitHub Pages** workflow

### Backend

- Deploy the **`server/`** folder to Render, Google Cloud Run, Railway, or any Node host.
- Set **`CORS_ORIGIN`** to your frontend URL(s), e.g. `https://yourusername.github.io,https://yourusername.github.io/CosmicJyoti`
- Set `API_KEY` or `GEMINI_API_KEY` and optionally `ASTROLOGY_API_KEYS` on the server.

When `VITE_API_BASE_URL` is set in the build, the site uses that backend for Kundali, Rishi, Panchang, and user sync (profile + saved reports).

---

## Astrology API keys

- Use **multiple keys** (comma-separated) in `ASTROLOGY_API_KEYS` or `VITE_ASTROLOGY_API_KEYS`.
- The app **automatically tries the next key** when one fails (quota, invalid key, 429, etc.).
- Get keys from [freeastrologyapi.com](https://www.freeastrologyapi.com/).  
- Backend uses `ASTROLOGY_API_KEYS`; frontend build needs `VITE_ASTROLOGY_API_KEYS` (or the same value in GitHub Secrets as `ASTROLOGY_API_KEYS` for the deploy workflow).

---

## Documentation in the repo

| Doc | Description |
|-----|-------------|
| [README](https://github.com/Appmakers123/CosmicJyoti/blob/main/README.md) | Overview, quick start, scripts |
| [DEPLOY.md](https://github.com/Appmakers123/CosmicJyoti/blob/main/DEPLOY.md) | Full deployment (frontend + backend) |
| [.env.example](https://github.com/Appmakers123/CosmicJyoti/blob/main/.env.example) | All environment variables |
| [docs/USER_SYNC.md](https://github.com/Appmakers123/CosmicJyoti/blob/main/docs/USER_SYNC.md) | User sync (profile + saved reports) |

---

## Workflows (GitHub Actions)

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **Deploy to GitHub Pages** | Push to `main` / manual | Builds frontend, starts backend for verification, deploys to Pages |
| **Generate Daily Blog** | Once per day (6am IST) / manual | Generates 2 AI blog posts, feed, sitemaps, embeddings (saves cost) |
| **Generate Daily AI Video** | Once per day (02:00 UTC) / manual | One AI video per day; commits video + `daily-videos.json` (saves cost) |

Secrets used by workflows: `GEMINI_API_KEY`, `VITE_API_BASE_URL`, `VITE_ASTROLOGY_API_KEYS`, `PERPLEXITY_API_KEYS` (blog), etc. See the workflow files in `.github/workflows/`.

---

## Tech stack

- **Frontend:** React 19, TypeScript, Vite 5  
- **Backend:** Node.js, Express (in `server/`)  
- **AI:** Google Gemini, optional Groq, Perplexity  
- **Astrology:** Free Astrology API (freeastrologyapi.com) with key rotation  
- **Mobile:** Capacitor (Android)

---

*For detailed setup, deployment, and SEO, see the [repository](https://github.com/Appmakers123/CosmicJyoti) and [DEPLOY.md](https://github.com/Appmakers123/CosmicJyoti/blob/main/DEPLOY.md).*
