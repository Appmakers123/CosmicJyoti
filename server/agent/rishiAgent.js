/**
 * Rishi Agent – Ask Rishi with tools (ADK-style agent using Gemini function calling).
 * Tools: get_today_panchang, get_horoscope_for_sign.
 * Uses the same backend services so results are consistent with the rest of the app.
 */
import { generatePanchang } from '../services/panchangService.js';
import { generateHoroscope } from '../services/horoscopeService.js';

const LANGUAGE_NAMES = { en: 'English', hi: 'Hindi' };
const PERSONA_PROMPTS = {
  general: 'You are Rishi, the CosmicJyoti Sage—a holistic guide for life, spirituality, and cosmic wisdom.',
  career: 'You are the Career Sage—specializing in career, business, job changes, and professional growth.',
  love: 'You are the Love Guide—specializing in relationships, compatibility, marriage, and romance.',
  health: 'You are the Health Advisor—specializing in Vedic health, doshas, and wellness.',
};

/**
 * Define tools the agent can call (Gemini function declarations).
 */
function getFunctionDeclarations() {
  return [
    {
      name: 'get_today_panchang',
      description: 'Get today\'s Vedic Panchang (almanac) for a location: tithi, nakshatra, sunrise, sunset, Rahu Kalam, Abhijit Muhurat. Use when the user asks about today\'s panchang, auspicious time, tithi, or muhurat for a place.',
      parameters: {
        type: 'OBJECT',
        properties: {
          location: { type: 'STRING', description: 'City or place name, e.g. New Delhi, Mumbai' },
          language: { type: 'STRING', description: 'en or hi', enum: ['en', 'hi'] },
        },
        required: ['location'],
      },
    },
    {
      name: 'get_horoscope_for_sign',
      description: 'Get daily horoscope (rashifal) for a zodiac sign. Use when the user asks about horoscope, daily prediction, or rashifal for a sign (Aries, Taurus, Gemini, etc.).',
      parameters: {
        type: 'OBJECT',
        properties: {
          sign: {
            type: 'STRING',
            description: 'Zodiac sign name',
            enum: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
          },
          language: { type: 'STRING', description: 'en or hi', enum: ['en', 'hi'] },
        },
        required: ['sign'],
      },
    },
  ];
}

/**
 * Execute a tool call and return the result (for the model).
 */
async function executeToolCall(name, args, language) {
  const lang = args.language || language || 'en';
  try {
    if (name === 'get_today_panchang') {
      const today = new Date().toISOString().slice(0, 10);
      const location = args.location || 'New Delhi, India';
      const data = await generatePanchang(today, location, lang);
      return {
        date: data.date,
        location: data.location,
        sunrise: data.sunrise,
        sunset: data.sunset,
        tithi: data.tithi?.name,
        nakshatra: data.nakshatra?.name,
        rahuKalam: data.rahuKalam,
        abhijitMuhurat: data.abhijitMuhurat,
      };
    }
    if (name === 'get_horoscope_for_sign') {
      const sign = args.sign || 'Aries';
      const today = new Date().toISOString().slice(0, 10);
      const data = await generateHoroscope(sign, today, lang);
      const horoscopeText = typeof data.horoscope === 'string' ? data.horoscope : JSON.stringify(data.horoscope);
      return { sign: data.sign || sign, date: data.date || today, horoscope: horoscopeText };
    }
  } catch (err) {
    console.error(`Rishi agent tool error (${name}):`, err);
    return { error: err.message || 'Tool execution failed' };
  }
  return { error: `Unknown tool: ${name}` };
}

/**
 * Run the Rishi agent: send user message, handle function calls in a loop, return final text.
 * Uses multi-turn contents: user -> model (optional functionCall) -> user (functionResponse) -> model (text).
 */
export async function runRishiAgent({ prompt, language = 'en', context = '', persona = 'general', genAI }) {
  if (!genAI) throw new Error('Gemini AI not initialized');

  const langName = LANGUAGE_NAMES[language] || 'English';
  const personaPrompt = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.general;
  const systemInstruction = `${personaPrompt}
You are CosmicJyoti Sage, an expert Vedic astrologer. Provide warm, mentor-like guidance.
Always respond in ${langName}.
When the user asks about today's Panchang or auspicious time, use get_today_panchang. When they ask about horoscope or rashifal for a sign, use get_horoscope_for_sign. Use tools when relevant, then summarize in a helpful way.
${context ? `Module context (answer using this scope only—e.g. Kundali, Compatibility, or current tool): ${context}` : ''}`;

  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    systemInstruction,
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    tools: [{ functionDeclarations: getFunctionDeclarations() }],
  });

  const tools = [{ functionDeclarations: getFunctionDeclarations() }];
  let contents = [{ role: 'user', parts: [{ text: prompt }] }];
  let iterations = 0;
  const maxIterations = 5;

  while (iterations < maxIterations) {
    const result = await model.generateContent({ contents, generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }, tools });
    const response = result?.response;
    if (!response || !response.candidates?.length) {
      return { text: 'The cosmic signals are faint. Please try again.', sources: [] };
    }

    const parts = response.candidates[0].content?.parts || [];
    let textParts = [];
    const functionCalls = [];

    for (const part of parts) {
      if (part.text) textParts.push(part.text);
      if (part.functionCall) {
        functionCalls.push({
          name: part.functionCall.name,
          args: part.functionCall.args || {},
        });
      }
    }

    if (textParts.length > 0 && functionCalls.length === 0) {
      return { text: textParts.join('\n').trim(), sources: [] };
    }

    if (functionCalls.length === 0) {
      return { text: textParts.join('\n').trim() || 'I\'m here to help. Ask about your chart, today\'s Panchang, or horoscope.', sources: [] };
    }

    contents.push({ role: 'model', parts });
    const responseParts = [];
    for (const fc of functionCalls) {
      const toolResult = await executeToolCall(fc.name, fc.args, language);
      responseParts.push({ functionResponse: { name: fc.name, response: toolResult } });
    }
    contents.push({ role: 'user', parts: responseParts });
    iterations++;
  }

  return { text: 'I used the tools but hit the reply limit. Please ask again in a shorter way.', sources: [] };
}
