# Dynamic AI Blog – 8 Posts per Day (4 Time Slots, Perplexity Only)

This guide explains how **2 AI-generated blog articles per time slot** (8 per day) work using **Perplexity API only**, scheduled via GitHub Actions.

---

## Time Slots (IST)

| Slot  | Time (IST) | Topics |
|-------|------------|--------|
| **6am**  | Morning 6:00 | Horoscope + Compatibility |
| **12pm** | Noon 12:00   | Career, Love, and other dashboard modules (2 rotating) |
| **6pm**  | Evening 6:00 | Planetary position and its effect (2 articles) |
| **9pm**  | Night 9:00   | Events and muhurat for the next day (2 articles) |

Each run generates **2 blog posts** and appends them to `public/blog/daily-posts.json` (newest first, cap 100).

---

## Architecture

```
┌─────────────────────┐   4x daily (6am, 12pm, 6pm, 9pm IST)   ┌──────────────────────┐
│  GitHub Actions     │ ─────────────────────────────────────► │  scripts/            │
│  (scheduled cron)   │                                        │  generate-daily-     │
└─────────────────────┘                                        │  blog.mjs [slot]     │
                                                                └──────────┬───────────┘
                                                                           │
                                                                           ▼
                                                                ┌──────────────────────┐
                                                                │  Perplexity API       │
                                                                │  (2 posts per slot)   │
                                                                └──────────┬───────────┘
                                                                           │
                                                                           ▼
                                                                ┌──────────────────────┐
                                                                │  public/blog/         │
                                                                │  daily-posts.json     │
                                                                └──────────┬───────────┘
                                                                           │
                                                                           ▼
┌─────────────────────┐     Fetch static file                  ┌──────────────────────┐
│  blog / AI Articles │ ◄───────────────────────────────────── │  GitHub Pages        │
└─────────────────────┘                                        └──────────────────────┘
```

---

## What's Included

| File | Purpose |
|------|---------|
| `scripts/generate-daily-blog.mjs` | Node script; uses **Perplexity only**. Accepts slot: `6am`, `12pm`, `6pm`, `9pm`. Writes 2 posts per run. |
| `.github/workflows/daily-blog.yml` | Runs at 00:30, 06:30, 12:30, 15:30 UTC (6am, 12pm, 6pm, 9pm IST). Manual run lets you pick slot. |
| `public/blog/daily-posts.json` | All posts (newest first); each post can have `timeSlot` (6am, 12pm, 6pm, 9pm). |
| `public/blog/feed.xml` | RSS feed (latest 30). |
| `public/blog/sitemap-blog.xml` | Blog sitemap (latest 50). |

---

## Setup (One-Time)

### 1. Add GitHub Secret

1. Go to **GitHub** → your repo → **Settings** → **Secrets and variables** → **Actions**
2. Add secret: **`PERPLEXITY_API_KEY`** = your Perplexity API key (required).
   - Optional: **`PERPLEXITY_API_KEYS`** (comma-separated) for multiple keys; the script uses the first.

### 2. Trigger First Generation

**Option A – Manual run (pick slot)**

1. Go to **Actions** → **Generate Daily Blog**
2. Click **Run workflow** → choose **slot** (6am, 12pm, 6pm, 9pm) → **Run workflow**
3. The workflow will generate 2 posts for that slot and commit.

**Option B – Local run**

From project root (ensure `.env` or `.env.local` has `PERPLEXITY_API_KEY`):

```bash
npm run blog:generate        # 6am slot (Horoscope + Compatibility)
npm run blog:generate:12pm   # Noon (Career/Love/modules)
npm run blog:generate:6pm    # Evening (Planetary)
npm run blog:generate:9pm    # Night (Tomorrow's events)
```

Or with node:

```bash
node scripts/generate-daily-blog.mjs 6am
node scripts/generate-daily-blog.mjs 12pm
node scripts/generate-daily-blog.mjs 6pm
node scripts/generate-daily-blog.mjs 9pm
```

---

## How It Works

1. **Perplexity only** – The script uses the Perplexity API (sonar model) to research and write original articles. No Gemini/API_KEY needed for blog generation.
2. **Slot-based** – You pass a slot (`6am`, `12pm`, `6pm`, `9pm`). Each slot has a fixed theme and generates exactly 2 posts.
3. **4 runs per day** – GitHub Actions runs at 00:30, 06:30, 12:30, 15:30 UTC so that roughly 6am, 12pm, 6pm, 9pm IST get 2 new posts each.
4. **Append** – New posts are prepended to the list; total posts are capped at 100.
5. **RSS & sitemap** – Updated after each run.

---

## npm Scripts

| Script | Effect |
|--------|--------|
| `npm run blog:generate` | Same as `blog:generate:6am` |
| `npm run blog:generate:6am` | 2 posts: Horoscope + Compatibility |
| `npm run blog:generate:12pm` | 2 posts: rotating dashboard modules (e.g. Tarot, Numerology, Kundali, Panchang, …) |
| `npm run blog:generate:6pm` | 2 posts: Planetary position and effects |
| `npm run blog:generate:9pm` | 2 posts: Tomorrow’s events and muhurat |

---

## Customization

- **Schedule** – Edit `.github/workflows/daily-blog.yml` cron expressions (times are in UTC).
- **Prompts / topics** – Edit `scripts/generate-daily-blog.mjs`: `buildPrompt6am`, `buildPrompt12pm`, `buildPrompt6pm`, `buildPrompt9pm`, and `NOON_MODULES` for 12pm rotation.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Set PERPLEXITY_API_KEY" | Add `PERPLEXITY_API_KEY` to GitHub Secrets or `.env.local` for local runs. |
| "Unknown slot" | Use exactly `6am`, `12pm`, `6pm`, or `9pm` (or `morning`, `noon`, `evening`, `night`). |
| Perplexity API error | Check key validity, quota, and network. |
| Wrong slot in scheduled run | Workflow infers slot from UTC hour (00→6am, 06→12pm, 12→6pm, 15→9pm). |

---

## Quick Checklist

- [ ] Add **PERPLEXITY_API_KEY** to GitHub Secrets (and/or `.env.local` for local)
- [ ] Run "Generate Daily Blog" workflow once per slot (or run script locally with slot)
- [ ] Verify `public/blog/daily-posts.json` gets 2 new posts per run
- [ ] Deploy; visit blog / AI Articles to see latest posts
