/**
 * Sarvam AI Translate API (Mayura) for website and AI response text.
 * @see https://docs.sarvam.ai/api-reference-docs/text/translate
 */

const SARVAM_TRANSLATE_URL = 'https://api.sarvam.ai/translate';

export type SarvamTranslateMode = 'formal' | 'modern_colloquial' | 'classical_colloquial' | 'code_mixed';
export type SarvamSpeakerGender = 'Male' | 'Female';
export type SarvamNumeralsFormat = 'native' | 'international';

export interface SarvamTranslateOptions {
  source_language_code: string;
  target_language_code: string;
  speaker_gender?: SarvamSpeakerGender;
  mode?: SarvamTranslateMode;
  model?: string;
  enable_preprocessing?: boolean;
  numerals_format?: SarvamNumeralsFormat;
}

function getApiKey(): string | undefined {
  if (typeof import.meta === 'undefined' || !import.meta.env) return undefined;
  return (import.meta.env.VITE_SARVAM_API_KEY as string)?.trim() || undefined;
}

export function hasSarvamTranslate(): boolean {
  return !!getApiKey();
}

/** Map app language codes to Sarvam BCP-47 target_language_code */
export const APP_LANG_TO_SARVAM: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  od: 'od-IN',
};

export interface SarvamTranslateResponse {
  translated_text: string;
  source_language_code?: string;
  request_id?: string;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Translate text using Sarvam Mayura API.
 * Retries once with backoff on 429 (rate limit).
 */
export async function sarvamTranslate(
  input: string,
  options: Partial<SarvamTranslateOptions> & { target_language_code: string },
  retryCount = 0
): Promise<string | null> {
  const key = getApiKey();
  if (!key || !input?.trim()) return null;

  const body = {
    input: input.trim(),
    source_language_code: options.source_language_code ?? 'en-IN',
    target_language_code: options.target_language_code,
    speaker_gender: options.speaker_gender ?? 'Male',
    mode: options.mode ?? 'formal',
    model: options.model ?? 'mayura:v1',
    enable_preprocessing: options.enable_preprocessing ?? false,
    numerals_format: options.numerals_format ?? 'native',
  };

  const maxRetries = 2;
  const backoffMs = 2000;

  try {
    const res = await fetch(SARVAM_TRANSLATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': key,
      },
      body: JSON.stringify(body),
    });

    if (res.status === 429 && retryCount < maxRetries) {
      if (retryCount === 0) {
        console.warn('Sarvam Translate: rate limit hit, retrying after', backoffMs, 'ms');
      }
      await delay(backoffMs * (retryCount + 1));
      return sarvamTranslate(input, options, retryCount + 1);
    }

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Sarvam Translate error', res.status, errBody);
      return null;
    }

    const data = (await res.json()) as SarvamTranslateResponse;
    return data?.translated_text?.trim() ?? null;
  } catch (e) {
    console.error('Sarvam Translate request failed:', e);
    return null;
  }
}
