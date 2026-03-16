# Gemini REST API – curl and key

When calling the Gemini REST API directly (e.g. for debugging), the **API key must be in the URL** as a query parameter. Using only the header `x-goog-api-key` is not enough for the public REST endpoint.

**Correct:**

```bash
curl 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  --data-raw '{"contents":[{"role":"user","parts":[{"text":"Hello"}]}],"generationConfig":{"maxOutputTokens":1024}}'
```

**Wrong:**  
A URL without `?key=YOUR_API_KEY` will return 400/401 even if you send `x-goog-api-key`.

---

**From the browser (e.g. cosmicjyoti.com):**  
Direct `fetch()` to `generativelanguage.googleapis.com` can be blocked by **CORS**. The app avoids that by using a **backend proxy**: when a backend is configured (`VITE_API_BASE_URL`), the frontend REST fallback calls your server at `POST /api/gemini-generate` instead of Google. The server then calls Gemini with the server’s API key. So the key stays on the server and CORS is not an issue.

**systemInstruction:**  
Send it as `{"parts":[{"text":"..."}]}`. Do **not** add `"role":"user"` inside `systemInstruction` (the API expects only `parts` there).
