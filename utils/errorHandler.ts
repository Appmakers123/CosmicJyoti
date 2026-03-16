/**
 * Safe Error Handler - Prevents app crashes from errors
 * All error messages are device-compatible and user-friendly
 */

export interface SafeError {
  message: string;
  code?: string;
  userFriendly: boolean;
}

/**
 * Safely extract error message from any error type
 * Prevents crashes from undefined/null errors
 */
import type { Language } from '../types';

export function getSafeErrorMessage(error: unknown, language: Language = 'en'): string {
  try {
    // Handle null/undefined
    if (!error) {
      return language === 'hi' 
        ? 'एक अज्ञात त्रुटि हुई। कृपया पुनः प्रयास करें।'
        : 'An unknown error occurred. Please try again.';
    }

    // Handle Error objects
    if (error instanceof Error) {
      const message = error.message || '';
      
      // Network errors (including CORS / "Failed to fetch" when backend is unreachable from deployed site)
      if (message.includes('network') || message.includes('fetch') || message.includes('Failed to fetch')) {
        const isProd = typeof import.meta !== 'undefined' && (import.meta as any).env?.PROD;
        if (isProd && (message.includes('Failed to fetch') || message.includes('fetch'))) {
          return language === 'hi'
            ? 'सर्वर से कनेक्ट नहीं हो पाया। बैकएंड पर CORS_ORIGIN में अपनी साइट URL जोड़ें, या GitHub Secrets में VITE_ASTROLOGY_API_KEYS सेट करें।'
            : 'Could not reach the server. Add your site URL to CORS_ORIGIN on the backend, or set VITE_ASTROLOGY_API_KEYS in GitHub Secrets.';
        }
        return language === 'hi'
          ? 'इंटरनेट कनेक्शन समस्या। कृपया अपना कनेक्शन जांचें और पुनः प्रयास करें।'
          : 'Network connection issue. Please check your connection and try again.';
      }

      // Google Maps: API not enabled or API key restrictions – enable APIs and allow key to use them
      if (message.includes('REQUEST_DENIED') || message.includes('not activated on your API project') || message.includes('enable this API') || message.includes('gmp-get-started') || message.includes('not authorized to use this service or API') || message.includes('API restrictions')) {
        return language === 'hi'
          ? 'Google Maps: प्रोजेक्ट में Geocoding API व Time Zone API enable करें और API key की restrictions में इन्हें allow करें।'
          : 'Google Maps: Enable Geocoding API and Time Zone API for your project, and in your API key restrictions allow these APIs.';
      }

      // API key not configured
      if (message.includes('GEMINI_API_KEY_NOT_CONFIGURED') || message.includes('PERPLEXITY_API_KEY_NOT_CONFIGURED') || message.includes('GROQ_API_KEY_NOT_CONFIGURED')) {
        return language === 'hi'
          ? 'API कुंजी कॉन्फ़िगर नहीं है। कृपया सेटअप जांचें।'
          : 'API key not configured. Please check your setup.';
      }
      // Kundali / Astrology API keys (freeastrologyapi.com) – needed for birth chart when backend is not used or fails
      if (message.includes('Astrology API keys not configured') || message.includes('ASTROLOGY_API_KEYS') || message.includes('VITE_ASTROLOGY_API_KEYS')) {
        const forDeploy = typeof import.meta !== 'undefined' && (import.meta as any).env?.PROD
          ? (language === 'hi' ? ' डिप्लॉय साइट पर: GitHub Secrets में VITE_ASTROLOGY_API_KEYS जोड़ें और फिर से डिप्लॉय करें।' : ' For deployed site: add VITE_ASTROLOGY_API_KEYS to GitHub Secrets and redeploy.')
          : '';
        return language === 'hi'
          ? `कुंडली के लिए एस्ट्रोलॉजी API कुंजी जरूरी है। .env.local में VITE_ASTROLOGY_API_KEYS सेट करें (freeastrologyapi.com से)।${forDeploy}`
          : `Kundali requires astrology API keys. Add VITE_ASTROLOGY_API_KEYS to .env.local (get keys from freeastrologyapi.com).${forDeploy}`;
      }
      // Backend returned 4xx/5xx – hint to check backend or use astrology keys for Kundali
      if (message.includes('Backend API error')) {
        return language === 'hi'
          ? 'बैकएंड से त्रुटि। सर्वर जांचें या GitHub Secrets में VITE_ASTROLOGY_API_KEYS सेट करके दोबारा डिप्लॉय करें।'
          : 'Backend error. Check the server or set VITE_ASTROLOGY_API_KEYS in GitHub Secrets and redeploy.';
      }

      // Horoscope temporarily unavailable (backend/direct failed – technical details logged to console)
      if (message.includes('Horoscope') && (message.includes('unavailable') || message.includes('temporarily'))) {
        return language === 'hi'
          ? 'राशिफल इस समय उपलब्ध नहीं है। कृपया कुछ देर बाद पुनः प्रयास करें।'
          : 'Horoscope is temporarily unavailable. Please try again in a moment.';
      }

      // API errors - Quota/Rate limit (generic)
      if (message.includes('429') || message.includes('quota') || message.includes('rate limit') || message.includes('exceeded') || message.includes('RESOURCE_EXHAUSTED')) {
        // Spending cap is a billing limit in Google Cloud – different from per-minute quota
        if (message.includes('spending cap') || message.includes('exceeded its spending')) {
          return language === 'hi'
            ? 'इस समय सेवा सीमा पूरी हो गई है। कृपया कुछ समय बाद पुनः प्रयास करें।'
            : 'Service limit reached for now. Please try again later.';
        }
        return language === 'hi'
          ? 'ब्रह्मांड तारों को संरेखित करने में व्यस्त है। कृपया कुछ समय बाद पुनः प्रयास करें।'
          : 'Cosmic is busy aligning the stars. Please try again after some time.';
      }

      // Timeout errors
      if (message.includes('timeout') || message.includes('TIMEOUT')) {
        return language === 'hi'
          ? 'अनुरोध समय सीमा से अधिक हो गया। कृपया पुनः प्रयास करें।'
          : 'Request timed out. Please try again.';
      }

      // Kundali form validation
      if (message.includes('Invalid date') || message.includes('YYYY-MM-DD')) {
        return language === 'hi'
          ? 'अमान्य तारीख। जन्म तिथि वर्ष-महीना-दिन (जैसे 1990-08-15) में दर्ज करें।'
          : 'Invalid date. Enter birth date as YYYY-MM-DD (e.g. 1990-08-15).';
      }
      if (message.includes('Invalid time') || message.includes('HH:MM')) {
        return language === 'hi'
          ? 'अमान्य समय। 24 घंटे प्रारूप में समय दर्ज करें (जैसे 14:30)।'
          : 'Invalid time. Enter time in 24-hour format (e.g. 14:30).';
      }

      // Return sanitized error message (limit length to prevent UI issues)
      const safeMessage = message.substring(0, 200);
      return safeMessage || (language === 'hi' ? 'एक त्रुटि हुई।' : 'An error occurred.');
    }

    // Handle string errors
    if (typeof error === 'string') {
      return error.substring(0, 200);
    }

    // Handle objects with error property
    if (typeof error === 'object' && 'error' in error) {
      const errorObj = error as { error?: unknown };
      return getSafeErrorMessage(errorObj.error, language);
    }

    // Handle objects with message property
    if (typeof error === 'object' && 'message' in error) {
      const errorObj = error as { message?: unknown };
      return getSafeErrorMessage(errorObj.message, language);
    }

    // Fallback
    return language === 'hi'
      ? 'एक अज्ञात त्रुटि हुई। कृपया पुनः प्रयास करें।'
      : 'An unknown error occurred. Please try again.';
  } catch (e) {
    // Even error handling can fail, so we have a final fallback
    return language === 'hi'
      ? 'त्रुटि प्रसंस्करण में समस्या। कृपया पुनः प्रयास करें।'
      : 'Error processing failed. Please try again.';
  }
}

/**
 * Log error safely without crashing
 */
export function logErrorSafely(error: unknown, context?: string): void {
  try {
    if (typeof console !== 'undefined' && console.error) {
      const contextMsg = context ? `[${context}]` : '';
      console.error(`${contextMsg} Error:`, error);
    }
  } catch (e) {
    // Silently fail - we don't want error logging to crash the app
  }
}

/**
 * Set error state safely
 */
export function setErrorSafely(
  setError: (error: string | null) => void,
  error: unknown,
  language: Language = 'en',
  context?: string
): void {
  try {
    logErrorSafely(error, context);
    const safeMessage = getSafeErrorMessage(error, language);
    setError(safeMessage);
  } catch (e) {
    // Fallback error message
    setError(language === 'hi' 
      ? 'एक त्रुटि हुई। कृपया पुनः प्रयास करें।'
      : 'An error occurred. Please try again.');
  }
}

