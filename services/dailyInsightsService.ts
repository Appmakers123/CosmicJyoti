/**
 * Daily Insights Service - Do's & Don'ts, Luck Score (Co-Star / KundaliCard style)
 */

import { Language } from '../types';
import { getNextGeminiKey } from '../utils/geminiApiKeys';

export interface DailyDoDont {
  dos: string[];
  donts: string[];
}

export interface DailyLuckScore {
  luckPercent: number;
  energyLevel: 'low' | 'medium' | 'high';
  emotionalStability: 'low' | 'medium' | 'high';
  decisionReadiness: 'low' | 'medium' | 'high';
  summary: string;
}

// Fallback when API unavailable
const getDefaultDoDonts = (language: Language, sign?: string): DailyDoDont => {
  const isHi = language === 'hi';
  return {
    dos: isHi
      ? ['सकारात्मक विचार रखें', 'ध्यान करें', 'परिवार से बात करें', 'पानी खूब पिएं', 'अच्छा काम करें']
      : ['Stay positive', 'Meditate briefly', 'Connect with family', 'Stay hydrated', 'Do one good deed'],
    donts: isHi
      ? ['जल्दबाजी न करें', 'नकारात्मक लोगों से बचें', 'बड़े निर्णय टालें', 'अधिक खाने से बचें']
      : ["Don't rush decisions", 'Avoid negative people', 'Postpone big decisions', "Don't overeat"],
  };
};

const getDefaultLuckScore = (language: Language): DailyLuckScore => {
  const day = new Date().getDay();
  const baseLuck = 55 + (day % 30);
  return {
    luckPercent: Math.min(95, baseLuck),
    energyLevel: day % 3 === 0 ? 'high' : day % 3 === 1 ? 'medium' : 'low',
    emotionalStability: 'medium',
    decisionReadiness: day % 2 === 0 ? 'high' : 'medium',
    summary: language === 'hi'
      ? 'आज का दिन मध्यम रूप से अनुकूल है। धैर्य रखें।'
      : 'Today is moderately favorable. Stay patient.',
  };
};

const DODONTS_CACHE_KEY_PREFIX = 'cosmicjyoti_dodonts_';

function getDoDontsCacheKey(date: string, language: Language, context?: { sign?: string; moonSign?: string; nakshatra?: string }): string {
  const hasContext = context && (context.sign || context.moonSign || context.nakshatra);
  const ctx = hasContext ? [context.sign ?? '', context.moonSign ?? '', context.nakshatra ?? ''].join('|') : 'general';
  return `${DODONTS_CACHE_KEY_PREFIX}${date}_${language}_${ctx}`;
}

export async function getDailyDoDonts(
  language: Language,
  context?: { sign?: string; moonSign?: string; nakshatra?: string }
): Promise<DailyDoDont> {
  const today = new Date().toISOString().slice(0, 10);
  const cacheKey = getDoDontsCacheKey(today, language, context);
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as DailyDoDont;
      if (parsed?.dos?.length && parsed?.donts?.length) return parsed;
    }
  } catch (_) {}

  const geminiKey = getNextGeminiKey();
  if (!geminiKey) return getDefaultDoDonts(language, context?.sign);

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const ctx = context ? `Rashi/Moon Sign: ${context.moonSign || context.sign || 'Unknown'}, Sun Sign: ${context.sign || context.moonSign || '-'}, Nakshatra: ${context.nakshatra || '-'}` : 'General (no birth details)';
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Today's date is ${today}. Generate astrological Do's and Don'ts for this day only. User context: ${ctx}. Return JSON: {"dos":["item1","item2",...],"donts":["item1","item2",...]}. Max 5 each. Be concise, practical. Language: ${language === 'hi' ? 'Hindi' : 'English'}.`,
      config: { responseMimeType: 'application/json' },
    });
    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      if (parsed.dos?.length && parsed.donts?.length) {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(parsed));
        } catch (_) {}
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[DailyInsights] DoDonts API failed:', e);
  }
  const fallback = getDefaultDoDonts(language, context?.sign);
  try {
    localStorage.setItem(cacheKey, JSON.stringify(fallback));
  } catch (_) {}
  return fallback;
}

const LUCKSCORE_CACHE_KEY_PREFIX = 'cosmicjyoti_luckscore_';

function getLuckScoreCacheKey(date: string, language: Language, context?: { sign?: string; moonSign?: string; nakshatra?: string }): string {
  const hasContext = context && (context.sign || context.moonSign || context.nakshatra);
  const ctx = hasContext ? [context.sign ?? '', context.moonSign ?? '', context.nakshatra ?? ''].join('|') : 'general';
  return `${LUCKSCORE_CACHE_KEY_PREFIX}${date}_${language}_${ctx}`;
}

export async function getDailyLuckScore(
  language: Language,
  context?: { sign?: string; moonSign?: string; nakshatra?: string }
): Promise<DailyLuckScore> {
  const today = new Date().toISOString().slice(0, 10);
  const cacheKey = getLuckScoreCacheKey(today, language, context);
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as DailyLuckScore;
      if (typeof parsed?.luckPercent === 'number') return parsed;
    }
  } catch (_) {}

  const luckKey = getNextGeminiKey();
  if (!luckKey) {
    const fallback = getDefaultLuckScore(language);
    try {
      localStorage.setItem(cacheKey, JSON.stringify(fallback));
    } catch (_) {}
    return fallback;
  }

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: luckKey });
    const ctx = context
      ? `Rashi/Moon Sign: ${context.moonSign || context.sign || 'Unknown'}, Sun Sign: ${context.sign || context.moonSign || '-'}, Nakshatra: ${context.nakshatra || '-'}`
      : 'General (no birth details)';
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Today's date is ${today}. Astrology context: ${ctx}. Return JSON: {"luckPercent":number 1-99,"energyLevel":"low"|"medium"|"high","emotionalStability":"low"|"medium"|"high","decisionReadiness":"low"|"medium"|"high","summary":"one short sentence"}. Language for summary: ${language === 'hi' ? 'Hindi' : 'English'}.`,
      config: { responseMimeType: 'application/json' },
    });
    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      if (typeof parsed.luckPercent === 'number') {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(parsed));
        } catch (_) {}
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[DailyInsights] LuckScore API failed:', e);
  }
  const fallback = getDefaultLuckScore(language);
  try {
    localStorage.setItem(cacheKey, JSON.stringify(fallback));
  } catch (_) {}
  return fallback;
}
