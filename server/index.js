import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateKundali } from './services/kundaliService.js';
import { generateMuhurat } from './services/muhuratService.js';
import { generateGochara } from './services/gocharaService.js';
import { generateGenericTransits, generatePersonalTransits } from './services/transitService.js';
import { generateHoroscope } from './services/horoscopeService.js';
import { generatePanchang } from './services/panchangService.js';
import { generateMatchmaking } from './services/matchmakingService.js';
import { generateTarot } from './services/tarotService.js';
import { generatePredictions } from './services/predictionService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Cache configuration - 1 hour TTL for most data, 24 hours for static calculations
const cache = new NodeCache({ 
  stdTTL: 3600, // 1 hour default
  checkperiod: 600 // Check for expired keys every 10 minutes
});

// Cache helper function
const getCachedOrCompute = async (key, computeFn, ttl = 3600) => {
  const cached = cache.get(key);
  if (cached) {
    console.log(`Cache HIT for key: ${key}`);
    return cached;
  }
  console.log(`Cache MISS for key: ${key}`);
  const result = await computeFn();
  cache.set(key, result, ttl);
  return result;
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize Gemini AI
let genAI = null;
try {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('✅ Gemini AI initialized for predictions');
  } else {
    console.warn('⚠️  Gemini API key not found - predictions will be limited');
  }
} catch (error) {
  console.warn('⚠️  Failed to initialize Gemini AI:', error.message);
}

// D1 Chart (Birth Chart/Kundali)
app.post('/api/kundali', async (req, res) => {
  try {
    const { name, date, time, location, lat, lon, tzone, seconds, language = 'en', includePredictions = true } = req.body;
    
    if (!name || !date || !time || !location) {
      return res.status(400).json({ error: 'Missing required fields: name, date, time, location' });
    }

    // Create cache key from input parameters
    const cacheKey = `kundali:${name}:${date}:${time}:${location}:${lat || ''}:${lon || ''}:${language}:${includePredictions}`;
    
    const result = await getCachedOrCompute(cacheKey, async () => {
      const kundaliData = await generateKundali({
        name,
        date,
        time,
        location,
        lat,
        lon,
        tzone,
        seconds,
        language
      }, language);

      // Generate AI-based predictions if requested
      if (includePredictions) {
        try {
          if (genAI) {
            const predictions = await generatePredictions(kundaliData, language, genAI);
            kundaliData.predictions = predictions;
          } else {
            // Fallback: Basic predictions without AI
            kundaliData.predictions = generateBasicPredictions(kundaliData, language);
          }
        } catch (predError) {
          console.warn('Prediction generation failed, using basic predictions:', predError);
          kundaliData.predictions = generateBasicPredictions(kundaliData, language);
        }
      }

      return kundaliData;
    }, 86400); // Cache for 24 hours (birth chart doesn't change)

    res.json(result);
  } catch (error) {
    console.error('Kundali API error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate Kundali' });
  }
});

// D9 Chart (Navamsha)
app.post('/api/navamsha', async (req, res) => {
  try {
    const { date, time, location, lat, lon, tzone, seconds } = req.body;
    
    if (!date || !time || !location) {
      return res.status(400).json({ error: 'Missing required fields: date, time, location' });
    }

    const cacheKey = `navamsha:${date}:${time}:${location}:${lat || ''}:${lon || ''}`;
    
    const result = await getCachedOrCompute(cacheKey, async () => {
      return await generateKundali({
        name: '',
        date,
        time,
        location,
        lat,
        lon,
        tzone,
        seconds
      }, 'en');
    }, 86400);

    // Return only D9 data
    res.json({
      navamshaPositions: result.charts?.navamshaPositions || [],
      navamshaAscendantSignId: result.charts?.navamshaAscendantSignId || 1,
      d9ChartSvg: result.charts?.d9ChartSvg || null
    });
  } catch (error) {
    console.error('Navamsha API error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate Navamsha chart' });
  }
});

// Muhurat (Best Timing)
app.post('/api/muhurat', async (req, res) => {
  try {
    const { date, location, activity, language = 'en' } = req.body;
    
    if (!date || !location) {
      return res.status(400).json({ error: 'Missing required fields: date, location' });
    }

    const cacheKey = `muhurat:${date}:${location}:${activity || 'general'}:${language}`;
    
    const result = await getCachedOrCompute(cacheKey, async () => {
      return await generateMuhurat(date, location, activity, language);
    }, 3600); // Cache for 1 hour (daily data)

    res.json(result);
  } catch (error) {
    console.error('Muhurat API error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate Muhurat' });
  }
});

// Gochara (Transits/Sky Tracker) - Generic transits without birth chart
app.post('/api/transits/generic', async (req, res) => {
  try {
    const { location, rashi, currentDate, language = 'en' } = req.body;
    
    if (!location || !rashi) {
      return res.status(400).json({ error: 'Missing required fields: location, rashi' });
    }

    const cacheKey = `transits:generic:${location}:${rashi}:${currentDate || new Date().toISOString().split('T')[0]}:${language}`;
    
    const result = await getCachedOrCompute(cacheKey, async () => {
      return await generateGenericTransits(location, rashi, currentDate, language);
    }, 1800); // Cache for 30 minutes (transits change frequently)

    res.json(result);
  } catch (error) {
    console.error('Generic Transits API error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate transits' });
  }
});

// Gochara (Transits/Sky Tracker) - Personal transits with birth chart
app.post('/api/gochara', async (req, res) => {
  try {
    const { birthDate, birthTime, birthLocation, currentDate, language = 'en' } = req.body;
    
    if (!birthDate || !birthTime || !birthLocation) {
      return res.status(400).json({ error: 'Missing required fields: birthDate, birthTime, birthLocation' });
    }

    const cacheKey = `gochara:${birthDate}:${birthTime}:${birthLocation}:${currentDate || new Date().toISOString().split('T')[0]}:${language}`;
    
    // Try new transit service first (no API key needed)
    try {
      const result = await getCachedOrCompute(cacheKey, async () => {
        return await generatePersonalTransits(birthDate, birthTime, birthLocation, currentDate, language);
      }, 1800); // Cache for 30 minutes
      
      res.json(result);
    } catch (transitError) {
      console.warn('New transit service failed, trying old gochara service:', transitError);
      // Fallback to old service if available
      const result = await getCachedOrCompute(cacheKey, async () => {
        return await generateGochara(birthDate, birthTime, birthLocation, currentDate, language);
      }, 3600);
      
      res.json(result);
    }
  } catch (error) {
    console.error('Gochara API error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate Gochara' });
  }
});

// Horoscope (Rashifal)
app.post('/api/horoscope', async (req, res) => {
  try {
    const { sign, date, language = 'en' } = req.body;
    
    if (!sign || !date) {
      return res.status(400).json({ error: 'Missing required fields: sign, date' });
    }

    const cacheKey = `horoscope:${sign}:${date}:${language}`;
    
    const result = await getCachedOrCompute(cacheKey, async () => {
      return await generateHoroscope(sign, date, language);
    }, 3600); // Cache for 1 hour (daily horoscope)

    res.json(result);
  } catch (error) {
    console.error('Horoscope API error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate Horoscope' });
  }
});

// Panchang (Almanac)
app.post('/api/panchang', async (req, res) => {
  try {
    const { date, location, language = 'en' } = req.body;
    
    if (!date || !location) {
      return res.status(400).json({ error: 'Missing required fields: date, location' });
    }

    const cacheKey = `panchang:${date}:${location}:${language}`;
    
    const result = await getCachedOrCompute(cacheKey, async () => {
      return await generatePanchang(date, location, language);
    }, 3600); // Cache for 1 hour

    res.json(result);
  } catch (error) {
    console.error('Panchang API error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate Panchang' });
  }
});

// Matchmaking (Harmony & Bond)
app.post('/api/matchmaking', async (req, res) => {
  try {
    const { boy, girl, language = 'en' } = req.body;
    
    if (!boy || !girl || !boy.date || !girl.date) {
      return res.status(400).json({ error: 'Missing required fields: boy and girl birth details' });
    }

    const cacheKey = `matchmaking:${boy.date}:${boy.time}:${boy.location}:${girl.date}:${girl.time}:${girl.location}:${language}`;
    
    const result = await getCachedOrCompute(cacheKey, async () => {
      return await generateMatchmaking(boy, girl, language);
    }, 86400); // Cache for 24 hours

    res.json(result);
  } catch (error) {
    console.error('Matchmaking API error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate Matchmaking report' });
  }
});

// Ashtakoota (Detailed 8 Kootas) - Dedicated endpoint for Love Harmony
app.post('/api/ashtakoota', async (req, res) => {
  try {
    const { personA, personB, language = 'en' } = req.body;
    
    // Support both formats: {boy, girl} or {personA, personB}
    const boy = personA || req.body.boy;
    const girl = personB || req.body.girl;
    
    if (!boy || !girl || !boy.date || !girl.date) {
      return res.status(400).json({ error: 'Missing required fields: personA and personB birth details' });
    }

    const cacheKey = `ashtakoota:${boy.date}:${boy.time}:${boy.location}:${girl.date}:${girl.time}:${girl.location}:${language}`;
    
    const result = await getCachedOrCompute(cacheKey, async () => {
      return await generateMatchmaking(boy, girl, language);
    }, 86400); // Cache for 24 hours

    res.json(result);
  } catch (error) {
    console.error('Ashtakoota API error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate Ashtakoota report' });
  }
});

// Tarot Card Reading
app.post('/api/tarot', async (req, res) => {
  try {
    const { question, spread, language = 'en' } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Missing required field: question' });
    }

    // Don't cache tarot readings as they should be unique
    const result = await generateTarot(question, spread, language);
    
    res.json(result);
  } catch (error) {
    console.error('Tarot API error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate Tarot reading' });
  }
});

// Clear cache endpoint (for admin use)
app.post('/api/cache/clear', (req, res) => {
  try {
    const { key } = req.body;
    if (key) {
      cache.del(key);
      res.json({ message: `Cache cleared for key: ${key}` });
    } else {
      cache.flushAll();
      res.json({ message: 'All cache cleared' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get cache stats
app.get('/api/cache/stats', (req, res) => {
  const stats = cache.getStats();
  res.json(stats);
});

// Basic predictions fallback (without AI)
function generateBasicPredictions(kundaliData, language) {
  const { basicDetails, charts, dasha } = kundaliData;
  const isHindi = language === 'hi';
  
  return {
    general: isHindi 
      ? `${basicDetails.name} का जीवन ${basicDetails.ascendant} लग्न और ${basicDetails.moonSign} राशि के प्रभाव में है।`
      : `${basicDetails.name}'s life is influenced by ${basicDetails.ascendant} ascendant and ${basicDetails.moonSign} moon sign.`,
    career: isHindi
      ? `कार्यक्षेत्र में ${dasha?.currentMahadasha || 'planetary'} महादशा का प्रभाव है।`
      : `Career is influenced by ${dasha?.currentMahadasha || 'planetary'} Mahadasha.`,
    love: isHindi
      ? 'प्रेम संबंधों में सामंजस्य बनाए रखें।'
      : 'Maintain harmony in relationships.',
    health: isHindi
      ? 'स्वास्थ्य का ध्यान रखें।'
      : 'Take care of health.',
    finance: isHindi
      ? 'वित्तीय स्थिति स्थिर रहेगी।'
      : 'Financial situation will remain stable.',
    education: isHindi
      ? 'शिक्षा में सफलता मिलेगी।'
      : 'Success in education.',
    family: isHindi
      ? 'परिवार में सामंजस्य बना रहेगा।'
      : 'Harmony will be maintained in family.',
    spirituality: isHindi
      ? 'आध्यात्मिक विकास के अवसर हैं।'
      : 'Opportunities for spiritual growth.'
  };
}

app.listen(PORT, () => {
  console.log(`🚀 CosmicJyoti Backend API running on port ${PORT}`);
  console.log(`📊 Cache enabled with TTL: 3600s (1 hour)`);
  console.log(`🤖 AI Predictions: ${genAI ? 'Enabled' : 'Disabled (API key missing)'}`);
});

