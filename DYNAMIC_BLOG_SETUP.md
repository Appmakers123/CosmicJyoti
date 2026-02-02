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

1. **Daily at 6 AM IST** – GitHub Actions runs `generate-daily-blog.mjs`
2. **Gemini** – Generates 3 astrology blog posts (Kundali, remedies, numerology, etc.)
3. **Commit** – Writes to `public/blog/daily-posts.json` and pushes to `main`
4. **Deploy** – Push triggers your main deploy workflow (GitHub Pages)
5. **blog.html** – Fetches `/blog/daily-posts.json` and shows the 3 cards
6. **article.html** – Full article view when user clicks "Read More"

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

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No blog posts yet" | Run the workflow manually once, or run the script locally |
| 404 on daily-posts.json | Ensure `public/blog/daily-posts.json` exists and is committed |
| Workflow fails | Check `API_KEY` secret is set; check Actions logs |
| Article not found | Slug in URL must match `slug` in JSON; check `?id=slug` |

---

## Quick Checklist

- [ ] Add `API_KEY` to GitHub Secrets
- [ ] Run "Generate Daily Blog" workflow once (or run script locally)
- [ ] Verify `public/blog/daily-posts.json` is committed
- [ ] Deploy (push triggers deploy)
- [ ] Visit blog page and confirm "Today's AI Articles" loads
