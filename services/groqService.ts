/**
 * Groq API service for horoscope and transit generation.
 * Uses Groq's OpenAI-compatible chat API (e.g. Llama). Use when Perplexity is not available.
 * Set GROQ_API_KEY or GROQ_API_KEYS in .env.
 */

import type { HoroscopeResponse, TransitResponse, PlanetaryPosition } from '../types';
import type { Language } from '../types';
import { getNextGroqKey, getAllGroqKeys } from '../utils/groqApiKeys';
import { getLanguageDisplayName } from '../utils/languageNames';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

async function groqFetch(body: object): Promise<string> {
  const keys = getAllGroqKeys();
  if (keys.length === 0) throw new Error('GROQ_API_KEY_NOT_CONFIGURED');

  let lastError: Error | null = null;
  for (const key of keys) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 429 || response.status === 401) {
          lastError = new Error(`Groq API ${response.status}: ${errText}`);
          continue;
        }
        throw new Error(`Groq API error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const content =
        data?.choices?.[0]?.message?.content?.trim() ||
        data?.choices?.[0]?.message?.content ||
        '';
      if (!content) throw new Error('Empty response from Groq API');
      return content;
    } catch (err) {
      lastError = err as Error;
      continue;
    }
  }
  throw lastError || new Error('All Groq API keys failed');
}

function parseHoroscopeFromContent(content: string, signName: string): HoroscopeResponse {
  const result: HoroscopeResponse = {
    horoscope: content,
    luckyNumber: Math.floor(Math.random() * 9) + 1,
    luckyColor: 'Gold',
    mood: 'Balanced',
    compatibility: 'All signs',
  };
  const numMatch = content.match(
    /lucky\s*number[:\s]*(\d)|number[:\s]*(\d)|(\d)\s*[–\-]\s*lucky|Lucky\s*Number[:\s]*(\d)/i
  );
  if (numMatch) {
    const n = parseInt(numMatch[1] || numMatch[2] || numMatch[3] || numMatch[4] || '5', 10);
    if (n >= 1 && n <= 9) result.luckyNumber = n;
  }
  const colorMatch = content.match(
    /lucky\s*color[:\s]*([a-zA-Z\s]+?)(?:\s*[,.\n]|$)|Lucky\s*Color[:\s]*([a-zA-Z\s]+?)(?:\s*[,.\n]|$)/i
  );
  if (colorMatch) {
    const c = (colorMatch[1] || colorMatch[2] || '').trim().slice(0, 20);
    if (c) result.luckyColor = c;
  }
  const moodMatch = content.match(
    /mood[:\s]*([a-zA-Z\s]+?)(?:\s*[,.\n]|$)|Mood[:\s]*([a-zA-Z\s]+?)(?:\s*[,.\n]|$)/i
  );
  if (moodMatch) {
    const m = (moodMatch[1] || moodMatch[2] || '').trim().slice(0, 30);
    if (m) result.mood = m;
  }
  const compatMatch = content.match(
    /compatibility[:\s]*([a-zA-Z\s]+?)(?:\s*[,.\n]|$)|compatible\s*with[:\s]*([a-zA-Z\s]+?)(?:\s*[,.\n]|$)|Compatibility[:\s]*([a-zA-Z\s]+?)(?:\s*[,.\n]|$)/i
  );
  if (compatMatch) {
    const c = compatMatch[1] || compatMatch[2] || compatMatch[3] || '';
    if (c.trim()) result.compatibility = c.trim().slice(0, 50);
  }
  return result;
}

const SIGN_NAMES = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const SIGN_MAP: Record<string, number> = Object.fromEntries(SIGN_NAMES.map((s, i) => [s, i + 1]));

/**
 * Generate daily horoscope using Groq API (Vedic astrology, current date).
 */
export async function generateHoroscopeFromGroq(
  signName: string,
  language: Language = 'en'
): Promise<HoroscopeResponse> {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const langName = getLanguageDisplayName(language) || 'English';

  const systemPrompt = `You are an expert Vedic astrologer. Based on today's date (${today}) and Vedic astrology principles, provide a daily horoscope for the ${signName} zodiac sign.
Use current planetary transits and standard Vedic interpretations. Be concise and accurate.
Respond ONLY in ${langName}. Keep the main horoscope text to 150-250 words.
Format: Use **bold** for key points, bullet points for Career, Love, Health, Finance. End with: Lucky Number: X, Lucky Color: Y, Mood: Z, Compatibility: W`;

  const userPrompt = `What is today's (${today}) daily horoscope for ${signName}? Structure: 1) Brief intro, 2) Bullet points for Career, Love, Health, Finance, 3) Lucky Number (1-9), Lucky Color, Mood, Compatibility.`;

  const content = await groqFetch({
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 1024,
    temperature: 0.3,
  });

  const contentClean = content.replace(/\[\d+\]/g, '').replace(/\s{2,}/g, ' ').trim();
  return parseHoroscopeFromContent(contentClean, signName);
}

export interface PersonalizedChartContext {
  lagna: string;
  moonSign: string;
  sunSign: string;
  nakshatra: string;
  name?: string;
}

/**
 * Generate personalized daily forecast using Groq. Falls back to Perplexity then Gemini if Groq fails.
 */
export async function generatePersonalizedDailyForecastFromGroq(
  context: PersonalizedChartContext,
  language: Language = 'en'
): Promise<HoroscopeResponse> {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const langName = getLanguageDisplayName(language) || 'English';
  const namePart = context.name ? ` for ${context.name}` : '';

  const systemPrompt = `You are an expert Vedic astrologer. Based on today (${today}), provide a personalized daily horoscope using:
- Lagna (Ascendant): ${context.lagna}
- Chandra Rashi (Moon Sign): ${context.moonSign}
- Surya Rashi (Sun Sign): ${context.sunSign}
- Janma Nakshatra: ${context.nakshatra}
Consider ALL these chart elements and current planetary transits. Respond ONLY in ${langName}. 150-300 words. Format: **bold** key points, bullets for Career, Love, Health, Finance. End with: Lucky Number, Lucky Color, Mood, Compatibility.`;

  const userPrompt = `Generate today's (${today}) personalized daily horoscope${namePart} for Lagna: ${context.lagna}, Moon: ${context.moonSign}, Sun: ${context.sunSign}, Nakshatra: ${context.nakshatra}. Structure: intro, Career/Love/Health/Finance, then Lucky Number, Color, Mood, Compatibility.`;

  const content = await groqFetch({
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 1024,
    temperature: 0.3,
  });

  const contentClean = content.replace(/\[\d+\]/g, '').replace(/\s{2,}/g, ' ').trim();
  return parseHoroscopeFromContent(contentClean, context.moonSign);
}

/**
 * Generate generic planetary transits (Gochara) using Groq.
 */
export async function generateGenericTransitsFromGroq(
  location: string,
  rashi: string,
  language: Language
): Promise<TransitResponse> {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const refSignId = SIGN_MAP[rashi] || 1;

  const systemPrompt = `You are a Vedic astrology expert. For TODAY (${today}) at location ${location}, provide CURRENT sidereal positions of all 9 planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu). Reference Moon Sign: ${rashi} (signId ${refSignId}).
Respond ONLY with a single valid JSON object: {"currentPositions":[{"planet":"Sun","sign":"Aries","signId":1,"house":1,"isRetrograde":false,"nakshatra":"Ashwini","degree":"12.50"}, ...]}
Rules: planet (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu), sign (Aries..Pisces), signId 1-12, house 1-12 (${rashi}=1), isRetrograde (Moon always false), nakshatra, degree. Include all 9 planets.`;

  const userPrompt = `Today's (${today}) planetary transit positions for ${location}, reference sign ${rashi}. Output only the JSON object.`;

  const content = await groqFetch({
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 2048,
    temperature: 0.2,
  });

  const trimmed = content.trim();
  let jsonStr = trimmed;
  const jsonBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlock) jsonStr = jsonBlock[1].trim();
  else {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start !== -1 && end > start) jsonStr = trimmed.slice(start, end + 1);
  }
  let parsed: any;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (_) {
    throw new Error('TRANSIENT');
  }

  if (!parsed || !Array.isArray(parsed.currentPositions) || parsed.currentPositions.length === 0) {
    throw new Error('TRANSIENT');
  }

  const positions: PlanetaryPosition[] = parsed.currentPositions.map((p: any) => {
    const sign = p.sign && SIGN_MAP[p.sign] ? p.sign : (SIGN_NAMES[(p.signId - 1)] || 'Aries');
    const signId = p.signId >= 1 && p.signId <= 12 ? p.signId : (SIGN_MAP[p.sign] || 1);
    const house = ((signId - refSignId + 12) % 12) + 1;
    const planet = p.planet || '';
    const isRetro = planet.toLowerCase().includes('moon') ? false : !!p.isRetrograde;
    return {
      planet,
      sign,
      signId,
      house,
      isRetrograde: isRetro,
      nakshatra: p.nakshatra || '',
      degree: p.degree != null ? String(p.degree) : '0.00',
    };
  }).filter((p: any) => p && p.planet);

  return {
    currentPositions: positions,
    personalImpact: Array.isArray(parsed.personalImpact) ? parsed.personalImpact : [],
  };
}

export function hasGroqKey(): boolean {
  return getAllGroqKeys().length > 0;
}
