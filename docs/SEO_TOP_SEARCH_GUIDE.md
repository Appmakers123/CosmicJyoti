# How to Get CosmicJyoti on Top of Search & Beat Competitors

This guide gives practical steps to rank higher when users search for your modules (e.g. "Sade Sati calculator", "free Kundali", "Lal Kitab totkas") and outrank competitor sites.

---

## 1. What’s Already Done in the App

- **Sitemap** (`public/sitemap.xml`) – All main tool URLs submitted for crawling.
- **Meta & schema** – Per-page title, description, canonical, og:url; JSON-LD (WebSite, WebApplication, FAQPage, ItemList).
- **Keyword-rich titles** – e.g. "Sade Sati Calculator – Check Sade Sati by Moon Sign | CosmicJyoti".
- **Search results above “Check today”** – When users search on the hub, matching modules appear above the "Check today" section.
- **Extra FAQ schema** – Lal Kitab, today’s Panchang, Prashna Kundali, mobile number numerology added for rich snippets.
- **Guides section on hub** – “Guides – How to use our tools” with 7 keyword-rich cards (Sade Sati, Kundali, Lal Kitab, Panchang, Guna Milan, Prashna Kundali, mobile numerology) and internal links (“Try Sade Sati calculator”, etc.).
- **First-visible keyword intro** – Sade Sati and Lal Kitab screens show a keyword line at the top (e.g. “Sade Sati calculator – check Sade Sati by Moon sign”).

---

## 2. Submit & Monitor in Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console).
2. Add property: `https://www.cosmicjyoti.com` (or your live domain).
3. **Submit sitemap:** Sitemaps → Add sitemap → `https://www.cosmicjyoti.com/sitemap.xml`.
4. **Request indexing** for important URLs:
   - `https://www.cosmicjyoti.com/`
   - `https://www.cosmicjyoti.com/?mode=sadesati-dasha`
   - `https://www.cosmicjyoti.com/?mode=kundali`
   - `https://www.cosmicjyoti.com/?mode=lal-kitab`
   - `https://www.cosmicjyoti.com/?mode=panchang`
5. Use **Performance** to see which queries and pages get clicks; double down on high-impression, low-click queries by improving titles/descriptions.

---

## 3. Content That Ranks: Add Focused Landing Content

Search engines reward pages that **answer the query** clearly. For each key module, consider:

- **Short intro** on the tool screen (you have this) + **one dedicated “Learn” or “Blog” article** that targets the search phrase.
- Example: An article titled **“How to Check Sade Sati by Moon Sign – Free Calculator”** that explains Sade Sati in 300–500 words and links to your Sade Sati calculator (`?mode=sadesati-dasha`). Publish it in your AI blog or Learning section and link from the tool.
- Repeat for: **free Kundali**, **Lal Kitab totkas**, **today panchang**, **Guna Milan**, **Prashna Kundali**, **mobile number numerology**. One strong article per tool + internal links from hub and tool screens.

This gives Google a clear “this page is about X” signal and helps you rank for “X calculator” or “how to check X”.

---

## 4. Technical Checks (Already Handled or Easy to Verify)

- **Canonical URL** – Each view sets its own canonical (e.g. `?mode=sadesati-dasha`). No duplicate-content confusion.
- **Mobile-friendly** – Your app is responsive; test with [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly).
- **Page speed** – Use [PageSpeed Insights](https://pagespeed.web.dev/) and fix any “Critical” or “High” issues (images, JS bundles). Faster pages tend to rank better.
- **HTTPS** – Ensure the live site is served over HTTPS.

---

## 5. Beating Competitors: Where to Focus

| Area | Action |
|------|--------|
| **Query intent** | Make sure the **first visible text** on each tool (and in meta description) contains the exact phrase users type (e.g. “Sade Sati calculator”, “check Sade Sati by moon sign”). You’ve done this in `pageMeta` and on-screen copy. |
| **Backlinks** | Get links from astrology forums, Hindi/English astrology blogs, and local directories. One link from a trusted site is worth more than many low-quality links. |
| **User signals** | Reduce bounce: when users land on e.g. Sade Sati, make the next step obvious (e.g. “Select Moon sign” or “Find Moon sign from birth details”). You already have clear CTAs. |
| **Freshness** | Update key pages when you change a tool (e.g. Saturn dates). You can bump `lastmod` in `sitemap.xml` and re-submit. |
| **Rich results** | You have FAQ and ItemList schema. If you add more FAQ entries for “Sade Sati”, “Kundali”, “Lal Kitab” in `index.html` or per-tool content, you can get more rich snippets and stand out vs competitors. |

---

## 6. Quick Wins Checklist

- [ ] Add and verify the site in Google Search Console.
- [ ] Submit `sitemap.xml` and request indexing for top 5–10 tool URLs.
- [x] **In app:** “Guides” section on hub with 7 tool cards + internal links (acts as “How to use” content per key module).
- [x] **In app:** Extra FAQ schema for Lal Kitab, Panchang, Prashna Kundali, mobile numerology (plus existing Sade Sati, Kundali, Guna Milan).
- [ ] Share direct tool links (e.g. Sade Sati, Kundali) on social media so Google sees traffic and shares to those URLs.
- [ ] Check Core Web Vitals in Search Console and fix any “Poor” URLs.
- [ ] When Saturn/transit dates or tool logic change, update `lastmod` in `sitemap.xml` for that URL.

---

## 7. Long-Term: Stay Ahead of Competitors

- **Blog regularly** – Use your AI blog or Learning section to publish short, keyword-focused articles (e.g. “Sade Sati 2025–2027 dates”, “Best time for marriage by Kundali”). Each article can target one long-tail keyword and link to the right tool.
- **Internal linking** – From hub, blog, and learning pages, link to tools with anchor text like “Sade Sati calculator”, “free Kundali”, “Lal Kitab remedies”. That passes relevance to the tool pages.
- **Local SEO** – If you target India, consider a Google Business Profile and “astrology app” or “Kundali” as category; link to the website. Helps for “Kundali app” or “free Kundali India” type searches.

Using the steps above consistently will help CosmicJyoti show up above “Check today” in your own hub search and, over time, **above competitors** in Google when users search for your module names and related phrases.
