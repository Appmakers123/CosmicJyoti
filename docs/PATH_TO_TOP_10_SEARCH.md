# Path to Top 10 in Google Search (Astrology / Kundali Category)

How to increase CosmicJyoti’s visibility and move toward **top 10** for your category (free Kundali, Vedic astrology, daily horoscope, Panchang, etc.) in Google Search.

---

## What Google rewards in this category

From how top astrology sites rank (Astrology.com, Horoscope.com, Cafe Astrology, AstroSeek, ToI Astrology, etc.):

1. **Strong relevance** – Content and URLs that clearly match what people search for (e.g. “free kundali”, “daily horoscope today”, “panchang 2026”, “guna milan”).
2. **Authority & trust** – Named author, clear branding, good UX, and (over time) backlinks from real sites.
3. **Fresh, date-specific content** – Daily horoscope, today’s Panchang, “horoscope for [date]” so Google sees the site as current.
4. **Good technical base** – Fast, mobile-friendly, clear structure, no blocking of crawlers.
5. **User engagement** – People stay, share, and return (Core Web Vitals, low bounce, repeat visits).

Your product already has many of these (daily content, tools, blog, English + Hindi). The plan below focuses on **gaps and priorities** to push toward top 10.

---

## Phase 1: Technical & on-page (do first)

### 1.1 One canonical host

- Use **one** canonical domain (e.g. `https://www.cosmicjyoti.com`).
- 301 redirect all other variants (e.g. `cosmicjyoti.com`, `http://...`) to that URL.
- See `docs/HOST_REDIRECTS.md`.

### 1.2 Sitemaps and indexing

- Keep **sitemap.xml** (and blog/news sitemaps) updated and submitted in [Google Search Console](https://search.google.com/search-console).
- In GSC: request indexing for important URLs (home, blog index, key tool pages).
- Fix any “Page with redirect”, “Duplicate without user-selected canonical”, or “Crawled – currently not indexed” issues.

### 1.3 Core Web Vitals & mobile

- Aim for **LCP &lt; 2.5s**, **FID/INP &lt; 100ms**, **CLS &lt; 0.1**.
- Test with [PageSpeed Insights](https://pagespeed.web.dev/) and fix big issues (heavy JS, huge images, layout shifts).
- Ensure tap targets and text are usable on mobile (no tiny buttons, readable font size).

### 1.4 Clear structure for crawlers

- Important content in **HTML** (not only in JS), so Google can read titles, dates, and main text.
- Stable section URLs: `/blog/`, `/tools/`, and (if you add them) `/horoscope/`, `/panchang/` with **HTML links** to articles/pages.
- Each important page: unique `<title>`, meta description, and (where relevant) Article/NewsArticle schema.

---

## Phase 2: Content that matches search intent

### 2.1 Target the right keywords

Focus on terms where you can realistically compete and that match your product:

| Intent | Example keywords | What to have |
|--------|------------------|--------------|
| Free tools | free kundali, free kundli, free birth chart, free horoscope | Home + tool pages with clear titles and descriptions |
| Daily / today | daily horoscope today, today horoscope, aaj ka rashifal, today panchang | One URL per day (and ideally per sign) with date in title and content |
| How-to / learning | kundali milan, guna milan, how to read kundli, panchang meaning | Blog articles and tool landing pages with clear H1 and sections |
| Vedic / Indian | vedic astrology, vedic horoscope, janam kundali, muhurat 2026 | Use “Vedic”, “Kundali”, “Panchang”, “Muhurat” in titles and body |
| Local / Hindi | kundli milan, rashifal hindi, panchang aaj ka | Hindi URLs and content (you already have some); expand where possible |

Use [Google Search Console](https://search.google.com/search-console) (Performance) and a keyword tool to see what you already get impressions for, and double down there.

### 2.2 One URL per “thing” users search for

- **Daily horoscope** – Ideally one URL per date (e.g. `/horoscope/2026-02-25`) and, if you can, per sign per day (e.g. `/horoscope/2026-02-25/aries`) with a clear title like “Aries Horoscope Today – 25 February 2026”.
- **Panchang / Muhurat** – One URL per date (e.g. `/panchang/2026-02-25`) with date and “Panchang”/“Muhurat” in title and content.
- **Blog** – Keep one permanent URL per article (you already do this); use dates and topics in titles.

This matches how top sites (e.g. ToI, Astrology Cafe) get into News and rank for “today” queries.

### 2.3 Visible date and author

- Show **publication/update date** (and time if possible) between headline and body.
- Use the **same date** in HTML, schema (`datePublished` / `dateModified`), and sitemap.
- Visible byline (e.g. “By Nikesh Maurya” or “CosmicJyoti”) and same in Article/NewsArticle schema.

---

## Phase 3: Authority and trust

### 3.1 Named author and brand

- Use **Nikesh Maurya** (or “CosmicJyoti Editorial”) consistently in bylines, About, and schema.
- Short **About** and **Contact** pages that build trust; link to them from footer and key pages.

### 3.2 Internal linking

- From **each article** link to 2–3 relevant tools (Kundali, Guna Milan, Panchang, etc.) and to other articles.
- From **home and hub pages** link to “Today’s Horoscope”, “Today’s Panchang”, and latest blog posts with normal `<a href="...">` links (not only buttons/JS).
- Use descriptive anchor text (e.g. “Free Kundali”, “Today’s Panchang”) where it fits.

### 3.3 Backlinks (off-site)

- **Quality over quantity.** A few links from real astrology, lifestyle, or news sites matter more than many low-quality links.
- Tactics: guest posts, interviews, “best free Kundali tools” roundups, partnerships, PR, social shares that get picked up.
- Avoid buying links or link schemes; they can trigger penalties.

### 3.4 E-E-A-T signals

- **Experience** – e.g. “Our Kundali tool is used by…” or “Based on 10+ years of Vedic astrology practice.”
- **Expertise** – Clear, accurate content; correct use of terms (e.g. Rashis, Nakshatras, Muhurat).
- **Authoritativeness** – Consistent branding, citations where relevant, backlinks.
- **Trust** – Privacy policy, terms, contact, secure site (HTTPS), no deceptive UX.

---

## Phase 4: Freshness and habit

### 4.1 Daily output

- Publish **daily** (horoscope, Panchang/Muhurat, or 1–2 blog posts) so Google sees regular updates.
- Use your existing pipelines (e.g. `blog:generate`, daily posts) and keep them running.

### 4.2 RSS and news sitemap

- Keep **blog/feed.xml** valid (unique `<guid>`, correct `<pubDate>`).
- Maintain a **Google News sitemap** (e.g. `blog/sitemap-news.xml`) for recent articles and submit via [Publisher Center](https://publishercenter.google.com/) if you want News visibility.
- See `docs/GLOBAL_VISIBILITY_AND_GOOGLE_NEWS.md` for details.

### 4.3 Notifications and return visits

- Use your existing notifications (e.g. 8 AM horoscope, 12 PM blog) to bring users back.
- “Share today’s horoscope” or “Share this article” can help spread links and engagement.

---

## Checklist: next actions (in order)

- [ ] **Canonical host** – 301 non-www to www (or vice versa); one canonical URL per page.
- [ ] **Search Console** – Verify property, submit sitemaps, fix critical issues, check Performance for keywords.
- [ ] **Core Web Vitals** – Measure key URLs; fix LCP/CLS/INP where bad.
- [ ] **Titles and meta** – Every important page: unique title and meta description with main keyword where natural.
- [ ] **Date on every article** – Visible date + same in schema and sitemap.
- [ ] **Author on every article** – Bylines + author in Article/NewsArticle schema.
- [ ] **Horoscope by sign per day** – Add URLs like `/horoscope/YYYY-MM-DD/sign` with clear titles (if not already).
- [ ] **Panchang by date** – One URL per date with “Panchang”/“Muhurat” in title and content (if not already).
- [ ] **Internal links** – Articles → tools and other articles; hub → today’s content and blog.
- [ ] **Backlinks** – List 5–10 realistic targets (sites, roundups, guests) and start outreach.
- [ ] **Publisher Center** – Submit site and feed/sitemap if you want News visibility.

---

## Realistic timeline

- **Weeks 1–4:** Technical fixes, sitemaps, GSC, dates/authors on key pages. You may see small indexing/impression gains.
- **Months 2–3:** More daily URLs (horoscope by sign, Panchang by date), internal linking, and consistent publishing. Rankings for long-tail terms can start to move.
- **Months 4–6:** As backlinks and authority grow, competitive terms (“free kundali”, “daily horoscope”, “today panchang”) can improve; top 20 is a realistic first milestone.
- **6–12 months:** With sustained content, technical health, and some quality links, **top 10 for specific phrases** in your category becomes achievable; “top 10 for astrology” in general is very competitive and takes longer.

Focus on **one geography and language first** (e.g. India, English + Hindi), then expand.

---

## Summary

To increase visibility and move toward **top 10 in your category**:

1. **Technical:** One canonical host, sitemaps in GSC, good Core Web Vitals, crawlable HTML structure.
2. **Content:** Match search intent with clear URLs and titles (daily horoscope, Panchang, Kundali, etc.); one URL per “thing” users search for; visible date and author.
3. **Authority:** Named author, internal linking, then selective backlinks and E-E-A-T.
4. **Freshness:** Daily content, RSS, and (optional) News sitemap + Publisher Center.

Use `docs/GLOBAL_VISIBILITY_AND_GOOGLE_NEWS.md` for News-specific and global visibility details, and `docs/HOST_REDIRECTS.md` for canonical and redirect setup.
