import axios from 'axios';
import { postWithKeyRotation } from '../utils/astrologyApiKeys.js';

const ASTROLOGY_API_BASE = process.env.ASTROLOGY_API_BASE_URL || 'https://json.freeastrologyapi.com';

/**
 * Generate Gochara (Transits) - Current planetary positions relative to birth chart
 */
export async function generateGochara(birthDate, birthTime, birthLocation, currentDate = null, language = 'en') {
  try {
    const current = currentDate ? new Date(currentDate) : new Date();
    
    // Get birth coordinates
    const birthCoords = await getCoordinates(birthLocation);
    const birthDt = parseDateTime(birthDate, birthTime);
    
    // Get current planetary positions
    const currentPayload = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      date: current.getDate(),
      hours: current.getHours(),
      minutes: current.getMinutes(),
      seconds: current.getSeconds(),
      latitude: birthCoords.lat,
      longitude: birthCoords.lon,
      timezone: birthCoords.timezone,
      settings: {
        observation_point: "topocentric",
        ayanamsha: "lahiri",
        language: language === 'hi' ? 'hi' : 'en'
      }
    };

    // Get birth chart planetary positions
    const birthPayload = {
      ...currentPayload,
      year: birthDt.year,
      month: birthDt.month,
      date: birthDt.date,
      hours: birthDt.hours,
      minutes: birthDt.minutes,
      seconds: birthDt.seconds
    };

    const [currentResponse, birthResponse] = await Promise.all([
      postWithKeyRotation(axios, `${ASTROLOGY_API_BASE}/planets`, currentPayload),
      postWithKeyRotation(axios, `${ASTROLOGY_API_BASE}/planets`, birthPayload)
    ]);

    let currentData = currentResponse.data;
    let birthData = birthResponse.data;
    
    if (currentData.output) currentData = currentData.output;
    if (birthData.output) birthData = birthData.output;

    // Calculate transits (difference between current and birth positions)
    const transits = calculateTransits(currentData, birthData);

    return {
      birthDate: birthDate,
      currentDate: current.toISOString().split('T')[0],
      transits: transits,
      currentPositions: parsePlanetaryPositions(currentData),
      birthPositions: parsePlanetaryPositions(birthData)
    };
  } catch (error) {
    console.error('Gochara generation error:', error);
    throw new Error(`Failed to generate Gochara: ${error.message}`);
  }
}

/**
 * Calculate transits
 */
function calculateTransits(currentData, birthData) {
  const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const transits = [];

  planets.forEach(planetName => {
    const currentPlanet = currentData[planetName];
    const birthPlanet = birthData[planetName];
    
    if (currentPlanet && birthPlanet) {
      const currentSign = currentPlanet.current_sign || currentPlanet.zodiac_sign_name;
      const birthSign = birthPlanet.current_sign || birthPlanet.zodiac_sign_name;
      const currentHouse = currentPlanet.house_number || 1;
      const birthHouse = birthPlanet.house_number || 1;
      
      transits.push({
        planet: planetName,
        currentSign: currentSign,
        birthSign: birthSign,
        currentHouse: currentHouse,
        birthHouse: birthHouse,
        isRetrograde: currentPlanet.isRetro === "true" || currentPlanet.isRetro === true
      });
    }
  });

  return transits;
}

/**
 * Parse planetary positions
 */
function parsePlanetaryPositions(data) {
  const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const positions = [];

  planets.forEach(planetName => {
    const planetData = data[planetName];
    if (planetData) {
      positions.push({
        planet: planetName,
        sign: planetData.zodiac_sign_name || planetData.sign || 'Aries',
        signId: planetData.current_sign || 1,
        house: planetData.house_number || 1,
        degree: planetData.normDegree || planetData.fullDegree || '0',
        isRetrograde: planetData.isRetro === "true" || planetData.isRetro === true
      });
    }
  });

  return positions;
}

/**
 * Get coordinates from location
 */
async function getCoordinates(location) {
  return { lat: 19.0760, lon: 72.8777, timezone: 5.5 };
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

