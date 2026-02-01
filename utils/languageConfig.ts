import { Language } from '../types';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
];

export const getLanguageInfo = (code: Language): LanguageInfo => {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code) || SUPPORTED_LANGUAGES[0];
};

export const getLanguageByCode = (code: string): Language => {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
  return lang ? lang.code : 'en';
};

