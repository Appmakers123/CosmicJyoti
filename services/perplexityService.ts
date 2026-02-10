/**
 * Perplexity API service for web-grounded horoscope generation.
 * Uses Perplexity's chat completions to search and summarize daily horoscopes for the current date.
 * Supports multiple API keys via PERPLEXITY_API_KEYS (comma-separated) for load balancing.
 */

import type { HoroscopeResponse, TransitResponse, PlanetaryPosition } from '../types';
import type { Language } from '../types';
import { getNextPerplexityKey, getAllPerplexityKeys } from '../utils/perplexityApiKeys';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  hi: 'Hindi',
};

function getApiKey(): string {
  const key = getNextPerplexityKey();
  if (!key) throw new Error('PERPLEXITY_API_KEY_NOT_CONFIGURED');
  return key;
}

async function perplexityFetch(body: object): Promise<string> {
  const keys = getAllPerplexityKeys();
  if (keys.length === 0) throw new Error('PERPLEXITY_API_KEY_NOT_CONFIGURED');

  let lastError: Error | null = null;
  for (const key of keys) {
    try {
      const response = await fetch(PERPLEXITY_API_URL, {
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
          lastError = new Error(`Perplexity API ${response.status}: ${errText}`);
          continue;
        }
        throw new Error(`Perplexity API error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const content =
        data?.choices?.[0]?.message?.content?.trim() ||
        data?.choices?.[0]?.message?.content ||
        '';
      if (!content) throw new Error('Empty response from Perplexity API');
      return content;
    } catch (err) {
      lastError = err as Error;
      continue;
    }
  }
  throw lastError || new Error('All Perplexity API keys failed');
}

/**
 * Generate daily horoscope using Perplexity API.
 * Perplexity searches the web for current-date horoscopes and returns grounded results.
 */
export async function generateHoroscopeFromPerplexity(
  signName: string,
  language: Language = 'en'
): Promise<HoroscopeResponse> {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const langName = LANGUAGE_NAMES[language] || 'English';

  const systemPrompt = `You are an expert Vedic astrologer. Search the web for today's (${today}) daily horoscope for the ${signName} zodiac sign. 
Provide a concise, accurate horoscope prediction based on current planetary transits and reputable astrology sources.
Respond ONLY in ${langName}. Keep the main horoscope text to 150-250 words.
IMPORTANT: Format your response with clear structure:
- Use **bold** for emphasis on key points
- Use bullet points (* or -) for lists (Career, Love, Health, Finance)
- Use line breaks between sections
- End with: Lucky Number: X, Lucky Color: Y, Mood: Z, Compatibility: W`;

  const userPrompt = `What is today's (${today}) daily horoscope for ${signName}? 
Structure your response:
1. Brief intro paragraph
2. Bullet points for: Career, Love, Health, Finance
3. End with: Lucky Number: (1-9), Lucky Color: (color name), Mood: (one word), Compatibility: (zodiac sign)`;

  const content = await perplexityFetch({
    model: 'sonar',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 1024,
    temperature: 0.3,
  });

  const contentWithoutCitations = content.replace(/\[\d+\]/g, '').replace(/\s{2,}/g, ' ').trim();
  return parseHoroscopeFromContent(contentWithoutCitations, signName);
}

export interface PersonalizedChartContext {
  lagna: string;
  moonSign: string;
  sunSign: string;
  nakshatra: string;
  name?: string;
}

/**
 * Generate personalized daily forecast based on full birth chart (Lagna, Moon Sign, Sun Sign, Nakshatra).
 * Uses Perplexity for web-grounded, current-date predictions. Falls back to Gemini if Perplexity fails.
 */
export async function generatePersonalizedDailyForecast(
  context: PersonalizedChartContext,
  language: Language = 'en'
): Promise<HoroscopeResponse> {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const langName = LANGUAGE_NAMES[language] || 'English';
  const namePart = context.name ? ` for ${context.name}` : '';

  const systemPrompt = `You are an expert Vedic astrologer. Search the web for today's (${today}) personalized daily horoscope based on the following birth chart details:
- Lagna (Ascendant): ${context.lagna}
- Chandra Rashi (Moon Sign): ${context.moonSign}
- Surya Rashi (Sun Sign): ${context.sunSign}
- Janma Nakshatra (Birth Star): ${context.nakshatra}

Provide a personalized, accurate daily prediction that considers ALL these chart elements - not just one sign. Use current planetary transits and Vedic astrology principles.
Respond ONLY in ${langName}. Keep the main horoscope text to 150-300 words.
IMPORTANT: Format with clear structure:
- Use **bold** for key points
- Use bullet points (* or -) for Career, Love, Health, Finance
- End with: Lucky Number: X, Lucky Color: Y, Mood: Z, Compatibility: W`;

  const userPrompt = `Generate today's (${today}) personalized daily horoscope${namePart} for someone with:
Lagna: ${context.lagna}, Moon Sign: ${context.moonSign}, Sun Sign: ${context.sunSign}, Nakshatra: ${context.nakshatra}.
Structure: 1) Brief intro, 2) Bullet points for Career, Love, Health, Finance, 3) Lucky Number, Lucky Color, Mood, Compatibility.`;

  try {
    const content = await perplexityFetch({
      model: 'sonar',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1024,
      temperature: 0.3,
    });

    const contentWithoutCitations = content.replace(/\[\d+\]/g, '').replace(/\s{2,}/g, ' ').trim();
    return parseHoroscopeFromContent(contentWithoutCitations, context.moonSign);
  } catch (err) {
    // Fallback to Gemini if Perplexity fails
    const { generateHoroscope } = await import('./geminiService');
    return generateHoroscope(context.moonSign, language);
  }
}

/**
 * Parse Perplexity's free-form response into HoroscopeResponse.
 */
function parseHoroscopeFromContent(
  content: string,
  signName: string
): HoroscopeResponse {
  const result: HoroscopeResponse = {
    horoscope: content,
    luckyNumber: Math.floor(Math.random() * 9) + 1,
    luckyColor: 'Gold',
    mood: 'Balanced',
    compatibility: 'All signs',
  };

  // Extract lucky number (1-9)
  const numMatch = content.match(
    /lucky\s*number[:\s]*(\d)|number[:\s]*(\d)|(\d)\s*[–\-]\s*lucky|Lucky\s*Number[:\s]*(\d)/i
  );
  if (numMatch) {
    const n = parseInt(
      numMatch[1] || numMatch[2] || numMatch[3] || numMatch[4] || '5',
      10
    );
    if (n >= 1 && n <= 9) result.luckyNumber = n;
  }

  // Extract lucky color (supports "Lucky Color: Blue" or "color: Blue")
  const colorMatch = content.match(
    /lucky\s*color[:\s]*([a-zA-Z\s]+?)(?:\s*[,.\n]|$)|Lucky\s*Color[:\s]*([a-zA-Z\s]+?)(?:\s*[,.\n]|$)/i
  );
  if (colorMatch) {
    const c = (colorMatch[1] || colorMatch[2] || '').trim().slice(0, 20);
    if (c) result.luckyColor = c;
  }

  // Extract mood
  const moodMatch = content.match(
    /mood[:\s]*([a-zA-Z\s]+?)(?:\s*[,.\n]|$)|Mood[:\s]*([a-zA-Z\s]+?)(?:\s*[,.\n]|$)/i
  );
  if (moodMatch) {
    const m = (moodMatch[1] || moodMatch[2] || '').trim().slice(0, 30);
    if (m) result.mood = m;
  }

  // Extract compatibility
  const compatMatch = content.match(
    /compatibility[:\s]*([a-zA-Z\s]+?)(?:\s*[,.\n]|$)|compatible\s*with[:\s]*([a-zA-Z\s]+?)(?:\s*[,.\n]|$)|Compatibility[:\s]*([a-zA-Z\s]+?)(?:\s*[,.\n]|$)/i
  );
  if (compatMatch) {
    const c =
      compatMatch[1] || compatMatch[2] || compatMatch[3] || '';
    if (c.trim()) result.compatibility = c.trim().slice(0, 50);
  }

  return result;
}

const SIGN_NAMES = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const SIGN_MAP: Record<string, number> = Object.fromEntries(SIGN_NAMES.map((s, i) => [s, i + 1]));
const REQUIRED_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

/**
 * Generate generic planetary transits (Gochara) using Perplexity.
 * Returns currentPositions + optional personalImpact. Caller should run house recalculation and generateTransitPredictions if needed.
 */
export async function generateGenericTransitsFromPerplexity(
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
  const langName = LANGUAGE_NAMES[language] || 'English';
  const refSignId = SIGN_MAP[rashi] || 1;

  const systemPrompt = `You are a Vedic astrology expert. For TODAY (${today}) at location ${location}, provide CURRENT sidereal positions of all 9 planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu).
Reference Moon Sign for the user: ${rashi} (signId ${refSignId}).
Respond ONLY with a single valid JSON object, no other text. Use this exact structure:
{"currentPositions":[{"planet":"Sun","sign":"Aries","signId":1,"house":1,"isRetrograde":false,"nakshatra":"Ashwini","degree":"12.50"}, ...]}
Rules:
- planet: one of Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu
- sign: one of Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces
- signId: 1-12 (1=Aries, 12=Pisces)
- house: 1-12, relative to ${rashi} as house 1 (so ${rashi}=1, next sign=2, etc.)
- isRetrograde: true/false (Moon is ALWAYS false)
- nakshatra: string (e.g. Ashwini, Bharani)
- degree: string (e.g. "15.30")
Include all 9 planets. Moon is never retrograde.`;

  const userPrompt = `Give me today's (${today}) planetary transit positions for ${location} with reference sign ${rashi}. Output only the JSON object.`;

  const content = await perplexityFetch({
    model: 'sonar',
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
    throw new Error('TRANSIENT'); // User-friendly message handled by caller
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

export function hasPerplexityKey(): boolean {
  return getAllPerplexityKeys().length > 0;
}
