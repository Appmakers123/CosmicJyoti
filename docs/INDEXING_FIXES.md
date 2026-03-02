# Google Search Console – Indexing Fixes

This doc explains what was changed to address "Why pages aren't indexed" and what to do in GSC.

## Changes made in the repo

### 1. Page with redirect (5 pages)

- **Cause:** `public/index.html` was redirecting to `landing.html`, so `/index.html` was a redirect URL. Other redirects may come from host (e.g. `www` ↔ non-`www`, trailing slash).
- **Fix:** `public/index.html` now redirects to the **canonical homepage** `https://www.cosmicjyoti.com/` and includes `<link rel="canonical" href="https://www.cosmicjyoti.com/">`. So `/index.html` is a single, clear redirect to the main URL.
- **You:** In your **hosting** (Firebase, Vercel, Netlify, etc.), set:
  - **301 redirect:** `cosmicjyoti.com` → `https://www.cosmicjyoti.com` (preferred).
  - Prefer one canonical form (e.g. `https://www.cosmicjyoti.com/` with trailing slash for root) and redirect the other variants to it.

### 2. Discovered – currently not indexed (27)

- **Cause:** Google discovered URLs (sitemap, links) but has not yet indexed them (low priority or crawl budget).
- **Fix:**
  - **Canonicals:** The app now always sets canonical to `https://www.cosmicjyoti.com` for your domain (see App.tsx), so `www` is the chosen version.
  - **Sitemaps:** `robots.txt` was corrected: removed invalid `/hi/blog/sitemap-blog.xml`, added `/blog/sitemap-blog.xml` and `/sitemap-pages.xml`.
- **You:** In GSC → **URL Inspection** for important URLs → **Request indexing**. Add internal links from the homepage and hub to key pages (blog, tools, landing) so they get more crawl priority.

### 3. Duplicate – Google chose different canonical than user (1)

- **Cause:** The canonical you sent (e.g. with/without `www`, or with/without trailing slash) differed from the URL Google chose.
- **Fix:** Canonical is now **fixed to** `https://www.cosmicjyoti.com` for `cosmicjyoti.com` and `www.cosmicjyoti.com`, so all app views declare the same canonical. Root `index.html` already has `<link rel="canonical" href="https://www.cosmicjyoti.com/">`.
- **You:** Ensure your host **redirects** non-`www` to `www` (301) so Google only sees one preferred URL.

### 4. Crawled – currently not indexed (1)

- **Cause:** The page was crawled but not indexed (e.g. duplicate or low-value signal).
- **Fix:** Same canonical and sitemap fixes as above; consistent canonicals reduce duplicate signals.
- **You:** In GSC, open the URL and check “Page fetch” / “Coverage”. If it’s duplicate, the canonical fix should help over time. You can request indexing again after redeploying.

## Checklist in Google Search Console

1. **Settings → Canonical:** Prefer `https://www.cosmicjyoti.com` and redirect all other variants to it.
2. **Sitemaps:** Resubmit sitemaps (or wait for recrawl). Confirm no 404s:  
   `https://www.cosmicjyoti.com/sitemap.xml`  
   `https://www.cosmicjyoti.com/sitemap-pages.xml`  
   `https://www.cosmicjyoti.com/blog/sitemap-news.xml`  
   `https://www.cosmicjyoti.com/blog/sitemap-blog.xml`
3. **URL Inspection:** For key URLs (homepage, main tools, important blog posts), use “Request indexing” after the fixes are live.
4. **Host redirects:** Configure 301: `http://cosmicjyoti.com` and `https://cosmicjyoti.com` → `https://www.cosmicjyoti.com`.

Re-crawling and re-indexing can take days to weeks. After deploying, wait a few days and recheck “Pages” and “Why pages aren’t indexed” in GSC.
