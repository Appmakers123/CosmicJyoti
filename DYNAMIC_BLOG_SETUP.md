# Dynamic AI Blog – 3 Daily Topics (No Backend)

This guide explains how the **3 daily AI-generated blog articles** work using **GitHub Actions only**—no backend server required.

---

## Architecture

```
┌─────────────────────┐     Daily 6 AM IST     ┌──────────────────────┐
│  GitHub Actions     │ ─────────────────────► │  scripts/            │
│  (scheduled cron)  │                        │  generate-daily-     │
└─────────────────────┘                        │  blog.mjs            │
                                               └──────────┬───────────┘
                                                          │
                                                          ▼
                                               ┌──────────────────────┐
                                               │  Gemini API          │
                                               │  (3 blog posts)      │
                                               └──────────┬───────────┘
                                                          │
                                                          ▼
                                               ┌──────────────────────┐
                                               │  public/blog/        │
                                               │  daily-posts.json    │
                                               └──────────┬───────────┘
                                                          │
                                                          ▼
┌─────────────────────┐     Fetch static file  ┌──────────────────────┐
│  blog.html         │ ◄───────────────────── │  GitHub Pages        │
│  (Today's AI       │                         │  (static hosting)    │
│   Articles)        │                         └──────────────────────┘
└─────────────────────┘
```

---

## What's Included

| File | Purpose |
|------|---------|
| `scripts/generate-daily-blog.mjs` | Node script that calls Gemini API and writes `public/blog/daily-posts.json` |
| `.github/workflows/daily-blog.yml` | Runs daily at 6 AM IST (00:30 UTC), generates posts, commits & pushes |
| `public/blog/daily-posts.json` | Static JSON with 3 daily posts (seed data included) |
| `public/blog.html` | "Today's AI Articles" section that fetches `/blog/daily-posts.json` |
| `public/blog/article.html` | Detail page for each AI article (loads by `?id=slug`) |

---

## Setup (One-Time)

### 1. Add GitHub Secret

1. Go to **GitHub** → your repo → **Settings** → **Secrets and variables** → **Actions**
2. Add secret: **`API_KEY`** = your Gemini API key

   (If you already have `API_KEY` for the main deploy, you're done.)

### 2. Trigger First Generation

**Option A – Manual run**

1. Go to **Actions** → **Generate Daily Blog**
2. Click **Run workflow** → **Run workflow**
3. Wait ~1–2 minutes. The workflow will commit `public/blog/daily-posts.json` to your repo.

**Option B – Local run**

```bash
API_KEY=your_gemini_api_key node scripts/generate-daily-blog.mjs
git add public/blog/daily-posts.json
git commit -m "chore: add daily AI blog posts"
git push
```

---

## How It Works

1. **Research + original writing** – The script asks Gemini to search the web for each topic (what famous astrologers and popular astrology sites have written), then write 3 **entirely original** articles in its own words so there is no plagiarism. When available, it uses **Google Search grounding** (gemini-2.0-flash); otherwise it uses gemini-1.5-flash without search.
2. **Daily at 6 AM IST** – GitHub Actions runs `generate-daily-blog.mjs`
3. **Gemini** – Generates 3 astrology blog posts (Kundali, remedies, numerology, etc.)
4. **Commit** – Writes to `public/blog/daily-posts.json` and pushes to `main`
5. **Deploy** – Push triggers your main deploy workflow (GitHub Pages)
6. **blog.html** – Fetches `/blog/daily-posts.json` and shows the 3 cards
7. **article.html** – Full article view when user clicks "Read More"

---

## npm Script (Optional)

Add to `package.json`:

```json
"scripts": {
  "blog:generate": "node scripts/generate-daily-blog.mjs"
}
```

Then run: `API_KEY=xxx npm run blog:generate`

---

## Customization

### Change schedule

Edit `.github/workflows/daily-blog.yml`:

```yaml
schedule:
  - cron: '30 0 * * *'   # 6 AM IST (00:30 UTC)
  # Examples:
  # - cron: '0 1 * * *'  # 6:30 AM IST
  # - cron: '0 0 * * *'  # 5:30 AM IST
```

### Change Gemini prompt

Edit `scripts/generate-daily-blog.mjs` – update the `PROMPT` constant.

### Add Hindi support

Extend the prompt to generate Hindi content and add a `lang` query param to the article page.

---

## How to know if it's working

### 1. Run locally and watch the output

```bash
API_KEY=your_gemini_api_key node scripts/generate-daily-blog.mjs
```

**Success looks like:**

```
Generating 3 blog posts for 2025-02-13: kundali, daily, panchang
Found 3 existing posts
Model: gemini-2.0-flash (with Google Search grounding)
[OK] Generated with Google Search grounding.
[DONE] Added 3 new posts. Total: 6 posts in .../public/blog/daily-posts.json
New titles: Understanding Your Kundali | Today's Horoscope Guide | ...
```

- **`[OK] Generated with Google Search grounding`** → Web search was used (research + original writing).
- **`[FALLBACK] ... retrying without web search`** then **`[OK] Generated with gemini-1.5-flash`** → Grounding wasn’t available; articles still generated without search.
- **`[DONE] Added 3 new posts`** → Script worked; check `public/blog/daily-posts.json`.

### 2. Check the output file

- Open **`public/blog/daily-posts.json`**.
- Confirm **`lastGenerated`** is today’s date and **`posts`** has 3 new entries at the top (with today’s date in `id` / `date`).
- New posts have `title`, `excerpt`, `content` (HTML), and `serviceMode`.

### 3. GitHub Actions (scheduled or manual)

- Go to **Actions** → **Generate Daily Blog**.
- Open the latest run → **generate** job → **Generate daily blog posts** step.
- Same log lines as above: look for **Model: gemini-2.0-flash (with Google Search grounding)** and **`[DONE] Added 3 new posts`**.
- Then check **Commit and push**: either “No changes to commit” (same day already run) or a commit with message `chore: update daily AI blog posts`.

### 4. On the site / app

- **Web:** Open your blog page (e.g. `https://www.cosmicjyoti.com/blog.html`) and the “Today’s AI Articles” (or “AI Articles”) section — you should see the 3 newest cards.
- **In-app:** Open **Learn Astrology** → **AI Articles** — same 3 articles with “Read More” and “Try [tool]” links.

If any step fails, see **Troubleshooting** below.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No blog posts yet" | Run the workflow manually once, or run the script locally |
| 404 on daily-posts.json | Ensure `public/blog/daily-posts.json` exists and is committed |
| Workflow fails | Check `API_KEY` secret is set; check Actions logs |
| Article not found | Slug in URL must match `slug` in JSON; check `?id=slug` |
| Disable web search | Set secret/env `USE_GOOGLE_SEARCH_GROUNDING=false` to use gemini-1.5-flash only |

---

## Quick Checklist

- [ ] Add `API_KEY` to GitHub Secrets
- [ ] Run "Generate Daily Blog" workflow once (or run script locally)
- [ ] Verify `public/blog/daily-posts.json` is committed
- [ ] Deploy (push triggers deploy)
- [ ] Visit blog page and confirm "Today's AI Articles" loads
