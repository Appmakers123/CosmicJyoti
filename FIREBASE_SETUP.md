# Firebase Setup – Ask AI (CORS Fix)

Use Firebase Cloud Functions to proxy Gemini API calls and fix CORS for the Ask AI feature on cosmicjyoti.com.

---

## Prerequisites

- Firebase project ([console.firebase.google.com](https://console.firebase.google.com))
- Node.js 18+
- Firebase CLI: `npm install -g firebase-tools`

---

## Step 1: Link Firebase Project

1. Open terminal in the project root.
2. Log in: `firebase login`
3. Link project: `firebase use --add`
4. Choose your Firebase project (or create one).
5. Edit `.firebaserc` and set `YOUR_FIREBASE_PROJECT_ID` to your project ID.

---

## Step 2: Deploy Cloud Function

1. Install function dependencies:
   ```bash
   cd functions
   npm install
   cd ..
   ```

2. Set Gemini API key (required before deploy):
   ```bash
   firebase functions:secrets:set GEMINI_API_KEY
   ```
   When prompted, paste your Gemini API key.

3. Deploy the function:
   ```bash
   firebase deploy --only functions
   ```

4. Note the function URL (e.g. `https://us-central1-YOUR_PROJECT.cloudfunctions.net/askRishi`).

---

## Step 3: Get Firebase Web Config

1. Go to [Firebase Console](https://console.firebase.google.com) → your project.
2. Project Settings (gear) → General.
3. Under "Your apps", select or create a Web app.
4. Copy the config values:
   - `apiKey`
   - `projectId`
   - `authDomain` (optional)

---

## Step 4: Add GitHub Secrets

In **Settings** → **Secrets and variables** → **Actions**, add:

| Secret | Value |
|--------|-------|
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_AUTH_DOMAIN` | `YOUR_PROJECT.firebaseapp.com` (optional) |

---

## Step 5: Rebuild Web App

1. Push your code.
2. Go to **Actions** → **Deploy to GitHub Pages** → **Run workflow**.
3. Wait for the build to finish.

---

## Step 6: Verify

1. Open https://www.cosmicjyoti.com/
2. Generate a Kundali.
3. Use **Ask about your Kundali**.
4. Ask a question and confirm you get an AI response.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Firebase not configured" | Add `VITE_FIREBASE_API_KEY` and `VITE_FIREBASE_PROJECT_ID` to GitHub Secrets. |
| "Gemini API key not configured" | Set `GEMINI_API_KEY` for the Cloud Function (Secret Manager or config). |
| Function deploy fails | Run `cd functions && npm install` and redeploy. |
| CORS error | Callable functions handle CORS; ensure you use `httpsCallable`, not a raw HTTP request. |
