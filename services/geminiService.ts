
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { HoroscopeResponse, KundaliFormData, KundaliResponse, Language, DailyPanchangResponse, NumerologyResponse, MatchMakingInput, MatchMakingResponse, MuhuratItem, TransitResponse, PlanetaryPosition, ImportantPoint } from "../types";
import { fetchWithKeyRotation } from "../utils/astrologyApiKeys";
import { generateHoroscopeFromPerplexity, hasPerplexityKey, generateGenericTransitsFromPerplexity } from "./perplexityService";
import { askRishiFromBackend } from "./backendService";

// Gemini API key (single key only - no fallback)
const GEMINI_API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;

const getAI = () => {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY_NOT_CONFIGURED");
  }
  return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
};

// Language name mapping for AI prompts
const LANGUAGE_NAMES: Record<Language, string> = {
  'en': 'English',
  'hi': 'Hindi',
};

const getLanguageName = (lang: Language): string => {
  return LANGUAGE_NAMES[lang] || 'English';
};

/** Clean prediction text: fix HTML entities, remove leaked instruction/placeholder text */
function cleanPredictionText(text: string | undefined): string {
  if (!text || typeof text !== 'string') return '';
  let s = text
    .replace(/&deg;/g, '°')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
  // Remove leaked numbered instruction blocks (e.g. "6. EDUCATION PREDICTIONS (150-250 words): ... Analyze: ...")
  s = s.replace(/\d+\.\s+[A-Z][A-Z\s&]*(?:PREDICTIONS?|PREDICTION)\s*\([^)]+\)[^:]*:[\s\S]*?(?=\d+\.\s+[A-Z]|$)/gi, '');
  // Remove "Xth house (label) and planets: None" lines
  s = s.replace(/\s*\d*(?:st|nd|rd|th)?\s*house\s*\([^)]*\)\s*and\s*planets:\s*None\.?\s*/gi, '');
  // Remove "house and planets: None" fragments
  s = s.replace(/\s*house\s+and\s+planets:\s*None\.?\s*/gi, '');
  s = s.replace(/\s+planets:\s*None\.?\s*/gi, '');
  // Remove trailing instruction fragments
  s = s.replace(/\s*Provide specific, actionable insights[\s\S]*$/i, '');
  s = s.replace(/\s*Reference actual planetary positions[\s\S]*$/i, '');
  return s.trim();
}

const MASTER_MENTOR_PROMPT = "You are a world-class mentor for CosmicJyoti. Your goal is to explain occult sciences like astrology, palmistry, and numerology with deep scholarly insight but simple words. IMPORTANT: You must respond ONLY in the language requested by the user. Use bullet points and clear headers.";

// Mentor-like tone: warm, human, supportive (MyNitya/Co-Star style)
const MENTOR_TONE = `TONE & STYLE: Be like a wise, caring friend who truly understands. Use a warm, conversational tone—never robotic or cold. Show empathy. Acknowledge the user's feelings. Give practical, actionable advice. Be encouraging but honest. Use "you" and "your" naturally. Avoid jargon unless you explain it. Keep responses focused and digestible.`;

// Specialized AI Astrologer personas (VedVaani style)
export type AstrologerPersona = 'general' | 'career' | 'love' | 'health';
const PERSONA_PROMPTS: Record<AstrologerPersona, string> = {
  general: 'You are Rishi, the CosmicJyoti Sage—a holistic guide for life, spirituality, and cosmic wisdom.',
  career: 'You are the Career Sage—specializing in career, business, job changes, success, and professional growth. Focus on practical career advice, timing for decisions, and remedies for professional challenges.',
  love: 'You are the Love Guide—specializing in relationships, compatibility, marriage, romance, and emotional connections. Focus on relationship dynamics, timing for love, and remedies for relationship challenges.',
  health: 'You are the Health Advisor—specializing in Vedic health, doshas, wellness, and preventive care. Focus on health remedies, lifestyle, and cosmic influences on wellbeing.',
};

// Comprehensive AI System Prompt with all services and remedies knowledge
const COMPREHENSIVE_AI_PROMPT = `You are CosmicJyoti Sage, an expert Vedic astrologer and spiritual guide with deep knowledge of all occult sciences. You have complete knowledge of all services available in CosmicJyoti app:

**AVAILABLE SERVICES:**
1. **Kundali (Birth Chart)**: D1 and D9 charts, planetary positions, houses, dasha, predictions
2. **Daily Horoscope**: Zodiac-based daily predictions
3. **Panchang**: Vedic almanac with tithi, nakshatra, yoga, karana
4. **Muhurat Planner**: Auspicious timings for activities
5. **Personal Transits (Gochara)**: Current planetary positions and their effects
6. **Numerology**: Life Path, Destiny, Soul Urge, Personality numbers
7. **Palmistry**: Hand reading, lines analysis, mounts, markings
8. **Tarot Reading**: Card-based divination and guidance
9. **Love Harmony/Compatibility**: Matchmaking, Guna Milan, relationship analysis
10. **Mantra Lab**: Sacred mantras for planets and purposes
11. **Rudraksh Lab**: Rudraksh beads for planetary remedies
12. **Yantra Lab**: Sacred geometric patterns for protection and benefits
13. **Gemstone Lab**: Gemstone recommendations based on planetary positions
14. **Vastu Lab**: Space energy optimization
15. **Dream Interpreter**: Dream analysis and meanings
16. **Mystic Lens**: Face and object reading
17. **Learning Center**: Comprehensive astrology education

**YOUR CAPABILITIES:**
- Provide detailed remedies (upayas) for planetary issues, doshas, and life problems
- Suggest mantras, yantras, gemstones, rudraksh, and other Vedic remedies
- Answer questions about any service in the app
- Provide consultations on career, health, relationships, finance, spirituality
- Explain complex astrological concepts in simple terms
- Guide users on which services to use for their specific needs
- Provide personalized advice based on their birth chart (if context provided)

**REMEDIES YOU CAN SUGGEST:**
- **Mantras**: Specific mantras for each planet, deity, and purpose
- **Yantras**: Sacred geometric patterns for protection and benefits
- **Gemstones**: Planetary gemstones (e.g., Ruby for Sun, Pearl for Moon, Red Coral for Mars)
- **Rudraksh**: Specific mukhi beads for planetary remedies
- **Vastu**: Directional remedies and space optimization
- **Rituals**: Puja, havan, fasting, charity recommendations
- **Lifestyle**: Dietary, color, day, direction-based remedies
- **Yoga & Meditation**: Spiritual practices for planetary balance

**IMPORTANT GUIDELINES:**
- Always respond in the user's requested language (English or Hindi)
- Provide practical, actionable remedies
- Explain the reasoning behind each remedy
- Be compassionate and supportive—like a wise mentor, not a robot
- If user asks about a service, explain how to access it in the app
- For complex issues, suggest consulting an expert astrologer via WhatsApp (+91 9326715739)
- Use bullet points and clear structure for easy reading
- Include both traditional Vedic remedies and modern interpretations
- ${MENTOR_TONE}`;

/**
 * Parse response to MuhuratItem array
 */
const parseMuhuratResponse = (text: string): MuhuratItem[] => {
    try {
        // Try to parse as JSON first
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }

        // If not JSON, try to extract structured data from text
        const items: MuhuratItem[] = [];
        const lines = text.split('\n').filter(line => line.trim());
        
        let currentItem: Partial<MuhuratItem> = {};
        
        for (const line of lines) {
            if (line.match(/^\d+\.|^[-*]/)) {
                if (currentItem.activity) {
                    items.push(currentItem as MuhuratItem);
                }
                currentItem = { activity: line.replace(/^\d+\.|^[-*]\s*/, '').trim() };
            } else if (line.toLowerCase().includes('time') || line.includes(':')) {
                currentItem.timeRange = line.replace(/time:?/i, '').trim();
            } else if (line.toLowerCase().includes('status') || line.match(/excellent|good|average|avoid/i)) {
                const statusMatch = line.match(/(excellent|good|average|avoid)/i);
                if (statusMatch) {
                    const status = statusMatch[1].charAt(0).toUpperCase() + statusMatch[1].slice(1).toLowerCase();
                    if (status === 'Excellent' || status === 'Good' || status === 'Average' || status === 'Avoid') {
                        currentItem.status = status as 'Excellent' | 'Good' | 'Average' | 'Avoid';
                    }
                }
            } else if (line.length > 20) {
                currentItem.reason = line.trim();
            }
        }
        
        if (currentItem.activity) {
            items.push(currentItem as MuhuratItem);
        }

        // If we couldn't parse, create a default response
        if (items.length === 0) {
            return [{
                activity: "General Activities",
                status: "Good",
                timeRange: "Check with local astrologer",
                reason: text.substring(0, 200) || "Muhurat timings based on Vedic calculations"
            }];
        }

        return items;
    } catch (e) {
        console.error("Error parsing Muhurat response:", e);
        // Return a fallback response
        return [{
            activity: "Vedic Muhurat Consultation",
            status: "Good",
            timeRange: "Please consult a local Vedic astrologer",
            reason: "Unable to parse detailed muhurat data. Please try again or consult a Vedic astrologer for accurate timings."
        }];
    }
};

/**
 * Parse JSON from Gemini response
 */
const parseJSONFromResponse = <T>(text: string, fallback: T): T => {
    try {
        // Try to find JSON in the response
        const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]) as T;
        }
        return fallback;
    } catch (e) {
        console.error("Failed to parse JSON from response:", e);
        return fallback;
    }
};

/**
 * Common Logic for all Occult Lab Interpretations
 */
const generateInterpretativeReading = async (prompt: string, systemInstruction: string, model: string = "gemini-3-flash-preview", language: Language = 'en') => {
    const languageName = getLanguageName(language);
    return (async () => {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: model,
            contents: `${prompt} IMPORTANT: Respond in ${languageName} language.`,
            config: { systemInstruction: MASTER_MENTOR_PROMPT + ` Respond in ${languageName}. ` + systemInstruction }
        });
        return response.text || "";
        }
    )();
};

export const generatePalmInterpretation = async (lines: string[], language: Language): Promise<string> => 
    generateInterpretativeReading(`Analyze these detected palm lines: ${lines.join(", ")}.`, "Act as an expert Vedic Palmist.", "gemini-3-flash-preview", language);

export const generateConjunctionAnalysis = async (planets: string[], house: number, sign: string, language: Language): Promise<string> => {
    const planetList = planets.length >= 2 ? planets.join(" and ") : planets[0] || "planets";
    return generateInterpretativeReading(`Analyze the conjunction of ${planetList} in house ${house} within the sign of ${sign}.`, "Focus on Yoga results in Vedic Astrology.", "gemini-3-flash-preview", language);
};

export const generateVastuAnalysis = async (room: string, direction: string, language: Language): Promise<string> => 
    generateInterpretativeReading(`Analyze the Vastu energy flow of a ${room} placed in the ${direction} direction.`, "Act as a Vastu Shastra expert.", "gemini-3-flash-preview", language);

export const generateGemstoneAdvice = async (planet: string, problem: string, language: Language): Promise<string> => 
    generateInterpretativeReading(`Suggest a gemstone remedy for a weak ${planet} and the life objective: ${problem}.`, "Focus on Ratna Shastra (Gemstone Science).", "gemini-3-flash-preview", language);

export const generateDreamAnalysis = async (dream: string, language: Language): Promise<string> => 
    generateInterpretativeReading(`Interpret this dream from a Vedic perspective: "${dream}".`, "Focus on Swapna Shastra (Dream Interpretation).", "gemini-3-flash-preview", language);

export const generateRudrakshAdvice = async (problem: string, language: Language): Promise<string> => 
    generateInterpretativeReading(`Identify the best Rudraksh bead for this problem: ${problem}.`, "Focus on Rudraksh Vidya.", "gemini-3-flash-preview", language);

export const searchOccultVault = async (query: string, category: string, language: Language): Promise<string> => 
    generateInterpretativeReading(`Explain "${query}" within the context of "${category}".`, "Provide deep esoteric wisdom.", "gemini-3-flash-preview", language);

export const generateAstroStory = async (target: string, type: string, language: Language): Promise<string> => 
    generateInterpretativeReading(`Tell a mystical legend from the Puranas about the ${type} ${target}.`, "Act as a Vedic Storyteller.", "gemini-3-flash-preview", language);

export const generateTarotReading = async (cards: string[], language: Language): Promise<string> => 
    generateInterpretativeReading(`Interpret this 3-card Tarot spread: ${cards.join(", ")} representing Past, Present, and Future.`, "Act as a Mystic Tarot Reader.", "gemini-3-flash-preview", language);

/**
 * Structured Data Services
 */
export const generateHoroscope = async (signName: string, language: Language = 'en'): Promise<HoroscopeResponse> => {
  // 1. Try Perplexity first (web-grounded, current-date horoscopes)
  if (hasPerplexityKey()) {
    try {
      return await generateHoroscopeFromPerplexity(signName, language);
    } catch (error: any) {
      console.warn('Perplexity horoscope failed, trying backend:', error?.message);
    }
  }
  // 2. Try backend API
  try {
    const backendResponse = await generateHoroscopeFromBackend(signName, new Date().toISOString().split('T')[0], language);
    const h = backendResponse.horoscope;
    const horoscope = typeof h === 'string' ? h : (typeof h?.general === 'string' ? h.general : (h ? String(h) : 'Horoscope analysis in progress...'));
    return {
      horoscope: horoscope || 'Horoscope analysis in progress...',
      luckyNumber: backendResponse.luckyNumber || Math.floor(Math.random() * 9) + 1,
      luckyColor: backendResponse.luckyColor || 'Gold',
      mood: backendResponse.mood || 'Balanced',
      compatibility: backendResponse.horoscope?.love || ''
    };
  } catch (error: any) {
    console.warn('Backend horoscope failed, using Gemini fallback:', error?.message);
    return await generateHoroscopeDirect(signName, language);
  }
};

  async function generateHoroscopeDirect(signName: string, language: Language = 'en'): Promise<HoroscopeResponse> {
      const today = new Date().toDateString();
      return (async () => {
        const ai = getAI();
      const languageName = getLanguageName(language);
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", 
        contents: `Planetary transits for ${signName} on ${today}. IMPORTANT: Respond in ${languageName} language.
Format the horoscope field with: brief intro, then bullet points (* or -) for Career, Love, Health, Finance. Use **bold** for key words.`,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: MASTER_MENTOR_PROMPT + ` Respond in ${languageName}. Use bullet points and **bold** for emphasis. Deterministic output.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              horoscope: { type: Type.STRING },
              luckyNumber: { type: Type.INTEGER },
              luckyColor: { type: Type.STRING },
              mood: { type: Type.STRING },
              compatibility: { type: Type.STRING }
            }
          }
        }
      });
      try {
      return JSON.parse(response.text!) as HoroscopeResponse;
      } catch (e) {
        return parseJSONFromResponse<HoroscopeResponse>(response.text || "", {
          horoscope: response.text?.substring(0, 500) || "",
      luckyNumber: Math.floor(Math.random() * 9) + 1,
      luckyColor: "Gold",
      mood: "Balanced",
      compatibility: "All signs"
        });
      }
    }
  )();
};

// Helper function to get coordinates from location using Google Geocoding API
const getCoordinates = async (location: string, lat?: number, lon?: number): Promise<{ lat: number, lon: number, timezone: number }> => {
    // If coordinates are already provided, use them
    if (lat !== undefined && lon !== undefined) {
        // Calculate timezone from longitude (approximate)
        // Each 15 degrees of longitude = 1 hour timezone difference
        let timezone = 5.5; // Default to IST
        try {
            // Approximate timezone from longitude
            timezone = Math.round((lon / 15) * 2) / 2; // Round to nearest 0.5
  } catch (e) {
            console.warn("Timezone calculation failed, using default 5.5");
        }
        return { lat, lon, timezone };
    }
    
    // Otherwise, geocode the location using Google Geocoding API
    try {
        const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
        
        if (!GOOGLE_API_KEY) {
            console.warn("Google API key not found, falling back to default coordinates");
            return { lat: 19.0760, lon: 72.8777, timezone: 5.5 };
        }
        
        // Use Google Geocoding API
        const encodedLocation = encodeURIComponent(location);
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${GOOGLE_API_KEY}`;
        
        const response = await fetch(geocodeUrl);
        
        if (!response.ok) {
            throw new Error(`Google Geocoding API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Google Geocoding API response:", data);
        
        if (data.status === 'OK' && data.results && data.results.length > 0) {
            const result = data.results[0];
            const location_data = result.geometry.location;
            const lat = location_data.lat;
            const lon = location_data.lng;
            
            // Get timezone using Google Time Zone API
            let timezone = 5.5; // Default
            try {
                const timestamp = Math.floor(Date.now() / 1000);
                const timezoneUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lon}&timestamp=${timestamp}&key=${GOOGLE_API_KEY}`;
                const tzResponse = await fetch(timezoneUrl);
                if (tzResponse.ok) {
                    const tzData = await tzResponse.json();
                    if (tzData.status === 'OK' && tzData.rawOffset !== undefined) {
                        // Convert rawOffset (seconds) to hours
                        timezone = tzData.rawOffset / 3600;
                    }
                }
            } catch (tzError) {
                console.warn("Timezone API failed, calculating from longitude:", tzError);
                // Fallback: calculate timezone from longitude
                timezone = Math.round((lon / 15) * 2) / 2;
            }
            
            return { lat, lon, timezone };
        } else {
            console.warn("Google Geocoding returned no results:", data.status);
        }
    } catch (e) {
        console.error("Geocoding failed:", e);
    }
    
    // Fallback to default coordinates (Mumbai)
    return { lat: 19.0760, lon: 72.8777, timezone: 5.5 };
};

// Helper function to parse date and time
const parseDateTime = (dateStr: string, timeStr: string, seconds?: number) => {
    const date = new Date(dateStr);
    const [hours, minutes] = timeStr.split(':').map(Number);
    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        date: date.getDate(),
        hours: hours || 0,
        minutes: minutes || 0,
        seconds: seconds !== undefined ? seconds : 0
    };
};

// Planet name mapping from API to our format
const planetNameMap: { [key: string]: string } = {
    'Sun': 'Sun',
    'Moon': 'Moon',
    'Mars': 'Mars',
    'Mercury': 'Mercury',
    'Jupiter': 'Jupiter',
    'Venus': 'Venus',
    'Saturn': 'Saturn',
    'Rahu': 'Rahu',
    'Ketu': 'Ketu',
    'Ascendant': 'Ascendant',
    'Lagna': 'Ascendant'
};

// House meanings in Vedic astrology
const houseMeanings: { [key: number]: { en: string, hi: string } } = {
    1: { en: "Self, personality, health, appearance", hi: "स्वयं, व्यक्तित्व, स्वास्थ्य, रूप" },
    2: { en: "Wealth, family, speech, food", hi: "धन, परिवार, वाणी, भोजन" },
    3: { en: "Siblings, courage, communication, short journeys", hi: "भाई-बहन, साहस, संचार, छोटी यात्राएं" },
    4: { en: "Mother, home, property, education", hi: "माता, घर, संपत्ति, शिक्षा" },
    5: { en: "Children, creativity, intelligence, romance", hi: "संतान, रचनात्मकता, बुद्धि, प्रेम" },
    6: { en: "Health, enemies, debts, service", hi: "स्वास्थ्य, शत्रु, ऋण, सेवा" },
    7: { en: "Marriage, partnerships, spouse, business", hi: "विवाह, साझेदारी, जीवनसाथी, व्यापार" },
    8: { en: "Longevity, transformation, secrets, sudden events", hi: "दीर्घायु, परिवर्तन, रहस्य, अचानक घटनाएं" },
    9: { en: "Father, fortune, spirituality, higher learning", hi: "पिता, भाग्य, आध्यात्मिकता, उच्च शिक्षा" },
    10: { en: "Career, reputation, authority, status", hi: "करियर, प्रतिष्ठा, अधिकार, स्थिति" },
    11: { en: "Gains, income, friends, aspirations", hi: "लाभ, आय, मित्र, आकांक्षाएं" },
    12: { en: "Losses, expenses, spirituality, foreign lands", hi: "हानि, खर्च, आध्यात्मिकता, विदेश" }
};

// Planet characteristics
const planetMeanings: { [key: string]: { en: string, hi: string } } = {
    'Sun': { en: "Authority, ego, father, leadership", hi: "अधिकार, अहंकार, पिता, नेतृत्व" },
    'Moon': { en: "Mind, emotions, mother, public", hi: "मन, भावनाएं, माता, जनता" },
    'Mars': { en: "Energy, courage, aggression, property", hi: "ऊर्जा, साहस, आक्रामकता, संपत्ति" },
    'Mercury': { en: "Intelligence, communication, business, siblings", hi: "बुद्धि, संचार, व्यापार, भाई-बहन" },
    'Jupiter': { en: "Wisdom, fortune, guru, children", hi: "ज्ञान, भाग्य, गुरु, संतान" },
    'Venus': { en: "Love, beauty, marriage, luxury", hi: "प्रेम, सुंदरता, विवाह, विलासिता" },
    'Saturn': { en: "Discipline, delays, karma, longevity", hi: "अनुशासन, देरी, कर्म, दीर्घायु" },
    'Rahu': { en: "Desires, illusions, foreign, sudden gains", hi: "इच्छाएं, भ्रम, विदेशी, अचानक लाभ" },
    'Ketu': { en: "Spirituality, detachment, losses, moksha", hi: "आध्यात्मिकता, वैराग्य, हानि, मोक्ष" }
};

// Generate transit predictions based on actual chart data
const generateTransitPredictions = (
    currentPositions: PlanetaryPosition[],
    kundali: KundaliResponse | null,
    language: Language
): { planet: string; house: number; sign: string; meaning: string }[] => {
    const predictions: { planet: string; house: number; sign: string; meaning: string }[] = [];
    const isHindi = language === 'hi';
    
    if (!currentPositions || currentPositions.length === 0) {
        return predictions;
    }
    
    // Get birth chart planetary positions for comparison
    const birthPlanets: { [key: string]: PlanetaryPosition } = {};
    if (kundali && kundali.charts && kundali.charts.planetaryPositions) {
        kundali.charts.planetaryPositions.forEach(p => {
            birthPlanets[p.planet] = p;
        });
    }
    
    currentPositions.forEach(transitPlanet => {
        if (!transitPlanet.planet || !transitPlanet.house || !transitPlanet.sign) {
            return;
        }
        
        const planetName = transitPlanet.planet;
        const house = transitPlanet.house;
        const sign = transitPlanet.sign;
        const isRetro = transitPlanet.isRetrograde || false;
        const nakshatra = transitPlanet.nakshatra || '';
        
        // Get house meaning
        const houseInfo = houseMeanings[house] || { en: "", hi: "" };
        const planetInfo = planetMeanings[planetName] || { en: "", hi: "" };
        
        // Build prediction based on planet, house, and retrograde status
        let meaning = '';
        
        // Check if planet is in its own house or exaltation
        const ownHouses: { [key: string]: number[] } = {
            'Sun': [5], 'Moon': [4], 'Mars': [1, 8], 'Mercury': [6, 9],
            'Jupiter': [9, 12], 'Venus': [7, 12], 'Saturn': [10, 11]
        };
        const isOwnHouse = ownHouses[planetName]?.includes(house);
        
        // Check if planet is transiting over its birth position
        const birthPlanet = birthPlanets[planetName];
        const isOverBirthPosition = birthPlanet && birthPlanet.house === house;
        
        // Generate specific predictions
        if (isOverBirthPosition) {
            meaning = isHindi 
                ? `${planetName} आपके जन्म चार्ट की स्थिति पर गोचर कर रहा है। यह ${houseInfo.hi} के क्षेत्र को प्रभावित करेगा।`
                : `${planetName} is transiting over your birth position. This will affect ${houseInfo.en}.`;
        } else if (isOwnHouse) {
            meaning = isHindi
                ? `${planetName} अपनी स्वयं की राशि में गोचर कर रहा है, जो ${houseInfo.hi} के लिए शुभ है।`
                : `${planetName} is transiting in its own sign, which is favorable for ${houseInfo.en}.`;
        } else {
            // General prediction based on planet and house combination
            const retroText = isRetro ? (isHindi ? "वक्री" : "retrograde") : "";
            const nakshatraText = nakshatra ? (isHindi ? ` ${nakshatra} नक्षत्र में` : ` in ${nakshatra} nakshatra`) : "";
            
            meaning = isHindi
                ? `${planetName}${retroText ? ` ${retroText}` : ""}${nakshatraText} ${sign} राशि में गोचर कर रहा है और ${houseInfo.hi} (${house}वां भाव) को प्रभावित कर रहा है। ${planetInfo.hi} के क्षेत्र में परिवर्तन देखने को मिल सकते हैं।`
                : `${planetName}${retroText ? ` (${retroText})` : ""}${nakshatraText} is transiting in ${sign} sign, affecting ${houseInfo.en} (${house}th house). Changes may be seen in ${planetInfo.en} areas.`;
        }
        
        // Add retrograde specific effects
        if (isRetro && planetName !== 'Moon') {
            const retroEffect = isHindi
                ? " वक्री ग्रह के कारण इस क्षेत्र में देरी या पुनर्विचार हो सकता है।"
                : " Due to retrograde motion, there may be delays or reconsideration in this area.";
            meaning += retroEffect;
        }
        
        // Special predictions for important planets
        if (planetName === 'Jupiter' && (house === 1 || house === 5 || house === 9)) {
            const jupiterEffect = isHindi
                ? " गुरु का शुभ प्रभाव इस क्षेत्र में लाभकारी होगा।"
                : " Jupiter's auspicious influence will be beneficial in this area.";
            meaning += jupiterEffect;
        }
        
        if (planetName === 'Saturn' && (house === 1 || house === 8 || house === 12)) {
            const saturnEffect = isHindi
                ? " शनि का प्रभाव इस क्षेत्र में चुनौतियां ला सकता है, लेकिन यह आपको मजबूत बनाएगा।"
                : " Saturn's influence may bring challenges in this area, but it will make you stronger.";
            meaning += saturnEffect;
        }
        
        if (planetName === 'Rahu' || planetName === 'Ketu') {
            const nodeEffect = isHindi
                ? " यह ग्रह अचानक परिवर्तन ला सकता है।"
                : " This planet may bring sudden changes.";
            meaning += nodeEffect;
        }
        
        predictions.push({
            planet: planetName,
            house: house,
            sign: sign,
            meaning: meaning
        });
    });
    
    // Sort by house number for better presentation
    predictions.sort((a, b) => a.house - b.house);
    
    return predictions;
};

// Sign name mapping
const signMap: { [key: string]: number } = {
    'Aries': 1, 'Taurus': 2, 'Gemini': 3, 'Cancer': 4,
    'Leo': 5, 'Virgo': 6, 'Libra': 7, 'Scorpio': 8,
    'Sagittarius': 9, 'Capricorn': 10, 'Aquarius': 11, 'Pisces': 12,
    'Mesha': 1, 'Vrishabha': 2, 'Mithuna': 3, 'Karka': 4,
    'Simha': 5, 'Kanya': 6, 'Tula': 7, 'Vrishchika': 8,
    'Dhanu': 9, 'Makara': 10, 'Kumbha': 11, 'Meena': 12
};

const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

// Nakshatra to starting Mahadasha mapping for Vimshottari Dasha
const nakshatraToDashaStart: { [key: string]: string } = {
    'Ashwini': 'Ketu', 'Bharani': 'Venus', 'Krittika': 'Sun', 'Rohini': 'Moon',
    'Mrigashira': 'Mars', 'Ardra': 'Rahu', 'Punarvasu': 'Jupiter', 'Pushya': 'Saturn',
    'Ashlesha': 'Mercury', 'Magha': 'Ketu', 'Purva Phalguni': 'Venus', 'Uttara Phalguni': 'Sun',
    'Hasta': 'Moon', 'Chitra': 'Mars', 'Swati': 'Rahu', 'Vishakha': 'Jupiter',
    'Anuradha': 'Saturn', 'Jyeshtha': 'Mercury', 'Mula': 'Ketu', 'Purva Ashadha': 'Venus',
    'Uttara Ashadha': 'Sun', 'Shravana': 'Moon', 'Dhanishta': 'Mars', 'Shatabhisha': 'Rahu',
    'Purva Bhadrapada': 'Jupiter', 'Uttara Bhadrapada': 'Saturn', 'Revati': 'Mercury',
    // Hindi names
    'अश्विनी': 'Ketu', 'भरणी': 'Venus', 'कृत्तिका': 'Sun', 'रोहिणी': 'Moon',
    'मृगशिरा': 'Mars', 'आर्द्रा': 'Rahu', 'पुनर्वसु': 'Jupiter', 'पुष्य': 'Saturn',
    'आश्लेषा': 'Mercury', 'मघा': 'Ketu', 'पूर्व फाल्गुनी': 'Venus', 'उत्तर फाल्गुनी': 'Sun',
    'हस्त': 'Moon', 'चित्रा': 'Mars', 'स्वाति': 'Rahu', 'विशाखा': 'Jupiter',
    'अनुराधा': 'Saturn', 'ज्येष्ठा': 'Mercury', 'मूल': 'Ketu', 'पूर्व आषाढ़': 'Venus',
    'उत्तर आषाढ़': 'Sun', 'श्रवण': 'Moon', 'धनिष्ठा': 'Mars', 'शतभिषा': 'Rahu',
    'पूर्व भाद्रपद': 'Jupiter', 'उत्तर भाद्रपद': 'Saturn', 'रेवती': 'Mercury'
};

// Vimshottari Dasha periods in years
const dashaPeriods: { [key: string]: number } = {
    'Sun': 6, 'Moon': 10, 'Mars': 7, 'Rahu': 18,
    'Jupiter': 16, 'Saturn': 19, 'Mercury': 17, 'Ketu': 7, 'Venus': 20
};

// Dasha sequence
const dashaSequence = ['Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus'];

/**
 * Calculate Vimshottari Dasha based on Moon's nakshatra and birth date
 */
const calculateVimshottariDasha = (moonNakshatra: string, birthDate: string, birthTime: string): { currentMahadasha: string, antardasha: string, endsAt: string } => {
    // Get starting Mahadasha from nakshatra
    const normalizedNakshatra = moonNakshatra.split('(')[0].trim(); // Remove any parenthetical text
    const startingDasha = nakshatraToDashaStart[normalizedNakshatra] || nakshatraToDashaStart[moonNakshatra] || 'Ketu';
    
    // Parse birth date and time
    const birth = new Date(`${birthDate}T${birthTime}`);
    const now = new Date();
    const yearsSinceBirth = (now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    // Calculate which Mahadasha we're in
    let currentMahadasha = startingDasha;
    let mahadashaStartIndex = dashaSequence.indexOf(startingDasha);
    
    // Calculate elapsed time through all Mahadashas
    let elapsedYears = yearsSinceBirth;
    let currentIndex = mahadashaStartIndex;
    
    while (elapsedYears > 0) {
        const currentDashaPlanet = dashaSequence[currentIndex];
        const dashaDuration = dashaPeriods[currentDashaPlanet];
        
        if (elapsedYears <= dashaDuration) {
            // We're in this Mahadasha
            currentMahadasha = currentDashaPlanet;
            break;
        }
        
        elapsedYears -= dashaDuration;
        currentIndex = (currentIndex + 1) % dashaSequence.length;
    }
    
    // Calculate Antardasha (sub-period within current Mahadasha)
    // Each Antardasha is a fraction of the Mahadasha period
    const mahadashaDuration = dashaPeriods[currentMahadasha];
    const elapsedInMahadasha = elapsedYears;
    const antardashaStartIndex = dashaSequence.indexOf(currentMahadasha);
    
    let antardashaElapsed = elapsedInMahadasha;
    let antardashaIndex = antardashaStartIndex;
    let currentAntardasha = currentMahadasha;
    let currentAntardashaDuration = 0;
    
    // Calculate which Antardasha we're in
    // Each planet's Antardasha duration = (planet's Mahadasha duration / 120) * current mahadasha duration
    // Total of all dasha periods = 120 years (6+10+7+18+16+19+17+7+20 = 120)
    const totalDashaYears = 120;
    
    for (let i = 0; i < dashaSequence.length; i++) {
        const antardashaPlanet = dashaSequence[(antardashaStartIndex + i) % dashaSequence.length];
        // Antardasha duration = (planet's dasha period / 120) * current mahadasha duration
        currentAntardashaDuration = (dashaPeriods[antardashaPlanet] / totalDashaYears) * mahadashaDuration;
        
        if (antardashaElapsed <= currentAntardashaDuration) {
            currentAntardasha = antardashaPlanet;
            break;
        }
        
        antardashaElapsed -= currentAntardashaDuration;
    }
    
    // Calculate when current Antardasha ends
    const remainingAntardashaYears = currentAntardashaDuration - antardashaElapsed;
    const antardashaEndDate = new Date(now.getTime() + remainingAntardashaYears * 365.25 * 24 * 60 * 60 * 1000);
    
    return {
        currentMahadasha,
        antardasha: currentAntardasha,
        endsAt: antardashaEndDate.toISOString()
    };
};

/**
 * Helper: Get sign index and degree within sign from absolute longitude
 */
const rashiFromLongitude = (deg: number): { signIndex: number, degreeInSign: number } => {
    const signIndex = Math.floor(deg / 30); // 0-11
    const degreeInSign = deg % 30;
    return { signIndex, degreeInSign };
};

/**
 * Helper: Get house number (1-12) from absolute longitude using house cusps
 * House cusps array should be in order: [House1_cusp, House2_cusp, ..., House12_cusp]
 */
const houseFromLongitude = (deg: number, houseCusps: number[]): number => {
    if (!houseCusps || houseCusps.length !== 12) {
        return 1; // Fallback if cusps invalid
    }
    
    // Normalize degree to 0-360 range
    let normalizedDeg = deg % 360;
    if (normalizedDeg < 0) normalizedDeg += 360;
    
    for (let i = 0; i < 12; i++) {
        const start = houseCusps[i];
        const end = houseCusps[(i + 1) % 12];
        
        // Case 1: Direct increasing order (no wrap-around)
        // e.g., House 1: 0° to 30°, House 2: 30° to 60°, etc.
        if (start < end) {
            if (normalizedDeg >= start && normalizedDeg < end) {
                return i + 1; // House number (1-12)
            }
        }
        // Case 2: Wrap around 360° (last house wraps from high degree to low degree)
        // e.g., House 12: 330° to 360° (0°), House 1: 0° to 30°
        else if (start > end) {
            // This is the last house (usually House 12) that wraps around
            if (normalizedDeg >= start || normalizedDeg < end) {
                return i + 1; // House number (1-12)
            }
        }
        // Case 3: Equal cusps (shouldn't happen, but handle it)
        else if (start === end) {
            // If cusps are equal, check if degree matches
            if (normalizedDeg === start) {
                return i + 1;
            }
        }
    }
    
    // Fallback: if no match found, return house 1
    return 1;
};

/**
 * Calculate Bhrigu Bindu (BB) - Midpoint between Rahu and Moon (anticlockwise from Rahu to Moon)
 */
const calculateBhriguBindu = (
    moonLongitude: number, 
    rahuLongitude: number, 
    houseCusps: number[]
): { absoluteDegree: number, signIndex: number, degreeInSign: number, house: number } => {
    // BB is the midpoint going anticlockwise from Rahu to Moon
    // If Moon is before Rahu (anticlockwise), we need to add 360 to Moon's longitude
    let moonForCalculation = moonLongitude;
    if (moonLongitude < rahuLongitude) {
        // Moon is anticlockwise from Rahu, add 360 to Moon
        moonForCalculation = moonLongitude + 360;
    }
    
    // Calculate midpoint: (Rahu + Moon_anticlockwise) / 2
    const total = rahuLongitude + moonForCalculation;
    let bbAbsolute = total / 2;
    
    // Normalize to 0-360 range
    if (bbAbsolute >= 360) {
        bbAbsolute = bbAbsolute % 360;
    }
    if (bbAbsolute < 0) {
        bbAbsolute = bbAbsolute + 360;
    }
    
    const { signIndex, degreeInSign } = rashiFromLongitude(bbAbsolute);
    const house = houseFromLongitude(bbAbsolute, houseCusps);
    
    return {
        absoluteDegree: bbAbsolute,
        signIndex,
        degreeInSign,
        house
    };
};

/**
 * Resolve Gulik and Maandi - use provided longitudes or set Maandi = Gulik if missing
 */
const resolveGulikAndMaandi = (
    gulikLongitude: number | null | undefined,
    maandiLongitude: number | null | undefined
): { gulik: number | null, maandi: number | null } => {
    const gulik = gulikLongitude ?? null;
    // If maandi missing → equate with gulik (common practical rule)
    const maandi = maandiLongitude ?? gulik;
    return { gulik, maandi };
};

/**
 * Calculate Gulika and Mandi positions
 */
const calculateGulikAndMandi = (
    gulikLongitude: number | null | undefined,
    maandiLongitude: number | null | undefined,
    houseCusps: number[]
): {
    gulik: { absoluteDegree: number, signIndex: number, degreeInSign: number, house: number } | null,
    maandi: { absoluteDegree: number, signIndex: number, degreeInSign: number, house: number } | null
} => {
    const { gulik, maandi } = resolveGulikAndMaandi(gulikLongitude, maandiLongitude);
    
    let gulikResult = null;
    let maandiResult = null;
    
    if (gulik !== null) {
        const { signIndex, degreeInSign } = rashiFromLongitude(gulik);
        const house = houseFromLongitude(gulik, houseCusps);
        gulikResult = {
            absoluteDegree: gulik,
            signIndex,
            degreeInSign,
            house
        };
    }
    
    if (maandi !== null) {
        const { signIndex, degreeInSign } = rashiFromLongitude(maandi);
        const house = houseFromLongitude(maandi, houseCusps);
        maandiResult = {
            absoluteDegree: maandi,
            signIndex,
            degreeInSign,
            house
        };
    }
    
    return { gulik: gulikResult, maandi: maandiResult };
};

// Import backend service
import { 
  generateKundaliFromBackend,
  generateMuhuratFromBackend,
  generateGocharaFromBackend,
  generateGenericTransitsFromBackend,
  generateHoroscopeFromBackend,
  generatePanchangFromBackend,
  generateMatchmakingFromBackend,
  generateAshtakootaFromBackend,
  generateTarotFromBackend
} from './backendService';

export const generateKundali = async (formData: KundaliFormData, language: Language = 'en'): Promise<KundaliResponse> => {
    try {
        console.log("Generating Kundali via backend API for:", formData.name);
        
        // Use backend API instead of direct astrology API
        const backendResponse = await generateKundaliFromBackend(formData, language);
        
        // Transform backend response to match frontend types
        return transformBackendResponse(backendResponse);
    } catch (error: any) {
        console.error("Backend Kundali generation failed, falling back to direct API:", error);
        
        // Fallback to original implementation if backend fails
        return await generateKundaliDirect(formData, language);
    }
};

/**
 * Transform backend response to match frontend KundaliResponse type
 */
function transformBackendResponse(backendResponse: any): KundaliResponse {
    const raw = backendResponse.predictions || {};
    const predictions: KundaliResponse['predictions'] = {
        general: cleanPredictionText(raw.general) || raw.general || '',
        career: cleanPredictionText(raw.career) || raw.career || '',
        love: cleanPredictionText(raw.love) || raw.love || '',
        health: cleanPredictionText(raw.health) || raw.health || '',
        finance: cleanPredictionText(raw.finance) || raw.finance || '',
        education: cleanPredictionText(raw.education) || raw.education || '',
        family: cleanPredictionText(raw.family) || raw.family || '',
        spirituality: cleanPredictionText(raw.spirituality) || raw.spirituality || '',
    };
    return {
        basicDetails: backendResponse.basicDetails,
        charts: backendResponse.charts,
        panchang: backendResponse.panchang,
        dasha: backendResponse.dasha,
        predictions,
    };
}

/**
 * Fallback: Generate Kundali directly (original implementation)
 */
async function generateKundaliDirect(formData: KundaliFormData, language: Language = 'en'): Promise<KundaliResponse> {
    try {
        console.log("Generating Kundali with astrology API for:", formData.name);
        
        // Get coordinates
        const coords = await getCoordinates(formData.location, formData.lat, formData.lon);
        
        // Parse date and time
        const dt = parseDateTime(formData.date, formData.time, formData.seconds);
        
        // Calculate timezone offset in hours
        let timezone = coords.timezone;
        if (formData.tzone) {
            // Parse timezone string like "Asia/Kolkata" or "GMT+5:30"
            const tzMatch = formData.tzone.match(/([+-]?\d+):?(\d+)?/);
            if (tzMatch) {
                const hours = parseInt(tzMatch[1]) || 0;
                const minutes = parseInt(tzMatch[2] || '0');
                timezone = hours + (minutes / 60);
            }
        }
        
        // Prepare payload for both APIs
        const chartPayload = {
            year: dt.year,
            month: dt.month,
            date: dt.date,
            hours: dt.hours,
            minutes: dt.minutes,
            seconds: dt.seconds,
            latitude: coords.lat,
            longitude: coords.lon,
            timezone: timezone,
            config: {
                observation_point: formData.observationPoint || "topocentric",
                ayanamsha: formData.ayanamsha || "lahiri"
            }
        };
        
        // Call D1 chart URL API (returns URL, not SVG code)
        console.log("Calling D1 Chart URL API with payload:", chartPayload);
        
        const d1ChartResponse = await fetchWithKeyRotation('https://json.freeastrologyapi.com/horoscope-chart-url', {
            method: 'POST',
            body: chartPayload
        });
        
        let d1ChartSvg: string | null = null;
        let d1ChartUrl: string | null = null;
        if (d1ChartResponse.ok) {
            const chartData = await d1ChartResponse.json();
            console.log("D1 Chart URL response:", chartData);
            // Handle different response structures - could be URL or SVG code
            d1ChartUrl = chartData.url || chartData.chart_url || chartData.image_url || chartData.data?.url || null;
            d1ChartSvg = chartData.svg || chartData.svg_code || chartData.chart_svg || chartData.data?.svg || null;
            
            // If we got a URL, fetch the SVG from it
            if (d1ChartUrl && !d1ChartSvg) {
                try {
                    console.log("Fetching SVG from URL:", d1ChartUrl);
                    const svgResponse = await fetch(d1ChartUrl);
                    if (svgResponse.ok) {
                        d1ChartSvg = await svgResponse.text();
                        console.log("Fetched SVG from URL, length:", d1ChartSvg?.length);
                    }
                } catch (e) {
                    console.warn("Failed to fetch SVG from URL:", e);
                }
            }
        } else {
            console.warn("D1 Chart URL API error:", d1ChartResponse.status, await d1ChartResponse.text());
        }
        
        // Call D1 planets API for data
        const d1Payload = {
            year: dt.year,
            month: dt.month,
            date: dt.date,
            hours: dt.hours,
            minutes: dt.minutes,
            seconds: dt.seconds,
            latitude: coords.lat,
            longitude: coords.lon,
            timezone: timezone,
            settings: {
                observation_point: formData.observationPoint || "topocentric",
                ayanamsha: formData.ayanamsha || "lahiri",
                language: formData.language || (language === 'hi' ? 'hi' : 'en')
            }
        };
        
        console.log("Calling D1 Planets API with payload:", d1Payload);
        
        // Try apiastro.com first, fallback to freeastrologyapi (both with key rotation)
        let d1Response = await fetchWithKeyRotation('https://json.apiastro.com/planets/extended', {
            method: 'POST',
            body: d1Payload
        });
        if (!d1Response.ok) {
            console.warn("apiastro.com failed, trying freeastrologyapi.com");
            d1Response = await fetchWithKeyRotation('https://json.freeastrologyapi.com/planets', {
                method: 'POST',
                body: d1Payload
            });
        }
        
        if (!d1Response.ok) {
            throw new Error(`D1 API error: ${d1Response.status} - ${await d1Response.text()}`);
        }
        
        let d1Data = await d1Response.json();
        console.log("D1 API response:", d1Data);
        console.log("D1 API response structure:", JSON.stringify(d1Data, null, 2));
        
        // Handle response wrapper (apiastro.com uses output wrapper)
        if (d1Data.output) {
            d1Data = d1Data.output;
            console.log("Unwrapped D1 data:", d1Data);
        }
        
        console.log("D1 API response keys:", Object.keys(d1Data));
        
        // Call D9 chart API
        const d9Payload = {
            year: dt.year,
            month: dt.month,
            date: dt.date,
            hours: dt.hours,
            minutes: dt.minutes,
            seconds: dt.seconds,
            latitude: coords.lat,
            longitude: coords.lon,
            timezone: timezone,
            config: {
                observation_point: formData.observationPoint || "topocentric",
                ayanamsha: formData.ayanamsha || "lahiri"
            }
        };
        
        console.log("Calling D9 API with payload:", d9Payload);
        
        const d9Response = await fetchWithKeyRotation('https://json.freeastrologyapi.com/navamsa-chart-info', {
            method: 'POST',
            body: d9Payload
        });
        
        let d9Data: any = null;
        if (d9Response.ok) {
            d9Data = await d9Response.json();
            console.log("D9 API response:", d9Data);
            
            // Handle response wrapper (apiastro.com uses output wrapper)
            if (d9Data.output) {
                d9Data = d9Data.output;
                console.log("Unwrapped D9 data:", d9Data);
            }
        } else {
            console.warn("D9 API error:", d9Response.status, await d9Response.text());
        }
        
        // Call D9 chart SVG API
        console.log("Calling D9 Chart SVG API with payload:", d9Payload);
        
        const d9ChartResponse = await fetchWithKeyRotation('https://json.freeastrologyapi.com/navamsa-chart-svg-code', {
            method: 'POST',
            body: d9Payload
        });
        
        let d9ChartSvg: string | null = null;
        if (d9ChartResponse.ok) {
            let d9ChartData = await d9ChartResponse.json();
            console.log("D9 Chart SVG response:", d9ChartData);
            // Handle different response structures
            if (d9ChartData.output) {
                d9ChartData = d9ChartData.output;
            }
            d9ChartSvg = d9ChartData.svg || d9ChartData.svg_code || d9ChartData.chart_svg || d9ChartData.data || d9ChartData.chart || null;
            console.log("D9 Chart SVG extracted, length:", d9ChartSvg?.length);
        } else {
            console.warn("D9 Chart SVG API error:", d9ChartResponse.status, await d9ChartResponse.text());
        }
        
        // Parse D1 data
        const planetaryPositions: PlanetaryPosition[] = [];
        let ascendantSignId = 1;
        let ascendantSign = 'Aries';
        let moonSign = 'Aries';
        let sunSign = 'Aries';
        let moonNakshatra = 'Ashwini';
        
        if (d1Data) {
            // Handle different API response structures
            // Try multiple possible structures
            let planetsData: any = null;
            
            // Check if planets are directly in the response (apiastro.com structure)
            const planetKeys = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu', 'Ascendant'];
            const hasDirectPlanets = planetKeys.some(key => d1Data[key]);
            
            if (hasDirectPlanets) {
                // apiastro.com structure - planets are direct keys
                planetsData = d1Data;
            } else if (d1Data.planets) {
                planetsData = d1Data.planets;
            } else if (d1Data.planet_positions) {
                planetsData = d1Data.planet_positions;
            } else if (d1Data.data && d1Data.data.planets) {
                planetsData = d1Data.data.planets;
            } else if (Array.isArray(d1Data)) {
                // If response is an array of planets
                planetsData = {};
                d1Data.forEach((item: any) => {
                    const planetName = item.planet || item.name || item.planet_name;
                    if (planetName) {
                        planetsData[planetName] = item;
                    }
                });
            } else {
                // Try to find planet-like keys directly in response
                planetsData = {};
                Object.keys(d1Data).forEach(key => {
                    const planetMatch = key.match(/^(sun|moon|mars|mercury|jupiter|venus|saturn|rahu|ketu|ascendant)$/i);
                    if (planetMatch || planetKeys.includes(key)) {
                        planetsData[key] = d1Data[key];
                    }
                });
            }
            
            console.log("Planets data found:", planetsData ? Object.keys(planetsData) : "No planets data");
            console.log("Full planets data:", planetsData);
            
            // Map planets from API response
            const planetOrder = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
            
            planetOrder.forEach(planetName => {
                if (!planetsData) return;
                
                // Try multiple variations of planet name
                const planetData = planetsData[planetName] || 
                                 planetsData[planetName.toLowerCase()] || 
                                 planetsData[planetName.toUpperCase()] || 
                                 planetsData[planetName.charAt(0).toUpperCase() + planetName.slice(1).toLowerCase()] ||
                                 planetsData[`${planetName.toLowerCase()}_position`] ||
                                 planetsData[`${planetName}_position`];
                
                console.log(`Processing ${planetName}:`, planetData);
                
                if (planetData) {
                    // Try multiple field names for sign (apiastro.com uses zodiac_sign_name and current_sign)
                    const signName = planetData.zodiac_sign_name || 
                                   planetData.sign || 
                                   planetData.sign_name || 
                                   planetData.zodiac || 
                                   planetData.rashi || 
                                   'Aries';
                    
                    // Try to get signId from various fields (apiastro.com uses current_sign)
                    let signId = planetData.current_sign;
                    if (!signId || signId < 1 || signId > 12) {
                        signId = signMap[signName] || 
                                planetData.sign_id || 
                                planetData.signId || 
                                (planetData.zodiac_id ? planetData.zodiac_id : (signMap[signName] || 1));
                    }
                    if (!signId || signId < 1 || signId > 12) {
                        signId = 1; // Default to Aries
                    }
                    
                    // Try multiple field names for degree (apiastro.com uses normDegree or fullDegree)
                    const degree = planetData.normDegree !== undefined ? planetData.normDegree.toFixed(2) :
                                  planetData.fullDegree !== undefined ? planetData.fullDegree.toFixed(2) :
                                  planetData.degree || 
                                  planetData.longitude || 
                                  planetData.position || 
                                  planetData.longitude_deg || 
                                  planetData.degrees || 
                                  '0';
                    
                    // Try multiple field names for nakshatra (apiastro.com uses nakshatra_name)
                    const nakshatra = planetData.nakshatra_name || 
                                     planetData.nakshatra || 
                                     planetData.nakshatra_name_english || 
                                     planetData.star || 
                                     '';
                    
                    // Try multiple field names for retrograde (apiastro.com uses isRetro as string "true"/"false")
                    const isRetro = planetData.isRetro === "true" || 
                                   planetData.isRetro === true ||
                                   planetData.is_retrograde === true || 
                                   planetData.retrograde === true || 
                                   planetData.isRetrograde === true || 
                                   planetData.retro === true ||
                                   false;
                    
                    // Get ascendant sign ID (apiastro.com has Ascendant in output with current_sign)
                    let ascId = 1;
                    if (d1Data.Ascendant) {
                        ascId = d1Data.Ascendant.current_sign || 1;
                    } else {
                        const ascData = d1Data.ascendant || d1Data.lagna || d1Data.data?.ascendant || {};
                        const ascSignName = ascData.zodiac_sign_name || ascData.sign || ascData.sign_name || ascData.zodiac || 'Aries';
                        ascId = ascData.current_sign || signMap[ascSignName] || ascData.sign_id || ascData.signId || 1;
                    }
                    if (ascId < 1 || ascId > 12) ascId = 1;
                    
                    // Calculate house relative to ascendant (apiastro.com already provides house_number)
                    const house = planetData.house_number || ((signId - ascId + 12) % 12) + 1;
                    
                    const planetPosition: PlanetaryPosition = {
                        planet: planetName,
                        sign: signNames[signId - 1] || signName,
                        signId: signId,
                        house: house,
                        degree: typeof degree === 'number' ? degree.toFixed(2) : String(degree),
                        nakshatra: nakshatra,
                        isRetrograde: isRetro
                    };
                    
                    planetaryPositions.push(planetPosition);
                    console.log(`Added planet ${planetName}:`, planetPosition);
                    
                    // Extract key information
                    if (planetName === 'Moon') {
                        moonSign = signNames[signId - 1] || signName;
                        moonNakshatra = nakshatra || 'Ashwini';
                        console.log(`Extracted Moon: sign=${moonSign}, nakshatra=${moonNakshatra}, signId=${signId}`);
                    }
                    if (planetName === 'Sun') {
                        sunSign = signNames[signId - 1] || signName;
                        console.log(`Extracted Sun: sign=${sunSign}, signId=${signId}`);
                    }
                } else {
                    console.warn(`Planet ${planetName} not found in API response`);
                }
            });
            
            console.log(`Total planets parsed: ${planetaryPositions.length}`);
            
            // Get ascendant (apiastro.com has Ascendant key with current_sign)
            let ascendantDegree: number | undefined = undefined;
            if (d1Data.Ascendant) {
                ascendantSignId = d1Data.Ascendant.current_sign || 1;
                ascendantSign = d1Data.Ascendant.zodiac_sign_name || signNames[ascendantSignId - 1] || 'Aries';
                // Try to get ascendant degree
                ascendantDegree = d1Data.Ascendant.normDegree || d1Data.Ascendant.fullDegree || 
                                 d1Data.Ascendant.degree || d1Data.Ascendant.longitude || undefined;
                console.log(`Extracted Ascendant from d1Data.Ascendant: sign=${ascendantSign}, signId=${ascendantSignId}, degree=${ascendantDegree}`);
            } else {
                const ascData = d1Data.ascendant || d1Data.lagna || d1Data.data?.ascendant || {};
                if (ascData.zodiac_sign_name || ascData.sign || ascData.sign_name || ascData.zodiac) {
                    ascendantSign = ascData.zodiac_sign_name || ascData.sign || ascData.sign_name || ascData.zodiac || 'Aries';
                    ascendantSignId = ascData.current_sign || signMap[ascendantSign] || ascData.sign_id || ascData.signId || 1;
                    ascendantDegree = ascData.normDegree || ascData.fullDegree || ascData.degree || ascData.longitude || undefined;
                    console.log(`Extracted Ascendant from ascData: sign=${ascendantSign}, signId=${ascendantSignId}, degree=${ascendantDegree}`);
                } else if (d1Data.ascendant_sign_id || d1Data.lagna_sign_id) {
                    ascendantSignId = d1Data.ascendant_sign_id || d1Data.lagna_sign_id || 1;
                    ascendantSign = signNames[ascendantSignId - 1] || 'Aries';
                    console.log(`Extracted Ascendant from d1Data: sign=${ascendantSign}, signId=${ascendantSignId}`);
                }
            }
            if (ascendantSignId < 1 || ascendantSignId > 12) {
                ascendantSignId = 1;
                ascendantSign = 'Aries';
                console.warn(`Invalid ascendantSignId, defaulting to Aries`);
            }
            console.log(`Final basic details: ascendant=${ascendantSign}, moonSign=${moonSign}, sunSign=${sunSign}, nakshatra=${moonNakshatra}`);
        }
        
        // Parse D9 data
        const navamshaPositions: PlanetaryPosition[] = [];
        let navamshaAscendantSignId = 1;
        
        if (d9Data) {
            // Handle D9 response structure (apiastro.com uses indexed objects with name field)
            let planetsData: any = {};
            
            // Check if it's indexed structure (0, 1, 2, etc.)
            if (d9Data['0'] || d9Data['1']) {
                // Indexed structure - convert to named structure
                Object.keys(d9Data).forEach(key => {
                    const item = d9Data[key];
                    if (item && item.name) {
                        planetsData[item.name] = item;
                    }
                });
            } else if (d9Data.planets) {
                planetsData = d9Data.planets;
            } else if (d9Data.planet_positions) {
                planetsData = d9Data.planet_positions;
            } else {
                planetsData = d9Data;
            }
            
            console.log("D9 Planets data:", planetsData);
            
            const planetOrder = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
            
            // Get D9 ascendant (first item with name "Ascendant" or index "0")
            let navAscId = 1;
            if (planetsData['Ascendant']) {
                navAscId = planetsData['Ascendant'].current_sign || 1;
            } else if (d9Data['0'] && d9Data['0'].name === 'Ascendant') {
                navAscId = d9Data['0'].current_sign || 1;
            } else {
                const navAscData = d9Data.ascendant || d9Data.lagna || d9Data.data?.ascendant || {};
                navAscId = navAscData.current_sign || navAscData.sign_id || navAscData.signId || 1;
            }
            navamshaAscendantSignId = navAscId;
            
            planetOrder.forEach(planetName => {
                const planetData = planetsData[planetName] || planetsData[planetName.toLowerCase()];
                if (planetData) {
                    // apiastro.com D9 uses current_sign directly
                    const signId = planetData.current_sign || 
                                 (planetData.sign ? signMap[planetData.sign] : null) ||
                                 planetData.sign_id || 
                                 planetData.signId || 
                                 1;
                    
                    // Ensure signId is valid
                    const validSignId = (signId >= 1 && signId <= 12) ? signId : 1;
                    const signName = signNames[validSignId - 1] || 'Aries';
                    
                    // apiastro.com D9 already provides house_number
                    const house = planetData.house_number || ((validSignId - navAscId + 12) % 12) + 1;
                    
                    navamshaPositions.push({
                        planet: planetName,
                        sign: signName,
                        signId: validSignId,
                        house: house
                    });
                    
                    console.log(`D9 Planet ${planetName}: signId=${validSignId}, house=${house}`);
                }
            });
        }
        
        // Calculate Dasha using proper Vimshottari Dasha calculation
        let dasha = { currentMahadasha: "Ketu", antardasha: "Venus", endsAt: new Date().toISOString(), analysis: "" };
        let panchang = { tithi: "", vara: "", nakshatra: "", yoga: "", karana: "" };
        
        try {
            // Use mathematical calculation instead of AI
            const calculatedDasha = calculateVimshottariDasha(moonNakshatra, formData.date, formData.time);
            dasha = { ...calculatedDasha, analysis: "" };
            console.log("Dasha calculated mathematically:", dasha);
        } catch (e) {
            console.warn("Dasha calculation failed, using defaults:", e);
            // Fallback: try AI if mathematical calculation fails
    try {
        const ai = getAI();
                const dashaPrompt = `Calculate Vimshottari Dasha for birth date: ${formData.date}, time: ${formData.time}, Moon nakshatra: ${moonNakshatra}. Provide current Mahadasha and Antardasha.`;
                const dashaResponse = await ai.models.generateContent({
                    model: "gemini-3-flash-preview",
                    contents: dashaPrompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                currentMahadasha: { type: Type.STRING },
                                antardasha: { type: Type.STRING },
                                endsAt: { type: Type.STRING }
                            }
                        }
                    }
                });
                const dashaData = JSON.parse(dashaResponse.text || "{}");
                dasha = { ...dasha, ...dashaData, analysis: "" };
            } catch (aiError) {
                console.warn("AI Dasha fallback also failed:", aiError);
            }
        }
        
        // Generate comprehensive predictions based on complete chart analysis
        // First, calculate all house positions for use in predictions
        const retroPlanets = planetaryPositions.filter(p => p.isRetrograde).map(p => p.planet);
        const planetsIn10th = planetaryPositions.filter(p => p.house === 10).map(p => p.planet);
        const planetsIn7th = planetaryPositions.filter(p => p.house === 7).map(p => p.planet);
        const planetsIn2nd = planetaryPositions.filter(p => p.house === 2).map(p => p.planet);
        const planetsIn11th = planetaryPositions.filter(p => p.house === 11).map(p => p.planet);
        const planetsIn5th = planetaryPositions.filter(p => p.house === 5).map(p => p.planet);
        const planetsIn9th = planetaryPositions.filter(p => p.house === 9).map(p => p.planet);
        const planetsIn4th = planetaryPositions.filter(p => p.house === 4).map(p => p.planet);
        const planetsIn12th = planetaryPositions.filter(p => p.house === 12).map(p => p.planet);
        const planetsIn6th = planetaryPositions.filter(p => p.house === 6).map(p => p.planet);
        const planetsIn8th = planetaryPositions.filter(p => p.house === 8).map(p => p.planet);
        const planetsIn3rd = planetaryPositions.filter(p => p.house === 3).map(p => p.planet);
        
        let predictions = {
            general: "",
            career: "",
            love: "",
            health: "",
            finance: "",
            education: "",
            family: "",
            spirituality: ""
        };
        
        try {
            const aiInstance = getAI();
            
            // Build detailed planetary positions summary with all details
            const planetarySummary = planetaryPositions.map(p => {
                const retroText = p.isRetrograde ? ' (Retrograde)' : '';
                const degreeText = p.degree ? ` at ${p.degree}°` : '';
                const nakshatraText = p.nakshatra ? ` in ${p.nakshatra} nakshatra` : '';
                return `${p.planet}: ${p.sign} in House ${p.house}${degreeText}${nakshatraText}${retroText}`;
            }).join('\n');
            
            // Build house analysis
            const houseAnalysis = [];
            for (let i = 1; i <= 12; i++) {
                const planetsInHouse = planetaryPositions.filter(p => p.house === i);
                if (planetsInHouse.length > 0) {
                    houseAnalysis.push(`House ${i}: ${planetsInHouse.map(p => p.planet).join(', ')}`);
                }
            }
            
            // Build D9 (Navamsha) summary
            const navamshaSummary = navamshaPositions.length > 0 
                ? navamshaPositions.map(p => `${p.planet}: ${p.sign} (House ${p.house})`).join('\n')
                : 'Not available';
            
            // Identify key planetary combinations
            const retroText = retroPlanets.length > 0 ? `Retrograde planets: ${retroPlanets.join(', ')}` : 'No retrograde planets';
            
            // Build comprehensive prediction prompt
            const predictionsPrompt = `You are an expert Vedic astrologer. Generate detailed, accurate, and specific predictions based on the complete birth chart analysis.

BIRTH DETAILS:
- Name: ${formData.name}
- Date: ${formData.date}, Time: ${formData.time}
- Location: ${formData.location}

BASIC CHART DETAILS:
- Ascendant (Lagna): ${ascendantSign} (Sign ID: ${ascendantSignId}) - This is the 1st house
- Moon Sign (Rashi): ${moonSign} - Emotional nature and mind
- Sun Sign (Surya Rashi): ${sunSign} - Soul purpose and ego
- Moon Nakshatra: ${moonNakshatra} - Birth star

COMPLETE PLANETARY POSITIONS:
${planetarySummary}

HOUSE ANALYSIS:
${houseAnalysis.join('\n')}

KEY PLANETARY COMBINATIONS:
- ${retroText}
- Career House (10th): ${planetsIn10th.length > 0 ? planetsIn10th.join(', ') : 'Empty'}
- Marriage House (7th): ${planetsIn7th.length > 0 ? planetsIn7th.join(', ') : 'Empty'}
- Wealth House (2nd): ${planetsIn2nd.length > 0 ? planetsIn2nd.join(', ') : 'Empty'}
- Gains House (11th): ${planetsIn11th.length > 0 ? planetsIn11th.join(', ') : 'Empty'}
- Education House (5th): ${planetsIn5th.length > 0 ? planetsIn5th.join(', ') : 'Empty'}
- Fortune House (9th): ${planetsIn9th.length > 0 ? planetsIn9th.join(', ') : 'Empty'}
- Mother House (4th): ${planetsIn4th.length > 0 ? planetsIn4th.join(', ') : 'Empty'}
- Moksha House (12th): ${planetsIn12th.length > 0 ? planetsIn12th.join(', ') : 'Empty'}

NAVAMSHA CHART (D9 - Soul Chart):
- Navamsha Ascendant: Sign ID ${navamshaAscendantSignId}
${navamshaSummary}

DASHA (Planetary Periods):
- Current Mahadasha: ${dasha.currentMahadasha || 'Unknown'}
- Current Antardasha: ${dasha.antardasha || 'Unknown'}
${dasha.endsAt ? `- Dasha ends: ${dasha.endsAt}` : ''}

PANCHANG (Birth Day Details):
- Tithi: ${panchang.tithi || 'Unknown'}
- Vara (Weekday): ${panchang.vara || 'Unknown'}
- Nakshatra: ${panchang.nakshatra || moonNakshatra}
- Yoga: ${panchang.yoga || 'Unknown'}
- Karana: ${panchang.karana || 'Unknown'}

VEDIC ASTROLOGY ANALYSIS REQUIRED:
Based on the complete chart analysis above, provide detailed, specific, and actionable predictions in ${getLanguageName(language)}. Use actual planetary positions, house placements, degrees, nakshatras, and retrograde status to make accurate predictions.

1. GENERAL PREDICTIONS (200-300 words): Overall life path, personality traits, strengths, challenges, and key life themes. Consider:
   - Ascendant lord placement and its condition
   - Moon sign and nakshatra (emotional nature, mental state)
   - Sun sign (soul purpose, ego, authority)
   - Planetary aspects and conjunctions
   - House lordships and their placements
   - Retrograde planets and their effects

2. CAREER PREDICTIONS (200-300 words): Professional life, career path, suitable professions, success timing. Analyze:
   - 10th house (career) and planets in it: ${planetsIn10th.join(', ') || 'None'}
   - 10th house lord and its placement
   - 2nd house (wealth) and 11th house (gains) for financial success
   - Dasha influence on career (${dasha.currentMahadasha} Mahadasha)
   - Suitable professions based on planetary combinations
   - Career timing and opportunities

3. LOVE & RELATIONSHIPS (200-300 words): Marriage, partnerships, compatibility, family life. Analyze:
   - 7th house (marriage) and planets in it: ${planetsIn7th.join(', ') || 'None'}
   - 7th house lord and its placement
   - Venus placement (${planetaryPositions.find(p => p.planet === 'Venus')?.sign || 'Unknown'} in House ${planetaryPositions.find(p => p.planet === 'Venus')?.house || 'Unknown'})
   - Moon placement (${moonSign} in House ${planetaryPositions.find(p => p.planet === 'Moon')?.house || 'Unknown'}) for emotional compatibility
   - Jupiter placement for spouse's nature
   - Navamsha chart analysis for marriage timing and spouse characteristics

4. HEALTH PREDICTIONS (200-300 words): Physical and mental well-being, health concerns, remedies. Analyze:
   - 6th house (health) and planets in it
   - 1st house (physical constitution) - Ascendant ${ascendantSign}
   - 8th house (longevity) and planets in it
   - Malefic planets in health-related houses
   - Retrograde planets affecting health: ${retroPlanets.join(', ') || 'None'}
   - Planetary aspects affecting health

5. FINANCE PREDICTIONS (200-300 words): Wealth, income, financial stability, investments. Analyze:
   - 2nd house (wealth) and planets: ${planetsIn2nd.join(', ') || 'None'}
   - 11th house (gains) and planets: ${planetsIn11th.join(', ') || 'None'}
   - 5th house (speculation) and planets: ${planetsIn5th.join(', ') || 'None'}
   - Jupiter and Venus placements (wealth indicators)
   - Dasha influence on finances
   - Financial timing and opportunities

6. EDUCATION PREDICTIONS (150-250 words): Learning, knowledge, academic success. Analyze:
   - 5th house (education) and planets: ${planetsIn5th.join(', ') || 'None'}
   - Mercury placement (intelligence and communication)
   - Jupiter placement (wisdom and higher learning)
   - 9th house (higher education and luck): ${planetsIn9th.join(', ') || 'None'}

7. FAMILY PREDICTIONS (150-250 words): Family relationships, parents, siblings. Analyze:
   - 4th house (mother): ${planetsIn4th.join(', ') || 'None'}
   - 9th house (father): ${planetsIn9th.join(', ') || 'None'}
   - 3rd house (siblings) and planets
   - Moon (mother indicator) and Sun (father indicator) placements

8. SPIRITUALITY PREDICTIONS (150-250 words): Spiritual growth, inner journey, moksha. Analyze:
   - 9th house (dharma and spirituality): ${planetsIn9th.join(', ') || 'None'}
   - 12th house (moksha): ${planetsIn12th.join(', ') || 'None'}
   - Ketu placement (spiritual detachment)
   - Jupiter placement (spiritual wisdom)
   - Ascendant and its spiritual significance

CRITICAL OUTPUT RULES:
- Each JSON field (general, career, love, health, finance, education, family, spirituality) must contain ONLY the narrative prediction text.
- Do NOT include section headers (e.g. "6. EDUCATION PREDICTIONS"), instruction text, analysis checklists, or placeholder phrases like "None", "planets: None", "house and planets: None" in your output.
- Use the degree symbol ° (not &deg;) for angles.
- Write fluent, readable paragraphs. Do not paste the instruction structure into any field.`;

            const predictionsResponse = await aiInstance.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: predictionsPrompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            general: { type: Type.STRING },
                            career: { type: Type.STRING },
                            love: { type: Type.STRING },
                            health: { type: Type.STRING },
                            finance: { type: Type.STRING },
                            education: { type: Type.STRING },
                            family: { type: Type.STRING },
                            spirituality: { type: Type.STRING }
                        }
                    }
                }
            });
            const generatedPredictions = JSON.parse(predictionsResponse.text || "{}");
            const predKeys = ['general', 'career', 'love', 'health', 'finance', 'education', 'family', 'spirituality'] as const;
            for (const key of predKeys) {
              predictions[key] = cleanPredictionText(generatedPredictions[key]) || predictions[key] || '';
            }
            console.log("Comprehensive predictions generated successfully:", predictions);
        } catch (e) {
            console.warn("Predictions generation failed, using basic predictions:", e);
            // Fallback to basic predictions based on chart data
            const venusHouse = planetaryPositions.find(p => p.planet === 'Venus')?.house || 'Unknown';
            const jupiterHouse = planetaryPositions.find(p => p.planet === 'Jupiter')?.house || 'Unknown';
            const marsHouse = planetaryPositions.find(p => p.planet === 'Mars')?.house || 'Unknown';
            
            predictions = {
                general: `Based on your Ascendant ${ascendantSign}, Moon Sign ${moonSign}, and Sun Sign ${sunSign}, you have a unique personality. Your Moon in ${moonSign} (${moonNakshatra} nakshatra) gives you emotional depth and intuition. Your Sun in ${sunSign} indicates strong willpower and determination.`,
                career: `Your career is influenced by planets in the 10th house. ${planetsIn10th.length > 0 ? `With ${planetsIn10th.join(' and ')} in the career house, you have strong professional potential.` : 'Your career house shows potential for growth.'} The current ${dasha.currentMahadasha} Mahadasha will bring career opportunities.`,
                love: `Your relationships are influenced by Venus in House ${venusHouse} and the 7th house. ${planetsIn7th.length > 0 ? `With ${planetsIn7th.join(' and ')} in the marriage house, relationships will be significant.` : 'Your marriage house indicates harmonious partnerships.'}`,
                health: `Your health is influenced by the 6th house and your ascendant ${ascendantSign}. ${retroPlanets.length > 0 ? `Retrograde planets ${retroPlanets.join(', ')} may require attention to health matters.` : 'Your planetary positions indicate good health with proper care.'}`,
                finance: `Your finances are influenced by the 2nd house (${planetsIn2nd.join(', ') || 'wealth indicators'}) and 11th house (${planetsIn11th.join(', ') || 'gains'}). Jupiter in House ${jupiterHouse} brings financial wisdom.`,
                education: `Your education is influenced by the 5th house (${planetsIn5th.join(', ') || 'learning indicators'}) and Mercury's placement. You have good potential for academic success.`,
                family: `Your family life is influenced by the 4th house (${planetsIn4th.join(', ') || 'mother'}) and 9th house (${planetsIn9th.join(', ') || 'father'}). Moon in ${moonSign} indicates strong family bonds.`,
                spirituality: `Your spiritual path is influenced by the 9th house (${planetsIn9th.join(', ') || 'dharma'}) and 12th house (${planetsIn12th.join(', ') || 'moksha'}). You have potential for spiritual growth.`
            };
        }
        
        // Get panchang
        if (d1Data.panchang) {
            panchang = {
                tithi: d1Data.panchang.tithi || d1Data.panchang.tithi_name || "",
                vara: d1Data.panchang.vara || d1Data.panchang.weekday || "",
                nakshatra: d1Data.panchang.nakshatra || d1Data.panchang.nakshatra_name || moonNakshatra,
                yoga: d1Data.panchang.yoga || d1Data.panchang.yoga_name || "",
                karana: d1Data.panchang.karana || d1Data.panchang.karana_name || ""
            };
        }
        
        // D9 chart SVG is already fetched above, no need to fetch again
        
        // Calculate important points (BB, GUL, etc.)
        const importantPoints: ImportantPoint[] = [];
        
        // Extract Moon and Rahu longitudes (absolute degrees 0-360)
        let moonLongitude: number | null = null;
        let rahuLongitude: number | null = null;
        let gulikLongitude: number | null | undefined = undefined;
        let maandiLongitude: number | null | undefined = undefined;
        
        // Find Moon and Rahu in planetary positions
        const moonPlanet = planetaryPositions.find(p => p.planet === 'Moon');
        const rahuPlanet = planetaryPositions.find(p => p.planet === 'Rahu');
        
        if (moonPlanet) {
            // Convert sign + degree to absolute longitude
            const moonSignId = moonPlanet.signId || 1;
            const moonDegree = parseFloat(moonPlanet.degree || '0');
            moonLongitude = ((moonSignId - 1) * 30) + moonDegree;
        }
        
        if (rahuPlanet) {
            // Convert sign + degree to absolute longitude
            const rahuSignId = rahuPlanet.signId || 1;
            const rahuDegree = parseFloat(rahuPlanet.degree || '0');
            rahuLongitude = ((rahuSignId - 1) * 30) + rahuDegree;
        }
        
        // Try to get Gulik and Maandi from API response if available
        if (d1Data.Gulika || d1Data.gulika || d1Data.gulik) {
            const gulikData = d1Data.Gulika || d1Data.gulika || d1Data.gulik;
            gulikLongitude = gulikData.longitude || gulikData.fullDegree || gulikData.normDegree || 
                            (gulikData.current_sign && gulikData.degree ? ((gulikData.current_sign - 1) * 30 + parseFloat(gulikData.degree)) : null);
        }
        
        if (d1Data.Maandi || d1Data.maandi || d1Data.mandi) {
            const maandiData = d1Data.Maandi || d1Data.maandi || d1Data.mandi;
            maandiLongitude = maandiData.longitude || maandiData.fullDegree || maandiData.normDegree || 
                             (maandiData.current_sign && maandiData.degree ? ((maandiData.current_sign - 1) * 30 + parseFloat(maandiData.degree)) : null);
        }
        
        // Get house cusps (house boundaries in absolute degrees)
        // House cusps must be in order: House 1, House 2, ..., House 12 (ascending)
        let houseCusps: number[] = [];
        if (d1Data.house_cusps && Array.isArray(d1Data.house_cusps) && d1Data.house_cusps.length === 12) {
            houseCusps = d1Data.house_cusps;
            // Ensure cusps are in ascending order (1-12)
            // If first cusp > last cusp, they might be in reverse order, so reverse them
            if (houseCusps[0] > houseCusps[11]) {
                // Cusps are in reverse order (12-1), reverse to get 1-12
                houseCusps = [...houseCusps].reverse();
            }
        } else if (d1Data.cusps && Array.isArray(d1Data.cusps) && d1Data.cusps.length === 12) {
            houseCusps = d1Data.cusps;
            // Ensure cusps are in ascending order (1-12)
            if (houseCusps[0] > houseCusps[11]) {
                houseCusps = [...houseCusps].reverse();
            }
        } else {
            // Calculate house cusps from ascendant degree
            // House 1 starts at ascendant, then each subsequent house is +30 degrees
            let ascendantAbsoluteDegree = 0;
        if (d1Data.Ascendant) {
                const ascDegree = d1Data.Ascendant.normDegree || d1Data.Ascendant.fullDegree || 
                                 d1Data.Ascendant.degree || d1Data.Ascendant.longitude || 0;
                const ascSignId = d1Data.Ascendant.current_sign || ascendantSignId || 1;
                ascendantAbsoluteDegree = ((ascSignId - 1) * 30) + parseFloat(String(ascDegree));
        } else {
            const ascData = d1Data.ascendant || d1Data.lagna || d1Data.data?.ascendant || {};
                const ascDegree = ascData.normDegree || ascData.fullDegree || ascData.degree || ascData.longitude || 0;
                const ascSignId = ascData.current_sign || ascendantSignId || 1;
                ascendantAbsoluteDegree = ((ascSignId - 1) * 30) + parseFloat(String(ascDegree));
            }
            // Calculate house cusps in order 1-12 (ascending)
            // houseCusps[0] = House 1 start (ascendant)
            // houseCusps[1] = House 2 start
            // ...
            // houseCusps[11] = House 12 start
            for (let i = 0; i < 12; i++) {
                houseCusps.push((ascendantAbsoluteDegree + (i * 30)) % 360);
            }
        }
        
        // Calculate BB (Bhrigu Bindu) - midpoint from Rahu to Moon (anticlockwise)
        if (moonLongitude !== null && rahuLongitude !== null) {
            const bb = calculateBhriguBindu(moonLongitude, rahuLongitude, houseCusps);
            const bbSign = signNames[bb.signIndex] || 'Aries';
        importantPoints.push({
            name: 'BB (Bhrigu Bindu)',
            nameHi: 'भृगु बिंदु',
            sign: bbSign,
                signId: bb.signIndex + 1,
                house: bb.house,
                degree: bb.degreeInSign.toFixed(2),
                description: 'Midpoint from Rahu to Moon (anticlockwise), represents the native\'s self and personality'
            });
        }
        
        // Calculate Gulik and Maandi
        // NOTE: Temporarily hidden from display as calculation logic needs correction
        // const { gulik, maandi } = calculateGulikAndMandi(gulikLongitude, maandiLongitude, houseCusps);
        
        // if (gulik) {
        //     const gulSign = signNames[gulik.signIndex] || 'Aries';
        //     importantPoints.push({
        //         name: 'GUL (Gulika)',
        //         nameHi: 'गुलिका',
        //         sign: gulSign,
        //         signId: gulik.signIndex + 1,
        //         house: gulik.house,
        //         degree: gulik.degreeInSign.toFixed(2),
        //         description: 'Malefic point indicating obstacles and challenges'
        //     });
        // }
        
        // if (maandi) {
        //     const mandiSign = signNames[maandi.signIndex] || 'Aries';
        //     importantPoints.push({
        //         name: 'Mandi',
        //         nameHi: 'मंडी',
        //         sign: mandiSign,
        //         signId: maandi.signIndex + 1,
        //         house: maandi.house,
        //         degree: maandi.degreeInSign.toFixed(2),
        //         description: 'Upagraha indicating delays and obstacles'
        //     });
        // }
        
        const result: KundaliResponse = {
            basicDetails: {
                ascendant: ascendantSign,
                ascendantSignId: ascendantSignId,
                moonSign: moonSign,
                sunSign: sunSign,
                nakshatra: moonNakshatra,
                name: formData.name
            },
            panchang: panchang,
            charts: {
                planetaryPositions: planetaryPositions,
                navamshaPositions: navamshaPositions,
                navamshaAscendantSignId: navamshaAscendantSignId,
                d1ChartSvg: d1ChartSvg || undefined,
                d9ChartSvg: d9ChartSvg || undefined,
                importantPoints: importantPoints
            },
            dasha: dasha,
            predictions: predictions
        };
        
            console.log("Final Kundali result:", result);
            console.log("Planetary positions count:", result.charts.planetaryPositions.length);
            console.log("Planetary positions:", JSON.stringify(result.charts.planetaryPositions, null, 2));
            console.log("Ascendant Sign ID:", result.basicDetails.ascendantSignId);
            
            // Validate that all planets have signId
            result.charts.planetaryPositions.forEach(p => {
                if (!p.signId || p.signId < 1 || p.signId > 12) {
                    console.error(`Invalid signId for planet ${p.planet}:`, p);
                }
            });
            
        return result;
        
    } catch (error: any) {
        console.error("Kundali generation error:", error);
        // Fallback to Gemini if API fails
        return await (async () => {
                const aiInstance = getAI();
                const response = await aiInstance.models.generateContent({
          model: "gemini-3-pro-preview", 
                    contents: `Calculate Vedic Kundali for ${formData.name}, ${formData.date}, ${formData.time}, ${formData.location}. Language: ${language}.`,
          config: {
            tools: [{ googleSearch: {} }],
            systemInstruction: MASTER_MENTOR_PROMPT,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                basicDetails: { type: Type.OBJECT, properties: { ascendant: { type: Type.STRING }, ascendantSignId: { type: Type.INTEGER }, moonSign: { type: Type.STRING }, sunSign: { type: Type.STRING }, nakshatra: { type: Type.STRING } } },
                panchang: { type: Type.OBJECT, properties: { tithi: { type: Type.STRING }, vara: { type: Type.STRING } } },
                charts: { type: Type.OBJECT, properties: { planetaryPositions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { planet: { type: Type.STRING }, signId: { type: Type.INTEGER }, house: { type: Type.INTEGER } } } }, navamshaPositions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { planet: { type: Type.STRING }, signId: { type: Type.INTEGER }, house: { type: Type.INTEGER } } } }, navamshaAscendantSignId: { type: Type.INTEGER } } },
                dasha: { type: Type.OBJECT, properties: { currentMahadasha: { type: Type.STRING }, antardasha: { type: Type.STRING } } },
                predictions: { type: Type.OBJECT, properties: { general: { type: Type.STRING }, career: { type: Type.STRING }, love: { type: Type.STRING }, health: { type: Type.STRING } } }
              }
            }
          }
        });
                const parsed = JSON.parse(response.text || "{}") as KundaliResponse;
                if (parsed.basicDetails) {
                    parsed.basicDetails.name = formData.name;
                }
                return parsed;
            }
        )();
    }
};

export const generateDailyPanchang = async (location: string, language: Language): Promise<DailyPanchangResponse> => {
    try {
        // Use backend API first
        const today = new Date().toISOString().split('T')[0];
        const backendResponse = await generatePanchangFromBackend(today, location, language);
        
        console.log("Backend panchang response:", {
            hasData: !!backendResponse,
            responseKeys: Object.keys(backendResponse || {})
        });
        
        if (backendResponse && backendResponse.date) {
            // Transform backend response to match DailyPanchangResponse structure
            const transformed: DailyPanchangResponse = {
                date: backendResponse.date || new Date().toDateString(),
                location: backendResponse.location || location,
                sunrise: backendResponse.sunrise || "06:00 AM",
                sunset: backendResponse.sunset || "06:00 PM",
                moonrise: backendResponse.moonrise || "12:00 PM",
                tithi: typeof backendResponse.tithi === 'object' 
                    ? backendResponse.tithi 
                    : { name: backendResponse.tithi || "Shukla Paksha", endTime: backendResponse.tithiEndTime || "12:00 PM" },
                nakshatra: typeof backendResponse.nakshatra === 'object'
                    ? backendResponse.nakshatra
                    : { name: backendResponse.nakshatra || "Rohini", endTime: backendResponse.nakshatraEndTime || "12:00 PM" },
                yoga: typeof backendResponse.yoga === 'object'
                    ? backendResponse.yoga
                    : { name: backendResponse.yoga || "Vajra", endTime: backendResponse.yogaEndTime || "12:00 PM" },
                karana: typeof backendResponse.karana === 'object'
                    ? backendResponse.karana
                    : { name: backendResponse.karana || "Bava", endTime: backendResponse.karanaEndTime || "12:00 PM" },
                rahuKalam: backendResponse.rahuKalam || "10:30 AM - 12:00 PM",
                yamaganda: backendResponse.yamaganda || "03:00 PM - 04:30 PM",
                abhijitMuhurat: backendResponse.abhijitMuhurat || "11:45 AM - 12:30 PM"
            };
            
            console.log("Returning transformed panchang data");
            return transformed;
        }
        
        // If backend returns empty, return default panchang
        console.warn("Backend returned empty panchang, returning default");
        return getDefaultPanchang(location, language);
    } catch (error: any) {
        console.error('Backend panchang failed:', error);
        // Return default panchang instead of trying fallback
        return getDefaultPanchang(location, language);
    }
};

/**
 * Get default panchang when API fails
 */
function getDefaultPanchang(location: string, language: Language): DailyPanchangResponse {
    return {
        date: new Date().toDateString(),
        location: location,
        sunrise: "06:00 AM",
        sunset: "06:00 PM",
        moonrise: "12:00 PM",
        tithi: { name: language === 'hi' ? "शुक्ल पक्ष" : "Shukla Paksha", endTime: "12:00 PM" },
        nakshatra: { name: language === 'hi' ? "रोहिणी" : "Rohini", endTime: "12:00 PM" },
        yoga: { name: language === 'hi' ? "वज्र" : "Vajra", endTime: "12:00 PM" },
        karana: { name: language === 'hi' ? "बव" : "Bava", endTime: "12:00 PM" },
        rahuKalam: "10:30 AM - 12:00 PM",
        yamaganda: "03:00 PM - 04:30 PM",
        abhijitMuhurat: "11:45 AM - 12:30 PM"
    };
}

export const generateMuhuratPlanner = async (location: string, language: Language, date?: string, activity: string = 'general'): Promise<MuhuratItem[]> => {
    try {
        // Use backend API first
        const selectedDate = date || new Date().toISOString().split('T')[0];
        console.log("Generating muhurat for date:", selectedDate, "location:", location, "activity:", activity);
        const backendResponse = await generateMuhuratFromBackend(selectedDate, location, activity, language);
        
        console.log("Backend muhurat response:", {
            hasMuhurats: !!backendResponse.muhurats,
            muhuratsLength: backendResponse.muhurats?.length || 0,
            responseKeys: Object.keys(backendResponse)
        });
        
        if (backendResponse.muhurats && Array.isArray(backendResponse.muhurats) && backendResponse.muhurats.length > 0) {
            console.log("Backend returned", backendResponse.muhurats.length, "muhurats");
            console.log("Sample muhurat:", backendResponse.muhurats[0]);
            
            const mapped = backendResponse.muhurats.map((m: any) => ({
                activity: m.activity || 'General Activity',
                status: m.status || 'Good',
                timeRange: m.timeRange || '10:00 - 12:00',
                reason: m.reason || 'Auspicious time based on Panchang'
            }));
            
            // Check if times are dynamic (not fixed defaults)
            const hasDynamicTimes = mapped.some((m: MuhuratItem) => {
                const timeRange = m.timeRange || '';
                // Check if it's not one of the fixed default times
                return !timeRange.includes('05:00 - 07:00') && 
                       !timeRange.includes('09:00 - 11:00') &&
                       !timeRange.includes('11:45 AM - 12:30 PM');
            });
            
            if (hasDynamicTimes) {
                console.log("✅ Using REAL muhurat data from backend API");
            } else {
                console.warn("⚠️ Backend returned muhurats but times appear to be defaults");
            }
            
            console.log("Returning", mapped.length, "muhurats from backend");
            return mapped;
        }
        
        // If backend returns empty, return default muhurats instead of falling back
        console.warn("⚠️ Backend returned empty muhurats, returning default muhurats");
        console.warn("This means the backend API may not be running or panchang API failed");
        return getDefaultMuhurats(language);
    } catch (error: any) {
        console.error('Backend muhurat failed:', error);
        // Return default muhurats instead of trying fallback
        return getDefaultMuhurats(language);
    }
};

/**
 * Get default muhurats when API fails
 */
function getDefaultMuhurats(language: Language): MuhuratItem[] {
    const isHindi = language === 'hi';
    return [
        {
            activity: isHindi ? 'सामान्य कार्य' : 'General Activity',
            status: 'Excellent',
            timeRange: '11:45 AM - 12:30 PM',
            reason: isHindi 
                ? 'अभिजीत मुहूर्त - सबसे शुभ समय'
                : 'Abhijit Muhurat - Most auspicious time'
        },
        {
            activity: isHindi ? 'सामान्य कार्य' : 'General Activity',
            status: 'Excellent',
            timeRange: '05:00 - 07:00',
            reason: isHindi 
                ? 'ब्रह्म मुहूर्त - सुबह का सबसे शुभ समय'
                : 'Brahma Muhurat - Most auspicious morning time'
        },
        {
            activity: isHindi ? 'सामान्य कार्य' : 'General Activity',
            status: 'Good',
            timeRange: '09:00 - 11:00',
            reason: isHindi 
                ? 'सुबह का शुभ समय'
                : 'Auspicious morning time'
        },
        {
            activity: isHindi ? 'विवाह' : 'Marriage',
            status: 'Excellent',
            timeRange: '11:45 AM - 12:30 PM',
            reason: isHindi 
                ? 'विवाह के लिए सबसे शुभ समय'
                : 'Most auspicious time for marriage'
        },
        {
            activity: isHindi ? 'व्यापार शुरू करना' : 'Starting Business',
            status: 'Good',
            timeRange: '10:00 - 12:00',
            reason: isHindi 
                ? 'व्यापार शुरू करने के लिए शुभ समय'
                : 'Auspicious time to start business'
        }
    ];
}

async function generateMuhuratPlannerDirect(location: string, language: Language): Promise<MuhuratItem[]> {
return (async () => {
        const ai = getAI();
            console.log("Calling Gemini API for Muhurat Planner...", { location, language });
        
        const requestParams = {
                model: "gemini-3-flash-preview",
            contents: `Auspicious Muhurat timings for today in ${location}. Language: ${language}.`,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: { 
                    type: Type.ARRAY, 
                    items: { 
                        type: Type.OBJECT, 
                        properties: { 
                            activity: { type: Type.STRING }, 
                            status: { type: Type.STRING }, 
                            timeRange: { type: Type.STRING },
                            reason: { type: Type.STRING }
                        } 
                    } 
                }
            }
        };
        
        const response = await ai.models.generateContent(requestParams);
        
        const text = response.text;
        if (!text) {
                throw new Error("No response text from API");
            }
            
            try {
                const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
                    throw new Error("API did not return an array");
        }
        console.log("Successfully parsed", parsed.length, "muhurat items");
        return parsed;
            } catch (parseError) {
                console.error("Failed to parse JSON response. Text was:", text);
                throw new Error("Invalid JSON response from API: " + text.substring(0, 200));
            }
        }
    )();
};

/**
 * Multimedia & Interactive Services
 */
export const generateMantraAudio = async (mantraText: string): Promise<string> => {
    return (async () => {
    try {
            console.log("Generating mantra audio for:", mantraText.substring(0, 50));
            const ai = getAI();
        
        // Try different TTS model names and API structures
        const attempts = [
            {
                model: "gemini-2.0-flash",
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
                    }
                }
            },
            {
            model: "gemini-2.5-flash-preview-tts",
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
                }
            }
            },
            {
                model: "gemini-2.0-flash",
                config: {
                    responseModalities: [Modality.AUDIO]
                }
            }
        ];
        
        let lastError: any = null;
        
        for (const attempt of attempts) {
            try {
                console.log(`Trying TTS with model: ${attempt.model}`);
                const response = await ai.models.generateContent({
                    model: attempt.model,
                    contents: [{ parts: [{ text: `Speak slowly and clearly with a spiritual, meditative tone. Pronounce each syllable distinctly: ${mantraText}` }] }],
                    config: attempt.config
                });
                
                console.log("TTS Response received:", {
                    hasCandidates: !!response.candidates,
                    candidatesCount: response.candidates?.length,
                    fullResponse: JSON.stringify(response, null, 2).substring(0, 500)
                });
                
                // Try multiple ways to extract audio
                if (response.candidates && response.candidates.length > 0) {
                    const candidate = response.candidates[0];
                    
                    // Method 1: Check content.parts
                    if (candidate.content?.parts) {
                        for (const part of candidate.content.parts) {
                            const partAny = part as any;
                            if (partAny.inlineData) {
                                const mimeType = partAny.inlineData.mimeType?.toLowerCase() || '';
                                if (mimeType.includes('audio')) {
                                    console.log("Found audio in content.parts, mimeType:", mimeType);
                                    const audioData = partAny.inlineData.data;
                                    if (audioData) {
                                        return audioData;
                                    }
                                }
                            }
                        }
                    }
                    
                    // Method 2: Check parts directly
                    if ((candidate as any).parts) {
                        for (const part of (candidate as any).parts) {
                            if (part.inlineData?.mimeType?.includes('audio')) {
                                console.log("Found audio in candidate.parts");
                                return part.inlineData.data;
                            }
                        }
                    }
                    
                    // Method 3: Check all properties
                    const candidateStr = JSON.stringify(candidate);
                    if (candidateStr.includes('audio') || candidateStr.includes('inlineData')) {
                        console.log("Audio-related data found in candidate, inspecting...");
                        console.log("Candidate structure:", Object.keys(candidate));
                    }
                }
                
                // Check response.data if available
                if ((response as any).data) {
                    console.log("Checking response.data...");
                    const dataStr = JSON.stringify((response as any).data);
                    if (dataStr.includes('audio')) {
                        console.log("Audio found in response.data");
                    }
                }
                
                throw new Error(`Model ${attempt.model} returned no audio data in expected format`);
            } catch (modelError: any) {
                console.error(`Attempt with ${attempt.model} failed:`, {
                    message: modelError?.message,
                    status: modelError?.status,
                    code: modelError?.code,
                    error: modelError
                });
                lastError = modelError;
                continue; // Try next attempt
            }
        }
        
        // If all attempts failed, use browser TTS as fallback
        console.warn("Gemini TTS failed, using browser TTS fallback");
        return "BROWSER_TTS_FALLBACK"; // Special marker for browser TTS
        
    } catch (e: any) {
        console.error("Mantra audio generation error:", e);
        console.error("Error details:", {
            message: e?.message,
            status: e?.status,
            code: e?.code,
            name: e?.name,
            stack: e?.stack?.substring(0, 500)
        });
        
        // Use browser TTS as fallback
        console.warn("Falling back to browser TTS");
        return "BROWSER_TTS_FALLBACK";
    }
        }
    )();
};

export const generateMysticReading = async (base64Image: string, features: string[], mode: 'face' | 'object', language: Language): Promise<string> => {
    return (async () => {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { 
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                    { text: `Esoterically analyze this ${mode} looking for: ${features.join(", ")}. Language: ${language}.` }
                ] 
            },
            config: { systemInstruction: MASTER_MENTOR_PROMPT + " Act as a Mystic Seer." }
        });
        return response.text || "";
        }
    )();
};

export const generateCosmicArt = async (prompt: string, language: Language): Promise<string> => {
    return (async () => {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: `Mystical Cosmic Vedic artwork representing: ${prompt}. Cinematic, detailed, spiritual.` }] }
        });
        if (response.candidates && response.candidates[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return "";
    }
    )();
};

export const generateStoryImage = async (target: string, story: string): Promise<string> => {
    return (async () => {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: `Historical Vedic illustration of ${target}. Intricate temple art style.` }] }
        });
        if (response.candidates && response.candidates[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return "";
    }
    )();
};

/**
 * Chat and Fallback Services - with mentor tone and persona support
 */
export const createChatSession = (language: Language, context?: string, persona: AstrologerPersona = 'general') => {
    const ai = getAI();
    const languageName = getLanguageName(language);
    const contextInfo = context ? `\n\nUser's Birth Chart Context: ${context}` : '';
    const personaPrompt = PERSONA_PROMPTS[persona];
    return ai.chats.create({
        model: "gemini-2.0-flash", 
        config: { 
            systemInstruction: `${personaPrompt}\n\n${COMPREHENSIVE_AI_PROMPT}${contextInfo}\n\nIMPORTANT: Always respond in ${languageName} language. Be warm, helpful, and provide practical remedies. Use a mentor-like, human tone.` 
        }
    });
};

export const askRishiWithFallback = async (prompt: string, language: Language, context?: string, persona: AstrologerPersona = 'general') => {
    // 1. Try backend proxy (Render, etc.)
    try {
        return await askRishiFromBackend(prompt, language, context, persona);
    } catch (backendErr: any) {
        const msg = backendErr?.message || '';
        const isBackendUnreachable = msg.includes('Backend not available') || msg.includes('Failed to fetch') || msg.includes('NetworkError');
        const isBackendError = msg.includes('Ask Rishi API error') || msg.includes('503') || msg.includes('500');
        if (isBackendUnreachable || isBackendError) {
            // Fall through to direct call (backend down or API key missing on server)
        } else {
            throw backendErr;
        }
    }

    // 2. Fallback: direct Gemini call (works when backend is down or returns 503/500)
    try {
        const ai = getAI();
        const contextInfo = context ? `\n\nUser's Birth Chart Context: ${context}` : '';
        const personaPrompt = PERSONA_PROMPTS[persona];
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: `${context ? "Context: " + context + "\n" : ""}User: ${prompt}.`,
            config: { 
                tools: [{ googleSearch: {} }],
                systemInstruction: `${personaPrompt}\n\n${COMPREHENSIVE_AI_PROMPT}${contextInfo}\n\nSearch the web if needed. IMPORTANT: Always respond in ${getLanguageName(language)} language. Be warm, mentor-like, and provide practical guidance.`
            }
        });
        return { 
            text: response.text || "The cosmic library is currently undergoing maintenance. Please try again soon.", 
            sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
                title: chunk.web?.title || "Celestial Source",
                uri: chunk.web?.uri || "#"
            })) || []
        };
    } catch (e: any) {
        const msg = e?.message || String(e);
        console.warn('[askRishiWithFallback] Direct Gemini fallback failed:', msg);
        return {
            text: "I couldn’t connect right now—please check your internet and try again in a moment. If you’re on a spotty connection, waiting a few seconds and asking again usually helps. 🙏",
            sources: []
        };
    }
};

// New Service: Astro Riddles
export const generateAstroRiddles = async (language: Language): Promise<any[]> => {
    return (async () => {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Create 3 mysterious riddles about Vedic signs or planets. Language: ${language}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            riddle: { type: Type.STRING },
                            answer: { type: Type.STRING },
                            clue: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
        }
    )();
};

// ... remaining stubs for compatibility features
export const generateMatchMaking = async (boy: MatchMakingInput, girl: MatchMakingInput, language: Language): Promise<MatchMakingResponse> => {
    try {
        // Use backend API
        const backendResponse = await generateMatchmakingFromBackend(boy, girl, language);
        return {
            ashtakoot_score: backendResponse.ashtakoot_score,
            conclusion: backendResponse.conclusion
        };
    } catch (error: any) {
        console.error('Backend matchmaking failed, using fallback:', error);
        // Fallback to original implementation
        return await generateMatchMakingDirect(boy, girl, language);
    }
};

async function generateMatchMakingDirect(boy: MatchMakingInput, girl: MatchMakingInput, language: Language): Promise<MatchMakingResponse> {
return (async () => {
        const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Guna Milan for Boy: ${JSON.stringify(boy)}, Girl: ${JSON.stringify(girl)}. Language: ${language}.`,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    ashtakoot_score: { type: Type.OBJECT, properties: { total: { type: Type.OBJECT, properties: { obtained_points: { type: Type.NUMBER } } } } },
                    conclusion: { type: Type.OBJECT, properties: { status: { type: Type.BOOLEAN }, report: { type: Type.STRING } } }
                }
            }
        }
    });
    return JSON.parse(response.text || "{}");
        }
    )();
};

export const generateCompatibilityReport = async (boy: MatchMakingInput, girl: MatchMakingInput, score: number, language: Language): Promise<string> => 
    generateInterpretativeReading(`Compatibility report for ${boy.name} and ${girl.name} with score ${score}/36. Language: ${language}.`, "Expert Vedic Matchmaker.");

export const generateNumerologyReport = async (name: string, lp: number, destiny: number, soulUrge: number, personality: number, birthday: number, language: Language): Promise<NumerologyResponse> => {
return (async () => {
        const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Interpret Numerology: ${name}, LifePath ${lp}. Language: ${language}.`,
        config: { 
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    lifePath: { type: Type.OBJECT, properties: { number: { type: Type.NUMBER }, description: { type: Type.STRING } } },
                    destiny: { type: Type.OBJECT, properties: { number: { type: Type.NUMBER }, description: { type: Type.STRING } } },
                    soulUrge: { type: Type.OBJECT, properties: { number: { type: Type.NUMBER }, description: { type: Type.STRING } } },
                    personality: { type: Type.OBJECT, properties: { number: { type: Type.NUMBER }, description: { type: Type.STRING } } },
                    birthday: { type: Type.OBJECT, properties: { number: { type: Type.NUMBER }, description: { type: Type.STRING } } },
                    dailyForecast: { type: Type.STRING }
                }
            }
        }
    });
    return JSON.parse(response.text!);
        }
    )();
};

export const generateAstroQuiz = async (language: Language): Promise<any[]> => {
return (async () => {
        const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Create 5 Vedic Astrology quiz questions. Language: ${language}.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctIndex: { type: Type.NUMBER },
                        explanation: { type: Type.STRING }
                    }
                }
            }
        }
    });
    return JSON.parse(response.text || "[]");
        }
    )();
};

export const generatePersonalTransits = async (kundali: KundaliResponse, language: Language): Promise<TransitResponse> => {
    try {
        // Extract birth details from kundali
        const birthDate = kundali.basicDetails?.name ? '1990-01-01' : '1990-01-01'; // Need to get from form data
        const birthTime = '12:00';
        const birthLocation = 'New Delhi, India';
        
        // Use backend API for Gochara
        const backendResponse = await generateGocharaFromBackend(
            birthDate,
            birthTime,
            birthLocation,
            null,
            language
        );
        
        // Transform backend response to TransitResponse format
        return {
            currentPositions: backendResponse.currentPositions || [],
            personalImpact: generateTransitPredictions(backendResponse.currentPositions || [], null, language)
        };
    } catch (error: any) {
        console.error('Backend transits failed, using fallback:', error);
        // Fallback to original implementation
        return await generatePersonalTransitsDirect(kundali, language);
    }
};

async function generatePersonalTransitsDirect(kundali: KundaliResponse, language: Language): Promise<TransitResponse> {
return (async () => {
        const ai = getAI();
            const ascendantSignId = kundali.basicDetails.ascendantSignId || 1;
            const ascendant = kundali.basicDetails.ascendant || "Aries";
            
            const prompt = `Calculate CURRENT planetary transits (Gochara) for TODAY's date and time. 
Birth Chart Details:
- Ascendant (Lagna): ${ascendant} (Sign ID: ${ascendantSignId})
- Moon Sign: ${kundali.basicDetails.moonSign || "Unknown"}
- Sun Sign: ${kundali.basicDetails.sunSign || "Unknown"}

Calculate:
1. Current positions of all 9 planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu) in today's sky
2. IMPORTANT: Moon moves ~13 degrees per day, so use TODAY's exact Moon position, not yesterday's or tomorrow's
3. For each planet, provide: planet name, current sign, signId (1-12), house number relative to birth ascendant, degree, nakshatra, retrograde status
4. House calculation: If ascendant is signId ${ascendantSignId}, then signId ${ascendantSignId} = House 1, signId ${(ascendantSignId % 12) + 1} = House 2, etc.
5. Personal impact: How each planet's current transit affects the native based on which house it's transiting

CRITICAL: Moon's current position must be accurate for TODAY. Moon is never retrograde. Use real-time astronomical data.
Language: ${language}.`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
                contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                            currentPositions: { 
                                type: Type.ARRAY, 
                                items: { 
                                    type: Type.OBJECT, 
                                    properties: { 
                                        planet: { type: Type.STRING }, 
                                        sign: { type: Type.STRING }, 
                                        signId: { type: Type.INTEGER }, 
                                        house: { type: Type.INTEGER }, 
                                        isRetrograde: { type: Type.BOOLEAN }, 
                                        nakshatra: { type: Type.STRING }, 
                                        degree: { type: Type.STRING } 
                                    } 
                                } 
                            },
                            personalImpact: { 
                                type: Type.ARRAY, 
                                items: { 
                                    type: Type.OBJECT, 
                                    properties: { 
                                        planet: { type: Type.STRING }, 
                                        house: { type: Type.INTEGER }, 
                                        sign: { type: Type.STRING }, 
                                        meaning: { type: Type.STRING } 
                                    } 
                                } 
                            }
                }
            }
        }
    });
            
            const parsed = JSON.parse(response.text || "{}");
            
            // Post-process: Ensure all planets are included and houses are calculated correctly
            if (parsed.currentPositions && Array.isArray(parsed.currentPositions)) {
                const signMap: { [key: string]: number } = {
                    'Aries': 1, 'Taurus': 2, 'Gemini': 3, 'Cancer': 4,
                    'Leo': 5, 'Virgo': 6, 'Libra': 7, 'Scorpio': 8,
                    'Sagittarius': 9, 'Capricorn': 10, 'Aquarius': 11, 'Pisces': 12
                };
                
                parsed.currentPositions = parsed.currentPositions.map((p: any) => {
                    // Special handling for Moon - ensure it's never marked as retrograde
                    if (p.planet && p.planet.toLowerCase().includes('moon')) {
                        p.isRetrograde = false; // Moon is never retrograde
                    }
                    
                    // Ensure sign name is present
                    if (!p.sign && p.signId) {
                        const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
                        p.sign = signNames[p.signId - 1] || 'Aries';
                    }
                    
                    // Ensure signId is valid (1-12)
                    if (!p.signId || p.signId < 1 || p.signId > 12) {
                        if (p.sign && signMap[p.sign]) {
                            p.signId = signMap[p.sign];
                        } else {
                            p.signId = 1; // Default to Aries
                            p.sign = 'Aries';
                        }
                    }
                    
                    // Calculate house if missing or incorrect
                    if (!p.house || p.house < 1 || p.house > 12) {
                        if (p.signId && ascendantSignId) {
                            p.house = ((p.signId - ascendantSignId + 12) % 12) + 1;
                        }
                    }
                    
                    return p;
                });
                
                // Validate Moon is present and has correct data
                const moonPlanet = parsed.currentPositions.find((p: any) => 
                    p.planet && p.planet.toLowerCase().includes('moon')
                );
                
                if (!moonPlanet) {
                    console.warn("Moon not found in transit data, this is critical!");
                } else {
                    console.log("Moon transit position:", moonPlanet);
                    // Double-check Moon's house calculation
                    if (moonPlanet.signId && ascendantSignId) {
                        const correctHouse = ((moonPlanet.signId - ascendantSignId + 12) % 12) + 1;
                        if (moonPlanet.house !== correctHouse) {
                            console.warn(`Moon house mismatch: calculated ${correctHouse}, got ${moonPlanet.house}. Fixing...`);
                            moonPlanet.house = correctHouse;
                        }
                    }
                }
            }
            
            return parsed;
        }
    )();
};

export const generateGenericTransits = async (location: string, rashi: string, language: Language): Promise<TransitResponse> => {
    console.log("Starting generateGenericTransits for:", { location, rashi, language });
    
    // Try to get real planetary positions from backend API first
    try {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        // Use the new generic transits endpoint (no API key needed)
        const backendResponse = await generateGenericTransitsFromBackend(
            location,
            rashi,
            todayStr,
            language
        );
        
        if (backendResponse && backendResponse.currentPositions && Array.isArray(backendResponse.currentPositions) && backendResponse.currentPositions.length > 0) {
            console.log("Using backend API for current planetary positions");
            
            // Find signId for the reference rashi
            const signMap: { [key: string]: number } = {
                'Aries': 1, 'Taurus': 2, 'Gemini': 3, 'Cancer': 4,
                'Leo': 5, 'Virgo': 6, 'Libra': 7, 'Scorpio': 8,
                'Sagittarius': 9, 'Capricorn': 10, 'Aquarius': 11, 'Pisces': 12
            };
            const referenceSignId = signMap[rashi] || 1;
            
            // Process backend positions: recalculate houses relative to reference rashi
            const processedPositions = backendResponse.currentPositions.map((p: any) => {
                // Ensure we have signId
                if (!p.signId && p.sign) {
                    p.signId = signMap[p.sign] || 1;
                }
                if (!p.sign && p.signId) {
                    const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
                    p.sign = signNames[(p.signId - 1) || 0] || 'Aries';
                }
                
                // Recalculate house relative to reference rashi (not birth ascendant)
                if (p.signId) {
                    p.house = ((p.signId - referenceSignId + 12) % 12) + 1;
                }
                
                // Ensure Moon is never retrograde
                if (p.planet && p.planet.toLowerCase().includes('moon')) {
                    p.isRetrograde = false;
                }
                
                return p;
            });
            
            // Generate impact predictions
            const personalImpact = generateTransitPredictions(processedPositions, null, language);
            
            return {
                currentPositions: processedPositions,
                personalImpact: personalImpact
            };
        }
    } catch (backendError: any) {
        console.warn("Backend API failed for generic transits:", backendError);
        
        // Check if backend error is due to network/connection issues
        const isNetworkError = backendError?.message?.includes("Failed to fetch") || 
                              backendError?.message?.includes("network") ||
                              backendError?.code === "ECONNREFUSED" ||
                              backendError?.code === "ETIMEDOUT";
        
        if (isNetworkError) {
            console.log("Backend network error detected, will try Perplexity then Gemini fallback");
        } else {
            console.log("Backend returned an error, will try Perplexity then Gemini fallback");
        }
    }

    // Try Perplexity fallback (before Gemini) when API key is available
    if (hasPerplexityKey()) {
        try {
            console.log("Trying Perplexity for generic transits...");
            const perplexityResponse = await generateGenericTransitsFromPerplexity(location, rashi, language);
            if (perplexityResponse?.currentPositions?.length > 0) {
                const signMap: { [key: string]: number } = {
                    'Aries': 1, 'Taurus': 2, 'Gemini': 3, 'Cancer': 4,
                    'Leo': 5, 'Virgo': 6, 'Libra': 7, 'Scorpio': 8,
                    'Sagittarius': 9, 'Capricorn': 10, 'Aquarius': 11, 'Pisces': 12
                };
                const referenceSignId = signMap[rashi] || 1;
                const processedPositions = perplexityResponse.currentPositions.map((p: any) => {
                    if (!p.signId && p.sign) p.signId = signMap[p.sign] || 1;
                    if (!p.sign && p.signId) {
                        const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
                        p.sign = signNames[(p.signId - 1) || 0] || 'Aries';
                    }
                    if (p.signId) p.house = ((p.signId - referenceSignId + 12) % 12) + 1;
                    if (p.planet && p.planet.toLowerCase().includes('moon')) p.isRetrograde = false;
                    return p;
                });
                const personalImpact = generateTransitPredictions(processedPositions, null, language);
                console.log("Using Perplexity for transit data");
                return { currentPositions: processedPositions, personalImpact };
            }
        } catch (perplexityError: any) {
            console.warn("Perplexity fallback failed for generic transits:", perplexityError);
        }
    }
    
    // Fallback to Gemini-generated transits (only if backend and Perplexity failed)
    try {
        return await (async () => {
            const ai = getAI();
            if (!ai) {
                throw new Error("AI service not available");
            }
            
            // Find signId for the reference rashi
            const signMap: { [key: string]: number } = {
                'Aries': 1, 'Taurus': 2, 'Gemini': 3, 'Cancer': 4,
                'Leo': 5, 'Virgo': 6, 'Libra': 7, 'Scorpio': 8,
                'Sagittarius': 9, 'Capricorn': 10, 'Aquarius': 11, 'Pisces': 12
            };
            const referenceSignId = signMap[rashi] || 1;
            
            const prompt = `Calculate CURRENT planetary transits (Gochara) for TODAY's date and time at location: ${location}.
Reference Moon Sign: ${rashi} (Sign ID: ${referenceSignId})

Calculate:
1. Current positions of all 9 planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu) in today's sky
2. IMPORTANT: Moon moves ~13 degrees per day, so use TODAY's exact Moon position. Moon is NEVER retrograde.
3. For each planet, provide: planet name, current sign, signId (1-12), house number relative to reference sign ${rashi}, degree, nakshatra, retrograde status
4. House calculation: If reference sign is ${rashi} (signId ${referenceSignId}), then signId ${referenceSignId} = House 1, signId ${(referenceSignId % 12) + 1} = House 2, etc.
5. General impact: How each planet's current transit affects people with ${rashi} moon sign

CRITICAL: Moon's current position must be accurate for TODAY. Use real-time astronomical data.
Language: ${language}.`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
                contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                            currentPositions: { 
                                type: Type.ARRAY, 
                                items: { 
                                    type: Type.OBJECT, 
                                    properties: { 
                                        planet: { type: Type.STRING }, 
                                        sign: { type: Type.STRING }, 
                                        signId: { type: Type.INTEGER }, 
                                        house: { type: Type.INTEGER }, 
                                        isRetrograde: { type: Type.BOOLEAN }, 
                                        nakshatra: { type: Type.STRING }, 
                                        degree: { type: Type.STRING } 
                                    } 
                                } 
                            },
                            personalImpact: { 
                                type: Type.ARRAY, 
                                items: { 
                                    type: Type.OBJECT, 
                                    properties: { 
                                        planet: { type: Type.STRING }, 
                                        house: { type: Type.INTEGER }, 
                                        sign: { type: Type.STRING }, 
                                        meaning: { type: Type.STRING } 
                                    } 
                                } 
                            }
                }
            }
        }
    });
            
            let parsed: any;
            try {
                parsed = JSON.parse(response.text || "{}");
            } catch (_) {
                throw new Error("We couldn't load transit data right now. Please try again in a moment.");
            }
            
            // Post-process: Calculate houses correctly and ensure all planets have correct data
            if (parsed.currentPositions && Array.isArray(parsed.currentPositions)) {
                // Ensure we have all 9 planets
                const requiredPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
                const existingPlanets = new Set(parsed.currentPositions.map((p: any) => p.planet));
                const missingPlanets = requiredPlanets.filter(p => !existingPlanets.has(p));
                
                if (missingPlanets.length > 0) {
                    console.warn("Missing planets in transit data:", missingPlanets);
                }
                
                parsed.currentPositions = parsed.currentPositions.map((p: any) => {
                    // Normalize planet name
                    const planetName = p.planet || '';
                    if (!planetName) {
                        console.warn("Planet without name found:", p);
                        return null;
                    }
                    
                    // Special handling for Moon - ensure it's never marked as retrograde
                    if (planetName.toLowerCase().includes('moon')) {
                        p.isRetrograde = false; // Moon is never retrograde
                    }
                    
                    // Ensure signId is valid (1-12) - this is critical for chart display
                    if (!p.signId || p.signId < 1 || p.signId > 12) {
                        // Try to get signId from sign name
                        if (p.sign && signMap[p.sign]) {
                            p.signId = signMap[p.sign];
                        } else {
                            console.warn(`Invalid signId for ${planetName}:`, p.signId, "sign:", p.sign);
                            // Default to Aries if we can't determine
                            p.signId = 1;
                            p.sign = 'Aries';
                        }
                    }
                    
                    // Ensure sign name is present and matches signId
                    if (!p.sign || signMap[p.sign] !== p.signId) {
                        const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
                        p.sign = signNames[p.signId - 1] || 'Aries';
                    }
                    
                    // Calculate house relative to reference rashi (moon sign)
                    // This is important for the transit interpretation
                    if (p.signId) {
                        p.house = ((p.signId - referenceSignId + 12) % 12) + 1;
                    } else {
                        p.house = 1; // Fallback
                    }
                    
                    // Ensure degree is a string
                    if (p.degree === undefined || p.degree === null) {
                        p.degree = '0.00';
                    } else if (typeof p.degree === 'number') {
                        p.degree = p.degree.toFixed(2);
                    }
                    
                    // Ensure nakshatra is present
                    if (!p.nakshatra) {
                        p.nakshatra = '';
                    }
                    
                    return p;
                }).filter((p: any) => p !== null); // Remove any null entries
                
                // Validate Moon is present and has correct data
                const moonPlanet = parsed.currentPositions.find((p: any) => 
                    p.planet && p.planet.toLowerCase().includes('moon')
                );
                
                if (!moonPlanet) {
                    console.warn("Moon not found in generic transit data!");
                } else {
                    console.log("Moon transit position (generic):", moonPlanet);
                    // Double-check Moon's house calculation
                    if (moonPlanet.signId) {
                        const correctHouse = ((moonPlanet.signId - referenceSignId + 12) % 12) + 1;
                        if (moonPlanet.house !== correctHouse) {
                            console.warn(`Moon house mismatch: calculated ${correctHouse}, got ${moonPlanet.house}. Fixing...`);
                            moonPlanet.house = correctHouse;
                        }
                    }
                }
            }
            
            // Validate that we have data
            if (!parsed || !parsed.currentPositions || !Array.isArray(parsed.currentPositions) || parsed.currentPositions.length === 0) {
                console.error("No planetary positions returned from Gemini API");
                throw new Error("No planetary positions returned from API");
            }
            
            console.log("Successfully generated transit data with", parsed.currentPositions.length, "planets");
            return parsed;
        }
        )();
    } catch (geminiError: any) {
        // If both backend and Gemini failed, provide a helpful error message
        const errorMessage = geminiError?.message || geminiError?.error?.message || JSON.stringify(geminiError);
        const isQuotaError = errorMessage?.includes("quota") || 
                            errorMessage?.includes("exceeded") ||
                            errorMessage?.includes("429") ||
                            errorMessage?.includes("RESOURCE_EXHAUSTED");
        
        if (isQuotaError) {
            throw new Error("Cosmic is busy aligning the stars. Please try again after some time.");
        }
        
        const raw = errorMessage || '';
        if (raw.includes('JSON') || raw.includes('position') || raw.includes('Unexpected token') || raw.includes('Expected')) {
          throw new Error("We couldn't load transit data right now. Please try again in a moment.");
        }
        throw new Error("We couldn't load transit data right now. Please try again later.");
    }
};

export const getAstroDetails = async (person: MatchMakingInput): Promise<{sign: string, nakshatra: string}> => {
return (async () => {
        const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Identify Moon Sign and Nakshatra for: ${JSON.stringify(person)}.`,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: { type: Type.OBJECT, properties: { sign: { type: Type.STRING }, nakshatra: { type: Type.STRING } } }
        }
    });
    return JSON.parse(response.text || "{}");
        }
    )();
};

export const generateTripleCompatibility = async (personA: any, personB: any, language: Language): Promise<any> => {
return (async () => {
        const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Triple compatibility between: ${JSON.stringify(personA)} and ${JSON.stringify(personB)}. Language: ${language}.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    overallScore: { type: Type.NUMBER },
                    numerologyScore: { type: Type.NUMBER },
                    nakshatraScore: { type: Type.NUMBER },
                    signScore: { type: Type.NUMBER },
                    report: { type: Type.STRING }
                }
            }
        }
    });
    return JSON.parse(response.text || "{}");
        }
    )();
};
