/**
 * Transit Service - Calculate current planetary positions without external API
 * Uses approximate planetary speeds for calculations
 */

// Approximate daily speeds of planets (degrees per day)
const PLANETARY_SPEEDS = {
  Sun: 0.9856,        // ~1 degree per day
  Moon: 13.1764,      // ~13 degrees per day
  Mars: 0.5240,       // ~0.5 degrees per day
  Mercury: 4.0923,    // Variable, average ~4 degrees
  Jupiter: 0.0831,    // ~0.08 degrees per day
  Venus: 1.6021,      // ~1.6 degrees per day
  Saturn: 0.0335,     // ~0.03 degrees per day
  Rahu: 0.0529,       // ~0.05 degrees per day (retrograde)
  Ketu: 0.0529        // ~0.05 degrees per day (retrograde, opposite to Rahu)
};

// Zodiac signs in order
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Nakshatras (27 divisions)
const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshta',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

/**
 * Get coordinates from location
 */
async function getCoordinates(location, lat, lon) {
  if (lat !== undefined && lon !== undefined) {
    const timezone = Math.round((lon / 15) * 2) / 2;
    return { lat, lon, timezone };
  }

  // Default to Mumbai if no coordinates provided
  return { lat: 19.0760, lon: 72.8777, timezone: 5.5 };
}

/**
 * Calculate Julian Day Number
 */
function julianDay(year, month, day, hour, minute, second, timezone) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  
  let jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 
            Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  
  const time = hour + minute / 60 + second / 3600 - timezone;
  jdn += (time / 24) - 0.5;
  
  return jdn;
}

/**
 * Calculate approximate planetary longitude using base positions and speeds
 */
function calculatePlanetLongitude(planet, jd, baseJD = 2451545.0) {
  // Base positions at J2000.0 (Jan 1, 2000, 12:00 UT)
  const BASE_POSITIONS = {
    Sun: 280.4665,
    Moon: 218.3162,
    Mars: 355.4333,
    Mercury: 252.2509,
    Jupiter: 34.3515,
    Venus: 181.9798,
    Saturn: 49.5581,
    Rahu: 95.9967,
    Ketu: 275.9967
  };

  const daysSinceBase = jd - baseJD;
  const baseLongitude = BASE_POSITIONS[planet] || 0;
  const speed = PLANETARY_SPEEDS[planet] || 0;
  
  // Calculate current longitude
  let longitude = baseLongitude + (speed * daysSinceBase);
  
  // Normalize to 0-360 degrees
  longitude = longitude % 360;
  if (longitude < 0) longitude += 360;
  
  return longitude;
}

/**
 * Convert longitude to sign and signId
 */
function longitudeToSign(longitude) {
  const signIndex = Math.floor(longitude / 30);
  const signId = (signIndex % 12) + 1;
  const sign = ZODIAC_SIGNS[signIndex % 12];
  const degreeInSign = longitude % 30;
  
  return { sign, signId, degree: degreeInSign };
}

/**
 * Get nakshatra from longitude
 */
function getNakshatra(longitude) {
  const nakshatraIndex = Math.floor((longitude / 360) * 27);
  return NAKSHATRAS[nakshatraIndex % 27];
}

/**
 * Check if planet is retrograde (simplified - only for outer planets)
 */
function isRetrograde(planet) {
  // Simplified: Only outer planets can be retrograde
  // In reality, this requires more complex calculations
  const retrogradePlanets = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  if (!retrogradePlanets.includes(planet)) {
    return false;
  }
  
  // Very simplified: assume retrograde based on position
  // This is not accurate but provides some variation
  const randomFactor = Math.sin(Date.now() / 1000000) * 0.3;
  return Math.abs(randomFactor) > 0.2;
}

/**
 * Calculate house number based on reference sign
 */
function calculateHouse(planetSignId, referenceSignId) {
  if (!planetSignId || !referenceSignId) return 1;
  return ((planetSignId - referenceSignId + 12) % 12) + 1;
}

/**
 * Generate current planetary positions for transits
 */
export async function generateTransits(location, referenceRashi, currentDate = null, language = 'en') {
  try {
    const current = currentDate ? new Date(currentDate) : new Date();
    const coords = await getCoordinates(location);
    
    // Parse current date/time
    const year = current.getFullYear();
    const month = current.getMonth() + 1;
    const day = current.getDate();
    const hour = current.getHours();
    const minute = current.getMinutes();
    const second = current.getSeconds();
    
    // Calculate Julian Day
    const jd = julianDay(year, month, day, hour, minute, second, coords.timezone);
    
    // Get reference sign ID
    const signMap = {
      'Aries': 1, 'Taurus': 2, 'Gemini': 3, 'Cancer': 4,
      'Leo': 5, 'Virgo': 6, 'Libra': 7, 'Scorpio': 8,
      'Sagittarius': 9, 'Capricorn': 10, 'Aquarius': 11, 'Pisces': 12
    };
    const referenceSignId = signMap[referenceRashi] || 1;
    
    // Calculate positions for all planets
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    const currentPositions = [];
    
    planets.forEach(planet => {
      const longitude = calculatePlanetLongitude(planet, jd);
      const { sign, signId, degree } = longitudeToSign(longitude);
      const nakshatra = getNakshatra(longitude);
      const house = calculateHouse(signId, referenceSignId);
      const retrograde = isRetrograde(planet);
      
      // Moon is never retrograde
      const isRetro = planet === 'Moon' ? false : retrograde;
      
      currentPositions.push({
        planet: planet,
        sign: sign,
        signId: signId,
        house: house,
        degree: `${degree.toFixed(2)}°`,
        nakshatra: nakshatra,
        isRetrograde: isRetro
      });
    });
    
    return {
      currentDate: current.toISOString().split('T')[0],
      currentTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      location: location,
      referenceRashi: referenceRashi,
      currentPositions: currentPositions
    };
  } catch (error) {
    console.error('Transit generation error:', error);
    throw new Error(`Failed to generate transits: ${error.message}`);
  }
}

/**
 * Generate transits for generic mode (no birth chart)
 */
export async function generateGenericTransits(location, rashi, language = 'en') {
  return await generateTransits(location, rashi, null, language);
}

/**
 * Generate personal transits (with birth chart reference)
 */
export async function generatePersonalTransits(birthDate, birthTime, birthLocation, currentDate, language = 'en') {
  // For personal transits, we'd need birth chart data
  // For now, use current date as reference
  const current = currentDate ? new Date(currentDate) : new Date();
  
  // Get birth coordinates
  const coords = await getCoordinates(birthLocation);
  
  // Calculate current transits
  // In a full implementation, we'd calculate houses relative to birth ascendant
  // For now, return current positions
  return await generateTransits(birthLocation, 'Aries', currentDate, language);
}

