# Daily AI Blog – Scheduled Generation

The app generates 2 AI blog posts per time slot via GitHub Actions.

## Schedule (IST)

| Slot | IST   | UTC (cron) | Content |
|------|--------|------------|---------|
| 6am  | 6:00  | 00:30      | Horoscope + Compatibility |
| 12pm | 12:00 | 06:30      | Career, Love, rotating modules |
| 6pm  | 18:00 | 12:30      | Planetary positions and effects |
| 9pm  | 21:00 | 15:30      | Next day’s muhurat and events |

## If the morning run didn’t run

1. **Secrets**  
   In the repo: **Settings → Secrets and variables → Actions** ensure at least one of:
   - `PERPLEXITY_API_KEY`
   - `PERPLEXITY_API_KEYS` (comma‑separated list)  
   is set. The workflow uses these; the script exits with an error if none are set.

   **401 Authorization Required:** If the run fails with Perplexity API 401 for all keys, the keys are invalid, expired, or revoked. Create new keys at [Perplexity API settings](https://www.perplexity.ai/settings/api) and update repo **Secrets** (`PERPLEXITY_API_KEY` or `PERPLEXITY_API_KEYS`). Use comma-separated keys with no extra spaces; keys usually start with `pplx-`. If keys work locally but not in Actions, Perplexity may be blocking CI IPs—try a new key or contact support.

2. **Scheduled runs**  
   GitHub can delay or skip scheduled workflows on inactive repos. Trigger once manually to confirm:
   - **Actions** tab → **Generate Daily Blog** → **Run workflow** → choose slot (e.g. **6am**) → **Run workflow**.

3. **Slot resolution**  
   The job picks the slot from the **current UTC hour** when the job runs:
   - UTC 00, 01, 02 → 6am
   - UTC 06, 07 → 12pm
   - UTC 12, 13 → 6pm
   - UTC 15, 16 → 9pm  
   So if the cron runs a bit late (e.g. 01:xx UTC), it still uses the 6am slot.

4. **Local run**  
   To generate posts locally (e.g. to test):
   ```bash
   # .env or .env.local must have PERPLEXITY_API_KEY or PERPLEXITY_API_KEYS
   node scripts/generate-daily-blog.mjs 6am
   ```

## Output

- `public/blog/daily-posts.json` – list of posts (in‑app AI Articles read this)
- `public/blog/feed.xml` – RSS feed
- `public/blog/sitemap-blog.xml` – blog sitemap

Commit and push are done by the workflow when run in GitHub Actions.
