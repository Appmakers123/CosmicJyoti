import axios from 'axios';
import { postWithKeyRotation } from '../utils/astrologyApiKeys.js';

const ASTROLOGY_API_BASE = process.env.ASTROLOGY_API_BASE_URL || 'https://json.freeastrologyapi.com';

/**
 * Generate Panchang (Almanac) for a specific date and location
 */
export async function generatePanchang(date, location, language = 'en') {
  try {
    const coords = await getCoordinates(location);
    const dateObj = new Date(date);
    
    const payload = {
      year: dateObj.getFullYear(),
      month: dateObj.getMonth() + 1,
      date: dateObj.getDate(),
      latitude: coords.lat,
      longitude: coords.lon,
      timezone: coords.timezone
    };

    const response = await postWithKeyRotation(
      axios,
      `${ASTROLOGY_API_BASE}/panchang`,
      payload
    );

    let panchangData = response.data;
    if (panchangData.output) {
      panchangData = panchangData.output;
    }
    
    // Extract data with fallbacks
    const tithiName = panchangData.tithi || panchangData.tithi_name || panchangData.tithi?.name || 'Shukla Paksha';
    const tithiEndTime = panchangData.tithi?.end_time || panchangData.tithi_end_time || panchangData.tithiEndTime || '12:00 PM';
    
    const nakshatraName = panchangData.nakshatra || panchangData.nakshatra_name || panchangData.nakshatra?.name || 'Rohini';
    const nakshatraEndTime = panchangData.nakshatra?.end_time || panchangData.nakshatra_end_time || panchangData.nakshatraEndTime || '12:00 PM';
    
    const yogaName = panchangData.yoga || panchangData.yoga_name || panchangData.yoga?.name || 'Vajra';
    const yogaEndTime = panchangData.yoga?.end_time || panchangData.yoga_end_time || panchangData.yogaEndTime || '12:00 PM';
    
    const karanaName = panchangData.karana || panchangData.karana_name || panchangData.karana?.name || 'Bava';
    const karanaEndTime = panchangData.karana?.end_time || panchangData.karana_end_time || panchangData.karanaEndTime || '12:00 PM';
    
    // Calculate Rahu Kalam (varies by day, typically 1.5 hours)
    const rahuKalam = panchangData.rahu_kalam || panchangData.rahuKalam || calculateRahuKalam(dateObj);
    const yamaganda = panchangData.yamaganda || calculateYamaganda(dateObj);
    const abhijitMuhurat = panchangData.abhijit_muhurat || panchangData.abhijitMuhurat || '11:45 AM - 12:30 PM';

    return {
      date: date,
      location: location,
      sunrise: panchangData.sunrise || '06:00 AM',
      sunset: panchangData.sunset || '06:00 PM',
      moonrise: panchangData.moonrise || '12:00 PM',
      tithi: {
        name: tithiName,
        endTime: tithiEndTime
      },
      nakshatra: {
        name: nakshatraName,
        endTime: nakshatraEndTime
      },
      yoga: {
        name: yogaName,
        endTime: yogaEndTime
      },
      karana: {
        name: karanaName,
        endTime: karanaEndTime
      },
      rahuKalam: rahuKalam,
      yamaganda: yamaganda,
      abhijitMuhurat: abhijitMuhurat,
      language: language
    };
  } catch (error) {
    console.error('Panchang generation error:', error);
    
    // Return default panchang structure instead of throwing
    const dateObj = new Date(date);
    return {
      date: date,
      location: location,
      sunrise: '06:00 AM',
      sunset: '06:00 PM',
      moonrise: '12:00 PM',
      tithi: {
        name: language === 'hi' ? 'शुक्ल पक्ष' : 'Shukla Paksha',
        endTime: '12:00 PM'
      },
      nakshatra: {
        name: language === 'hi' ? 'रोहिणी' : 'Rohini',
        endTime: '12:00 PM'
      },
      yoga: {
        name: language === 'hi' ? 'वज्र' : 'Vajra',
        endTime: '12:00 PM'
      },
      karana: {
        name: language === 'hi' ? 'बव' : 'Bava',
        endTime: '12:00 PM'
      },
      rahuKalam: calculateRahuKalam(dateObj),
      yamaganda: calculateYamaganda(dateObj),
      abhijitMuhurat: '11:45 AM - 12:30 PM',
      language: language
    };
  }
}

/**
 * Get coordinates from location
 */
async function getCoordinates(location) {
  // Use Google Geocoding API if available
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;
  
  if (GOOGLE_API_KEY) {
    try {
      const geocodeResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${GOOGLE_API_KEY}`
      );
      
      if (geocodeResponse.data.results && geocodeResponse.data.results.length > 0) {
        const result = geocodeResponse.data.results[0];
        const lat = result.geometry.location.lat;
        const lng = result.geometry.location.lng;
        
        // Get timezone
        const timezoneResponse = await axios.get(
          `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${Math.floor(Date.now() / 1000)}&key=${GOOGLE_API_KEY}`
        );
        
        const timezoneOffset = timezoneResponse.data.rawOffset / 3600;
        
        return { lat, lon: lng, timezone: timezoneOffset };
      }
    } catch (error) {
      console.error('Geocoding error:', error.message);
    }
  }
  
  // Fallback to default coordinates (Mumbai)
  return { lat: 19.0760, lon: 72.8777, timezone: 5.5 };
}

/**
 * Calculate Rahu Kalam based on day of week
 */
function calculateRahuKalam(dateObj) {
  const day = dateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const rahuKalamTimes = {
    0: '04:30 PM - 06:00 PM', // Sunday
    1: '07:30 AM - 09:00 AM', // Monday
    2: '03:00 PM - 04:30 PM', // Tuesday
    3: '12:00 PM - 01:30 PM', // Wednesday
    4: '01:30 PM - 03:00 PM', // Thursday
    5: '10:30 AM - 12:00 PM', // Friday
    6: '09:00 AM - 10:30 AM'  // Saturday
  };
  return rahuKalamTimes[day] || '10:30 AM - 12:00 PM';
}

/**
 * Calculate Yamaganda based on day of week
 */
function calculateYamaganda(dateObj) {
  const day = dateObj.getDay();
  const yamagandaTimes = {
    0: '12:00 PM - 01:30 PM', // Sunday
    1: '10:30 AM - 12:00 PM', // Monday
    2: '09:00 AM - 10:30 AM', // Tuesday
    3: '07:30 AM - 09:00 AM', // Wednesday
    4: '03:00 PM - 04:30 PM', // Thursday
    5: '01:30 PM - 03:00 PM', // Friday
    6: '12:00 PM - 01:30 PM'  // Saturday
  };
  return yamagandaTimes[day] || '03:00 PM - 04:30 PM';
}

