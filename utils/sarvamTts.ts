/**
 * Sarvam AI Text-to-Speech for Mantra Lab.
 * Uses Bulbul v3 with spiritual/meditative voice; API key from env.
 * Supports 11 Indian languages – use dropdown and translate when requested.
 */

const SARVAM_TTS_URL = 'https://api.sarvam.ai/text-to-speech';

/** All languages supported by Sarvam Bulbul v3 (BCP-47 codes + labels) */
export const SARVAM_LANGUAGES = [
  { code: 'hi-IN', nameEn: 'Hindi', nameHi: 'हिंदी' },
  { code: 'en-IN', nameEn: 'English (India)', nameHi: 'अंग्रेज़ी' },
  { code: 'bn-IN', nameEn: 'Bengali', nameHi: 'बंगाली' },
  { code: 'ta-IN', nameEn: 'Tamil', nameHi: 'तमिल' },
  { code: 'te-IN', nameEn: 'Telugu', nameHi: 'तेलुगु' },
  { code: 'kn-IN', nameEn: 'Kannada', nameHi: 'कन्नड़' },
  { code: 'ml-IN', nameEn: 'Malayalam', nameHi: 'मलयालम' },
  { code: 'mr-IN', nameEn: 'Marathi', nameHi: 'मराठी' },
  { code: 'gu-IN', nameEn: 'Gujarati', nameHi: 'गुजराती' },
  { code: 'pa-IN', nameEn: 'Punjabi', nameHi: 'पंजाबी' },
  { code: 'od-IN', nameEn: 'Odia', nameHi: 'ओड़िया' },
] as const;

export type SarvamLanguageCode = (typeof SARVAM_LANGUAGES)[number]['code'];

export const SARVAM_MANTRA_VOICES = ['anand', 'shubh', 'priya', 'ritu'] as const;
export type SarvamMantraVoice = (typeof SARVAM_MANTRA_VOICES)[number];

const DEFAULT_VOICE: SarvamMantraVoice = 'anand';
const DEFAULT_PACE = 0.75;
const DEFAULT_LANGUAGE: SarvamLanguageCode = 'hi-IN';

function getApiKey(): string | undefined {
  if (typeof import.meta === 'undefined' || !import.meta.env) return undefined;
  return (import.meta.env.VITE_SARVAM_API_KEY as string)?.trim() || undefined;
}

export function hasSarvamTts(): boolean {
  return !!getApiKey();
}

export interface SarvamTtsOptions {
  speaker?: SarvamMantraVoice;
  pace?: number;
  target_language_code?: SarvamLanguageCode;
}

export async function generateMantraTts(
  text: string,
  options: SarvamTtsOptions = {}
): Promise<string | null> {
  const key = getApiKey();
  if (!key) return null;

  const speaker = options.speaker ?? DEFAULT_VOICE;
  const pace = options.pace ?? DEFAULT_PACE;
  const target_language_code = options.target_language_code ?? DEFAULT_LANGUAGE;

  if (!text?.trim()) return null;

  try {
    const res = await fetch(SARVAM_TTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': key,
      },
      body: JSON.stringify({
        text: text.trim(),
        model: 'bulbul:v3',
        speaker,
        pace,
        target_language_code,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Sarvam TTS error', res.status, errBody);
      return null;
    }

    const data = (await res.json()) as { audios?: string[] };
    const base64 = data?.audios?.[0];
    if (!base64) return null;
    return base64;
  } catch (e) {
    console.error('Sarvam TTS request failed:', e);
    return null;
  }
}
