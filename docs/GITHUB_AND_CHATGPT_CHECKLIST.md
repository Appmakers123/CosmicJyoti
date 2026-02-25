# GitHub Repo & ChatGPT Integration – What You Need To Do

Your repo: [Appmakers123/CosmicJyoti](https://github.com/Appmakers123/CosmicJyoti) – frontend (React/Vite) + backend (`server/`).

---

## 1. Backend must be deployed and public

The backend in `server/` is **not** auto-deployed by GitHub. You need to run it somewhere public so that:

- Your website (cosmicjyoti.com) can call it for Kundali, Ask Rishi, Panchang, etc.
- ChatGPT Add apps can call it when users use your GPT.

**Do this:**

1. Deploy the backend using your existing setup:
   - **Render.com (recommended):** [DEPLOY_BACKEND.md](../DEPLOY_BACKEND.md) – connect the repo, use `server/Dockerfile`, add env vars `API_KEY` / `GEMINI_API_KEY`.
   - Or use [render.yaml](../render.yaml): connect the repo at Render and add the same env vars.
2. Note the backend URL, e.g. `https://cosmicjyoti-api.onrender.com` (no trailing slash).

---

## 2. Frontend must know the backend URL

Your frontend only calls the backend when `VITE_API_BASE_URL` is set **at build time**.

**Do this:**

1. **If you deploy the web app via GitHub Actions** (e.g. to GitHub Pages / cosmicjyoti.com):
   - In GitHub: **Settings → Secrets and variables → Actions**
   - Add secret: **Name** `VITE_API_BASE_URL`, **Value** your backend URL (e.g. `https://cosmicjyoti-api.onrender.com`).
   - Your workflow must pass this into the build (e.g. `VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}` in env for the build step).
2. **If you build locally and then deploy:**
   - In `.env.production` (or the file your build uses):  
     `VITE_API_BASE_URL=https://cosmicjyoti-api.onrender.com`
   - Run `npm run build` and deploy the `dist/` folder.

If `VITE_API_BASE_URL` is not set in production, the app will try to call Gemini from the browser (and may hit CORS issues). So this step is required for a working site + backend.

---

## 3. Backend CORS for your site (and optional for ChatGPT)

- In **production**, the server uses `CORS_ORIGIN` if set; otherwise it only allows the default localhost origins.
- **Do this:** On Render (or wherever the backend runs), add an env var:
  - **Key:** `CORS_ORIGIN`  
  - **Value:** `https://www.cosmicjyoti.com,https://cosmicjyoti.com`  
  (add any other frontend URLs you use, comma-separated, no spaces)

ChatGPT Actions usually call your API **server-to-server** (no browser origin). Your code already allows requests with **no `Origin` header** (`if (!origin) return cb(null, true)`), so ChatGPT can call your API without changing CORS. If you later see blockings, you can add the origin OpenAI sends (if any) to `CORS_ORIGIN`.

---

## 4. ChatGPT Add apps (Actions) – what to do

1. **Backend URL:** Use the same public backend URL (e.g. `https://cosmicjyoti-api.onrender.com`). No trailing slash.
2. **OpenAPI schema:** ChatGPT needs an OpenAPI (Swagger) spec that describes your endpoints. You don’t have one in the repo yet. Options:
   - Add a file like `server/openapi.yaml` (or `docs/openapi.yaml`) that describes at least:  
     `POST /api/kundali`, `POST /api/panchang`, `POST /api/horoscope`, `POST /api/ask-rishi`, etc., with request body schemas.
   - In the ChatGPT GPT editor: **Configure → Actions → Create new action → Import from URL** and point to the URL of this schema (e.g. hosted on your site or in a gist), or paste the YAML/JSON.
3. **Authentication:** Your backend currently allows unauthenticated requests. For production you may want:
   - API key in a header (e.g. `x-api-key`) and validate it in `server/index.js`, and configure the same key in ChatGPT Actions.
   - Or keep it open if usage is low and you accept the risk.

Details of which APIs exist and suggested request/response shapes are in [API_MODULES_FOR_CHATGPT.md](API_MODULES_FOR_CHATGPT.md).

---

## 5. GitHub repo – nothing else required

- The repo structure (frontend + `server/`) is fine.
- **Do not** commit `.env` or API keys; use GitHub Secrets and your host’s env vars.
- Optional: In README, set the live demo URL to `https://www.cosmicjyoti.com` and mention that the backend is deployed separately (e.g. Render) and that `VITE_API_BASE_URL` must be set for the frontend to use it.

---

## Quick checklist

| Task | Done? |
|------|--------|
| Backend deployed (e.g. Render) and returns 200 for `GET /health` | |
| Env vars on backend: `API_KEY` or `GEMINI_API_KEY`, optionally `CORS_ORIGIN` | |
| `VITE_API_BASE_URL` set when building frontend (Actions secret or .env) | |
| Frontend redeployed so production build has backend URL | |
| For ChatGPT: OpenAPI schema created and imported in GPT Actions | |
| (Optional) API key auth on backend and configured in ChatGPT | |

Once the backend is public and the frontend is built with `VITE_API_BASE_URL`, your site and ChatGPT can both use the same APIs.
