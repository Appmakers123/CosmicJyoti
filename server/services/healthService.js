/**
 * Cosmic Health - Vedic astrology-based health analysis
 * Uses birth chart to suggest dosha remedies and health guidance
 */
const getLanguageName = (lang) => (lang === 'hi' ? 'Hindi' : 'English');

function getDefaultRemedies(language) {
  if (language === 'hi') {
    return [
      { dosha: 'वात दोष', description: 'वात दोष असंतुलन के लिए उपाय', remedies: ['गर्म तेल से मालिश करें', 'गर्म और पौष्टिक भोजन लें', 'नियमित दिनचर्या बनाए रखें', 'तुलसी और अदरक की चाय पिएं'] },
      { dosha: 'पित्त दोष', description: 'पित्त दोष असंतुलन के लिए उपाय', remedies: ['ठंडे पेय पदार्थ पिएं', 'मीठे और कड़वे खाद्य पदार्थ लें', 'तनाव कम करें', 'चंदन का उपयोग करें'] },
      { dosha: 'कफ दोष', description: 'कफ दोष असंतुलन के लिए उपाय', remedies: ['हल्का और गर्म भोजन लें', 'नियमित व्यायाम करें', 'अदरक और काली मिर्च का सेवन करें', 'गर्म पानी पिएं'] },
    ];
  }
  return [
    { dosha: 'Vata Dosha', description: 'Remedies for Vata dosha imbalance', remedies: ['Warm oil massage', 'Eat warm and nourishing foods', 'Maintain regular routine', 'Drink tulsi and ginger tea'] },
    { dosha: 'Pitta Dosha', description: 'Remedies for Pitta dosha imbalance', remedies: ['Drink cool beverages', 'Eat sweet and bitter foods', 'Reduce stress', 'Use sandalwood'] },
    { dosha: 'Kapha Dosha', description: 'Remedies for Kapha dosha imbalance', remedies: ['Eat light and warm foods', 'Exercise regularly', 'Consume ginger and black pepper', 'Drink warm water'] },
  ];
}

const HEALTH_SYSTEM_PROMPT = `You are CosmicHealth AI, an expert Vedic astrology-based health advisor. Analyze birth charts and suggest remedies.
Respond in the requested language. Return ONLY valid JSON.`;

/**
 * Generate chart-based health analysis
 */
export async function generateChartBasedHealthAnalysis(kundaliData, birthData, language = 'en', genAI) {
  if (!genAI) {
    return {
      healthIssues: [],
      chartSummary: language === 'hi' ? 'चार्ट विश्लेषण उपलब्ध नहीं' : 'Chart analysis unavailable',
      remedies: getDefaultRemedies(language),
    };
  }

  try {
    const bd = kundaliData.basicDetails || {};
    const pp = kundaliData.charts?.planetaryPositions || [];
    const dasha = kundaliData.dasha || {};
    const healthPred = kundaliData.predictions?.health || '';

    const chartContext = `
BIRTH CHART DATA:
- Ascendant: ${bd.ascendant || '-'}
- Moon Sign: ${bd.moonSign || '-'}
- Sun Sign: ${bd.sunSign || '-'}
- Nakshatra: ${bd.nakshatra || '-'}
- Current Dasha: ${dasha.currentMahadasha || '-'} / ${dasha.antardasha || '-'}
- Birth: ${birthData.date} ${birthData.time}, ${birthData.city}

PLANETARY POSITIONS (House = health area):
${pp.map((p) => `- ${p.planet} in ${p.sign} (House ${p.house})${p.isRetrograde ? ' [Retrograde]' : ''}${p.nakshatra ? `, Nakshatra: ${p.nakshatra}` : ''}`).join('\n')}

EXISTING HEALTH PREDICTION: ${healthPred}
`;

    const prompt = `Based on the Vedic birth chart above, analyze and return a JSON object with:
1. healthIssues: array of 3-6 specific health issues or vulnerabilities this person may face based on their chart (e.g., "Digestive issues due to Mars in 6th house", "Stress/anxiety from Moon placement", "Bone/joint concerns from Saturn"). Be specific to the chart.
2. chartSummary: 2-3 sentence summary of health indicators in the chart.
3. remedies: array of objects, each with { dosha: string (e.g., "Vata imbalance" or planet name), description: string (brief), remedies: string[] (3-5 actionable items) }.

Respond ONLY with valid JSON. Language: ${getLanguageName(language)}.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
    const fullPrompt = HEALTH_SYSTEM_PROMPT + '\n\n' + chartContext + '\n\n' + prompt;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      return {
        healthIssues: [],
        chartSummary: language === 'hi' ? 'चार्ट विश्लेषण उपलब्ध नहीं' : 'Chart analysis unavailable',
        remedies: getDefaultRemedies(language),
      };
    }

    let jsonText = text;
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch) jsonText = jsonMatch[1];
    const parsed = JSON.parse(jsonText.trim());
    return {
      healthIssues: Array.isArray(parsed.healthIssues) ? parsed.healthIssues : [],
      chartSummary: parsed.chartSummary || '',
      remedies: Array.isArray(parsed.remedies) && parsed.remedies.length > 0 ? parsed.remedies : getDefaultRemedies(language),
    };
  } catch (e) {
    console.warn('Health analysis failed:', e);
    return {
      healthIssues: [],
      chartSummary: language === 'hi' ? 'चार्ट विश्लेषण उपलब्ध नहीं' : 'Chart analysis unavailable',
      remedies: getDefaultRemedies(language),
    };
  }
}
