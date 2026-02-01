# Profile Data to Google Sheet Setup

When users give consent and save their profile, data is POSTed to a URL you configure. Data is appended to your Google Sheet and emailed to **nikemaurya1996@gmail.com**.

**Your Sheet:** [cosmicjyoti.com Profiles](https://docs.google.com/spreadsheets/d/1XKEvEnFhrFD73BnXJK8FeuS8vCJ07h3gTxzMuutUAu4/edit?gid=0#gid=0)

---

## Step 1: Create Google Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Click **New project**
3. Delete any default code in `Code.gs`
4. Copy the entire contents of **`PROFILE_SHEET_Code.gs`** (in this project) and paste into `Code.gs`
5. Save (Ctrl+S)

---

## Step 2: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon next to "Select type" → choose **Web app**
3. Set:
   - **Description:** CosmicJyoti Profile Submit
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**
5. **Copy the Web App URL** (looks like `https://script.google.com/macros/s/XXXXX/exec`)
6. Authorize when prompted (choose your Google account, allow permissions)

---

## Step 3: Add URL to .env

Create or edit `.env.local` in your project root (use `.env.local` for local dev):

```
VITE_PROFILE_SUBMIT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

Replace `YOUR_SCRIPT_ID` with the ID from your Web App URL.

**For GitHub Pages deploy:** Add `VITE_PROFILE_SUBMIT_URL` as a GitHub secret:
1. Repo → Settings → Secrets and variables → Actions
2. New repository secret → Name: `VITE_PROFILE_SUBMIT_URL`, Value: your Web App URL

---

## Step 4: Rebuild the App

```bash
npm run build
```

Or for development:

```bash
npm run dev
```

---

## Troubleshooting: No records in sheet

1. **Consent checkbox** – User must check "I consent to sharing my information" before Save.
2. **Rebuild after adding URL** – Run `npm run dev` or `npm run build` after adding `VITE_PROFILE_SUBMIT_URL` to `.env.local`.
3. **Redeploy Google Apps Script** – If you updated `PROFILE_SHEET_Code.gs`, deploy again (Deploy → Manage deployments → Edit → Version: New version → Deploy).
4. **Check browser console** – Open DevTools (F12) → Network tab, save profile, look for the POST request to script.google.com and any errors.

---

## How It Works

- When a user fills the profile form, checks consent, and clicks **Save**, the app POSTs data to your Web App URL
- The script appends a row to your Google Sheet
- You receive an email at nikemaurya1996@gmail.com for each submission
- When the sheet reaches 1000 rows, a new sheet tab is created automatically

## Payload Structure (from app)

| Field | Description |
|-------|-------------|
| timestamp | ISO date string |
| accountName | User's name (optional) |
| accountEmail | User's email (optional) |
| self | name, date, time, location, gender |
| partner | name, date, time, location, gender (optional) |
