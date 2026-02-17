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

1. **Consent checkbox** – User must check **"I consent to sharing my information"** before clicking Save. If it’s unchecked, data is only saved locally and not sent to the sheet.
2. **Restart dev server** – After adding or changing `VITE_PROFILE_SUBMIT_URL` in `.env.local`, **stop** the dev server (Ctrl+C) and run `npm run dev` again. Vite reads env only at startup.
3. **Correct Web App URL** – Use the **exec** URL from Google Apps Script: Deploy → Manage deployments → copy the URL that ends with `/exec`. It must start with `https://script.google.com/macros/s/...`.
4. **Web app access** – In the script deployment, set **"Who has access"** to **Anyone** (so unauthenticated browser requests are allowed). If it’s "Only myself" or "Anyone with Google account", the POST may get 302/403.
5. **Sheet permissions** – The script uses `SHEET_ID` in the code. Ensure that Google account owns (or has edit access to) that spreadsheet.
6. **Browser console** – Open DevTools (F12) → Console and Network. Save profile and look for `[ProfileSubmit]` logs and the POST to `script.google.com`. Red errors or a failed request will show the cause.

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
