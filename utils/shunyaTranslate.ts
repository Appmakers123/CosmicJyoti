/**
 * Shunya Labs Post-Processing Translation API.
 * Supports 200+ languages. Use when Sarvam does not support the target language.
 * @see https://docs.shunyalabs.ai/features/translation
 */

const SHUNYA_TRANSLATE_URL = 'https://tb.shunyalabs.ai/v1/translate';

function getApiKey(): string | undefined {
  if (typeof import.meta === 'undefined' || !import.meta.env) return undefined;
  return (import.meta.env.VITE_SHUNYA_API_KEY as string)?.trim() || undefined;
}

export function hasShunyaTranslate(): boolean {
  return !!getApiKey();
}

export interface ShunyaTranslateResponse {
  original_text?: string;
  translated_text: string;
  source_language?: string;
  target_language?: string;
}

/**
 * Translate text using Shunya Labs (200+ languages).
 * source_lang/target_lang: use codes from https://docs.shunyalabs.ai/languages
 */
export async function shunyaTranslate(
  text: string,
  source_lang: string,
  target_lang: string
): Promise<string | null> {
  const key = getApiKey();
  if (!key || !text?.trim()) return null;

  try {
    const res = await fetch(SHUNYA_TRANSLATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': key,
      },
      body: JSON.stringify({
        text: text.trim(),
        source_lang: source_lang || 'en',
        target_lang,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Shunya Translate error', res.status, errBody);
      return null;
    }

    const data = (await res.json()) as ShunyaTranslateResponse;
    return data?.translated_text?.trim() ?? null;
  } catch (e) {
    console.error('Shunya Translate request failed:', e);
    return null;
  }
}
