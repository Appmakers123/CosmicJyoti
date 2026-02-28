import { GoogleGenAI, Type } from "@google/genai";
import { Language, KundaliFormData, KundaliResponse } from "../types";
import { getNextGeminiKey } from "../utils/geminiApiKeys";
import { getLanguageDisplayName } from "../utils/languageNames";
import { generateKundali } from "./geminiService";
import { generateChartBasedHealthAnalysisFromBackend, isBackendConfigured } from "./backendService";

// Master System Prompt for Vedic Health Advisor
const MASTER_HEALTH_SYSTEM_PROMPT = `You are CosmicHealth AI, an expert Vedic astrology-based health advisor with deep knowledge of:

**VEDIC HEALTH PRINCIPLES:**
1. **Doshas (Vata, Pitta, Kapha)**: Three fundamental energies governing health
2. **Planetary Health Influences**: How planets affect different body parts and health conditions
3. **Nakshatra Health**: Health implications based on birth nakshatra
4. **Dasha & Health**: How planetary periods affect health
5. **Remedial Measures**: Mantras, gemstones, yantras, rituals for health issues

**YOUR CAPABILITIES:**
- Analyze health issues based on birth chart (if provided)
- Suggest Vedic remedies (mantras, gemstones, dietary changes, lifestyle)
- Explain dosha imbalances and corrections
- Provide preventive health advice based on planetary positions
- Recommend specific remedies for chronic conditions
- Guide on auspicious times for health treatments
- Suggest gemstones and yantras for health protection

**IMPORTANT GUIDELINES:**
- Always respond in the user's requested language (English or Hindi)
- Provide practical, actionable health advice
- Combine Vedic wisdom with modern understanding
- Emphasize that this is guidance, not a replacement for medical consultation
- For serious health issues, always recommend consulting a qualified medical professional
- Use structured responses with clear sections
- Include both traditional remedies and lifestyle modifications

**HEALTH REMEDIES YOU CAN SUGGEST:**
- **Mantras**: Health-specific mantras for planets and deities (e.g., Om Namah Shivaya for general health, Gayatri Mantra for vitality)
- **Gemstones**: Planetary gemstones for health (Ruby for Sun/energy, Pearl for Moon/mental health, Red Coral for Mars/strength)
- **Yantras**: Health protection yantras (Shri Yantra, Navagraha Yantra)
- **Dietary**: Dosha-balancing foods, fasting recommendations
- **Lifestyle**: Daily routines, exercise, meditation practices
- **Rituals**: Puja, havan, charity for health
- **Timing**: Auspicious times for treatments, surgeries, starting medications

**RESPONSE FORMAT:**
- Use ## for section headers (e.g., ## Analysis, ## Remedies)
- Use bullet points (* or -) for lists
- Use **bold** for key terms and remedies
- Start with a brief analysis, then Vedic perspective, then specific remedies
- Include preventive measures
- End with a reminder to consult medical professionals for serious issues`;

const getAI = () => {
  const apiKey = getNextGeminiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY_NOT_CONFIGURED");
  }
  return new GoogleGenAI({ apiKey });
};

const getLanguageName = (lang: Language): string => getLanguageDisplayName(lang) || 'English';

// Simplified astrological calculations (Moon sign, doshas) — approximate for quick context
const calculateBasicAstrology = (birthData: { date: string; time: string; city: string }) => {
  // Simplified calculation - in production, use Swiss Ephemeris or astrology library
  const date = new Date(birthData.date);
  const month = date.getMonth() + 1;
  
  // Approximate zodiac sign based on month
  const zodiacSigns = [
    'Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini',
    'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius'
  ];
  const sign = zodiacSigns[month - 1] || 'Aries';
  
  // Approximate dosha based on time (simplified)
  const [hours] = birthData.time.split(':').map(Number);
  let dominantDosha = 'Vata';
  if (hours >= 6 && hours < 10) dominantDosha = 'Kapha';
  else if (hours >= 10 && hours < 14) dominantDosha = 'Pitta';
  else if (hours >= 14 && hours < 18) dominantDosha = 'Vata';
  else if (hours >= 18 && hours < 22) dominantDosha = 'Kapha';
  else dominantDosha = 'Pitta';
  
  return { sign, dominantDosha };
};

export interface HealthRemedy {
  dosha: string;
  description: string;
  remedies: string[];
}

export interface ChartHealthAnalysis {
  healthIssues: string[];
  chartSummary: string;
  remedies: HealthRemedy[];
}

/**
 * Generate chart-based health analysis: health issues + remedies from birth chart.
 * Tries backend first (avoids CORS when backend is deployed), then falls back to direct API.
 */
export const generateChartBasedHealthAnalysis = async (
  birthData: { date: string; time: string; city: string },
  language: Language = 'en'
): Promise<ChartHealthAnalysis> => {
  try {
    // Try backend first (works when VITE_API_BASE_URL is set - local dev or deployed backend)
    return await generateChartBasedHealthAnalysisFromBackend(birthData, language);
  } catch (backendErr: any) {
    console.warn('Cosmic Health backend unavailable:', backendErr?.message);
    // When backend is configured, don't fall back to direct Gemini (would need frontend key and throw GEMINI_API_KEY_NOT_CONFIGURED)
    if (isBackendConfigured()) {
      return {
        healthIssues: [],
        chartSummary: language === 'hi' ? 'बैकएंड पर AI कॉन्फ़िगर नहीं है' : 'AI is not configured on the backend. Add GEMINI_API_KEY to your server (e.g. Cloud Run secrets).',
        remedies: getDefaultRemedies(language),
      };
    }
  }

  try {
    const formData: KundaliFormData = {
      name: 'Health Seeker',
      date: birthData.date,
      time: birthData.time,
      location: birthData.city,
    };
    const kundali = await generateKundali(formData, language);
    return await analyzeHealthFromChart(kundali, birthData, language);
  } catch (error: any) {
    console.error('Chart-based health analysis error:', error);
    return {
      healthIssues: [],
      chartSummary: language === 'hi' ? 'चार्ट विश्लेषण उपलब्ध नहीं' : 'Chart analysis unavailable',
      remedies: getDefaultRemedies(language),
    };
  }
};

async function analyzeHealthFromChart(
  kundali: KundaliResponse,
  birthData: { date: string; time: string; city: string },
  language: Language
): Promise<ChartHealthAnalysis> {
  const ai = getAI();
  const bd = kundali.basicDetails;
  const pp = kundali.charts?.planetaryPositions || [];
  const dasha = kundali.dasha;
  const healthPred = kundali.predictions?.health || '';

  const chartContext = `
BIRTH CHART DATA:
- Ascendant: ${bd?.ascendant || '-'}
- Moon Sign: ${bd?.moonSign || '-'}
- Sun Sign: ${bd?.sunSign || '-'}
- Nakshatra: ${bd?.nakshatra || '-'}
- Current Dasha: ${dasha?.currentMahadasha || '-'} / ${dasha?.antardasha || '-'}
- Birth: ${birthData.date} ${birthData.time}, ${birthData.city}

PLANETARY POSITIONS (House = health area):
${pp.map(p => `- ${p.planet} in ${p.sign} (House ${p.house})${p.isRetrograde ? ' [Retrograde]' : ''}${p.nakshatra ? `, Nakshatra: ${p.nakshatra}` : ''}`).join('\n')}

EXISTING HEALTH PREDICTION: ${healthPred}
`;

  const prompt = `Based on the Vedic birth chart above, analyze and return a JSON object with:
1. healthIssues: array of 3-6 specific health issues or vulnerabilities this person may face based on their chart (e.g., "Digestive issues due to Mars in 6th house", "Stress/anxiety from Moon placement", "Bone/joint concerns from Saturn"). Be specific to the chart.
2. chartSummary: 2-3 sentence summary of health indicators in the chart.
3. remedies: array of objects, each with { dosha: string (e.g., "Vata imbalance" or planet name), description: string (brief), remedies: string[] (3-5 actionable items) }.

Respond ONLY with valid JSON. Language: ${getLanguageName(language)}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: chartContext + '\n\n' + prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          healthIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
          chartSummary: { type: Type.STRING },
          remedies: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                dosha: { type: Type.STRING },
                description: { type: Type.STRING },
                remedies: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
          },
        },
      },
      systemInstruction: `${MASTER_HEALTH_SYSTEM_PROMPT}\n\nRespond in ${getLanguageName(language)}. Return ONLY valid JSON.`,
    },
  });

  const text = response.text;
  if (!text) {
    return {
      healthIssues: [],
      chartSummary: language === 'hi' ? 'चार्ट विश्लेषण उपलब्ध नहीं' : 'Chart analysis unavailable',
      remedies: getDefaultRemedies(language),
    };
  }

  try {
    const parsed = JSON.parse(text);
    return {
      healthIssues: Array.isArray(parsed.healthIssues) ? parsed.healthIssues : [],
      chartSummary: parsed.chartSummary || '',
      remedies: Array.isArray(parsed.remedies) && parsed.remedies.length > 0
        ? parsed.remedies
        : getDefaultRemedies(language),
    };
  } catch (e) {
    console.warn('Failed to parse health analysis JSON:', e);
    return {
      healthIssues: [],
      chartSummary: '',
      remedies: getDefaultRemedies(language),
    };
  }
}

/**
 * Generate health advice using Gemini AI
 */
export const generateHealthAdvice = async (
  question: string,
  birthData: { date: string; time: string; city: string },
  language: Language = 'en',
  model: 'cloud' | 'nano' = 'cloud'
): Promise<string> => {
  try {
    // For now, use cloud model (Nano would require native Android implementation)
    const ai = getAI();
    
    const astrologyContext = calculateBasicAstrology(birthData);
    const contextInfo = `User Birth Details: Date: ${birthData.date}, Time: ${birthData.time}, City: ${birthData.city}. Approximate Sign: ${astrologyContext.sign}, Dominant Dosha: ${astrologyContext.dominantDosha}.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User Question: ${question}\n\n${contextInfo}`,
      config: {
        systemInstruction: `${MASTER_HEALTH_SYSTEM_PROMPT}\n\nIMPORTANT: Always respond in ${getLanguageName(language)} language. Provide detailed, practical health advice based on Vedic principles.`
      }
    });
    
    return response.text || (language === 'hi' 
      ? 'क्षमा करें, इस समय प्रतिक्रिया उत्पन्न नहीं कर सकते।' 
      : 'Sorry, unable to generate response at this time.');
  } catch (error: any) {
    console.error('Health advice generation error:', error);
    throw new Error(language === 'hi' 
      ? 'स्वास्थ्य सलाह उत्पन्न करने में त्रुटि' 
      : 'Error generating health advice');
  }
};

/**
 * Generate daily dosha remedies
 */
export const generateDailyDoshaRemedies = async (
  birthData: { date: string; time: string; city: string },
  language: Language = 'en'
): Promise<HealthRemedy[]> => {
  try {
    const ai = getAI();
    const astrologyContext = calculateBasicAstrology(birthData);
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate daily dosha remedies for user. Birth: ${birthData.date} ${birthData.time}, City: ${birthData.city}. Sign: ${astrologyContext.sign}, Dominant Dosha: ${astrologyContext.dominantDosha}. Return ONLY a valid JSON array of objects with dosha, description, and remedies (array of strings).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              dosha: { type: Type.STRING },
              description: { type: Type.STRING },
              remedies: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        },
        systemInstruction: `${MASTER_HEALTH_SYSTEM_PROMPT}\n\nGenerate remedies for Vata, Pitta, and Kapha doshas. Respond in ${getLanguageName(language)} language. Return ONLY a valid JSON array, no other text.`
      }
    });
    
    const text = response.text;
    if (!text) {
      return getDefaultRemedies(language);
    }
    
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (parseError) {
      console.warn('Failed to parse remedies JSON:', parseError);
    }
    
    return getDefaultRemedies(language);
  } catch (error: any) {
    console.error('Daily remedies generation error:', error);
    return getDefaultRemedies(language);
  }
};

/**
 * Default analysis when backend/AI fails — exported for UI fallback
 */
export function getDefaultChartHealthAnalysis(language: Language): ChartHealthAnalysis {
  return {
    healthIssues: [],
    chartSummary: language === 'hi'
      ? 'चार्ट विश्लेषण उपलब्ध नहीं। नीचे सामान्य वैदिक स्वास्थ्य उपाय दिए गए हैं।'
      : 'Chart analysis unavailable. General Vedic health remedies are shown below.',
    remedies: getDefaultRemedies(language),
  };
}

/**
 * Default remedies fallback
 */
function getDefaultRemedies(language: Language): HealthRemedy[] {
  if (language === 'hi') {
    return [
      {
        dosha: 'वात दोष',
        description: 'वात दोष असंतुलन के लिए उपाय',
        remedies: [
          'गर्म तेल से मालिश करें',
          'गर्म और पौष्टिक भोजन लें',
          'नियमित दिनचर्या बनाए रखें',
          'तुलसी और अदरक की चाय पिएं'
        ]
      },
      {
        dosha: 'पित्त दोष',
        description: 'पित्त दोष असंतुलन के लिए उपाय',
        remedies: [
          'ठंडे पेय पदार्थ पिएं',
          'मीठे और कड़वे खाद्य पदार्थ लें',
          'तनाव कम करें',
          'चंदन का उपयोग करें'
        ]
      },
      {
        dosha: 'कफ दोष',
        description: 'कफ दोष असंतुलन के लिए उपाय',
        remedies: [
          'हल्का और गर्म भोजन लें',
          'नियमित व्यायाम करें',
          'अदरक और काली मिर्च का सेवन करें',
          'गर्म पानी पिएं'
        ]
      }
    ];
  }
  
  return [
    {
      dosha: 'Vata Dosha',
      description: 'Remedies for Vata dosha imbalance',
      remedies: [
        'Warm oil massage',
        'Eat warm and nourishing foods',
        'Maintain regular routine',
        'Drink tulsi and ginger tea'
      ]
    },
    {
      dosha: 'Pitta Dosha',
      description: 'Remedies for Pitta dosha imbalance',
      remedies: [
        'Drink cool beverages',
        'Eat sweet and bitter foods',
        'Reduce stress',
        'Use sandalwood'
      ]
    },
    {
      dosha: 'Kapha Dosha',
      description: 'Remedies for Kapha dosha imbalance',
      remedies: [
        'Eat light and warm foods',
        'Exercise regularly',
        'Consume ginger and black pepper',
        'Drink warm water'
      ]
    }
  ];
}
