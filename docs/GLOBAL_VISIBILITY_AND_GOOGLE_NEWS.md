# Global Visibility & Google News – CosmicJyoti

Research-based guide: what top astrology sites do for visibility, what to add for global rank, and how to get astrology/horoscope content into **Google News**.

---

## Part 1: Top Astrology/Horoscope Websites (Global)

Based on traffic, longevity, and feature comparisons (2024–2025):

| Site | Why they rank / What they do |
|------|------------------------------|
| **Astrology.com** | One of the largest; strong brand, intuitive UI, broad content (tarot, horoscope, compatibility). |
| **Horoscope.com** | Free daily/weekly/monthly readings; clear structure; professional positioning. |
| **Keen.com** | Long-running (since 1999); psychics + astrology; trust + paid consultations. |
| **Astro.com (Astrodienst)** | Professional-grade free charts; extended chart types; authority in serious astrology. |
| **AstroSeek** | Free birth chart, no sign-up; AI + expert backup; compatibility, celebrity charts. |
| **Cafe Astrology** | Beginner-friendly; educational content; strong SEO on “how to” and sign pages. |
| **Astrology Zone (Susan Miller)** | Named astrologer; in-depth monthly horoscopes; loyal audience. |
| **California Psychics / Psychic Source** | Live readings + astrology; customer service; paid model. |
| **The Times of India (Astrology)** | Major publisher; daily horoscope by sign; **appears in Google News** regularly. |
| **Astrology Cafe** | Daily “Astrology of Today”; date-based URLs; transit/moon content. |
| **AstroAura** | 11 languages; app-first; daily horoscope, birth chart, tarot, compatibility. |
| **Ceze.com** | 30+ languages; free birth chart; daily horoscope; sync across devices. |
| **Astroica.com** | Chinese + Western + Vedic; Kundli matching, Mangal Dosh; multi-system. |

**Common drivers of visibility and rank**

- **Daily, date-specific content** (e.g. “Horoscope for [date]”, “Panchang/Muhurat for [date]”).
- **Permanent, unique URLs** per article or per day/sign (no “one URL, different story every day”).
- **Clear structure**: section pages that don’t change URL (e.g. `/horoscope/`, `/panchang/`).
- **Multilingual** (even 2–3 languages) for non-English markets.
- **Free tools** (birth chart, compatibility, Panchang) that attract links and repeat visits.
- **RSS/feeds** for syndication and crawlers.
- **Named authority** (e.g. “Susan Miller”, “CosmicJyoti – Nikesh Maurya”) in bylines and schema.
- **Mobile-friendly** and fast; many leaders have apps (Co-Star, AstroAura, etc.).
- **Social + notifications**: daily push, Instagram/TikTok, shareable “today’s horoscope” cards.

---

## Part 2: What to Add to Increase Visibility & Global Rank

Prioritised by impact and feasibility.

### High impact

1. **Permanent URLs for every article**  
   - Move from `article.html?id=...` to **one URL per article**, e.g.  
     `https://www.cosmicjyoti.com/blog/2026-02-25-daily-horoscope-february-25-2026`  
   - Same for daily Panchang, Muhurat, “Key astrological events”, etc.  
   - Needed for Google News and better SEO (unique, shareable links).

2. **Visible publication date on every article**  
   - Show **date and time** (e.g. “25 Feb 2026, 6:00 AM IST”) between headline and body.  
   - Use same date in HTML, **Article schema** (`datePublished` / `dateModified`), and sitemap.  
   - Helps both Search and News.

3. **Author + publisher in schema and on page**  
   - Add **Article** (or NewsArticle) JSON-LD: `author` (name + URL), `publisher`, `datePublished`, `dateModified`, `headline`, `image`.  
   - Visible byline on article: e.g. “By Nikesh Maurya” or “CosmicJyoti Editorial”.

4. **Google News sitemap**  
   - Separate **news sitemap** (or news-specific entries) with:  
     `<news:news>`, `<news:publication_date>` (ISO 8601), `<news:title>`, `<news:publication><news:name>`, `<news:language>`.  
   - Include only recent articles (e.g. last 48 hours or last 100 URLs).  
   - Submit in **Publisher Center** (see Part 3).

5. **Dedicated “news-style” section URLs**  
   - Stable section URLs that list latest articles (e.g. `/blog/`, `/horoscope/`, `/panchang/`) with **HTML links** to each article (no JS-only navigation).  
   - Section pages that don’t change URL daily so Googlebot-News can crawl “latest” reliably.

6. **More languages**  
   - You already have English + Hindi. Add at least one more (e.g. Spanish, or another Indian language).  
   - Separate **section or subpath per language** (e.g. `/hi/`, `/es/`) and **one language per article** (required for Google News).

### Medium impact

7. **Structured “Today’s Horoscope” by sign**  
   - One URL per sign per day, e.g.  
     `https://www.cosmicjyoti.com/horoscope/2026-02-25/aries`  
   - Title like “Aries Horoscope Today – 25 February 2026”.  
   - Enables “horoscope today [sign]” queries and news-style indexing.

8. **Structured “Today’s Panchang / Muhurat” page**  
   - One URL per date, e.g.  
     `https://www.cosmicjyoti.com/panchang/2026-02-25`  
   - Title like “Today’s Panchang – 25 February 2026 – Tithi, Muhurat”.  
   - Matches how ToI and others get into News.

9. **RSS feed that meets News requirements**  
   - Valid RSS with `<pubDate>`, `<guid>` or `<id>`, clear `<title>` and `<link>`.  
   - Max ~1 MB per article, ~2 MB per feed; update frequently (e.g. every 30 min).  
   - You already have `blog/feed.xml`; ensure every item has correct, ISO-aligned pub date and unique URL.

10. **Internal linking**  
    - From each article to 2–3 relevant tools (Kundali, Guna Milan, Panchang, etc.) and to other articles.  
    - From hub/modules to “Today’s Articles” and key blog URLs.

### Ongoing / content

11. **Consistent daily output**  
    - Daily horoscope, daily Panchang/Muhurat, 1–2 daily articles.  
    - Builds crawl frequency and “news” signal.

12. **Original, useful content**  
    - Avoid thin or duplicate content; focus on “today’s transits”, “muhurat for [date]”, “horoscope for [date]”, remedies, how-tos.  
    - Aligns with Google’s quality and news policies.

13. **Social + notifications**  
    - You already have notifications (8 AM horoscope, 12 PM blog).  
    - Add simple “Share today’s horoscope” (by sign) and optional “Share this article” with OG image and title.  
    - Helps discovery and backlinks.

---

## Part 3: How to Get Astrology/Horoscope Content on Google News

Google does **not** require a formal “approval” to be considered for News. Content is **discovered by crawl** or via **Publisher Center** (RSS, sitemaps, URLs). To maximise chances:

### 3.1 Policy and quality

- Follow **Google News content policies** (no misleading content, no dangerous/illegal, transparent authorship).  
- Content should be **news-like**: timely, factual, original (e.g. “Horoscope for 25 Feb 2026”, “Muhurat for 25 Feb 2026”).  
- **Single language per article**; no mixing multiple languages in one article.  
- **UTF-8** encoding.

### 3.2 Technical (must-have)

| Requirement | What to do |
|------------|------------|
| **Unique, permanent URL per article** | One canonical URL per piece of content. No “same URL, different story every day”. |
| **Stable section URLs** | e.g. `/blog/`, `/horoscope/` that don’t change daily; list latest with **HTML links** to articles. |
| **HTML links to articles** | Section pages must link to articles with normal `<a href="...">`. Not only buttons/JS. |
| **Visible date/time** | Between headline and body; same as in schema and sitemap. |
| **Article body in HTML** | Main text in HTML, not only in JavaScript (so crawler can read it). |
| **No blocking** | Don’t block Googlebot or Googlebot-News in `robots.txt` or meta for article/section paths. |

### 3.3 Google News sitemap (recommended)

- Use the **Google News sitemap** schema.  
- For each article include at least:  
  - `<loc>` (canonical URL)  
  - `<news:news>`  
    - `<news:publication>` with `<news:name>` (e.g. “CosmicJyoti”), `<news:language>` (e.g. “en”)  
    - `<news:publication_date>` in **ISO 8601** (e.g. `2026-02-25T06:00:00+05:30`)  
    - `<news:title>` (match the on-page headline)  
- Only include articles from the **last 48 hours** (or follow Google’s limit).  
- Reference this sitemap from your main sitemap and/or submit in Publisher Center.

Example entry:

```xml
<url>
  <loc>https://www.cosmicjyoti.com/blog/2026-02-25-daily-horoscope-february-25-2026</loc>
  <news:news>
    <news:publication>
      <news:name>CosmicJyoti</news:name>
      <news:language>en</news:language>
    </news:publication>
    <news:publication_date>2026-02-25T06:00:00+05:30</news:publication_date>
    <news:title>Daily Vedic Horoscope: February 25, 2026</news:title>
  </news:news>
</url>
```

### 3.4 Article schema (JSON-LD)

On each article page, add **NewsArticle** or **Article**:

- `datePublished`, `dateModified` (ISO 8601)  
- `headline`, `image`, `description`  
- `author`: `{ "@type": "Person", "name": "...", "url": "https://www.cosmicjyoti.com/about" }`  
- `publisher`: Organisation with logo  

This helps Search and News understand the page.

### 3.5 Publisher Center (optional but useful)

- Go to [Publisher Center](https://publishercenter.google.com/).  
- Add your publication (e.g. CosmicJyoti).  
- Add **sources**:  
  - RSS feed URL (e.g. `https://www.cosmicjyoti.com/blog/feed.xml`), or  
  - Website URL + let Google discover, or  
  - Google News sitemap URL.  
- Set **language(s)** (e.g. English, Hindi as separate publications if needed).  
- This doesn’t guarantee placement but improves **eligibility** (e.g. News tab, Top stories).

### 3.6 How astrology appears in Google News today

- **Large publishers** (e.g. The Times of India) have an “Astrology” section with daily horoscope by sign and date-specific pages; these are indexed as news.  
- **Dedicated astrology sites** (e.g. Astrology Cafe) use **date-based titles and URLs** (“Astrology of Today – [date]”) and stable structure.  
- Common pattern: **“Horoscope today [date]”**, **“Panchang/Muhurat [date]”**, **“Key astrological events [date]”** as clear, timely articles with permanent URLs and visible dates.

### 3.7 Checklist for CosmicJyoti

- [ ] **URLs**: Migrate to permanent URLs per article (e.g. `/blog/YYYY-MM-DD-slug`). *(Optional; current `article.html?id=` is stable per article.)*
- [x] **Date**: Visible publication date and time between headline and body; same in schema and sitemap. *(Done in article.html.)*
- [x] **Schema**: Article/NewsArticle JSON-LD with author (Person: Nikesh Maurya), publisher, datePublished, dateModified, image. *(Done in article.html.)*
- [x] **News sitemap**: `blog/sitemap-news.xml` with `news:publication_date`, `news:title`, `news:publication`; last 48 hours. *(Done: generated by generate-daily-blog.mjs.)*
- [x] **Section pages**: Stable `blog.html` with HTML links to latest.  
- [x] **RSS**: `blog/feed.xml` has `<pubDate>` and unique `<guid>`; time aligned with news sitemap.  
- [ ] **Publisher Center**: Add site and feed/sitemap at https://publishercenter.google.com/; set language(s).  
- [ ] **One language per article**: Separate URLs or paths for English vs Hindi.  
- [x] **Don’t block** article/section paths for Googlebot. *(robots.txt lists news sitemap.)*

---

## Summary

- **Global visibility**: Permanent URLs, visible dates, author/publisher schema, more languages, daily date-based content (horoscope, Panchang, muhurat), RSS, internal links, and social/share.  
- **Google News**: Same technical and content standards plus **Google News sitemap**, **Article/NewsArticle schema**, **Publisher Center** submission, and **one language per article**.  
- Your existing **daily AI articles**, **RSS**, and **blog structure** are a good base; the main gaps are **per-article URLs**, **visible dates**, **news sitemap**, and **schema** on article pages. Implementing these will align CosmicJyoti with how top astrology and news sites achieve visibility and News eligibility.
