/**
 * Daily Insights Service - Do's & Don'ts, Luck Score (Co-Star / KundaliCard style)
 */

import { Language } from '../types';

const GEMINI_API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;

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

export async function getDailyDoDonts(
  language: Language,
  context?: { sign?: string; moonSign?: string; nakshatra?: string }
): Promise<DailyDoDont> {
  if (!GEMINI_API_KEY) return getDefaultDoDonts(language, context?.sign);

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const ctx = context ? `Sign: ${context.sign || 'Unknown'}, Moon: ${context.moonSign || '-'}, Nakshatra: ${context.nakshatra || '-'}` : 'General';
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Generate today's astrological Do's and Don'ts. Context: ${ctx}. Return JSON: {"dos":["item1","item2",...],"donts":["item1","item2",...]}. Max 5 each. Be concise, practical. Language: ${language === 'hi' ? 'Hindi' : 'English'}.`,
      config: { responseMimeType: 'application/json' },
    });
    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      if (parsed.dos?.length && parsed.donts?.length) return parsed;
    }
  } catch (e) {
    console.warn('[DailyInsights] DoDonts API failed:', e);
  }
  return getDefaultDoDonts(language, context?.sign);
}

export async function getDailyLuckScore(
  language: Language,
  context?: { sign?: string; moonSign?: string }
): Promise<DailyLuckScore> {
  if (!GEMINI_API_KEY) return getDefaultLuckScore(language);

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const ctx = context ? `Sign: ${context.sign}, Moon: ${context.moonSign}` : 'General';
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Today's date: ${new Date().toISOString().slice(0, 10)}. Astrology context: ${ctx}. Return JSON: {"luckPercent":number 1-99,"energyLevel":"low"|"medium"|"high","emotionalStability":"low"|"medium"|"high","decisionReadiness":"low"|"medium"|"high","summary":"one short sentence"}. Language for summary: ${language === 'hi' ? 'Hindi' : 'English'}.`,
      config: { responseMimeType: 'application/json' },
    });
    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      if (typeof parsed.luckPercent === 'number') return parsed;
    }
  } catch (e) {
    console.warn('[DailyInsights] LuckScore API failed:', e);
  }
  return getDefaultLuckScore(language);
}
