import https from 'https';
import axios from 'axios';
import { postWithKeyRotation } from '../utils/astrologyApiKeys.js';

const ASTROLOGY_API_BASE = process.env.ASTROLOGY_API_BASE_URL || 'https://json.freeastrologyapi.com';

// On Windows/corporate networks, "unable to get local issuer certificate" can occur.
// Set NODE_TLS_REJECT_UNAUTHORIZED=0 or ALLOW_INSECURE_SSL=1 in .env (dev only) to skip SSL verify for outbound requests.
const skipSslVerify = process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0' || process.env.ALLOW_INSECURE_SSL === '1';
const httpsAgent = skipSslVerify ? new https.Agent({ rejectUnauthorized: false }) : undefined;
const axiosWithTls = httpsAgent ? axios.create({ httpsAgent }) : axios;

/**
 * Get coordinates from location using Google Geocoding API
 */
async function getCoordinates(location, lat, lon) {
  if (lat !== undefined && lon !== undefined) {
    // Calculate timezone from longitude (approximate)
    const timezone = Math.round((lon / 15) * 2) / 2;
    return { lat, lon, timezone };
  }

  try {
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    if (!GOOGLE_API_KEY) {
      console.warn("Google API key not found, using default coordinates");
      return { lat: 19.0760, lon: 72.8777, timezone: 5.5 };
    }

    const encodedLocation = encodeURIComponent(location);
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${GOOGLE_API_KEY}`;
    
    const response = await axiosWithTls.get(geocodeUrl);
    
    if (response.data.status === 'OK' && response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      const location_data = result.geometry.location;
      const lat = location_data.lat;
      const lon = location_data.lng;
      
      // Get timezone
      let timezone = 5.5;
      try {
        const timestamp = Math.floor(Date.now() / 1000);
        const timezoneUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lon}&timestamp=${timestamp}&key=${GOOGLE_API_KEY}`;
        const tzResponse = await axiosWithTls.get(timezoneUrl);
        if (tzResponse.data.status === 'OK' && tzResponse.data.rawOffset !== undefined) {
          timezone = tzResponse.data.rawOffset / 3600;
        }
      } catch (tzError) {
        console.warn("Timezone API failed, calculating from longitude:", tzError);
        timezone = Math.round((lon / 15) * 2) / 2;
      }
      
      return { lat, lon, timezone };
    }
  } catch (e) {
    console.error("Geocoding failed:", e);
  }
  
  return { lat: 19.0760, lon: 72.8777, timezone: 5.5 };
}

/**
 * Parse date and time
 */
function parseDateTime(dateStr, timeStr, seconds = 0) {
  const date = new Date(dateStr);
  const [hours, minutes] = timeStr.split(':').map(Number);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    date: date.getDate(),
    hours: hours || 0,
    minutes: minutes || 0,
    seconds: seconds || 0
  };
}

/**
 * Generate Kundali (D1 Chart)
 */
export async function generateKundali(formData, language = 'en') {
  try {
    console.log("Starting Kundali generation for:", formData.name, "Language:", language);
    
    // Get coordinates
    const coords = await getCoordinates(formData.location, formData.lat, formData.lon);
    console.log("Coordinates:", coords);
    
    // Parse date and time
    const dt = parseDateTime(formData.date, formData.time, formData.seconds || 0);
    console.log("Parsed date/time:", dt);
    
    // Calculate timezone
    let timezone = coords.timezone;
    if (formData.tzone) {
      const tzMatch = formData.tzone.match(/([+-]?\d+):?(\d+)?/);
      if (tzMatch) {
        const hours = parseInt(tzMatch[1]) || 0;
        const minutes = parseInt(tzMatch[2] || '0');
        timezone = hours + (minutes / 60);
      }
    }
    
    // Prepare payload
    const chartPayload = {
      year: dt.year,
      month: dt.month,
      date: dt.date,
      hours: dt.hours,
      minutes: dt.minutes,
      seconds: dt.seconds || 0,
      latitude: coords.lat,
      longitude: coords.lon,
      timezone: timezone
    };

    const d1Payload = {
      ...chartPayload,
      settings: {
        observation_point: formData.observationPoint || "topocentric",
        ayanamsha: formData.ayanamsha || "lahiri",
        language: formData.language || (language === 'hi' ? 'hi' : 'en')
      }
    };
    
    console.log("D1 Payload prepared:", JSON.stringify(d1Payload, null, 2));

    // Call D1 chart URL API
    let d1ChartSvg = null;
    let d1ChartUrl = null;
    
    try {
      const d1ChartResponse = await postWithKeyRotation(
        axiosWithTls,
        `${ASTROLOGY_API_BASE}/horoscope-chart-url`,
        chartPayload
      );

      if (d1ChartResponse.data) {
        const chartData = d1ChartResponse.data;
        d1ChartUrl = chartData.url || chartData.chart_url || chartData.image_url || chartData.data?.url || null;
        d1ChartSvg = chartData.svg || chartData.svg_code || chartData.chart_svg || chartData.data?.svg || null;
        
        console.log("D1 Chart Response:", {
          hasUrl: !!d1ChartUrl,
          hasSvg: !!d1ChartSvg,
          responseKeys: Object.keys(chartData)
        });
        
        // If we got a URL, fetch the SVG from it
        if (d1ChartUrl && !d1ChartSvg) {
          try {
            const svgResponse = await axiosWithTls.get(d1ChartUrl);
            d1ChartSvg = svgResponse.data;
            console.log("Fetched SVG from URL, length:", d1ChartSvg?.length);
          } catch (e) {
            console.warn("Failed to fetch SVG from URL:", e.message);
          }
        }
      }
    } catch (chartError) {
      console.error("D1 Chart API error:", chartError.message);
      // Continue without chart SVG - will use generated chart instead
    }

    // Call D1 planets API
    let d1Data = null;
    try {
      const d1Response = await postWithKeyRotation(
        axiosWithTls,
        `${ASTROLOGY_API_BASE}/planets`,
        d1Payload
      );

      d1Data = d1Response.data;
      if (d1Data.output) {
        d1Data = d1Data.output;
      }
      console.log("D1 Planets API success, data keys:", Object.keys(d1Data || {}));
    } catch (planetsError) {
      console.error("D1 Planets API error:", planetsError.message);
      throw new Error(`Failed to fetch planetary data: ${planetsError.message}`);
    }

    // Call D9 chart API
    const d9Payload = {
      ...chartPayload,
      config: {
        observation_point: formData.observationPoint || "topocentric",
        ayanamsha: formData.ayanamsha || "lahiri"
      }
    };

    let d9Data = null;
    try {
      const d9Response = await postWithKeyRotation(
        axiosWithTls,
        `${ASTROLOGY_API_BASE}/navamsa-chart-info`,
        d9Payload
      );

      d9Data = d9Response.data;
      if (d9Data.output) {
        d9Data = d9Data.output;
      }
      console.log("D9 Chart API success, data keys:", Object.keys(d9Data || {}));
    } catch (d9Error) {
      console.error("D9 Chart API error:", d9Error.message);
      // Use empty data structure if D9 fails
      d9Data = {};
    }

    // Call D9 chart SVG API
    let d9ChartSvg = null;
    
    try {
      const d9ChartResponse = await postWithKeyRotation(
        axiosWithTls,
        `${ASTROLOGY_API_BASE}/navamsa-chart-svg-code`,
        d9Payload
      );

      if (d9ChartResponse.data) {
        let d9ChartData = d9ChartResponse.data;
        if (d9ChartData.output) {
          d9ChartData = d9ChartData.output;
        }
        d9ChartSvg = d9ChartData.svg || d9ChartData.svg_code || d9ChartData.chart_svg || d9ChartData.data || d9ChartData.chart || null;
        
        console.log("D9 Chart Response:", {
          hasSvg: !!d9ChartSvg,
          svgLength: d9ChartSvg?.length,
          responseKeys: Object.keys(d9ChartData)
        });
      }
    } catch (chartError) {
      console.error("D9 Chart API error:", chartError.message);
      // Continue without chart SVG - will use generated chart instead
    }

    // Parse planetary positions (simplified - you'll need to implement full parsing)
    if (!d1Data) {
      throw new Error("No planetary data received from API");
    }
    
    const planetaryPositions = parsePlanetaryPositions(d1Data);
    const navamshaPositions = d9Data ? parseNavamshaPositions(d9Data) : [];
    
    if (planetaryPositions.length === 0) {
      console.warn("No planetary positions parsed, checking d1Data structure:", Object.keys(d1Data));
    }
    
    // Extract basic details
    const ascendantSignId = d1Data.Ascendant?.current_sign || d1Data.ascendant?.current_sign || 1;
    const ascendantSign = d1Data.Ascendant?.zodiac_sign_name || 'Aries';
    const moonSign = d1Data.Moon?.zodiac_sign_name || 'Aries';
    const sunSign = d1Data.Sun?.zodiac_sign_name || 'Aries';
    const moonNakshatra = d1Data.Moon?.nakshatra_name || 'Ashwini';
    const navamshaAscendantSignId = d9Data.Ascendant?.current_sign || d9Data.ascendant?.current_sign || 1;

    console.log("Kundali generation complete:", {
      hasPlanetaryPositions: planetaryPositions.length > 0,
      hasNavamshaPositions: navamshaPositions.length > 0,
      hasD1ChartSvg: !!d1ChartSvg,
      hasD9ChartSvg: !!d9ChartSvg,
      ascendantSignId: ascendantSignId
    });

    return {
      basicDetails: {
        ascendant: ascendantSign,
        ascendantSignId: ascendantSignId,
        moonSign: moonSign,
        sunSign: sunSign,
        nakshatra: moonNakshatra,
        name: formData.name
      },
      charts: {
        planetaryPositions: planetaryPositions,
        navamshaPositions: navamshaPositions,
        navamshaAscendantSignId: navamshaAscendantSignId,
        d1ChartSvg: d1ChartSvg,
        d9ChartSvg: d9ChartSvg
      },
      panchang: d1Data.panchang || {},
      dasha: calculateDasha(moonNakshatra, formData.date, formData.time),
      predictions: {} // Will be generated by AI if needed
    };
  } catch (error) {
    console.error('Kundali generation error:', error);
    throw new Error(`Failed to generate Kundali: ${error.message}`);
  }
}

/**
 * Parse planetary positions from API response
 */
function parsePlanetaryPositions(d1Data) {
  const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const signMap = {
    'Aries': 1, 'Taurus': 2, 'Gemini': 3, 'Cancer': 4,
    'Leo': 5, 'Virgo': 6, 'Libra': 7, 'Scorpio': 8,
    'Sagittarius': 9, 'Capricorn': 10, 'Aquarius': 11, 'Pisces': 12
  };

  const ascendantSignId = d1Data.Ascendant?.current_sign || d1Data.ascendant?.current_sign || 1;
  const positions = [];

  planets.forEach(planetName => {
    const planetData = d1Data[planetName];
    if (planetData) {
      const signName = planetData.zodiac_sign_name || planetData.sign || 'Aries';
      const signId = planetData.current_sign || signMap[signName] || 1;
      const house = planetData.house_number || ((signId - ascendantSignId + 12) % 12) + 1;
      const degree = planetData.normDegree || planetData.fullDegree || planetData.degree || '0';
      const nakshatra = planetData.nakshatra_name || planetData.nakshatra || '';
      const isRetrograde = planetData.isRetro === "true" || planetData.isRetro === true || false;

      positions.push({
        planet: planetName,
        sign: signName,
        signId: signId,
        house: house,
        degree: typeof degree === 'number' ? degree.toFixed(2) : String(degree),
        nakshatra: nakshatra,
        isRetrograde: isRetrograde
      });
    }
  });

  return positions;
}

/**
 * Parse Navamsha positions
 */
function parseNavamshaPositions(d9Data) {
  const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  
  const navAscId = d9Data.Ascendant?.current_sign || 1;
  const positions = [];

  planets.forEach(planetName => {
    const planetData = d9Data[planetName];
    if (planetData) {
      const signId = planetData.current_sign || 1;
      const signName = signNames[signId - 1] || 'Aries';
      const house = planetData.house_number || ((signId - navAscId + 12) % 12) + 1;

      positions.push({
        planet: planetName,
        sign: signName,
        signId: signId,
        house: house
      });
    }
  });

  return positions;
}

/**
 * Calculate Vimshottari Dasha
 */
function calculateDasha(moonNakshatra, birthDate, birthTime) {
  // Simplified Dasha calculation - implement full logic as needed
  const nakshatraToDashaStart = {
    'Ashwini': 'Ketu', 'Bharani': 'Venus', 'Krittika': 'Sun', 'Rohini': 'Moon',
    'Mrigashira': 'Mars', 'Ardra': 'Rahu', 'Punarvasu': 'Jupiter', 'Pushya': 'Saturn',
    'Ashlesha': 'Mercury', 'Magha': 'Ketu', 'Purva Phalguni': 'Venus', 'Uttara Phalguni': 'Sun',
    'Hasta': 'Moon', 'Chitra': 'Mars', 'Swati': 'Rahu', 'Vishakha': 'Jupiter',
    'Anuradha': 'Saturn', 'Jyeshtha': 'Mercury', 'Mula': 'Ketu', 'Purva Ashadha': 'Venus',
    'Uttara Ashadha': 'Sun', 'Shravana': 'Moon', 'Dhanishta': 'Mars', 'Shatabhisha': 'Rahu',
    'Purva Bhadrapada': 'Jupiter', 'Uttara Bhadrapada': 'Saturn', 'Revati': 'Mercury'
  };

  const normalizedNakshatra = moonNakshatra.split('(')[0].trim();
  const startingDasha = nakshatraToDashaStart[normalizedNakshatra] || 'Ketu';
  
  // Calculate current Dasha based on elapsed time
  const birth = new Date(`${birthDate}T${birthTime}`);
  const now = new Date();
  const yearsSinceBirth = (now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

  // Simplified - return starting Dasha for now
  return {
    currentMahadasha: startingDasha,
    antardasha: startingDasha,
    endsAt: new Date(now.getTime() + 365.25 * 24 * 60 * 60 * 1000 * 6).toISOString(),
    analysis: ''
  };
}

