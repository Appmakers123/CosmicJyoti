# CosmicJyoti – Vedic AI Astrology

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff.svg)](https://vitejs.dev/)

A full-featured **Vedic astrology** web and Android app with AI-powered horoscopes, birth charts (Kundali), Panchang, compatibility, tarot, numerology, and more. Built with React, TypeScript, Vite, and optional AI backends (Gemini, Groq, Perplexity).

**Live:** [cosmicjyoti.com](https://www.cosmicjyoti.com)

---

## Features

| Area | Features |
|------|----------|
| **Kundali** | Janam Kundali (D1/D9), Vimshottari Dasha, AI predictions |
| **Horoscope** | Daily / weekly / monthly, personalized by chart, multi-language |
| **Panchang** | Tithi, Nakshatra, Muhurat, auspicious timings |
| **Compatibility** | Guna Milan (Ashtakoota), love match, matchmaking |
| **AI** | Astro Rishi chat (Gemini/Groq/Perplexity), voice input, CosmicHealth, Tarot |
| **Learning** | Planets, houses, zodiac, Nakshatras, numerology, palmistry |
| **Content** | 8 daily AI blog articles, RSS, Google News sitemap |
| **Mobile** | Capacitor Android app, PWA-ready |

---

## Quick start

**Requirements:** Node.js 18+ (see [.nvmrc](.nvmrc)).

**To run both frontend and backend so they can communicate** (Kundali, Rishi, Panchang, etc. use the backend):

```bash
git clone https://github.com/Appmakers123/CosmicJyoti.git
cd CosmicJyoti
npm install
cd server && npm install && cd ..
cp .env.example .env.local
# Edit .env.local: add API_KEY (Gemini), and optionally ASTROLOGY_API_KEYS (freeastrologyapi.com)
npm run dev:all
```

- **Frontend:** http://localhost:5173  
- **Backend:** http://localhost:3001 (the frontend talks to this in dev when both run)

**Other options:**

- **Frontend only:** `npm run dev` — app works but uses direct APIs (set `VITE_ASTROLOGY_API_KEYS` in .env.local for Kundali).
- **Backend only:** `npm run dev:server` or `npm run server` → http://localhost:3001  
- **Both (recommended for local):** `npm run dev:all`

**Production build:**

```bash
npm run build
npm run preview   # test dist/
```

---

## Environment variables

Copy [.env.example](.env.example) to `.env` or `.env.local`. Main options:

| Variable | Purpose |
|----------|---------|
| `API_KEY` / `GEMINI_API_KEY` | Google Gemini (horoscope, Rishi chat, blog fallback, images) |
| `EMBEDDING_MODEL` | Optional: embedding model (default `text-embedding-004`; use Gemini Embedding 2 when available) |
| `GROQ_API_KEY` | Groq (horoscope, chat, daily blog – fast) |
| `PERPLEXITY_API_KEY` | Perplexity (horoscope, blog – web-grounded) |
| `VITE_GOOGLE_API_KEY` | Google Maps (geocoding, timezone) |
| `ASTROLOGY_API_KEYS` | Free Astrology API (Panchang, Muhurat) |

See [.env.example](.env.example) and [BUILD_AND_RUN.md](BUILD_AND_RUN.md) for the full list.

---

## GitHub (push / CI / static deploy)

When you push to GitHub:

- **Build** (e.g. Deploy workflow) runs `npm run build` with optional secrets; the app builds even if no API keys are set (features that need keys are disabled at runtime).
- **Static deploy** (e.g. GitHub Pages): the site works without a backend. Blog search uses **keyword** matching; **Related articles** appear when the repo has run the embeddings step (see below). Set `VITE_API_BASE_URL` in repo Secrets only if you deploy a separate backend.
- **Daily blog workflow** (scheduled or manual): generates posts and commits `public/blog/daily-posts.json`, feed, and sitemaps. If `GEMINI_API_KEY` (or `API_KEY`) is set in repo Secrets, it also runs **blog:embeddings** (optional step; does not fail the job if it errors). That updates posts with `relatedIds` and adds `public/blog/daily-posts-embeddings.json` so related articles and backend semantic search work after deploy.

Do not commit `.env` or `.env.local`; use repo **Secrets** for CI and follow [DEPLOY_WEB.md](DEPLOY_WEB.md) / [DEPLOY.md](DEPLOY.md).

---

## SEO & reaching top 10

To rank in the **top 10** for your category (free Kundali, daily horoscope, Panchang, Guna Milan, etc.), use the step-by-step playbook: **[TOP_10_PLAYBOOK.md](TOP_10_PLAYBOOK.md)**. It covers technical SEO, Search Console, content, internal linking, backlinks, and weekly/monthly checklists.

---

## Documentation

| Doc | Description |
|-----|--------------|
| [TOP_10_PLAYBOOK.md](TOP_10_PLAYBOOK.md) | How to get CosmicJyoti in top 10 (SEO, GSC, content, backlinks) |
| [BUILD_AND_RUN.md](BUILD_AND_RUN.md) | Build, run, and deploy |
| [DEPLOY.md](DEPLOY.md) | Deployment overview |
| [DEPLOY_WEB.md](DEPLOY_WEB.md) | Static / GitHub Pages |
| [DEPLOY_BACKEND.md](DEPLOY_BACKEND.md) | Backend (e.g. Cloud Run) |
| [DYNAMIC_BLOG_SETUP.md](DYNAMIC_BLOG_SETUP.md) | Daily AI blog (Groq/Perplexity/Gemini) |
| [Gemini Embedding 2](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-embedding-2/) | Multimodal embeddings (blog related-articles, future RAG/semantic search) |
| [SECURITY.md](SECURITY.md) | Security and hardening |
| [ANDROID_WEB_APP.md](ANDROID_WEB_APP.md) | Capacitor Android build |
| [docs/](docs/) | SEO, API, ChatGPT, revenue, more |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run dev:server` | Start backend (server/) |
| `npm run dev:all` | Frontend + backend |
| `npm run build` | TypeScript + Vite build |
| `npm run preview` | Preview production build |
| `npm run blog:generate` | Generate 2 AI blog posts (6am slot) |
| `npm run blog:generate:12pm` | 12pm slot (etc. 6pm, 9pm) |
| `npm run blog:embeddings` | Generate blog embeddings + related articles (Gemini Embedding API) |
| `npm run video:generate` | Generate one AI video for 2am slot (Veo via Gemini API) |
| `npm run video:generate:2am` | 2am slot (use 7am, 11am, 2pm, 5pm, 7pm, 10pm, 12am for others) |
| `npm run android:build` | Build web + sync Capacitor Android |
| `npm run audit` | Security audit |

---

## Project structure

```
CosmicJyoti/
├── components/       # React UI (ChatWidget, KundaliResult, etc.)
├── services/         # API clients (Gemini, Groq, Perplexity, backend)
├── utils/            # Helpers, sanitize, API key rotation
├── server/           # Optional Express API (Kundali, horoscope, Panchang)
├── scripts/          # generate-daily-blog.mjs, export, translate
├── public/           # Static assets, blog, feed.xml
└── docs/             # Extra documentation
```

---

## License and copyright

This project is licensed under the **MIT License** – see [LICENSE](LICENSE) and [COPYRIGHT](COPYRIGHT).

---

## Contributing

We welcome issues and pull requests. Please read [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

---

**CosmicJyoti** – Vedic astrology, powered by AI.
