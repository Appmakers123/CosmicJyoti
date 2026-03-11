# User data sync (profile + saved reports)

When a user signs in with Google, their **profile** (name, DOB, time, place, gender, partner) and **saved reports** (Kundali, Horoscope, Panchang, Guna Milan, Compatibility, Tarot, etc.) can be saved to your backend and restored when they log in again (e.g. from another device or later).

## Flow

- **On Google sign-in** (or on app load if user is already in localStorage): the app calls `GET {syncUrl}?userId=xxx`. If the backend returns `{ profile, reports }`, that data is merged into local storage so the profile form and “My saved reports” are populated.
- **“Save to my account”** (in the profile modal when logged in): the app sends the current profile and all saved reports via `POST {syncUrl}` with body `{ userId, profile, reports }`.

**Sync URL:** When the app uses the backend from `/server` (e.g. in dev with `http://localhost:3001` or when `VITE_API_BASE_URL` is set), sync automatically uses that backend’s `/api/sync` endpoint. Only if no backend is configured does the app use `VITE_SYNC_API_URL` (e.g. for a separate production sync service).

## Backend contract

- **GET** `{VITE_SYNC_API_URL}?userId={userId}`  
  - Returns JSON: `{ profile: GlobalProfile | null, reports: { index: SavedReportMeta[], items: Record<string, SavedReport> } }`.

- **POST** `{VITE_SYNC_API_URL}`  
  - Body: `{ userId: string, profile: GlobalProfile | null, reports: { index, items } }`.  
  - Store by `userId` (e.g. Google sub). Return 200 and e.g. `{ ok: true }`.

CORS must allow your app origins (e.g. `https://www.cosmicjyoti.com`, `http://localhost:5173`).

---

## Option A: Use the built-in server (recommended, no Firebase)

The CosmicJyoti **Express server** (`server/index.js`) includes sync endpoints that store data in a JSON file. No Firebase or extra services needed.

1. **Run the server** (from project root):
   ```bash
   cd server && npm install && node index.js
   ```
   Or use your usual start script. The server listens on `PORT` (default 3001).

2. **Set CORS** so the frontend can call it. In `.env` or `.env.local` (project root or server folder):
   ```bash
   CORS_ORIGIN=http://localhost:5173,https://www.cosmicjyoti.com
   ```
   Add any other origins where you host the app.

3. **Sync URL:** When the frontend is using the same backend (e.g. in dev it uses `http://localhost:3001` automatically), sync uses `http://localhost:3001/api/sync` — no need to set `VITE_SYNC_API_URL`. For production, set `VITE_API_BASE_URL` to your backend URL so the app uses that backend for both API calls and sync; or if the frontend does not use that backend, set `VITE_SYNC_API_URL` to your sync endpoint (e.g. `https://api.cosmicjyoti.com/api/sync`).

4. Restart the frontend dev server. When a user signs in with Google, the profile modal shows **“Save to my account”**. After they save, the same data is restored on next login (same or different device).

**Where data is stored:** `server/data/userSync.json` (created automatically; `server/data/` is in `.gitignore`).

---

## Option B: Your own backend

Implement the same GET/POST contract on any backend (e.g. Vercel, Netlify, Cloudflare Worker, or another server). Set `VITE_SYNC_API_URL` to that base URL (e.g. `https://your-api.com/sync`). The app does not send any auth header; it relies on `userId` (Google sub) in the query (GET) or body (POST). If you need auth, add it in your backend and optionally in the frontend (e.g. send a token in a header).

---

## Deployed site: why changes don’t show after push

**`.env.local` is gitignored** — it is never pushed. So the live site does **not** get any variables from your local `.env.local`.

To get sync (and other features) on the **deployed** site:

1. **Set environment variables in your host** (Vercel, Netlify, etc.):
   - **Vercel:** Project → Settings → Environment Variables  
   - **Netlify:** Site → Site settings → Environment variables  
   Add at least:
   - `VITE_GOOGLE_CLIENT_ID` (for Google sign-in)
   - `VITE_SYNC_API_URL` = your **production** API URL (e.g. `https://your-api.example.com/api/sync`), **not** `http://localhost:3001/...`
   - Any other `VITE_*` keys the app needs (e.g. `VITE_PROFILE_SUBMIT_URL`).

2. **Redeploy** after adding or changing variables (e.g. “Redeploy” in the dashboard, or push a new commit). New env values are applied only on the next build.

3. **Hard refresh** the site (Ctrl+Shift+R) or clear cache so the browser loads the new JS.

---

## Without a backend

If `VITE_SYNC_API_URL` is not set:

- Profile and reports stay **only in the browser** (localStorage).
- “Save to my account” is not shown.
- No sync across devices or after clearing data.
