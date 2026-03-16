# Security

This document summarizes security measures in CosmicJyoti and how to harden your deployment.

## Backend (`server/`)

- **Helmet**: Secure HTTP headers (X-Content-Type-Options, X-Frame-Options, etc.). CSP is disabled by default; set it at your reverse proxy or static host if needed.
- **CORS**: Allowed origins are configurable via `CORS_ORIGIN` (comma-separated). Default includes `http://localhost:5173` and `http://127.0.0.1:5173`. In production, set `CORS_ORIGIN` to your frontend URL(s).
- **Rate limiting**: Disabled (was 100 req/15 min per IP; removed).
- **Body size**: JSON body limit 500 KB to reduce DoS risk.
- **Input validation**: Prompt/context length limits on Ask Rishi (e.g. prompt max 10k chars, context 5k).
- **Cache clear**: Optional protection with `CACHE_CLEAR_SECRET`. If set, `POST /api/cache/clear` requires `?secret=...` or `body.secret` to match.

## Frontend

- **XSS mitigation**: User-visible HTML and SVG (blog content, chart SVGs) are sanitized with DOMPurify before being rendered (e.g. `dangerouslySetInnerHTML`).
- **Unsafe URLs**: The external link handler blocks `javascript:` and `data:` URLs to avoid script injection via links.
- **No sensitive logging**: API key presence is never logged in production builds.

### API keys in the client bundle

When you build the frontend with `GEMINI_API_KEY`, `GROQ_API_KEY`, or `PERPLEXITY_API_KEY` set (e.g. in CI), those values are **inlined into the JavaScript bundle** so the app can call the APIs from the browser when no backend is used. As a result, **anyone can view source or DevTools and extract these keys**. To reduce risk:

- Prefer using the **backend** (`server/`) for AI and external APIs; do **not** set Gemini/Groq/Perplexity keys in the frontend build env. Set them only on the server (e.g. Cloud Run, GitHub Actions for blog script).
- If you need client-side AI (e.g. when the backend is down), use separate keys with **strict quota/rate limits** and treat them as potentially public.
- Keys that are meant to be public (e.g. Google Maps `VITE_GOOGLE_API_KEY`) can be restricted by domain in the provider’s console.

## Auditing dependencies

npm reported **4 vulnerabilities (2 moderate, 2 high)**. To address them:

1. **See the report** (from project root):
   ```bash
   npm audit
   ```
2. **Apply safe fixes** (updates that stay within semver ranges):
   ```bash
   npm audit fix
   ```
3. **If vulnerabilities remain**, check which packages are affected. To try automatic major upgrades (may have breaking changes):
   ```bash
   npm audit fix --force
   ```
   Run tests and the app after this; revert or fix any breakage.
4. **Backend**: From `server/`, run `npm audit` and `npm audit fix` there too.

## Deployment

- Keep dependencies updated (`npm audit`, `npm update`).
- Use HTTPS in production and set `NODE_ENV=production` for the backend.
- Store secrets (API keys, `CACHE_CLEAR_SECRET`) in environment variables or a secrets manager, not in code or public config.
- If you use a reverse proxy (e.g. Nginx), consider adding a strict Content-Security-Policy and rate limiting at the proxy.

## Reporting issues

If you find a security vulnerability, please report it privately (e.g. via the repository’s security policy or maintainer contact) rather than in a public issue.
