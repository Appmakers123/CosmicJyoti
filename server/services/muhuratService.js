import axios from 'axios';
import { postWithKeyRotation } from '../utils/astrologyApiKeys.js';

const ASTROLOGY_API_BASE = process.env.ASTROLOGY_API_BASE_URL || 'https://json.freeastrologyapi.com';

/**
 * Generate Muhurat (Best Timing) for a specific date and location
 */
export async function generateMuhurat(date, location, activity = 'general', language = 'en') {
  try {
    console.log("Generating Muhurat for:", { date, location, activity, language });
    
    // Get coordinates
    const coords = await getCoordinates(location);
    console.log("Coordinates:", coords);
    
    const dateObj = new Date(date);
    const payload = {
      year: dateObj.getFullYear(),
      month: dateObj.getMonth() + 1,
      date: dateObj.getDate(),
      latitude: coords.lat,
      longitude: coords.lon,
      timezone: coords.timezone
    };
    
    console.log("Panchang payload:", payload);

    // Call Panchang API to get Tithi, Nakshatra, etc.
    let panchangData = null;
    try {
      const panchangResponse = await postWithKeyRotation(
        axios,
        `${ASTROLOGY_API_BASE}/panchang`,
        payload
      );

      panchangData = panchangResponse.data;
      
      // Handle response wrapper
      if (panchangData.output) {
        panchangData = panchangData.output;
      }
      
      // Handle nested structure
      if (panchangData.data) {
        panchangData = panchangData.data;
      }
      
      console.log("Panchang API response keys:", Object.keys(panchangData || {}));
      console.log("Panchang API response data:", JSON.stringify(panchangData, null, 2));
    } catch (panchangError) {
      console.error("Panchang API error:", panchangError.message);
      console.error("Panchang API error details:", panchangError.response?.data || panchangError);
      // Use default panchang data structure
      panchangData = {
        tithi: '',
        nakshatra: '',
        yoga: '',
        vara: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
        rahuKalam: '',
        abhijitMuhurat: '11:45 AM - 12:30 PM',
        sunrise: '06:00 AM',
        sunset: '06:00 PM'
      };
    }

    const muhurats = calculateMuhurats(panchangData, activity, language);
    
    console.log("Generated muhurats:", muhurats.length, "items");

    return {
      date: date,
      location: location,
      activity: activity,
      muhurats: muhurats,
      panchang: panchangData
    };
  } catch (error) {
    console.error('Muhurat generation error:', error);
    
    // Return default muhurats even if API fails
    const defaultMuhurats = calculateMuhurats({}, activity, language);
    
    return {
      date: date,
      location: location,
      activity: activity,
      muhurats: defaultMuhurats,
      panchang: {}
    };
  }
}

/**
 * Calculate auspicious timings based on Panchang
 */
function calculateMuhurats(panchangData, activity, language) {
  const muhurats = [];
  
  if (!panchangData) {
    panchangData = {};
  }
  
  // Extract Panchang data - handle various response structures
  let tithi = panchangData.tithi || panchangData.tithi_name || panchangData.tithi?.name || panchangData.tithi_name_eng || '';
  let nakshatra = panchangData.nakshatra || panchangData.nakshatra_name || panchangData.nakshatra?.name || panchangData.nakshatra_name_eng || '';
  let yoga = panchangData.yoga || panchangData.yoga_name || panchangData.yoga?.name || panchangData.yoga_name_eng || '';
  const weekday = panchangData.vara || panchangData.weekday || panchangData.vara_name || '';
  const rahuKalam = panchangData.rahuKalam || panchangData.rahu_kalam || panchangData.rahu_kalam_timing || '';
  let abhijitMuhurat = panchangData.abhijitMuhurat || panchangData.abhijit_muhurat || panchangData.abhijit_muhurat_timing || panchangData.abhijit_muhurat_time || '';
  
  // Get sunrise and sunset for calculating dynamic muhurat times
  const sunrise = panchangData.sunrise || panchangData.sun_rise || '06:00 AM';
  const sunset = panchangData.sunset || panchangData.sun_set || '06:00 PM';
  
  // Parse sunrise time to calculate dynamic muhurats
  const parseTime = (timeStr) => {
    if (!timeStr) return { hours: 6, minutes: 0 };
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hours !== 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      return { hours, minutes };
    }
    return { hours: 6, minutes: 0 };
  };
  
  const formatTime = (hours, minutes) => {
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };
  
  const sunRise = parseTime(sunrise);
  const sunSet = parseTime(sunset);
  
  // Calculate dynamic muhurat times based on sunrise
  // Brahma Muhurat: 1.5 hours before sunrise
  const brahmaStart = new Date();
  brahmaStart.setHours(sunRise.hours, sunRise.minutes, 0, 0);
  brahmaStart.setMinutes(brahmaStart.getMinutes() - 90); // 1.5 hours before
  const brahmaEnd = new Date();
  brahmaEnd.setHours(sunRise.hours, sunRise.minutes, 0, 0);
  brahmaEnd.setMinutes(brahmaEnd.getMinutes() - 30); // 30 min before sunrise
  const brahmaMuhurat = `${formatTime(brahmaStart.getHours(), brahmaStart.getMinutes())} - ${formatTime(brahmaEnd.getHours(), brahmaEnd.getMinutes())}`;
  
  // Mid-morning: 3-5 hours after sunrise
  const midMorningStart = new Date();
  midMorningStart.setHours(sunRise.hours, sunRise.minutes, 0, 0);
  midMorningStart.setMinutes(midMorningStart.getMinutes() + 180); // 3 hours after
  const midMorningEnd = new Date();
  midMorningEnd.setHours(sunRise.hours, sunRise.minutes, 0, 0);
  midMorningEnd.setMinutes(midMorningEnd.getMinutes() + 300); // 5 hours after
  const midMorningMuhurat = `${formatTime(midMorningStart.getHours(), midMorningStart.getMinutes())} - ${formatTime(midMorningEnd.getHours(), midMorningEnd.getMinutes())}`;
  
  // Ensure we have at least default values
  if (!tithi) tithi = '';
  if (!nakshatra) nakshatra = '';
  if (!yoga) yoga = '';
  if (!abhijitMuhurat) {
    // Calculate Abhijit Muhurat: 24 minutes before and 24 minutes after noon
    const noon = new Date();
    noon.setHours(12, 0, 0, 0);
    const abhijitStart = new Date(noon);
    abhijitStart.setMinutes(abhijitStart.getMinutes() - 24);
    const abhijitEnd = new Date(noon);
    abhijitEnd.setMinutes(abhijitEnd.getMinutes() + 24);
    abhijitMuhurat = `${formatTime(abhijitStart.getHours(), abhijitStart.getMinutes())} - ${formatTime(abhijitEnd.getHours(), abhijitEnd.getMinutes())}`;
  }
  
  // Activity-specific muhurats
  const activityName = activity === 'general' 
    ? (language === 'hi' ? 'सामान्य कार्य' : 'General Activity')
    : activity;
  
  // Abhijit Muhurat - Most auspicious time
  if (abhijitMuhurat) {
    muhurats.push({
      activity: activityName,
      status: 'Excellent',
      timeRange: abhijitMuhurat,
      reason: language === 'hi' 
        ? `अभिजीत मुहूर्त - सबसे शुभ समय (${tithi}, ${nakshatra})`
        : `Abhijit Muhurat - Most auspicious time (${tithi}, ${nakshatra})`
    });
  }
  
  // Morning Muhurat (Brahma Muhurat) - Dynamic based on sunrise
  muhurats.push({
    activity: activityName,
    status: 'Excellent',
    timeRange: brahmaMuhurat,
    reason: language === 'hi' 
      ? `ब्रह्म मुहूर्त - सुबह का सबसे शुभ समय (${tithi || 'सूर्योदय से 1.5 घंटे पहले'})`
      : `Brahma Muhurat - Most auspicious morning time (${tithi || '1.5 hours before sunrise'})`
  });
  
  // Mid-morning Muhurat - Dynamic based on sunrise
  muhurats.push({
    activity: activityName,
    status: 'Good',
    timeRange: midMorningMuhurat,
    reason: language === 'hi' 
      ? `सुबह का शुभ समय (${nakshatra || 'सूर्योदय के बाद'} नक्षत्र)`
      : `Auspicious morning time (${nakshatra || 'after sunrise'} nakshatra)`
  });
  
  // Afternoon Muhurat (avoid Rahu Kalam)
  if (rahuKalam && !rahuKalam.includes('12:00')) {
    muhurats.push({
      activity: activityName,
      status: 'Good',
      timeRange: '12:00 - 14:00',
      reason: language === 'hi' 
        ? `दोपहर का शुभ समय (राहु काल से बचा हुआ)`
        : `Auspicious afternoon time (avoiding Rahu Kalam)`
    });
  }
  
  // Evening Muhurat
  muhurats.push({
    activity: activityName,
    status: 'Average',
    timeRange: '17:00 - 19:00',
    reason: language === 'hi' 
      ? `शाम का समय (${yoga} योग)`
      : `Evening time (${yoga} yoga)`
  });
  
  // If no specific activity, add more general muhurats
  if (activity === 'general') {
    muhurats.push({
      activity: language === 'hi' ? 'विवाह' : 'Marriage',
      status: 'Excellent',
      timeRange: abhijitMuhurat || '11:00 - 13:00',
      reason: language === 'hi' 
        ? `विवाह के लिए सबसे शुभ समय`
        : `Most auspicious time for marriage`
    });
    
    muhurats.push({
      activity: language === 'hi' ? 'व्यापार शुरू करना' : 'Starting Business',
      status: 'Good',
      timeRange: '10:00 - 12:00',
      reason: language === 'hi' 
        ? `व्यापार शुरू करने के लिए शुभ समय`
        : `Auspicious time to start business`
    });
  }
  
  return muhurats;
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

