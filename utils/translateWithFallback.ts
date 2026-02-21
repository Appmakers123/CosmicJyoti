/**
 * Translate text with fallback chain: Sarvam → Shunya → Gemini.
 * Use when Sarvam is rate-limited or unavailable.
 */

import { sarvamTranslate, APP_LANG_TO_SARVAM, hasSarvamTranslate } from './sarvamTranslate';
import { shunyaTranslate, hasShunyaTranslate } from './shunyaTranslate';
import { translateText as geminiTranslate } from '../services/geminiService';
import { getLanguageDisplayName } from './languageNames';

const SOURCE_CODE = 'en-IN';

/**
 * Translate a single string. Tries Sarvam first, then Shunya, then Gemini.
 * Returns original text if all fail (Gemini returns original on error).
 */
export async function translateWithFallback(
  text: string,
  targetLangCode: string
): Promise<string> {
  if (!text?.trim() || targetLangCode === 'en') return text;

  const sarvamCode = APP_LANG_TO_SARVAM[targetLangCode];
  const langName = getLanguageDisplayName(targetLangCode);

  // 1. Try Sarvam (for supported Indian languages)
  if (sarvamCode && hasSarvamTranslate()) {
    const out = await sarvamTranslate(text, {
      source_language_code: SOURCE_CODE,
      target_language_code: sarvamCode,
      mode: 'formal',
    });
    if (out != null && out.trim()) return out.trim();
  }

  // 2. Try Shunya (200+ languages)
  if (hasShunyaTranslate()) {
    const out = await shunyaTranslate(text, 'en', targetLangCode);
    if (out != null && out.trim()) return out.trim();
  }

  // 3. Fallback to Gemini
  try {
    const out = await geminiTranslate(text, langName);
    if (out != null && out.trim()) return out.trim();
  } catch (_) {
    // geminiTranslate returns original on catch; fall through
  }

  return text;
}
