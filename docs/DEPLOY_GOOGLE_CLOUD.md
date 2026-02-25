# Deploy CosmicJyoti Backend to Google Cloud (Cloud Run)

Use **Google Cloud Run** to run your `server/` API. Cloud Run is serverless, scales to zero, and works with your existing Dockerfile. You can use your **Gemini Pro access** via the same `GEMINI_API_KEY` (or API key from [Google AI Studio](https://aistudio.google.com/app/apikey)).

---

## Prerequisites

1. **Google Cloud account** – [console.cloud.google.com](https://console.cloud.google.com)
2. **gcloud CLI** – [Install](https://cloud.google.com/sdk/docs/install)
3. **Gemini API key** – from [Google AI Studio](https://aistudio.google.com/app/apikey) (same key works for Gemini Pro)

---

## 1. Create project and enable APIs

```bash
# Login and set project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Create project if needed
gcloud projects create cosmicjyoti-api --name="CosmicJyoti API"
gcloud config set project cosmicjyoti-api

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

---

## 2. Deploy from local (quick test)

From your **repo root** (where `server/` lives):

```bash
# Build the image (context = repo root, Dockerfile in server/)
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/cosmicjyoti-api .

# Or with Artifact Registry (recommended)
gcloud artifacts repositories create cosmicjyoti --repository-format=docker --location=YOUR_REGION
gcloud builds submit --tag YOUR_REGION-docker.pkg.dev/YOUR_PROJECT_ID/cosmicjyoti/cosmicjyoti-api .
```

**Important:** The Dockerfile uses `COPY server/` so the build context must be the **repo root**. Use a `cloudbuild.yaml` that runs the build from the repo root (see section 4), or run from root:

```bash
# From repo root - Docker needs to be told where Dockerfile is and use current dir as context
docker build -f server/Dockerfile -t gcr.io/YOUR_PROJECT_ID/cosmicjyoti-api .
docker push gcr.io/YOUR_PROJECT_ID/cosmicjyoti-api
```

Then deploy to Cloud Run:

```bash
gcloud run deploy cosmicjyoti-api \
  --image gcr.io/YOUR_PROJECT_ID/cosmicjyoti-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "GEMINI_API_KEY=your_gemini_api_key_here" \
  --set-env-vars "CORS_ORIGIN=https://www.cosmicjyoti.com,https://cosmicjyoti.com"
```

Replace `YOUR_PROJECT_ID`, `your_gemini_api_key_here`, and CORS origins as needed. You’ll get a URL like `https://cosmicjyoti-api-xxxxx-uc.a.run.app`.

---

## 3. Deploy using Cloud Build (from repo root)

A `cloudbuild.yaml` in the repo can build from the root context. Create it (see section 4), then from **repo root**:

```bash
gcloud builds submit --config cloudbuild.yaml .
```

Then deploy the built image to Cloud Run as in section 2 (or add the deploy step to `cloudbuild.yaml`).

---

## 4. Cloud Build config (build from root)

Add this file at **repo root** so Cloud Build uses the right context for `server/Dockerfile`:

**`cloudbuild.yaml`** (in repo root):

```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-f'
      - 'server/Dockerfile'
      - '-t'
      - 'gcr.io/$PROJECT_ID/cosmicjyoti-api:$SHORT_SHA'
      - '-t'
      - 'gcr.io/$PROJECT_ID/cosmicjyoti-api:latest'
      - '.'
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/cosmicjyoti-api:$SHORT_SHA']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/cosmicjyoti-api:latest']
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'cosmicjyoti-api'
      - '--image'
      - 'gcr.io/$PROJECT_ID/cosmicjyoti-api:$SHORT_SHA'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
images:
  - 'gcr.io/$PROJECT_ID/cosmicjyoti-api:$SHORT_SHA'
  - 'gcr.io/$PROJECT_ID/cosmicjyoti-api:latest'
options:
  logging: CLOUD_LOGGING_ONLY
```

Secrets (e.g. `GEMINI_API_KEY`) should **not** be in this file. Set them once on the Cloud Run service (see below).

---

## 5. Set environment variables and secrets

Set env vars (and optionally secrets) on the Cloud Run service:

**Option A – Env vars (plain):**

```bash
gcloud run services update cosmicjyoti-api \
  --region us-central1 \
  --set-env-vars "NODE_ENV=production,GEMINI_API_KEY=your_key,CORS_ORIGIN=https://www.cosmicjyoti.com,https://cosmicjyoti.com"
```

**Option B – Secret (recommended for API key):**

```bash
# Create secret (one-time)
echo -n "your_gemini_api_key" | gcloud secrets create gemini-api-key --data-file=-

# Allow Cloud Run to use it
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Update Cloud Run to use the secret
gcloud run services update cosmicjyoti-api --region us-central1 \
  --set-secrets="GEMINI_API_KEY=gemini-api-key:latest" \
  --set-env-vars "NODE_ENV=production,CORS_ORIGIN=https://www.cosmicjyoti.com,https://cosmicjyoti.com"
```

Use your project number from `gcloud projects describe YOUR_PROJECT_ID --format='value(projectNumber)'`.

---

## 6. Connect GitHub (optional CI/CD)

1. In **Cloud Console** → **Cloud Build** → **Triggers** → **Create trigger**.
2. Connect your repo: **Appmakers123/CosmicJyoti**.
3. **Build configuration:** Cloud Build configuration file; path: `cloudbuild.yaml` (repo root).
4. On push to `main` (or your branch), Cloud Build will build and deploy.

Ensure the trigger’s service account has permissions to deploy to Cloud Run and push to Container Registry (or Artifact Registry).

---

## 7. After deployment

1. **Health check:**  
   `https://YOUR_SERVICE_URL/health` should return `{"status":"ok",...}`.

2. **Frontend:**  
   Set `VITE_API_BASE_URL` to your Cloud Run URL (e.g. `https://cosmicjyoti-api-xxxxx-uc.a.run.app`) when building the web app, then redeploy the frontend.

3. **ChatGPT / external apps:**  
   Use the same Cloud Run URL as the API base. Requests with no `Origin` are already allowed by your CORS logic.

---

## 8. Cost and Gemini

- **Cloud Run:** Free tier is generous; you pay for request time and CPU/memory when the service is handling traffic. It scales to zero when idle.
- **Gemini:** Use your existing Gemini Pro access; the same API key works with the backend. Billing (if any) is per the [Generative AI pricing](https://ai.google.dev/pricing).

---

## Quick reference

| Item | Value |
|------|--------|
| Build context | Repo root (so `COPY server/` works) |
| Dockerfile | `server/Dockerfile` |
| Port | Cloud Run sets `PORT`; your app uses `process.env.PORT \|\| 3001` |
| Env vars | `NODE_ENV`, `GEMINI_API_KEY`, `CORS_ORIGIN` |
| Service URL | Shown after `gcloud run deploy` or in Console → Cloud Run |
