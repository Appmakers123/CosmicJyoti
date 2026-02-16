# Deploy CosmicJyoti (Frontend + Backend)

**Right now:** We’re **not** using Render. Backend and frontend run **locally** (see “Running locally” below). The “Deploy to production” section is for when you want to host the app later (e.g. Render + GitHub Pages).

---

## Running locally (backend + frontend)

The app has a **backend** (Node/Express in `server/`, with Google Gen AI for Rishi, Kundali, etc.) and a **frontend** (Vite/React). Both need to run for the full app to work.

### One-time setup

```bash
# From project root
npm install
cd server && npm install && cd ..
```

Add your Gemini API key: in project root, create or edit `.env.local` with `API_KEY=your_gemini_key` (the server will load it from there).

### Run both together

From the **project root**:

```bash
npm run dev:all
```

This starts:
- **Backend** at `http://localhost:3001` (Rishi, Kundali, Panchang, etc.)
- **Frontend** at `http://localhost:5173` (Vite dev server)

The frontend is configured to use `http://localhost:3001` in development, so Rishi and all APIs will use your local backend.

### Run separately (two terminals)

- **Backend only:** `npm run server` (from project root) or `cd server && npm run dev`
- **Frontend only:** `npm run dev` (from project root)

---

## Deploy to production

### 1. Deploy the backend (Render)

1. **Push your code** to GitHub (if not already).

2. **Go to [Render](https://render.com)** and sign in (GitHub login is easiest).

3. **New → Web Service**
   - Connect your GitHub repo (`cosmicsutra` or your repo name).
   - Render should detect the **Blueprint** from `render.yaml`:
     - **Name:** `cosmicjyoti-api`
     - **Dockerfile:** `server/Dockerfile`
   - If you don’t use the blueprint, add a **Web Service** and set:
     - **Build:** Docker, Dockerfile path: `server/Dockerfile`
     - **Instance:** Free (or paid)

4. **Environment variables** (required for Rishi / AI):
   - `API_KEY` or `GEMINI_API_KEY` = your Gemini API key  
   Get one: [Google AI Studio](https://aistudio.google.com/apikey)

5. **Create Web Service.** Wait for the first deploy to finish.

6. **Copy the backend URL**, e.g.:
   - `https://cosmicjyoti-api.onrender.com`  
   (Render gives you a URL like `https://<service-name>.onrender.com`.)

**Note:** On the free tier, the service may sleep after ~15 minutes of no traffic. The first request after sleep can take 30–60 seconds (cold start).

---

## 2. Deploy the frontend (GitHub Pages)

The frontend must be built with your **backend URL** so it calls your API in production.

1. **GitHub repo → Settings → Secrets and variables → Actions.**

2. **Add (or update) these secrets:**

   | Secret name             | Value                                      | Required for |
   |--------------------------|--------------------------------------------|--------------|
   | `VITE_API_BASE_URL`      | Your Render backend URL (no trailing slash) | Backend calls (Rishi, Kundali, etc.) |
   | `API_KEY` or `GEMINI_API_KEY` | Your Gemini API key (for direct fallback)   | Optional; backend has its own key |

   Example: `VITE_API_BASE_URL` = `https://cosmicjyoti-api.onrender.com`

   **Important:** Use `https://` and no trailing slash.

3. **Trigger deploy:**
   - Push to `main`, or
   - **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**.

4. **Enable GitHub Pages** (if not already):
   - **Settings → Pages**
   - Source: **GitHub Actions**
   - Save. Your site will be at `https://<username>.github.io/<repo>/` or your custom domain.

---

## 3. Verify

- **Backend:** Open `https://<your-backend-url>/health` → should return `{"status":"ok",...}`.
- **Frontend:** Open your GitHub Pages URL. Use the chat (Rishi); it should call the backend and get responses (no “couldn’t connect” if backend is up).

---

## 4. Summary

| What        | Where        | URL / Config |
|------------|--------------|--------------|
| Backend API | Render       | e.g. `https://cosmicjyoti-api.onrender.com` |
| Frontend   | GitHub Pages | e.g. `https://user.github.io/cosmicsutra/` |
| Backend URL in frontend | GitHub Secret | `VITE_API_BASE_URL` = backend URL |

After you set `VITE_API_BASE_URL` and redeploy the frontend, the app will use your deployed backend for Rishi, Kundali, Panchang, and other APIs.
