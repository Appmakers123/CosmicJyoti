# Deploy CosmicJyoti Web App to Your Domain

This guide covers deploying the CosmicJyoti web app to **cosmicjyoti.com** (or your custom domain).

---

## Option 1: GitHub Pages (Recommended)

Your project has a GitHub Actions workflow that auto-deploys on push to `main`.

### Step 1: Build & Test Locally

```bash
npm install
npm run build
npm run preview   # Optional: preview at http://localhost:4173
```

### Step 2: Push to GitHub

```bash
git add .
git commit -m "Deploy web app with AdSense integration"
git push origin main
```

### Step 3: Configure Custom Domain (cosmicjyoti.com)

1. Go to your repo on GitHub → **Settings** → **Pages**
2. Under **Custom domain**, enter: `www.cosmicjyoti.com` or `cosmicjyoti.com`
3. Save. GitHub will show DNS instructions.
4. In your domain registrar (GoDaddy, Namecheap, etc.), add:
   - **A record**: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - **CNAME** (if using www): `your-username.github.io`
5. Wait for DNS propagation (up to 48 hours; often 5–15 minutes).
6. Enable **Enforce HTTPS** in GitHub Pages settings.

### Step 4: Required GitHub Secrets

For the build to succeed, add these in **Settings → Secrets and variables → Actions**:

| Secret | Purpose |
|--------|---------|
| `API_KEY` | Gemini API key |
| `GEMINI_FALLBACK_KEY` | (Optional) Backup Gemini key |
| `VITE_GOOGLE_API_KEY` | Google Maps/Geocoding |
| `VITE_PROFILE_SUBMIT_URL` | (Optional) Profile submission URL |

---

## Option 2: Manual Deployment (VPS / Shared Hosting)

If you host on your own server (e.g., cPanel, VPS, Netlify, Vercel):

### Build

```bash
npm run build
```

### Deploy the `dist` Folder

Upload the contents of the `dist` folder to your web root:

- **cPanel**: Upload to `public_html` or your domain folder
- **Netlify**: Drag & drop `dist` or connect the repo and set build command: `npm run build`, publish directory: `dist`
- **Vercel**: Connect repo, build command: `npm run build`, output directory: `dist`
- **VPS**: `scp -r dist/* user@server:/var/www/cosmicjyoti/`

### Static HTML Pages

The `public` folder (404.html, blog articles, landing.html, etc.) is copied into `dist` during build. Ensure your server serves:

- `index.html` for `/`
- `404.html` for 404s
- SPA fallback: all routes should serve `index.html` for client-side routing

---

## AdSense Integration

The following ad units are integrated:

| Type | Slot ID | Placement |
|------|---------|-----------|
| **Multiplex** | 6705795838 | Hub / module grid |
| **In-feed** | 6593742126 | Numerology, Compatibility, list views |
| **Display** | 5280660455 | Between sections, leaderboard |
| **In-article** | 3545619331 | Learning Center, Kundali Result, blog articles |

The AdSense script (`ca-pub-3559865379099936`) is loaded in `index.html`. Ensure your domain is verified in [Google AdSense](https://www.google.com/adsense/).

---

## Quick Checklist

- [ ] Build succeeds: `npm run build`
- [ ] GitHub secrets configured (if using GitHub Pages)
- [ ] Custom domain DNS configured
- [ ] HTTPS enabled
- [ ] AdSense domain verified
- [ ] `public/ads.txt` updated if required by AdSense
