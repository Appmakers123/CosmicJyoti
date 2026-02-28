# Deploy CosmicJyoti Backend (for Ask AI / CORS fix)

The **Ask AI** feature in Kundali, Compatibility, and other modules calls the Gemini API. Google's Gemini API **blocks direct browser calls** from cosmicjyoti.com due to CORS. To fix this, deploy the backend server as a proxy.

---

## ⚠️ Fix for Rollup Error on Render

If you see `Cannot find module @rollup/rollup-linux-x64-gnu`:
- **Root Directory** must be `server` (not empty/root)
- **Build Command** must be `npm install` only (no `npm run build` or `vite build`)

The backend is pure Node.js – it does NOT use Vite or Rollup.

---

## Quick Setup (Render.com - Free)

### Option A: Dockerfile (Recommended – avoids Root Directory issues)

1. Go to [Render.com](https://render.com) and sign up (free)
2. Click **New** → **Web Service**
3. Connect your GitHub repo: **Appmakers123/CosmicJyoti**
4. Configure:
   - **Environment:** Docker
   - **Dockerfile Path:** `server/Dockerfile`
   - **Instance Type:** Free
5. Add **Environment Variables**:
   - `API_KEY` = Your Gemini API key
   - `GEMINI_API_KEY` = (optional, same as API_KEY)
6. Click **Create Web Service**
7. Copy your URL (e.g. `https://cosmicjyoti-api.onrender.com`)

### Option B: Root Directory (if Docker doesn’t work)

1. Go to [Render.com](https://render.com) → your service → **Settings**
2. Set:
   - **Root Directory:** `server` (exactly this)
   - **Build Command:** `npm install` (remove `npm run build`)
   - **Start Command:** `npm start`
3. Save and **Manual Deploy**

### 2. Add to GitHub Secrets

1. Go to **https://github.com/Appmakers123/CosmicJyoti** → **Settings** → **Secrets** → **Actions**
2. Add new secret:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** `https://your-app-name.onrender.com` (no trailing slash)

### 3. Rebuild the web app

1. Go to **Actions** → **Deploy to GitHub Pages**
2. Click **Run workflow** → **Run workflow**
3. Wait for the build to complete

---

## Google Cloud (Cloud Run)

If you use **Google Cloud** and have Gemini Pro access, deploy the backend to **Cloud Run**:

- **Full guide:** [docs/DEPLOY_GOOGLE_CLOUD.md](docs/DEPLOY_GOOGLE_CLOUD.md)
- From repo root: `gcloud builds submit --config cloudbuild.yaml .` then set env vars (e.g. `GEMINI_API_KEY`, `CORS_ORIGIN`) on the Cloud Run service.
- Set `VITE_API_BASE_URL` to your Cloud Run URL when building the frontend.

**If the API works when you hit it directly (Postman/curl) but fails from the app:** the browser is blocking the request due to **CORS**. The backend only allows origins listed in `CORS_ORIGIN`. On Cloud Run, set the **`CORS_ORIGIN`** environment variable to your frontend URL(s), for example:
- Production: `CORS_ORIGIN=https://www.cosmicjyoti.com,https://cosmicjyoti.com`
- Local dev (frontend at localhost calling Cloud Run): `CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173`
- Both: `CORS_ORIGIN=https://www.cosmicjyoti.com,https://cosmicjyoti.com,http://localhost:5173,http://127.0.0.1:5173`  
No spaces; comma-separated. Redeploy the Cloud Run service after changing it.

**Cloud Run secret → env var:** The server reads `GEMINI_API_KEY` or `API_KEY`. When you add a secret in Cloud Run, **expose it as an environment variable** with the **exact name** `GEMINI_API_KEY` (or `API_KEY`). In Cloud Run: **Edit & deploy** → **Variables & secrets** → Add variable / reference secret → **Name:** `GEMINI_API_KEY`, **Value:** your secret reference. If the name doesn’t match, the backend will log "Gemini API key not found" and Ask Rishi will return "AI key is missing there".

---

## Alternative: Railway, Fly.io, or Vercel

- **Railway:** Same steps, use `server` as root, add env vars
- **Fly.io:** `fly launch` in server folder, add secrets
- **Vercel:** Use serverless functions (requires adapting the server)

---

## Verify

After deployment:

1. Visit https://www.cosmicjyoti.com/
2. Generate a Kundali
3. Scroll to **Ask about your Kundali**
4. Type a question and click **Ask Question**
5. You should get an AI response
