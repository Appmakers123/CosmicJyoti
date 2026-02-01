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
export function getSafeErrorMessage(error: unknown, language: 'en' | 'hi' = 'en'): string {
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
      
      // Network errors
      if (message.includes('network') || message.includes('fetch') || message.includes('Failed to fetch')) {
        return language === 'hi'
          ? 'इंटरनेट कनेक्शन समस्या। कृपया अपना कनेक्शन जांचें और पुनः प्रयास करें।'
          : 'Network connection issue. Please check your connection and try again.';
      }

      // API key not configured
      if (message.includes('GEMINI_API_KEY_NOT_CONFIGURED') || message.includes('PERPLEXITY_API_KEY_NOT_CONFIGURED')) {
        return language === 'hi'
          ? 'API कुंजी कॉन्फ़िगर नहीं है। कृपया सेटअप जांचें।'
          : 'API key not configured. Please check your setup.';
      }

      // API errors - Quota/Rate limit
      if (message.includes('429') || message.includes('quota') || message.includes('rate limit') || message.includes('exceeded') || message.includes('RESOURCE_EXHAUSTED')) {
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
  language: 'en' | 'hi' = 'en',
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

