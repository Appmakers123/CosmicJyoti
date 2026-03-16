import { GoogleGenerativeAI } from '@google/generative-ai';
import { post } from '../lib/freeAstrologyApi.js';
import { getTextModelOrder } from '../utils/geminiTierLimits.js';
import { checkLimit, recordUsage } from '../utils/geminiRateLimiter.js';

// Lazy read so dotenv has run (index.js loads .env after importing this module)
function getGeminiApiKey() {
  const env = process.env;
  const keys = env.GEMINI_API_KEYS || env.API_KEYS;
  if (keys && typeof keys === 'string') {
    const first = keys.split(',')[0]?.trim();
    if (first) return first;
  }
  const single = env.GEMINI_API_KEY || env.API_KEY || env.VITE_GEMINI_API_KEY;
  return single && typeof single === 'string' ? single.trim() : null;
}

// Language name mapping for AI prompts
const LANGUAGE_NAMES = {
  'en': 'English',
  'hi': 'Hindi',
};

const getLanguageName = (lang) => {
  return LANGUAGE_NAMES[lang] || 'English';
};

const HOROSCOPE_MODEL_FALLBACKS = getTextModelOrder();

function isRetryableGeminiError(e) {
  const msg = e?.message || String(e || '');
  return /503|UNAVAILABLE|high demand|try again later/i.test(msg);
}

/**
 * Generate Horoscope (Rashifal) for a specific sign and date
 * @param {string} sign - Zodiac sign
 * @param {string} date - Date string
 * @param {string} language - 'en' | 'hi'
 * @param {string} period - 'day' | 'week' | 'month' | 'year'
 */
export async function generateHoroscope(sign, date, language = 'en', period = 'day') {
  const languageName = getLanguageName(language);
  // For week/month/year use AI; external API is daily only
  if (period && period !== 'day') {
    return generateHoroscopeWithAI(sign, date, language, languageName, period);
  }
  try {
    const dateObj = new Date(date);
    const payload = {
      year: dateObj.getFullYear(),
      month: dateObj.getMonth() + 1,
      date: dateObj.getDate(),
      sign: sign,
      language: language === 'hi' ? 'hi' : 'en'
    };

    // Call horoscope API if available, otherwise generate based on sign
    try {
      const response = await post('horoscope', payload);

      const horoscopeText = response.data.horoscope || response.data.prediction || response.data;
      
      // If language is not English, translate using AI
      if (language === 'hi' && typeof horoscopeText === 'string') {
        // For Hindi, the API might already return Hindi, so check if translation is needed
        return {
          sign: sign,
          date: date,
          horoscope: horoscopeText,
          language: language
        };
      }

      return {
        sign: sign,
        date: date,
        horoscope: horoscopeText,
        language: language
      };
    } catch (apiError) {
      // Fallback: Generate basic horoscope
      return {
        sign: sign,
        date: date,
        horoscope: generateBasicHoroscope(sign, date, language),
        language: language
      };
    }
  } catch (error) {
    console.error('Horoscope generation error:', error);
    throw new Error(`Failed to generate Horoscope: ${error.message}`);
  }
}

/**
 * Generate horoscope using AI for all languages
 * @param {string} period - 'day' | 'week' | 'month' | 'year'
 */
async function generateHoroscopeWithAI(sign, date, language, languageName, period = 'day') {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    console.warn('Gemini API key not found, using basic horoscope. Set GEMINI_API_KEYS (or GEMINI_API_KEY) in .env.local for AI horoscope (week/month/year).');
    const basic = generateBasicHoroscope(sign, date, language);
    const text = typeof basic === 'object' && basic.general ? basic.general : String(basic);
    return { sign, date, horoscope: text, language };
  }

  const periodLabel = period === 'week' ? 'weekly' : period === 'month' ? 'monthly' : period === 'year' ? 'yearly' : 'daily';
  const extraSections = period !== 'day' ? `

## Overall theme
(2-3 sentences for the ${periodLabel} period.)

## Key dates or phases
(2-3 bullet points with dates or phases to watch.)` : '';

  const prompt = `You are an expert Vedic astrologer. Write a DETAILED ${periodLabel} horoscope for ${sign} zodiac sign. Date: ${date}. Language: ${languageName}.

OUTPUT FORMAT — use exactly these markdown headers in your response:
## Intro
(2-3 sentences summarizing ${periodLabel} energy for ${sign}.)

## Career
(2-4 bullet points or short paragraph: work, opportunities, challenges. Use **bold** for key terms.)

## Love
(2-4 bullet points: relationships, romance. Use **bold** for key terms.)

## Health
(2-4 bullet points: wellbeing, energy. Use **bold** for key terms.)

## Finance
(2-4 bullet points: money, investments. Use **bold** for key terms.)${extraSections}

RULES: Minimum 150 words total. No one-liners. Be specific, practical, and compassionate. Use - for bullets and **bold** for key words. Respond in ${languageName}.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    let result = null;
    let lastError = null;
    for (const modelId of HOROSCOPE_MODEL_FALLBACKS) {
      const limitCheck = checkLimit(modelId);
      if (!limitCheck.allowed && limitCheck.reason === 'RPD') {
        console.warn('Horoscope model', modelId, 'at RPD limit, trying next.');
        continue;
      }
      if (!limitCheck.allowed && limitCheck.waitMs > 0) {
        await new Promise((r) => setTimeout(r, limitCheck.waitMs));
      }
      try {
        const model = genAI.getGenerativeModel({ model: modelId });
        result = await model.generateContent(prompt);
        const usage = result?.response?.usageMetadata;
        recordUsage(modelId, usage?.promptTokenCount, usage?.candidatesTokenCount);
        break;
      } catch (e) {
        lastError = e;
        if (isRetryableGeminiError(e)) {
          console.warn('Horoscope model', modelId, 'unavailable (503/high demand), trying next fallback.');
          continue;
        }
        throw e;
      }
    }
    if (!result) throw lastError;
    const response = result.response;
    let horoscopeText = '';
    try {
      if (typeof response.text === 'function') {
        horoscopeText = response.text();
      } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        horoscopeText = response.candidates[0].content.parts[0].text;
      } else {
        horoscopeText = response.text || '';
      }
    } catch (e) {
      console.warn('Gemini response text failed for', period, e?.message);
      if (result.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        horoscopeText = result.response.candidates[0].content.parts[0].text;
      }
    }
    if (!horoscopeText || typeof horoscopeText !== 'string' || horoscopeText.trim().length < 50) {
      console.warn('Gemini returned empty/short horoscope for', period, '- using basic fallback');
      const basic = generateBasicHoroscope(sign, date, language);
      horoscopeText = typeof basic === 'object' && basic.general ? basic.general : String(basic);
    }

    return {
      sign: sign,
      date: date,
      horoscope: horoscopeText.trim(),
      language: language
    };
  } catch (aiError) {
    console.error('AI horoscope generation error (' + period + '):', aiError?.message || aiError);
    // Fallback to basic horoscope
    const basic = generateBasicHoroscope(sign, date, language);
    const text = typeof basic === 'object' && basic.general ? basic.general : String(basic);
    return {
      sign: sign,
      date: date,
      horoscope: text,
      language: language
    };
  }
}

/**
 * Generate basic horoscope (fallback)
 */
function generateBasicHoroscope(sign, date, language) {
  const signNames = {
    'Aries': language === 'hi' ? 'मेष' : 'Aries',
    'Taurus': language === 'hi' ? 'वृषभ' : 'Taurus',
    'Gemini': language === 'hi' ? 'मिथुन' : 'Gemini',
    'Cancer': language === 'hi' ? 'कर्क' : 'Cancer',
    'Leo': language === 'hi' ? 'सिंह' : 'Leo',
    'Virgo': language === 'hi' ? 'कन्या' : 'Virgo',
    'Libra': language === 'hi' ? 'तुला' : 'Libra',
    'Scorpio': language === 'hi' ? 'वृश्चिक' : 'Scorpio',
    'Sagittarius': language === 'hi' ? 'धनु' : 'Sagittarius',
    'Capricorn': language === 'hi' ? 'मकर' : 'Capricorn',
    'Aquarius': language === 'hi' ? 'कुम्भ' : 'Aquarius',
    'Pisces': language === 'hi' ? 'मीन' : 'Pisces'
  };

  const signName = signNames[sign] || sign;
  
  if (language === 'hi') {
    return {
      general: `${signName} राशि के जातकों के लिए आज का दिन मिश्रित परिणाम लेकर आएगा। कार्यक्षेत्र में सफलता मिलेगी।`,
      career: 'कार्यक्षेत्र में नए अवसर मिल सकते हैं।',
      love: 'प्रेम संबंधों में सामंजस्य बना रहेगा।',
      health: 'स्वास्थ्य का ध्यान रखें।',
      finance: 'वित्तीय स्थिति स्थिर रहेगी।'
    };
  }

  return {
    general: `Today brings mixed results for ${signName} natives. Success in professional field.`,
    career: 'New opportunities may arise in career.',
    love: 'Harmony will be maintained in relationships.',
    health: 'Take care of health.',
    finance: 'Financial situation will remain stable.'
  };
}

