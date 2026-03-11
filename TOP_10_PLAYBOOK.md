# How to Get CosmicJyoti in the Top 10 for Your Category

This playbook gives you a clear path to rank in the **top 10** for Vedic astrology searches (free Kundali, daily horoscope, Panchang, Guna Milan, rashifal, etc.). Your app already has strong foundations; these steps close gaps and build authority.

---

## Define “your category”

Focus on terms where you can realistically compete:

| Category | Example keywords |
|----------|------------------|
| **Free tools** | free kundali, free kundli, free birth chart, free horoscope, free kundli by date of birth |
| **Daily / today** | daily horoscope today, today horoscope, aaj ka rashifal, today panchang, aaj ka panchang |
| **Marriage / match** | guna milan, kundali milan, marriage compatibility, ashtakoot |
| **Vedic / Indian** | vedic astrology, janam kundali, muhurat 2026, panchang meaning |
| **Specific tools** | sade sati calculator, lal kitab totkas, prashna kundali, mobile number numerology |

**Goal:** Top 10 for 5–10 of these phrases in India (English + Hindi) first, then expand.

---

## Phase 1: Technical (do in week 1)

### 1.1 One canonical domain

- Use **one** main URL (e.g. `https://www.cosmicjyoti.com`).
- **301 redirect** all other variants (e.g. `cosmicjyoti.com`, `http://`) to that URL.
- See [docs/HOST_REDIRECTS.md](docs/HOST_REDIRECTS.md).

### 1.2 Google Search Console

- Add property: [search.google.com/search-console](https://search.google.com/search-console) → your domain.
- **Submit sitemaps:** `https://www.cosmicjyoti.com/sitemap.xml`, `https://www.cosmicjyoti.com/blog/sitemap-blog.xml` (and news sitemap if you use it).
- **Request indexing** for: `/`, `/?mode=kundali`, `/?mode=panchang`, `/?mode=daily`, `/?mode=matchmaking`, `/?mode=sadesati-dasha`, `/?mode=lal-kitab`, blog index.
- Check **Performance** → see which queries get impressions; improve titles/descriptions for high-impression, low-click queries.

### 1.3 Core Web Vitals

- Target: **LCP &lt; 2.5s**, **INP &lt; 100ms**, **CLS &lt; 0.1**.
- Test: [PageSpeed Insights](https://pagespeed.web.dev/) for home and 2–3 key tool URLs.
- Fix “Critical” and “High” issues (images, JS size, layout shifts). Fast pages rank better.

### 1.4 Mobile and HTTPS

- Confirm site is **mobile-friendly**: [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly).
- Ensure **HTTPS** everywhere.

---

## Phase 2: On-page and content (weeks 2–4)

### 2.1 Titles and meta

- Every important view already has meta in [utils/pageMeta.ts](utils/pageMeta.ts). Ensure **main keyword** is in the first 60 characters of the title and in the meta description (e.g. “Free Kundali”, “Today’s Panchang”).
- Blog articles: unique `<title>` and meta per article (you have this); keep “date + topic” in title for “today” queries.

### 2.2 One URL per “thing” people search for

- **Daily horoscope:** Ideally one URL per date (and per sign if possible), e.g. `/horoscope/2026-03-11` or `?mode=daily&date=2026-03-11`, with title like “Daily Horoscope – 11 March 2026 | CosmicJyoti”.
- **Panchang / Muhurat:** One URL per date with “Panchang”/“Muhurat” and date in title and content.
- **Blog:** You already have one URL per article; keep dates and keywords in titles.

### 2.3 Visible date and author

- Show **publication/update date** on every article (and key tool pages if they change).
- Use the **same date** in HTML, JSON-LD (`datePublished`/`dateModified`), and sitemap.
- Use a **consistent byline** (e.g. “CosmicJyoti” or “Nikesh Maurya”) in schema and on the page.

### 2.4 Focused landing content

- For each key tool (Sade Sati, Kundali, Lal Kitab, Panchang, Guna Milan, etc.), have **one clear intro** on the tool screen (you have this) plus **one dedicated article** that targets the search phrase and links to the tool.
- Example: “How to Check Sade Sati by Moon Sign – Free Calculator” → links to your Sade Sati calculator. Repeat for free Kundali, today panchang, Guna Milan, etc. See [docs/SEO_TOP_SEARCH_GUIDE.md](docs/SEO_TOP_SEARCH_GUIDE.md).

---

## Phase 3: Internal linking and freshness (ongoing)

### 3.1 Internal links

- From **each blog article** link to 2–3 relevant tools (Kundali, Panchang, Guna Milan, etc.) with descriptive anchor text (“Free Kundali”, “Today’s Panchang”).
- From **hub / home** link to “Today’s Horoscope”, “Today’s Panchang”, and latest articles with normal `<a href="...">` where possible.
- Your AI articles already have “Try [tool]” CTAs; keep and expand.

### 3.2 Daily content

- Keep **daily blog** running (Groq/Perplexity/Gemini via `npm run blog:generate:12pm` etc.) so Google sees regular updates.
- **Today’s Horoscope** and **Today’s Panchang** are already in the app; ensure the URLs that serve them are crawlable and have date in title/description when possible.

### 3.3 RSS and News (optional)

- Keep **blog/feed.xml** valid; submit **sitemap-news.xml** in [Publisher Center](https://publishercenter.google.com/) if you want Google News visibility. See [docs/GLOBAL_VISIBILITY_AND_GOOGLE_NEWS.md](docs/GLOBAL_VISIBILITY_AND_GOOGLE_NEWS.md).

---

## Phase 4: Authority and backlinks (months 2–6)

### 4.1 E-E-A-T

- **Experience:** “Used by thousands for free Kundali and horoscope” (or similar) on About/landing.
- **Expertise:** Accurate Vedic terms (Rashi, Nakshatra, Tithi); correct calculations; no deceptive claims.
- **Authoritativeness:** Consistent branding, optional citations, and backlinks from real sites.
- **Trust:** [SECURITY.md](SECURITY.md), privacy/terms if you add them, contact page, HTTPS.

### 4.2 Backlinks (quality over quantity)

- **Do:** Guest posts on astrology/lifestyle blogs, “best free Kundali tools” roundups, interviews, partnerships, PR, social shares that get picked up.
- **Don’t:** Buy links or link schemes (risk of penalties).
- List 5–10 **realistic targets** (sites that might mention or link to you) and reach out.

### 4.3 Social and sharing

- Share **direct tool links** (e.g. Sade Sati, Kundali, Today’s Panchang) on social so Google sees traffic and engagement to those URLs.
- Encourage in-app sharing (you already have Share on horoscope, Panchang, articles); add “Share” where it’s missing on high-value pages.

---

## Checklist: this week

- [ ] **Canonical:** 301 redirect to one host (www or non-www).
- [ ] **Search Console:** Verify property, submit sitemap.xml (and blog sitemap).
- [ ] **Request indexing** for home + 5–7 key tool URLs.
- [ ] **PageSpeed:** Run on home and 2 tool URLs; fix at least one “Critical” or “High” issue.
- [ ] **GSC Performance:** Note top 10 queries by impressions; ensure title/description mention the query where natural.

---

## Checklist: this month

- [ ] **Core Web Vitals:** No “Poor” URLs in GSC (or plan to fix them).
- [ ] **Date + author** on every blog article (visible + in schema).
- [ ] **One “how to” or guide article** per key tool (Sade Sati, Kundali, Panchang, Guna Milan) with internal link to the tool.
- [ ] **Internal links:** Every new article links to 2+ tools; hub links to today’s content and latest posts.
- [ ] **Backlinks:** List 5 target sites and send 1–2 outreach emails or comments.

---

## Realistic timeline

| Timeframe | What to expect |
|-----------|----------------|
| **Weeks 1–4** | Technical fixes, sitemaps, GSC. Small indexing/impression gains. |
| **Months 2–3** | More daily URLs, internal linking, consistent publishing. Long-tail terms start moving. |
| **Months 4–6** | As backlinks and authority grow, competitive terms (“free kundali”, “daily horoscope”, “today panchang”) can reach top 20. |
| **6–12 months** | With sustained content, technical health, and quality links, **top 10 for specific phrases** in your category is achievable. |

Focus on **one geography and language first** (e.g. India, English + Hindi), then expand.

---

## More detail

- **Technical + on-page:** [docs/PATH_TO_TOP_10_SEARCH.md](docs/PATH_TO_TOP_10_SEARCH.md)
- **Beating competitors, quick wins:** [docs/SEO_TOP_SEARCH_GUIDE.md](docs/SEO_TOP_SEARCH_GUIDE.md)
- **Daily traffic and sharing:** [TRAFFIC_GROWTH.md](TRAFFIC_GROWTH.md)
- **Google News and global visibility:** [docs/GLOBAL_VISIBILITY_AND_GOOGLE_NEWS.md](docs/GLOBAL_VISIBILITY_AND_GOOGLE_NEWS.md)
- **Canonical and redirects:** [docs/HOST_REDIRECTS.md](docs/HOST_REDIRECTS.md)
