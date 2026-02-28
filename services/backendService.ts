/**
 * Backend API Service - All API calls go through our backend
 */

// Detect if running on Android/Capacitor
const isCapacitor = typeof (window as any).Capacitor !== 'undefined';
const isAndroid = isCapacitor && (window as any).Capacitor.getPlatform() === 'android';
const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';
const isDevelopment = import.meta.env.DEV;

// Helper to log only in development
const devLog = (...args: any[]) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

const devWarn = (...args: any[]) => {
  if (isDevelopment) {
    console.warn(...args);
  }
};

/**
 * Get API Base URL for backend service
 * 
 * Priority:
 * 1. VITE_API_BASE_URL env variable (if set and valid for current environment)
 * 2. Development mode: localhost:3001 (for local development)
 * 3. Production/Android: null (fallback to direct API calls)
 * 
 * Production Safety:
 * - Never uses localhost in production or Android builds
 * - Automatically falls back to direct API calls if backend unavailable
 */
const getApiBaseUrl = (): string | null => {
  // Priority 1: Check for environment variable first (for custom backend URLs)
  if (import.meta.env.VITE_API_BASE_URL) {
    const url = import.meta.env.VITE_API_BASE_URL.trim();
    
    // Validate URL format
    if (!url || url.length === 0) {
      devWarn('[BackendService] VITE_API_BASE_URL is empty, using fallback');
      // Fall through to next priority
    } else {
      // Safety check: Don't use localhost in production or Android
      if ((isProduction || isAndroid) && (url.includes('localhost') || url.includes('127.0.0.1'))) {
        // Always warn about this in production as it's a configuration error
        console.warn('[BackendService] ⚠️ VITE_API_BASE_URL contains localhost in production/Android, ignoring. Using direct API calls.');
        return null;
      }
      
      // Validate URL format (should start with http:// or https://)
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        devWarn('[BackendService] VITE_API_BASE_URL must start with http:// or https://, using fallback');
        // Fall through to next priority
      } else {
        devLog(`[BackendService] Using backend API: ${url}`);
        return url;
      }
    }
  }
  
  // Priority 2: On Android or production, don't use localhost (it won't work)
  if (isAndroid || isProduction) {
    devLog('[BackendService] Production/Android build detected. Using direct API calls (no backend).');
    // Return null to indicate we should use direct API calls instead
    return null;
  }
  
  // Priority 3: For web/localhost development only, try backend
  // Only use localhost in development mode
  if (isDevelopment) {
    const devUrl = 'http://localhost:3001';
    devLog(`[BackendService] Development mode. Using backend API: ${devUrl}`);
    return devUrl;
  }
  
  // Default: no backend in production
  devLog('[BackendService] No backend configured. Using direct API calls.');
  return null;
};

const API_BASE_URL = getApiBaseUrl();

/** True when frontend is configured to use a backend (e.g. VITE_API_BASE_URL or dev localhost). */
export function isBackendConfigured(): boolean {
  return API_BASE_URL !== null;
}

export interface KundaliFormData {
  name: string;
  date: string;
  time: string;
  location: string;
  gender?: 'male' | 'female' | 'other';
  lat?: number;
  lon?: number;
  tzone?: string;
  seconds?: number;
  language?: string;
}

export interface BackendKundaliResponse {
  basicDetails: {
    ascendant: string;
    ascendantSignId: number;
    moonSign: string;
    sunSign: string;
    nakshatra: string;
    name: string;
  };
  charts: {
    planetaryPositions: any[];
    navamshaPositions: any[];
    navamshaAscendantSignId: number;
    d1ChartSvg?: string;
    d9ChartSvg?: string;
    importantPoints?: any[];
  };
  panchang: any;
  dasha: {
    currentMahadasha: string;
    antardasha: string;
    endsAt: string;
    analysis: string;
  };
  predictions: {
    general?: string;
    career?: string;
    love?: string;
    health?: string;
    finance?: string;
    education?: string;
    family?: string;
    spirituality?: string;
  };
}

/**
 * Generate Kundali using backend API
 */
export async function generateKundaliFromBackend(
  formData: KundaliFormData,
  language: string = 'en'
): Promise<BackendKundaliResponse> {
  // If no backend URL (Android or not configured), throw error to trigger fallback
  if (!API_BASE_URL) {
    throw new Error('Backend not available, using direct API calls');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/kundali`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        language,
        includePredictions: true
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Backend Kundali API error:', error);
    // Re-throw to trigger fallback to direct API calls
    throw error;
  }
}

const COSMIC_HEALTH_TIMEOUT_MS = 15000;

/**
 * Generate Cosmic Health analysis using backend API
 */
export async function generateChartBasedHealthAnalysisFromBackend(
  birthData: { date: string; time: string; city: string },
  language: string = 'en'
): Promise<{ healthIssues: string[]; chartSummary: string; remedies: { dosha: string; description: string; remedies: string[] }[] }> {
  if (!API_BASE_URL) {
    throw new Error('Backend not available, using direct API calls');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), COSMIC_HEALTH_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/api/cosmic-health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: birthData.date,
        time: birthData.time,
        city: birthData.city,
        language,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cosmic Health API error: ${response.status} - ${errorText}`);
    }
    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error?.name === 'AbortError') {
      throw new Error('Cosmic Health request timed out');
    }
    devWarn('[BackendService] Cosmic Health backend failed:', error?.message);
    throw error;
  }
}

/**
 * Generate Muhurat using backend API
 */
export async function generateMuhuratFromBackend(
  date: string,
  location: string,
  activity: string = 'general',
  language: string = 'en'
): Promise<any> {
  // If no backend URL (Android or not configured), throw error to trigger fallback
  if (!API_BASE_URL) {
    throw new Error('Backend not available, using direct API calls');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/muhurat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date,
        location,
        activity,
        language,
      }),
    });

    if (!response.ok) {
      throw new Error(`Muhurat API error: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Backend Muhurat API error:', error);
    // Re-throw to trigger fallback to direct API calls
    throw error;
  }
}

/** Timeout in ms for transits backend call - then fallback to Perplexity/Gemini */
const TRANSITS_BACKEND_TIMEOUT_MS = 8000;

/**
 * Generate Generic Transits (without birth chart) using backend API
 */
export async function generateGenericTransitsFromBackend(
  location: string,
  rashi: string,
  currentDate: string | null = null,
  language: string = 'en'
): Promise<any> {
  // If no backend URL (Android or production), throw error to trigger fallback
  if (!API_BASE_URL) {
    throw new Error('Backend not available, using direct API calls');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TRANSITS_BACKEND_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/api/transits/generic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location,
        rashi,
        currentDate: currentDate || new Date().toISOString().split('T')[0],
        language,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Generic Transits API error: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    const isAbort = error?.name === 'AbortError';
    const isConnectionError = isAbort || !error?.message || error?.message === 'Failed to fetch' || error?.code === 'ERR_CONNECTION_REFUSED' || error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT';
    if (isConnectionError) {
      devWarn('[BackendService] Transits backend unreachable or slow, using fallback.');
    } else {
      console.error('Backend Generic Transits API error:', error);
    }
    if (isAbort) {
      throw new Error('Backend transits request timed out');
    }
    throw error;
  }
}

/**
 * Generate Gochara (Transits) using backend API
 */
export async function generateGocharaFromBackend(
  birthDate: string,
  birthTime: string,
  birthLocation: string,
  currentDate: string | null = null,
  language: string = 'en'
): Promise<any> {
  // If no backend URL (Android or production), throw error to trigger fallback
  if (!API_BASE_URL) {
    throw new Error('Backend not available, using direct API calls');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/gochara`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        birthDate,
        birthTime,
        birthLocation,
        currentDate: currentDate || new Date().toISOString().split('T')[0],
        language,
      }),
    });

    if (!response.ok) {
      throw new Error(`Gochara API error: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Backend Gochara API error:', error);
    throw error;
  }
}

/**
 * Generate Horoscope using backend API
 */
export async function generateHoroscopeFromBackend(
  sign: string,
  date: string,
  language: string = 'en',
  period: 'day' | 'week' | 'month' | 'year' = 'day'
): Promise<any> {
  // If no backend URL (Android or not configured), throw error to trigger fallback
  if (!API_BASE_URL) {
    throw new Error('Backend not available, using direct API calls');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/horoscope`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sign,
        date,
        language,
        period,
      }),
    });

    if (!response.ok) {
      throw new Error(`Horoscope API error: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Backend Horoscope API error:', error);
    // Re-throw to trigger fallback to direct API calls
    throw error;
  }
}

/**
 * Generate Panchang using backend API
 */
export async function generatePanchangFromBackend(
  date: string,
  location: string,
  language: string = 'en'
): Promise<any> {
  // If no backend URL (Android or production), throw error to trigger fallback
  if (!API_BASE_URL) {
    throw new Error('Backend not available, using direct API calls');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/panchang`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date,
        location,
        language,
      }),
    });

    if (!response.ok) {
      throw new Error(`Panchang API error: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Backend Panchang API error:', error);
    throw error;
  }
}

/**
 * Generate Matchmaking using backend API
 */
export async function generateMatchmakingFromBackend(
  boy: any,
  girl: any,
  language: string = 'en'
): Promise<any> {
  // If no backend URL (Android or production), throw error to trigger fallback
  if (!API_BASE_URL) {
    throw new Error('Backend not available, using direct API calls');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/matchmaking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        boy,
        girl,
        language,
      }),
    });

    if (!response.ok) {
      throw new Error(`Matchmaking API error: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Backend Matchmaking API error:', error);
    throw error;
  }
}

/**
 * Generate Ashtakoota (detailed 8 kootas) using backend API
 */
export async function generateAshtakootaFromBackend(
  personA: any,
  personB: any,
  language: string = 'en'
): Promise<any> {
  // If no backend URL (Android or production), throw error to trigger fallback
  if (!API_BASE_URL) {
    throw new Error('Backend not available, using direct API calls');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/ashtakoota`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personA,
        personB,
        language,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ashtakoota API error: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Backend Ashtakoota API error:', error);
    throw error;
  }
}

/**
 * Ask Rishi (AI chat) via backend - avoids CORS when calling from browser
 */
export async function askRishiFromBackend(
  prompt: string,
  language: string = 'en',
  context?: string,
  persona: string = 'general'
): Promise<{ text: string; sources: { title: string; uri: string }[] }> {
  if (!API_BASE_URL) {
    throw new Error('Backend not available, using direct API calls');
  }

  const response = await fetch(`${API_BASE_URL}/api/ask-rishi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, language, context, persona }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Ask Rishi API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return { text: data.text || '', sources: data.sources || [] };
}

/**
 * Generate Tarot reading using backend API
 */
export async function generateTarotFromBackend(
  question: string,
  spread: string = 'three-card',
  language: string = 'en'
): Promise<any> {
  // If no backend URL (Android or production), throw error to trigger fallback
  if (!API_BASE_URL) {
    throw new Error('Backend not available, using direct API calls');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/tarot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        spread,
        language,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tarot API error: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Backend Tarot API error:', error);
    throw error;
  }
}

