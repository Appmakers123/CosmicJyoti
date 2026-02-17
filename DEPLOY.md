# Deploy CosmicJyoti (Frontend + Backend)

The app has a **backend** in the `server/` directory (Node/Express, Google Gen AI for Rishi, Kundali, etc.) and a **frontend** (Vite/React). You run the backend yourself—locally or on your own host—not via Render.

---

## Running locally (backend + frontend)

Backend lives in `server/`; run it together with the frontend for the full app.

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

### 1. Run the backend (`server/`)

The backend is in **`server/`**. Run it wherever you host your Node apps:

- **Locally:** `npm run server` or `cd server && npm run dev` (from project root).
- **Your own host (VPS, Railway, Fly.io, etc.):** Deploy the `server/` directory (e.g. use `server/Dockerfile` or run `node index.js`). Set `API_KEY` or `GEMINI_API_KEY` in the environment.
- **Optional – Render:** You can use `render.yaml` and `server/Dockerfile` if you want; we are not using Render by default.

Ensure the backend is reachable at a URL (e.g. `https://your-backend.example.com` or `http://localhost:3001` for local dev). The frontend will call this URL when `VITE_API_BASE_URL` is set.

---

## 2. Deploy the frontend (GitHub Pages)

The frontend must know **where your backend is running** so it can call your API.

1. **GitHub repo → Settings → Secrets and variables → Actions.**

2. **Add (or update) these secrets:**

   | Secret name             | Value                                      | Required for |
   |--------------------------|--------------------------------------------|--------------|
   | `VITE_API_BASE_URL`      | URL where your `server/` backend is running (no trailing slash) | Backend calls (Rishi, Kundali, etc.) |
   | `API_KEY` or `GEMINI_API_KEY` | Your Gemini API key (for direct fallback)   | Optional; backend has its own key |

   Examples:
   - Backend on your server: `VITE_API_BASE_URL` = `https://api.yourdomain.com`
   - Backend on Render: `VITE_API_BASE_URL` = `https://cosmicjyoti-api.onrender.com`

   **Important:** Use `https://` in production (no trailing slash).

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
- **Frontend:** Open your GitHub Pages URL. Use the chat (Rishi); it should call the backend and get responses (no "couldn't connect" if backend is up).

---

## 4. Summary

| What        | Where        | URL / Config |
|------------|--------------|--------------|
| Backend API | Your host (from `server/`) | e.g. `https://api.yourdomain.com` or localhost for dev |
| Frontend   | GitHub Pages | e.g. `https://user.github.io/cosmicsutra/` |
| Backend URL in frontend | GitHub Secret | `VITE_API_BASE_URL` = URL where your backend runs |

After you set `VITE_API_BASE_URL` to your backend URL and redeploy the frontend, the app will use your `server/` backend for Rishi, Kundali, Panchang, and other APIs.
