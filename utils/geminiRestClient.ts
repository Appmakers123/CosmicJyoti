/**
 * REST fallback for Gemini when SDK fails (network, 503, 429 quota).
 * When backendBaseUrl is set, calls our backend /api/gemini-generate (avoids CORS).
 * Otherwise calls Google directly (key in URL: ?key=... – required by the API).
 */

const REST_BASE = 'https://generativelanguage.googleapis.com/v1beta';

export interface RestGenerateOptions {
  systemInstruction?: string;
  maxOutputTokens?: number;
  temperature?: number;
}

/**
 * Call Gemini generateContent via REST (no SDK).
 * Pass backendBaseUrl when you have a backend so the request goes through it (no CORS, key stays on server).
 */
export async function generateContentViaRest(
  apiKey: string,
  modelId: string,
  prompt: string,
  opts: RestGenerateOptions = {},
  backendBaseUrl?: string | null
): Promise<{ text: string; modelId: string }> {
  const model = modelId.replace(/^models\//, '');

  if (backendBaseUrl && backendBaseUrl.trim()) {
    const url = `${backendBaseUrl.replace(/\/$/, '')}/api/gemini-generate`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt.trim(),
        modelId: model,
        systemInstruction: opts.systemInstruction?.trim() || undefined,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini REST ${res.status}: ${errText.slice(0, 200)}`);
    }
    const data = await res.json();
    const text = data?.text ?? '';
    return { text: String(text).trim(), modelId: model };
  }

  const url = `${REST_BASE}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const body: Record<string, unknown> = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: opts.temperature ?? 0.7,
      maxOutputTokens: opts.maxOutputTokens ?? 8192,
      topP: 0.95,
      topK: 40,
    },
  };
  if (opts.systemInstruction?.trim()) {
    body.systemInstruction = { parts: [{ text: opts.systemInstruction }] };
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    const err = new Error(`Gemini REST ${res.status}: ${errText.slice(0, 200)}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  const data = await res.json();
  const part = data?.candidates?.[0]?.content?.parts?.[0];
  const text = part?.text ?? '';
  if (typeof text !== 'string') {
    throw new Error('Gemini REST: unexpected response shape');
  }
  return { text: String(text).trim(), modelId: model };
}
