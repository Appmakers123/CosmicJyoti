# Security

This document summarizes security measures in place and how to harden deployment.

## Implemented measures

### Backend (Express server in `server/`)

- **Helmet** – Security HTTP headers (X-Content-Type-Options, X-Frame-Options, etc.).
- **Rate limiting** – 100 requests per 15 minutes per IP on `/api/*` to reduce abuse and DDoS.
- **Body size limit** – JSON body limited to 100KB to prevent large-payload attacks.
- **CORS** – Optional allowlist via `ALLOWED_ORIGINS` (comma-separated). If unset, all origins are allowed (suitable for dev).
- **Input sanitization** – Request body strings are trimmed and length-limited (500 chars default, 4000 for `prompt`/`context`).
- **Cache admin** – `/api/cache/clear` and `/api/cache/stats` require `CACHE_CLEAR_SECRET` when set in env.

### Frontend

- **XSS mitigation** – SVG and HTML from API/blog are sanitized before `dangerouslySetInnerHTML` (strip `<script>`, event handlers, `javascript:`/`data:` in hrefs). See `utils/htmlSanitizer.ts`.
- **Safe external links** – `javascript:`, `data:`, and `vbscript:` URLs are blocked in `openExternalLink`; links use `rel="noopener noreferrer"`.
- **No API key logging** – Vite no longer logs API key presence in production; optional via `DEBUG_VITE_ENV=1` in dev.

### Static hosting

- **`public/_headers`** – Suggested headers for Netlify/Cloudflare Pages: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. Copy this file into your publish root if your host supports it.

## Deployment checklist

1. **Backend**
   - Set `ALLOWED_ORIGINS` to your frontend origin(s), e.g. `https://www.cosmicjyoti.com,https://cosmicjyoti.com`.
   - Set `CACHE_CLEAR_SECRET` if you use the cache-clear endpoint.
   - Keep `GEMINI_API_KEY` (and other secrets) in env only; never commit them.

2. **Frontend**
   - Use `VITE_API_BASE_URL` pointing to your backend; do not expose backend-only secrets to the client build.
   - API keys used in the client (e.g. Gemini for fallback) are embedded in the bundle; restrict key usage in the provider dashboard (e.g. HTTP referrer / API restrictions).

3. **HTTPS**
   - Serve the site and API over HTTPS only. Redirect HTTP → HTTPS at the host or CDN.

4. **Dependencies**
   - Run `npm audit` and `cd server && npm audit` regularly; fix high/critical issues.

## Reporting a vulnerability

If you discover a security issue, please report it privately (e.g. to the repository owner or via your normal channel) rather than opening a public issue.
