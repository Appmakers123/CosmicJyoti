/**
 * Service to manage temporary premium feature unlocks via ads
 */

const STORAGE_KEY = 'cosmicjyoti_ad_unlocks';
const UNLOCK_DURATION = 5 * 60 * 1000; // 5 minutes per ad watch

export interface AdUnlock {
  feature: string;
  unlockedAt: number;
  expiresAt: number;
}

/**
 * Get all active ad unlocks
 */
export const getActiveUnlocks = (): AdUnlock[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const unlocks: AdUnlock[] = JSON.parse(stored);
    const now = Date.now();
    
    // Filter out expired unlocks
    const activeUnlocks = unlocks.filter(unlock => unlock.expiresAt > now);
    
    // Update storage with only active unlocks
    if (activeUnlocks.length !== unlocks.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeUnlocks));
    }
    
    return activeUnlocks;
  } catch (error) {
    console.error('Error reading ad unlocks:', error);
    return [];
  }
};

/**
 * Check if a specific feature is unlocked via ad
 */
export const isFeatureUnlocked = (feature: string): boolean => {
  const unlocks = getActiveUnlocks();
  return unlocks.some(unlock => unlock.feature === feature && unlock.expiresAt > Date.now());
};

/**
 * Unlock a feature via ad watch
 */
export const unlockFeature = (feature: string): void => {
  try {
    const unlocks = getActiveUnlocks();
    const now = Date.now();
    
    // Remove existing unlock for this feature if any
    const filteredUnlocks = unlocks.filter(unlock => unlock.feature !== feature);
    
    // Add new unlock
    const newUnlock: AdUnlock = {
      feature,
      unlockedAt: now,
      expiresAt: now + UNLOCK_DURATION
    };
    
    filteredUnlocks.push(newUnlock);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredUnlocks));
  } catch (error) {
    console.error('Error unlocking feature:', error);
  }
};

/**
 * Get remaining time for a feature unlock (in milliseconds)
 */
export const getRemainingTime = (feature: string): number => {
  const unlocks = getActiveUnlocks();
  const unlock = unlocks.find(u => u.feature === feature);
  if (!unlock) return 0;
  
  const remaining = unlock.expiresAt - Date.now();
  return remaining > 0 ? remaining : 0;
};

/**
 * Format remaining time as human-readable string
 */
export const formatRemainingTime = (feature: string, language: 'en' | 'hi' = 'en'): string => {
  const remaining = getRemainingTime(feature);
  if (remaining <= 0) return '';
  
  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  
  if (language === 'hi') {
    if (hours > 0) {
      return `${hours} घंटे ${minutes} मिनट शेष`;
    }
    return `${minutes} मिनट शेष`;
  }
  
  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  return `${minutes}m left`;
};

/**
 * Clear all unlocks (for testing or reset)
 */
export const clearAllUnlocks = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

