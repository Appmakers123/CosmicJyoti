// Language name mapping for AI prompts
const LANGUAGE_NAMES = {
  'en': 'English',
  'hi': 'Hindi',
};

const getLanguageName = (lang) => {
  return LANGUAGE_NAMES[lang] || 'English';
};

const getLanguageInstruction = (lang) => {
  const langName = getLanguageName(lang);
  if (lang === 'hi') {
    return 'सभी उत्तर हिंदी में दें।';
  }
  return `Provide all answers in ${langName}.`;
};

/**
 * Generate AI-based predictions using expert astrologer knowledge
 */
export async function generatePredictions(kundaliData, language = 'en', genAI) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
    const languageName = getLanguageName(language);

    // Build comprehensive chart analysis prompt
    const chartAnalysis = buildChartAnalysis(kundaliData);
    
    const prompt = `You are an expert Vedic astrologer with 30+ years of experience in consulting and guiding people. You have deep knowledge of:
- Planetary positions and their effects
- House significations and their meanings
- Dasha (planetary periods) and their impacts
- Nakshatra influences
- Yogas and planetary combinations
- Remedies and guidance for life challenges

Based on the following complete birth chart analysis, provide detailed, accurate, and compassionate predictions. Be specific, practical, and helpful. Your guidance should help the person understand their life path and make better decisions.

${chartAnalysis}

Provide predictions in the following categories (each should be 150-250 words, detailed and specific):

1. GENERAL LIFE: Overall life path, personality traits, strengths, challenges, and general guidance
2. CAREER: Professional life, career opportunities, best fields, timing for career moves, obstacles
3. LOVE & RELATIONSHIPS: Marriage, relationships, compatibility, timing for relationships, relationship challenges
4. HEALTH: Health patterns, areas of concern, preventive measures, wellness guidance
5. FINANCE: Financial prospects, wealth accumulation, investment guidance, financial challenges
6. EDUCATION: Learning abilities, educational opportunities, best fields of study, academic success
7. FAMILY: Family relationships, parents, siblings, family harmony, family responsibilities
8. SPIRITUALITY: Spiritual growth, inner journey, meditation, spiritual practices, moksha

IMPORTANT: Provide all answers in ${languageName} language. ${getLanguageInstruction(language)}

Format your response as JSON with these exact keys: general, career, love, health, finance, education, family, spirituality`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    let predictions;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;
      predictions = JSON.parse(jsonText);
    } catch (parseError) {
      console.warn('Failed to parse JSON, trying to extract manually:', parseError);
      predictions = extractPredictionsFromText(text);
    }

    // Ensure all required fields exist
    return {
      general: predictions.general || 'Analysis in progress...',
      career: predictions.career || 'Career analysis in progress...',
      love: predictions.love || 'Relationship analysis in progress...',
      health: predictions.health || 'Health analysis in progress...',
      finance: predictions.finance || 'Finance analysis in progress...',
      education: predictions.education || 'Education analysis in progress...',
      family: predictions.family || 'Family analysis in progress...',
      spirituality: predictions.spirituality || 'Spirituality analysis in progress...'
    };
  } catch (error) {
    console.error('Prediction generation error:', error);
    throw new Error(`Failed to generate predictions: ${error.message}`);
  }
}

/**
 * Build comprehensive chart analysis text
 */
function buildChartAnalysis(kundaliData) {
  const { basicDetails, charts, dasha, panchang } = kundaliData;
  
  let analysis = `BIRTH DETAILS:\n`;
  analysis += `- Name: ${basicDetails.name}\n`;
  analysis += `- Ascendant (Lagna): ${basicDetails.ascendant} (Sign ID: ${basicDetails.ascendantSignId}) - This is the 1st house\n`;
  analysis += `- Moon Sign (Rashi): ${basicDetails.moonSign} - Emotional nature and mind\n`;
  analysis += `- Sun Sign (Surya Rashi): ${basicDetails.sunSign} - Soul purpose and ego\n`;
  analysis += `- Moon Nakshatra: ${basicDetails.nakshatra} - Birth star\n\n`;

  analysis += `PLANETARY POSITIONS:\n`;
  if (charts.planetaryPositions && charts.planetaryPositions.length > 0) {
    charts.planetaryPositions.forEach(planet => {
      analysis += `- ${planet.planet}: ${planet.sign} in House ${planet.house} at ${planet.degree}°`;
      if (planet.nakshatra) analysis += ` (${planet.nakshatra} nakshatra)`;
      if (planet.isRetrograde) analysis += ` [RETROGRADE]`;
      analysis += `\n`;
    });
  }
  analysis += `\n`;

  analysis += `HOUSE ANALYSIS:\n`;
  for (let i = 1; i <= 12; i++) {
    const planetsInHouse = charts.planetaryPositions?.filter(p => p.house === i) || [];
    if (planetsInHouse.length > 0) {
      analysis += `- House ${i}: ${planetsInHouse.map(p => p.planet).join(', ')}\n`;
    }
  }
  analysis += `\n`;

  if (charts.navamshaPositions && charts.navamshaPositions.length > 0) {
    analysis += `NAVAMSHA CHART (D9 - Soul Chart):\n`;
    analysis += `- Navamsha Ascendant: Sign ID ${charts.navamshaAscendantSignId}\n`;
    charts.navamshaPositions.forEach(planet => {
      analysis += `- ${planet.planet}: ${planet.sign} (House ${planet.house})\n`;
    });
    analysis += `\n`;
  }

  if (dasha) {
    analysis += `DASHA (Planetary Periods):\n`;
    analysis += `- Current Mahadasha: ${dasha.currentMahadasha || 'Unknown'}\n`;
    analysis += `- Current Antardasha: ${dasha.antardasha || 'Unknown'}\n`;
    if (dasha.endsAt) analysis += `- Dasha ends: ${dasha.endsAt}\n`;
    analysis += `\n`;
  }

  if (panchang) {
    analysis += `PANCHANG (Birth Day Details):\n`;
    if (panchang.tithi) analysis += `- Tithi: ${panchang.tithi}\n`;
    if (panchang.vara) analysis += `- Vara (Weekday): ${panchang.vara}\n`;
    if (panchang.nakshatra) analysis += `- Nakshatra: ${panchang.nakshatra}\n`;
    if (panchang.yoga) analysis += `- Yoga: ${panchang.yoga}\n`;
    if (panchang.karana) analysis += `- Karana: ${panchang.karana}\n`;
    analysis += `\n`;
  }

  if (charts.importantPoints && charts.importantPoints.length > 0) {
    analysis += `IMPORTANT POINTS:\n`;
    charts.importantPoints.forEach(point => {
      analysis += `- ${point.name}: House ${point.house}, ${point.sign}\n`;
    });
    analysis += `\n`;
  }

  return analysis;
}

/**
 * Extract predictions from text if JSON parsing fails
 */
function extractPredictionsFromText(text) {
  const predictions = {
    general: '',
    career: '',
    love: '',
    health: '',
    finance: '',
    education: '',
    family: '',
    spirituality: ''
  };

  const categories = ['general', 'career', 'love', 'health', 'finance', 'education', 'family', 'spirituality'];
  
  categories.forEach(category => {
    const regex = new RegExp(`${category}[\\s:]*([\\s\\S]*?)(?=${categories.find(c => c !== category)}|$)`, 'i');
    const match = text.match(regex);
    if (match) {
      predictions[category] = match[1].trim();
    }
  });

  return predictions;
}
