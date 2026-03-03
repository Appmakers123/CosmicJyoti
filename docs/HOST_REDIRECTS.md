# Host redirects – 301 to canonical (www)

For SEO and indexing, use **one canonical host**. We use **https://www.cosmicjyoti.com**. Configure your hosting to 301 redirect all other variants to it.

## Why

- **Page with redirect** and **Duplicate, Google chose different canonical** in Search Console are often caused by `cosmicjyoti.com` vs `www.cosmicjyoti.com` (or `http` vs `https`).
- A permanent (301) redirect from non‑www to www tells Google and users which URL is the main one.

## Target

- **Canonical:** `https://www.cosmicjyoti.com`
- **Redirect to it:**
  - `http://cosmicjyoti.com` → `https://www.cosmicjyoti.com`
  - `https://cosmicjyoti.com` → `https://www.cosmicjyoti.com`
  - `http://www.cosmicjyoti.com` → `https://www.cosmicjyoti.com`

---

## Firebase Hosting

In `firebase.json` add a `hosting` section with redirects:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "redirects": [
      {
        "source": "/**",
        "destination": "https://www.cosmicjyoti.com/**",
        "type": 301,
        "condition": {
          "request": { "host": ["cosmicjyoti.com"] }
        }
      }
    ]
  },
  "functions": { "source": "functions", "predeploy": [] }
}
```

Adjust `public` (e.g. `dist`, `build`, `public`) to match your build output. The condition redirects only when the request host is `cosmicjyoti.com` (no www), so `www.cosmicjyoti.com` is not redirected.

---

## Vercel

1. **Domains:** In Vercel project → Settings → Domains, add both `cosmicjyoti.com` and `www.cosmicjyoti.com`. Set **www** as primary if you want that to be canonical.
2. **Redirect:** In the same Domains (or in `vercel.json`), add a redirect from `cosmicjyoti.com` to `https://www.cosmicjyoti.com`.

Or in `vercel.json` at project root:

```json
{
  "redirects": [
    {
      "source": "/:path*",
      "destination": "https://www.cosmicjyoti.com/:path*",
      "permanent": true,
      "has": [{ "type": "host", "value": "cosmicjyoti.com" }]
    }
  ]
}
```

---

## Netlify

In `netlify.toml` at project root (or in Netlify UI → Site settings → Build & deploy → Post processing → Redirects):

```toml
[[redirects]]
  from = "http://cosmicjyoti.com/*"
  to = "https://www.cosmicjyoti.com/:splat"
  status = 301
  force = true

[[redirects]]
  from = "https://cosmicjyoti.com/*"
  to = "https://www.cosmicjyoti.com/:splat"
  status = 301
  force = true
```

---

## Other hosts

- **Cloudflare:** Page Rules or Redirect Rules: redirect `*cosmicjyoti.com/*` to `https://www.cosmicjyoti.com/$1` (301).
- **cPanel / Apache:** Add to `.htaccess` or vhost:
  - `RewriteCond %{HTTP_HOST} ^cosmicjyoti\.com$`  
  - `RewriteRule ^(.*)$ https://www.cosmicjyoti.com/$1 [R=301,L]`
- **Nginx:** `server` block for `cosmicjyoti.com` with `return 301 https://www.cosmicjyoti.com$request_uri;`

After configuring, test: open `https://cosmicjyoti.com` and confirm it 301s to `https://www.cosmicjyoti.com`.

---

## Google Cloud (Firebase Hosting)

Yes — you can use **Google Cloud** for this. The usual way to host the CosmicJyoti site is **Firebase Hosting**, which is part of Google Cloud and supports redirects and rewrites in `firebase.json`.

Use the config below in the **Firebase Hosting** section. It does two things:

1. **301 redirect** `cosmicjyoti.com` → `https://www.cosmicjyoti.com` (only when host is non-www).
2. **Rewrite** `/blog/:id` and `/blog/:id/` to `/blog/article.html` so AI article permanent URLs work (the app already reads the article id from the URL path).

Replace `public` with your actual build output folder (e.g. `dist`, `build`, or `public` if you deploy that).

**`firebase.json` (combined hosting + www redirect + blog rewrite):**

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "redirects": [
      {
        "source": "/**",
        "destination": "https://www.cosmicjyoti.com/**",
        "type": 301,
        "condition": { "request": { "host": ["cosmicjyoti.com"] } }
      }
    ],
    "rewrites": [
      { "source": "/blog/:id", "destination": "/blog/article.html" },
      { "source": "/blog/:id/**", "destination": "/blog/article.html" }
    ]
  },
  "functions": { "source": "functions", "predeploy": [] }
}
```

- **redirects**: When someone visits `cosmicjyoti.com` (no www), they are 301’d to `https://www.cosmicjyoti.com`. Requests to `www.cosmicjyoti.com` are not redirected.
- **rewrites**: Requests to `/blog/ARTICLE_ID` or `/blog/ARTICLE_ID/` are served by `/blog/article.html`; the URL in the browser stays `/blog/ARTICLE_ID/`. `article.html` reads the id from `window.location.pathname`, so no query parameter is needed.

**Other Google Cloud options**

- **Cloud Run / App Engine:** Put redirect and rewrite logic in your app or in a reverse proxy (e.g. Load Balancer URL map).
- **Load Balancer + Cloud Storage or Backend:** Use the load balancer’s **URL map** to add a 301 redirect from `cosmicjyoti.com` to `https://www.cosmicjyoti.com` and a path rule so `/blog/*` is served by the same backend that serves `article.html` (or by a backend that rewrites the path).

For a static (or mostly static) site, **Firebase Hosting** is the simplest and is fully supported on Google Cloud.

---

## Blog: AI article permanent URLs (rewrite)

AI articles use **permanent URLs** like `https://www.cosmicjyoti.com/blog/2026-03-02-daily-horoscope-march-2-2026-leo-moon/`. There is no physical file at `/blog/{articleId}/`; the app serves them via `article.html?id=...`. So the host must **rewrite** (not redirect) requests for `/blog/:id/` to `/blog/article.html?id=:id` so that:

1. Users and Google see the clean URL.
2. The page loads with the correct article (canonical and og:url already point to the permanent URL).

Apply this **after** the www redirects above. Only rewrite paths that do **not** match an existing file or directory (e.g. existing static blog folders like `/blog/2026-02-25-daily-vedic-horoscope-february-25-2026/` are real; `/blog/2026-03-02-daily-horoscope-march-2-2026-leo-moon/` for an AI-only article is not).

### Firebase Hosting (Google Cloud)

Use the **rewrites** in the [Google Cloud (Firebase Hosting)](#google-cloud-firebase-hosting) section above. The app’s `article.html` already reads the article id from the URL path, so you only need:

- `"source": "/blog/:id"` and `"source": "/blog/:id/**"` → `"destination": "/blog/article.html"`.

### Vercel

In `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/blog/:id", "destination": "/blog/article.html?id=:id" },
    { "source": "/blog/:id/", "destination": "/blog/article.html?id=:id" }
  ]
}
```

### Netlify

In `netlify.toml` or Netlify UI (Redirects), add a **rewrite** (not redirect) so the URL bar stays `/blog/:id/`:

```toml
[[redirects]]
  from = "/blog/*"
  to = "/blog/article.html?id=:splat"
  status = 200
  force = false
```

Adjust `:splat` so the id does not include a trailing slash (e.g. strip the last slash in your build or use a rule that matches `/blog/:id/` and passes `:id`).

### Summary

- **Redirects** change the URL (301/302). We do **not** want that for `/blog/:id/` — the canonical URL must stay.
- **Rewrites** keep the URL and serve another file. Use a rewrite from `/blog/:id/` to `/blog/article.html` and ensure the article id is available (query or path) so `article.html` can render the right post.
