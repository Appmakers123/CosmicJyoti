import axios from 'axios';
import { postWithKeyRotation } from '../utils/astrologyApiKeys.js';

const ASTROLOGY_API_BASE = process.env.ASTROLOGY_API_BASE_URL || 'https://json.freeastrologyapi.com';

/**
 * Generate Matchmaking (Guna Milan) report
 */
export async function generateMatchmaking(boy, girl, language = 'en') {
  try {
    // Get birth details for both
    const boyCoords = await getCoordinates(boy.location);
    const girlCoords = await getCoordinates(girl.location);
    
    const boyDt = parseDateTime(boy.date, boy.time);
    const girlDt = parseDateTime(girl.date, girl.time);

    // Get planetary positions for both (with key rotation)
    const [boyResponse, girlResponse] = await Promise.all([
      postWithKeyRotation(axios, `${ASTROLOGY_API_BASE}/planets`, {
        year: boyDt.year,
        month: boyDt.month,
        date: boyDt.date,
        hours: boyDt.hours,
        minutes: boyDt.minutes,
        seconds: boyDt.seconds,
        latitude: boyCoords.lat,
        longitude: boyCoords.lon,
        timezone: boyCoords.timezone,
        settings: {
          observation_point: "topocentric",
          ayanamsha: "lahiri",
          language: language === 'hi' ? 'hi' : 'en'
        }
      }),
      postWithKeyRotation(axios, `${ASTROLOGY_API_BASE}/planets`, {
        year: girlDt.year,
        month: girlDt.month,
        date: girlDt.date,
        hours: girlDt.hours,
        minutes: girlDt.minutes,
        seconds: girlDt.seconds,
        latitude: girlCoords.lat,
        longitude: girlCoords.lon,
        timezone: girlCoords.timezone,
        settings: {
          observation_point: "topocentric",
          ayanamsha: "lahiri",
          language: language === 'hi' ? 'hi' : 'en'
        }
      })
    ]);

    let boyData = boyResponse.data;
    let girlData = girlResponse.data;
    
    if (boyData.output) boyData = boyData.output;
    if (girlData.output) girlData = girlData.output;

    // Calculate Ashtakoot matching
    const ashtakootScore = calculateAshtakoot(boyData, girlData, language);

    return {
      boy: {
        name: boy.name,
        moonSign: boyData.Moon?.zodiac_sign_name || 'Aries',
        nakshatra: boyData.Moon?.nakshatra_name || 'Ashwini'
      },
      girl: {
        name: girl.name,
        moonSign: girlData.Moon?.zodiac_sign_name || 'Aries',
        nakshatra: girlData.Moon?.nakshatra_name || 'Ashwini'
      },
      ashtakoot_score: ashtakootScore,
      conclusion: {
        status: ashtakootScore.total.obtained_points >= 18,
        report: generateMatchmakingReport(ashtakootScore, language)
      }
    };
  } catch (error) {
    console.error('Matchmaking generation error:', error);
    throw new Error(`Failed to generate Matchmaking report: ${error.message}`);
  }
}

/**
 * Calculate Ashtakoot (8 Gunas) matching - Proper Vedic calculation
 */
function calculateAshtakoot(boyData, girlData, language = 'en') {
  const boyMoonSign = getSignNumber(boyData.Moon?.zodiac_sign_name || 'Aries');
  const girlMoonSign = getSignNumber(girlData.Moon?.zodiac_sign_name || 'Aries');
  const boyNakshatra = boyData.Moon?.nakshatra_name || 'Ashwini';
  const girlNakshatra = girlData.Moon?.nakshatra_name || 'Ashwini';
  
  // 1. Varna (1 point) - Based on Moon sign
  const varna = calculateVarna(boyMoonSign, girlMoonSign);
  
  // 2. Vashya (2 points) - Sign compatibility
  const vashya = calculateVashya(boyMoonSign, girlMoonSign);
  
  // 3. Tara (3 points) - Nakshatra distance
  const tara = calculateTara(boyNakshatra, girlNakshatra);
  
  // 4. Yoni (4 points) - Nakshatra compatibility
  const yoni = calculateYoni(boyNakshatra, girlNakshatra);
  
  // 5. Graha Maitri (5 points) - Sign friendship
  const grahaMaitri = calculateGrahaMaitri(boyMoonSign, girlMoonSign);
  
  // 6. Gana (6 points) - Nakshatra Gana compatibility
  const gana = calculateGana(boyNakshatra, girlNakshatra);
  
  // 7. Bhakoot (7 points) - Sign relationship
  const bhakoot = calculateBhakoot(boyMoonSign, girlMoonSign);
  
  // 8. Nadi (8 points) - Nakshatra Nadi compatibility
  const nadi = calculateNadi(boyNakshatra, girlNakshatra);
  
  const totalPoints = 36;
  const obtainedPoints = varna + vashya + tara + yoni + grahaMaitri + gana + bhakoot + nadi;
  
  // Get descriptions for each koota
  const getKootaDescription = (kootaName, obtained, maximum, lang) => {
    const descriptions = {
      varna: {
        en: { name: 'Varna', desc: 'Spiritual/ego compatibility based on Moon signs' },
        hi: { name: 'वर्ण', desc: 'चंद्र राशि के आधार पर आध्यात्मिक/अहंकार अनुकूलता' }
      },
      vashya: {
        en: { name: 'Vashya', desc: 'Mutual attraction and control between partners' },
        hi: { name: 'वश्य', desc: 'साथियों के बीच पारस्परिक आकर्षण और नियंत्रण' }
      },
      tara: {
        en: { name: 'Tara', desc: 'Health and longevity of the bond (Nakshatra distance)' },
        hi: { name: 'तारा', desc: 'बंधन की स्वास्थ्य और दीर्घायु (नक्षत्र दूरी)' }
      },
      yoni: {
        en: { name: 'Yoni', desc: 'Sexual intimacy and temperament compatibility' },
        hi: { name: 'योनि', desc: 'यौन अंतरंगता और स्वभाव अनुकूलता' }
      },
      graha_maitri: {
        en: { name: 'Graha Maitri', desc: 'Mental friendship via Moon lords' },
        hi: { name: 'ग्रह मैत्री', desc: 'चंद्र स्वामियों के माध्यम से मानसिक मित्रता' }
      },
      gana: {
        en: { name: 'Gana', desc: 'Personality types (Deva, Manushya, Rakshasa)' },
        hi: { name: 'गण', desc: 'व्यक्तित्व प्रकार (देव, मनुष्य, राक्षस)' }
      },
      bhakoot: {
        en: { name: 'Bhakoot', desc: 'Emotional harmony and prosperity' },
        hi: { name: 'भकूट', desc: 'भावनात्मक सामंजस्य और समृद्धि' }
      },
      nadi: {
        en: { name: 'Nadi', desc: 'Health and genetics (critical; avoid same Nadi)' },
        hi: { name: 'नाड़ी', desc: 'स्वास्थ्य और आनुवंशिकी (महत्वपूर्ण; समान नाड़ी से बचें)' }
      }
    };
    
    const desc = descriptions[kootaName]?.[lang] || descriptions[kootaName]?.en;
    const status = obtained === maximum ? 'Excellent' : obtained > 0 ? 'Good' : 'Poor';
    const statusHi = obtained === maximum ? 'उत्कृष्ट' : obtained > 0 ? 'अच्छा' : 'खराब';
    
    return {
      name: desc.name,
      description: desc.desc,
      obtained,
      maximum,
      status: lang === 'hi' ? statusHi : status,
      percentage: Math.round((obtained / maximum) * 100)
    };
  };

  return {
    total: {
      obtained_points: obtainedPoints,
      maximum_points: totalPoints,
      percentage: Math.round((obtainedPoints / totalPoints) * 100),
      rating: obtainedPoints >= 33 ? 'Excellent' : obtainedPoints >= 25 ? 'Good' : obtainedPoints >= 18 ? 'Acceptable' : 'Poor',
      ratingHi: obtainedPoints >= 33 ? 'उत्कृष्ट' : obtainedPoints >= 25 ? 'अच्छा' : obtainedPoints >= 18 ? 'स्वीकार्य' : 'खराब'
    },
    varna: getKootaDescription('varna', varna, 1, 'en'),
    vashya: getKootaDescription('vashya', vashya, 2, 'en'),
    tara: getKootaDescription('tara', tara, 3, 'en'),
    yoni: getKootaDescription('yoni', yoni, 4, 'en'),
    graha_maitri: getKootaDescription('graha_maitri', grahaMaitri, 5, 'en'),
    gana: getKootaDescription('gana', gana, 6, 'en'),
    bhakoot: getKootaDescription('bhakoot', bhakoot, 7, 'en'),
    nadi: getKootaDescription('nadi', nadi, 8, 'en'),
    // Hindi versions
    varna_hi: getKootaDescription('varna', varna, 1, 'hi'),
    vashya_hi: getKootaDescription('vashya', vashya, 2, 'hi'),
    tara_hi: getKootaDescription('tara', tara, 3, 'hi'),
    yoni_hi: getKootaDescription('yoni', yoni, 4, 'hi'),
    graha_maitri_hi: getKootaDescription('graha_maitri', grahaMaitri, 5, 'hi'),
    gana_hi: getKootaDescription('gana', gana, 6, 'hi'),
    bhakoot_hi: getKootaDescription('bhakoot', bhakoot, 7, 'hi'),
    nadi_hi: getKootaDescription('nadi', nadi, 8, 'hi')
  };
}

// Helper: Get sign number (1=Aries, 2=Taurus, ..., 12=Pisces)
function getSignNumber(signName) {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const sign = signs.findIndex(s => signName.toLowerCase().includes(s.toLowerCase()));
  return sign >= 0 ? sign + 1 : 1;
}

// 1. Varna (1 point) - Same Varna gets 1 point
function calculateVarna(boySign, girlSign) {
  // Varna: 1-3 (Brahmin), 4-6 (Kshatriya), 7-9 (Vaishya), 10-12 (Shudra)
  const boyVarna = Math.ceil(boySign / 3);
  const girlVarna = Math.ceil(girlSign / 3);
  return boyVarna === girlVarna ? 1 : 0;
}

// 2. Vashya (2 points) - Sign compatibility
function calculateVashya(boySign, girlSign) {
  // Same sign or compatible signs get points
  if (boySign === girlSign) return 2;
  // Compatible signs (same element or friendly)
  const compatiblePairs = [
    [1, 5, 9], // Fire signs
    [2, 6, 10], // Earth signs
    [3, 7, 11], // Air signs
    [4, 8, 12]  // Water signs
  ];
  const isCompatible = compatiblePairs.some(group => 
    group.includes(boySign) && group.includes(girlSign)
  );
  return isCompatible ? 2 : 0;
}

// 3. Tara (3 points) - Nakshatra distance (Janma, Sampat, Vipat, Kshema, Pratyak, Sadhak, Vadha, Mitra, Ati-Mitra)
function calculateTara(boyNakshatra, girlNakshatra) {
  const nakshatras = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 
                      'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
                      'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
                      'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 
                      'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
  
  const boyIdx = nakshatras.findIndex(n => boyNakshatra.toLowerCase().includes(n.toLowerCase()));
  const girlIdx = nakshatras.findIndex(n => girlNakshatra.toLowerCase().includes(n.toLowerCase()));
  
  if (boyIdx < 0 || girlIdx < 0) return 0;
  
  const distance = Math.abs(boyIdx - girlIdx) % 9;
  // Tara positions: 0=Janma(0), 1=Sampat(3), 2=Vipat(0), 3=Kshema(3), 4=Pratyak(0), 5=Sadhak(3), 6=Vadha(0), 7=Mitra(3), 8=Ati-Mitra(3)
  const taraPoints = [0, 3, 0, 3, 0, 3, 0, 3, 3];
  return taraPoints[distance] || 0;
}

// 4. Yoni (4 points) - Nakshatra Yoni compatibility
function calculateYoni(boyNakshatra, girlNakshatra) {
  // Yoni pairs: Same Yoni = 4, Friendly = 2, Enemy = 0
  const yoniMap = {
    'Ashwini': 'Horse', 'Bharani': 'Elephant', 'Krittika': 'Sheep', 'Rohini': 'Serpent',
    'Mrigashira': 'Serpent', 'Ardra': 'Dog', 'Punarvasu': 'Cat', 'Pushya': 'Goat',
    'Ashlesha': 'Cat', 'Magha': 'Rat', 'Purva Phalguni': 'Rat', 'Uttara Phalguni': 'Cow',
    'Hasta': 'Buffalo', 'Chitra': 'Tiger', 'Swati': 'Buffalo', 'Vishakha': 'Tiger',
    'Anuradha': 'Deer', 'Jyeshtha': 'Deer', 'Mula': 'Dog', 'Purva Ashadha': 'Monkey',
    'Uttara Ashadha': 'Mongoose', 'Shravana': 'Monkey', 'Dhanishta': 'Lion', 
    'Shatabhisha': 'Horse', 'Purva Bhadrapada': 'Lion', 'Uttara Bhadrapada': 'Cow', 'Revati': 'Elephant'
  };
  
  const getYoni = (nakshatra) => {
    for (const [key, value] of Object.entries(yoniMap)) {
      if (nakshatra.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    return 'Unknown';
  };
  
  const boyYoni = getYoni(boyNakshatra);
  const girlYoni = getYoni(girlNakshatra);
  
  if (boyYoni === girlYoni) return 4;
  
  // Friendly Yoni pairs (according to Vedic astrology)
  const friendlyPairs = [
    ['Horse', 'Elephant'], // Ashwini-Bharani, Shatabhisha-Revati
    ['Sheep', 'Goat'],     // Krittika-Pushya
    ['Cat', 'Monkey'],     // Punarvasu-Purva Ashadha, Ashlesha-Shravana
    ['Rat', 'Cow'],        // Magha-Uttara Phalguni, Purva Phalguni-Uttara Bhadrapada
    ['Tiger', 'Lion'],     // Chitra-Dhanishta, Vishakha-Purva Bhadrapada
    ['Dog', 'Mongoose'],   // Ardra-Uttara Ashadha, Mula-Uttara Ashadha
    ['Buffalo', 'Buffalo'] // Hasta-Swati (same, already handled above)
  ];
  
  const isFriendly = friendlyPairs.some(pair => 
    pair.includes(boyYoni) && pair.includes(girlYoni)
  );
  
  return isFriendly ? 2 : 0;
}

// 5. Graha Maitri (5 points) - Sign friendship
function calculateGrahaMaitri(boySign, girlSign) {
  if (boySign === girlSign) return 5;
  
  // Friendly signs
  const friendlyPairs = [
    [1, 5, 9], // Fire signs (friendly)
    [2, 6, 10], // Earth signs (friendly)
    [3, 7, 11], // Air signs (friendly)
    [4, 8, 12]  // Water signs (friendly)
  ];
  
  const isFriendly = friendlyPairs.some(group => 
    group.includes(boySign) && group.includes(girlSign)
  );
  
  if (isFriendly) return 5;
  
  // Neutral signs get 2.5 (rounded to 3)
  return 3;
}

// 6. Gana (6 points) - Nakshatra Gana compatibility
function calculateGana(boyNakshatra, girlNakshatra) {
  // Deva (God), Manushya (Human), Rakshasa (Demon)
  const ganaMap = {
    'Deva': ['Ashwini', 'Mrigashira', 'Punarvasu', 'Pushya', 'Hasta', 'Swati', 'Anuradha', 'Shravana', 'Revati'],
    'Manushya': ['Bharani', 'Rohini', 'Ardra', 'Purva Phalguni', 'Uttara Phalguni', 'Purva Ashadha', 'Uttara Ashadha', 'Purva Bhadrapada', 'Uttara Bhadrapada'],
    'Rakshasa': ['Krittika', 'Ashlesha', 'Magha', 'Chitra', 'Vishakha', 'Jyeshtha', 'Mula', 'Dhanishta', 'Shatabhisha']
  };
  
  const getGana = (nakshatra) => {
    for (const [gana, nakshatras] of Object.entries(ganaMap)) {
      if (nakshatras.some(n => nakshatra.toLowerCase().includes(n.toLowerCase()))) {
        return gana;
      }
    }
    return 'Manushya';
  };
  
  const boyGana = getGana(boyNakshatra);
  const girlGana = getGana(girlNakshatra);
  
  if (boyGana === girlGana) return 6;
  if ((boyGana === 'Deva' && girlGana === 'Manushya') || (boyGana === 'Manushya' && girlGana === 'Deva')) return 5;
  if ((boyGana === 'Rakshasa' && girlGana === 'Manushya') || (boyGana === 'Manushya' && girlGana === 'Rakshasa')) return 3;
  return 0; // Deva-Rakshasa incompatible
}

// 7. Bhakoot (7 points) - Sign relationship (1,2,4,5,7,8,10,11 = good, 3,6,9,12 = bad)
function calculateBhakoot(boySign, girlSign) {
  if (boySign === girlSign) return 7;
  
  const diff = Math.abs(boySign - girlSign);
  // Good positions: 1, 2, 4, 5, 7, 8, 10, 11 signs apart
  const goodPositions = [1, 2, 4, 5, 7, 8, 10, 11];
  const badPositions = [3, 6, 9, 12];
  
  if (goodPositions.includes(diff)) return 7;
  if (badPositions.includes(diff)) return 0;
  
  return 3; // Neutral
}

// 8. Nadi (8 points) - Nakshatra Nadi compatibility
function calculateNadi(boyNakshatra, girlNakshatra) {
  // Adi (First), Madhya (Middle), Antya (Last)
  const nadiMap = {
    'Adi': ['Ashwini', 'Ardra', 'Punarvasu', 'Uttara Phalguni', 'Hasta', 'Jyeshtha', 'Mula', 'Shravana', 'Dhanishta', 'Shatabhisha'],
    'Madhya': ['Bharani', 'Mrigashira', 'Pushya', 'Purva Phalguni', 'Chitra', 'Anuradha', 'Purva Ashadha', 'Uttara Ashadha', 'Purva Bhadrapada'],
    'Antya': ['Krittika', 'Rohini', 'Ashlesha', 'Magha', 'Swati', 'Vishakha', 'Uttara Bhadrapada', 'Revati']
  };
  
  const getNadi = (nakshatra) => {
    for (const [nadi, nakshatras] of Object.entries(nadiMap)) {
      if (nakshatras.some(n => nakshatra.toLowerCase().includes(n.toLowerCase()))) {
        return nadi;
      }
    }
    return 'Madhya';
  };
  
  const boyNadi = getNadi(boyNakshatra);
  const girlNadi = getNadi(girlNakshatra);
  
  // Same Nadi = 0 (incompatible), Different = 8
  return boyNadi === girlNadi ? 0 : 8;
}

/**
 * Generate matchmaking report
 */
function generateMatchmakingReport(score, language) {
  const points = score.total.obtained_points;
  const maxPoints = score.total.maximum_points;
  const percentage = (points / maxPoints) * 100;
  
  if (language === 'hi') {
    if (percentage >= 75) {
      return `उत्कृष्ट मिलान! ${points}/${maxPoints} अंक प्राप्त हुए। यह एक बहुत ही अनुकूल जोड़ी है।`;
    } else if (percentage >= 50) {
      return `अच्छा मिलान। ${points}/${maxPoints} अंक प्राप्त हुए। यह जोड़ी सामान्य रूप से अनुकूल है।`;
    } else {
      return `मध्यम मिलान। ${points}/${maxPoints} अंक प्राप्त हुए। कुछ सावधानियां आवश्यक हैं।`;
    }
  }
  
  if (percentage >= 75) {
    return `Excellent match! Scored ${points}/${maxPoints} points. This is a very compatible couple.`;
  } else if (percentage >= 50) {
    return `Good match. Scored ${points}/${maxPoints} points. This couple is generally compatible.`;
  } else {
    return `Moderate match. Scored ${points}/${maxPoints} points. Some precautions are necessary.`;
  }
}

/**
 * Get coordinates from location using Google Geocoding API
 */
async function getCoordinates(location) {
  try {
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;
    
    if (!GOOGLE_API_KEY) {
      console.warn('Google API key not found, using default coordinates for New Delhi');
      return { lat: 28.6139, lon: 77.2090, timezone: 5.5 };
    }

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${GOOGLE_API_KEY}`;
    const geocodeResponse = await axios.get(geocodeUrl);
    
    if (geocodeResponse.data.status === 'OK' && geocodeResponse.data.results.length > 0) {
      const result = geocodeResponse.data.results[0];
      const lat = result.geometry.location.lat;
      const lon = result.geometry.location.lng;
      
      // Get timezone
      const timezoneUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lon}&timestamp=${Math.floor(Date.now() / 1000)}&key=${GOOGLE_API_KEY}`;
      const timezoneResponse = await axios.get(timezoneUrl);
      
      let timezone = 5.5; // Default IST
      if (timezoneResponse.data.status === 'OK') {
        timezone = timezoneResponse.data.rawOffset / 3600;
      }
      
      return { lat, lon, timezone };
    }
    
    // Fallback to default
    console.warn(`Geocoding failed for ${location}, using default coordinates`);
    return { lat: 28.6139, lon: 77.2090, timezone: 5.5 };
  } catch (error) {
    console.error('Error getting coordinates:', error);
    // Fallback to default (New Delhi)
    return { lat: 28.6139, lon: 77.2090, timezone: 5.5 };
  }
}

/**
 * Parse date and time
 */
function parseDateTime(dateStr, timeStr) {
  const date = new Date(dateStr);
  const [hours, minutes] = timeStr.split(':').map(Number);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    date: date.getDate(),
    hours: hours || 0,
    minutes: minutes || 0,
    seconds: 0
  };
}

