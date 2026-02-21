/**
 * Resolve language code to display name (e.g. for AI prompts and UI).
 * Used so Rishi responds in the user's selected language (Tamil, Hindi, etc.).
 */

import { SHUNYA_LANGUAGES } from './shunyaLanguages';

export function getLanguageDisplayName(code: string): string {
  if (!code?.trim()) return 'English';
  const entry = SHUNYA_LANGUAGES.find(
    (l) => l.code === code || l.code.startsWith(code + '-')
  );
  return entry?.label ?? code;
}
