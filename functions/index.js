import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { GoogleGenerativeAI } from '@google/generative-ai';

const geminiApiKey = defineSecret('GEMINI_API_KEY');

const PERSONA_PROMPTS = {
  general: 'You are Rishi, the CosmicJyoti Sage—a holistic guide for life, spirituality, and cosmic wisdom.',
  career: 'You are the Career Sage—specializing in career, business, job changes, success, and professional growth.',
  love: 'You are the Love Guide—specializing in relationships, compatibility, marriage, romance, and emotional connections.',
  health: 'You are the Health Advisor—specializing in Vedic health, doshas, wellness, and preventive care.',
};

const LANGUAGE_NAMES = { en: 'English', hi: 'Hindi' };

/**
 * Ask Rishi - Callable function that proxies Gemini API (fixes CORS)
 * Call from web: httpsCallable(functions, 'askRishi')({ prompt, language, context, persona })
 * Set secret: firebase functions:secrets:set GEMINI_API_KEY
 */
export const askRishi = onCall(
  { cors: true, secrets: [geminiApiKey] },
  async (request) => {
    const { prompt, language = 'en', context, persona = 'general' } = request.data || {};

    if (!prompt || typeof prompt !== 'string') {
      throw new HttpsError('invalid-argument', 'Missing required field: prompt');
    }

    const apiKey = geminiApiKey.value() || process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      throw new HttpsError('failed-precondition', 'Gemini API key not configured');
    }

    const langName = LANGUAGE_NAMES[language] || 'English';
    const contextInfo = context ? `\n\nUser's Birth Chart Context: ${context}` : '';
    const personaPrompt = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.general;
    const systemInstruction = `${personaPrompt}

You are CosmicJyoti Sage, an expert Vedic astrologer. Provide warm, mentor-like guidance.
IMPORTANT: Always respond in ${langName} language. Be practical and supportive.
${contextInfo}`;

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const fullPrompt = `${systemInstruction}\n\n---\n\n${context ? 'Context: ' + context + '\n\n' : ''}User: ${prompt}`;
      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      const text = response?.text?.() || 'The cosmic library is currently undergoing maintenance. Please try again soon.';

      return { text, sources: [] };
    } catch (error) {
      console.error('Ask Rishi error:', error);
      throw new HttpsError('internal', error.message || 'Failed to get AI response');
    }
  }
);
