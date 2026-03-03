# Google SEO Starter Guide – Applied to CosmicJyoti

Based on [Google's SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=en). What we already do ✓ and what can help further.

---

## 1. Help Google find your content

| Guide says | Our status | Action |
|------------|------------|--------|
| Check if Google has found your site: `site:cosmicjyoti.com` | — | Run in Google; see what’s indexed. |
| Submit a sitemap | ✓ Done | Sitemaps in `robots.txt` (main, pages, blog). |
| Google finds pages via links | ✓ | Hub links to tools; blog has internal links. Add more internal links from hub/blog to key pages. |
| **Check how Google sees the page** – URL Inspection in Search Console | — | **Do this:** For homepage and 2–3 key URLs, use GSC → URL Inspection → “View tested page” to confirm Google sees content like users (important for your SPA). |

---

## 2. Organize your site

| Guide says | Our status | Action |
|------------|------------|--------|
| Use descriptive URLs | ✓ | `/blog/2026-02-25-daily-vedic-horoscope-...`, `/?mode=kundali` are descriptive. |
| Group similar pages in directories | ✓ | `/blog/`, static pages in root. |
| **Reduce duplicate content** – one canonical URL per content | ✓ Done | Canonical fixed to `https://www.cosmicjyoti.com`; redirects fixed (see INDEXING_FIXES.md). |
| Prefer redirect from non‑preferred URL to the one that best represents the page | ✓ | `public/index.html` redirects to canonical root; host should 301 non‑www → www. |

---

## 3. Make content interesting and useful

| Guide says | Our status | Action |
|------------|------------|--------|
| Easy to read, well organized, headings | ✓ | Blog and app use headings and structure. |
| Unique content | ✓ | Your own articles and tools. |
| Up-to-date content | — | Refresh key blog posts and `lastmod` in sitemaps when you update. |
| **Helpful, reliable, people-first** | ✓ | Disclaimers and “for entertainment/education” align with this. |
| **Expect readers’ search terms** | — | Use terms like “free kundali”, “daily horoscope”, “guna milan”, “panchang today” in titles and meta (you already do in pageMeta). Keep doing. |
| **Avoid distracting ads** | — | Don’t let ads block or overwhelm content (you already avoid that). |
| **Link to relevant resources** with good **anchor text** | ✓ Done | Internal links exist; ensure anchor text is descriptive (e.g. “Today’s Panchang” not “click here”). |

---

## 4. Influence title links and snippets

| Guide says | Our status | Action |
|------------|------------|--------|
| **Title**: unique per page, clear, concise, describes content | ✓ | `pageMeta.ts` has per-mode titles; index/landing have static titles. |
| **Snippet / meta description**: short, unique, relevant points | ✓ | Descriptions set per view in App and in static HTML. |
| Snippet can come from page content or meta description | ✓ | You control both. |

---

## 5. Images

| Guide says | Our status | Action |
|------------|------------|--------|
| High-quality images near relevant text | — | Use when you add images. |
| **Descriptive alt text** on every image | ✓ Done | **Add `alt` to all `<img>`** in landing, blog, about, tools (e.g. “CosmicJyoti logo”, “Kundali chart example”). Google uses alt to understand images. |

---

## 6. What not to focus on (per Google)

- **Meta keywords** – Google ignores them; skip.
- **Keyword stuffing** – Against policy; write naturally.
- **Exact keyword in domain/URL** – Low impact; your URLs are fine.
- **Duplicate content “penalty”** – Not a penalty; canonical/redirects are for efficiency (we did this).
- **Magic word count** – No target; focus on useful, non-repetitive content.

---

## Quick action list

1. **GSC:** Use **URL Inspection** on `https://www.cosmicjyoti.com/` and 2–3 key URLs; confirm “Page fetch” / “View tested page” shows full content (SPA).
2. **GSC:** Submit or resubmit sitemaps; fix any errors.
3. **Host:** 301 redirect `cosmicjyoti.com` → `https://www.cosmicjyoti.com` (see **docs/HOST_REDIRECTS.md**).
4. **Content:** Add **descriptive `alt`** to every image on landing, blog, about, tools.
5. **Internal links:** From blog posts, link to relevant app modes (e.g. “Try our [Kundali](/)” with good anchor text) and to other related articles.
6. **Sitemaps:** When you update important pages, refresh `lastmod` so Google knows to re-crawl.

These align with the Starter Guide and your existing indexing and canonical fixes.
