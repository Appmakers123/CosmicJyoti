import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Language } from '../types';
import { englishTranslations, type TranslationCache } from '../utils/translationsData';

type TranslationContextValue = {
  localeCache: TranslationCache;
  language: Language;
  isLocaleLoading: boolean;
};

export const TranslationContext = createContext<TranslationContextValue | null>(null);

const LOCALES_BASE = '/locales';

async function loadPreTranslated(lang: string): Promise<Partial<Record<keyof typeof englishTranslations, string>> | null> {
  try {
    const res = await fetch(`${LOCALES_BASE}/${lang}.json`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && typeof data === 'object') return data as Partial<Record<keyof typeof englishTranslations, string>>;
    return null;
  } catch {
    return null;
  }
}

export function TranslationProvider({
  language,
  children,
}: {
  language: Language;
  children: React.ReactNode;
}) {
  const [localeCache, setLocaleCache] = useState<TranslationCache>({});
  const [isLocaleLoading, setIsLocaleLoading] = useState(false);

  useEffect(() => {
    if (language === 'en' || language === 'hi') return;
    let cancelled = false;
    const run = async () => {
      setIsLocaleLoading(true);
      const pre = await loadPreTranslated(language);
      if (!cancelled && pre && Object.keys(pre).length > 0) {
        setLocaleCache((prev) => ({
          ...prev,
          [language]: { ...(prev[language] || {}), ...pre },
        }));
      }
      if (!cancelled) setIsLocaleLoading(false);
    };
    run();
    return () => { cancelled = true; };
  }, [language]);

  const value: TranslationContextValue = {
    localeCache,
    language,
    isLocaleLoading,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslationContext() {
  return useContext(TranslationContext);
}
