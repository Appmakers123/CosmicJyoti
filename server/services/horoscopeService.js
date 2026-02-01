import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { postWithKeyRotation } from '../utils/astrologyApiKeys.js';

const ASTROLOGY_API_BASE = process.env.ASTROLOGY_API_BASE_URL || 'https://json.freeastrologyapi.com';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;

// Language name mapping for AI prompts
const LANGUAGE_NAMES = {
  'en': 'English',
  'hi': 'Hindi',
};

const getLanguageName = (lang) => {
  return LANGUAGE_NAMES[lang] || 'English';
};

/**
 * Generate Horoscope (Rashifal) for a specific sign and date
 */
export async function generateHoroscope(sign, date, language = 'en') {
  try {
    const languageName = getLanguageName(language);

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
      const response = await postWithKeyRotation(
        axios,
        `${ASTROLOGY_API_BASE}/horoscope`,
        payload
      );

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
 */
async function generateHoroscopeWithAI(sign, date, language, languageName) {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not found, using basic horoscope');
    return {
      sign: sign,
      date: date,
      horoscope: generateBasicHoroscope(sign, date, language),
      language: language
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert Vedic astrologer. Generate a daily horoscope for ${sign} zodiac sign for ${date}. 
Provide a detailed, accurate, and helpful horoscope prediction in ${languageName} language. 
Include insights about career, love, health, finance, and general life aspects. 
Make it specific, practical, and compassionate.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const horoscopeText = response.text();

    return {
      sign: sign,
      date: date,
      horoscope: horoscopeText,
      language: language
    };
  } catch (aiError) {
    console.error('AI horoscope generation error:', aiError);
    // Fallback to basic horoscope
    return {
      sign: sign,
      date: date,
      horoscope: generateBasicHoroscope(sign, date, language),
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

