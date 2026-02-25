# Integrate CosmicJyoti Backend with ChatGPT

Your API is live at: **https://cosmicjyoti-api-265360069232.europe-west1.run.app**

Use the OpenAPI schema so ChatGPT can call your endpoints (Panchang, Horoscope, Kundali, Ask Rishi, etc.).

---

## Step 1: Get the OpenAPI schema

The schema is in **`server/openapi.yaml`** in your repo. You can:

**Option A – Use the raw file URL (if the repo is public)**  
- GitHub raw URL:  
  `https://raw.githubusercontent.com/Appmakers123/CosmicJyoti/main/server/openapi.yaml`  
- In the schema, the `servers` URL is already set to your Cloud Run URL. If ChatGPT doesn’t use it, set the server in the GPT editor (Step 3).

**Option B – Host the YAML on your site**  
- Copy `server/openapi.yaml` to your web server (e.g. `https://www.cosmicjyoti.com/openapi.yaml`).  
- Use that URL when importing into ChatGPT.

**Option C – Paste the schema**  
- Open `server/openapi.yaml`, copy the full contents, and paste into ChatGPT when creating the Action (Step 3).

---

## Step 2: Create a Custom GPT

1. Go to [ChatGPT](https://chat.openai.com) and sign in.
2. Click your profile → **My GPTs** → **Create a GPT** (or use [GPT Editor](https://chat.openai.com/gpts/editor)).
3. In **Configure**:
   - **Name:** e.g. “CosmicJyoti Vedic Astrology”
   - **Description:** e.g. “Get free Kundali, daily horoscope, Panchang, muhurat, and ask the Vedic astrologer Rishi. Powered by CosmicJyoti.”
   - **Instructions:** e.g.  
     “You have access to the CosmicJyoti API. Use it to get today’s Panchang, daily horoscope by sign, birth chart (Kundali), matchmaking, muhurat, tarot, or to ask Rishi (AI astrologer). When the user asks for horoscope or Panchang or Kundali, call the right API and summarize the result. Prefer calling the API over making things up.”

---

## Step 3: Add the API as an Action

1. In the GPT editor, open **Configure** → **Actions** → **Create new action**.
2. **Import schema:**
   - **Import from URL:** paste the OpenAPI URL (Option A or B above), or  
   - **Paste schema:** paste the contents of `server/openapi.yaml` (Option C).
3. **Authentication:**  
   - Your API is currently **no auth**. Leave “No authentication” if you’re fine with that.  
   - For production you can add an API key later and set it here (e.g. in header).
4. **Server / base URL:**  
   - If the schema’s `servers` block has your Cloud Run URL, it should be used automatically.  
   - If there’s a field for “Server URL” or “Override URL”, set it to:  
     `https://cosmicjyoti-api-265360069232.europe-west1.run.app`  
     (no trailing slash).
5. Save the Action.

---

## Step 4: Test

1. Save the GPT and open a new chat with it.
2. Try:
   - “What’s today’s Panchang for New Delhi?”
   - “Give me today’s horoscope for Aries.”
   - “I want to ask Rishi: what does my Moon in Cancer mean?”
3. ChatGPT should call your API and show the results. If it doesn’t, check the Action’s server URL and schema import.

---

## Endpoints available to ChatGPT

| Action        | When to use it                          |
|---------------|------------------------------------------|
| getPanchang   | Today’s Panchang, tithi, muhurat for a place |
| getHoroscope  | Daily horoscope for a zodiac sign       |
| getKundali    | Birth chart (Kundali) with predictions  |
| askRishi      | General/career/love/health questions    |
| getMuhurat    | Auspicious timings for a date/location  |
| getTarot      | Tarot reading for a question            |
| getMatchmaking| Compatibility between two birth charts  |
| getCosmicHealth | Health analysis from birth details   |
| getTransitsGeneric | Transits by Moon sign (no full chart) |

---

## Troubleshooting

- **“Server error” or timeout:** Ensure Cloud Run service is running and env vars (`GEMINI_API_KEY`, etc.) are set.
- **ChatGPT doesn’t call the API:** Refine the GPT **Instructions** to say explicitly when to call which action (e.g. “When the user asks for horoscope, use getHoroscope with sign and today’s date”).
- **CORS:** ChatGPT calls your API server-to-server; CORS on your backend does not apply to those calls. Your existing CORS is for the browser (cosmicjyoti.com).
