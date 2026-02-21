/**
 * Timer-based ad service - Shows ads every 5-10 minutes during app usage
 */

import type { Language } from '../types';

const STORAGE_KEY = 'cosmicjyoti_timer_ads';
const MIN_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_INTERVAL = 10 * 60 * 1000; // 10 minutes

export interface TimerAdState {
  lastAdShown: number;
  nextAdTime: number;
  totalUsageTime: number;
  adCount: number;
}

/**
 * Get random interval between 5-10 minutes
 */
const getRandomInterval = (): number => {
  return MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
};

/**
 * Get current timer ad state
 */
export const getTimerAdState = (): TimerAdState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Initialize with first ad scheduled
      const now = Date.now();
      const state: TimerAdState = {
        lastAdShown: 0,
        nextAdTime: now + getRandomInterval(),
        totalUsageTime: 0,
        adCount: 0
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return state;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading timer ad state:', error);
    const now = Date.now();
    return {
      lastAdShown: 0,
      nextAdTime: now + getRandomInterval(),
      totalUsageTime: 0,
      adCount: 0
    };
  }
};

/**
 * Save timer ad state
 */
export const saveTimerAdState = (state: TimerAdState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving timer ad state:', error);
  }
};

/**
 * Check if it's time to show an ad
 */
export const shouldShowAd = (): boolean => {
  const state = getTimerAdState();
  const now = Date.now();
  return now >= state.nextAdTime;
};

/**
 * Mark that an ad was shown
 */
export const markAdShown = (): void => {
  const state = getTimerAdState();
  const now = Date.now();
  
  const updatedState: TimerAdState = {
    ...state,
    lastAdShown: now,
    nextAdTime: now + getRandomInterval(), // Schedule next ad
    adCount: state.adCount + 1
  };
  
  saveTimerAdState(updatedState);
};

/**
 * Update usage time (called periodically)
 */
export const updateUsageTime = (timeSpent: number): void => {
  const state = getTimerAdState();
  const updatedState: TimerAdState = {
    ...state,
    totalUsageTime: state.totalUsageTime + timeSpent
  };
  saveTimerAdState(updatedState);
};

/**
 * Reset timer ad state (for testing)
 */
export const resetTimerAdState = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Get time until next ad (in milliseconds)
 */
export const getTimeUntilNextAd = (): number => {
  const state = getTimerAdState();
  const now = Date.now();
  const remaining = state.nextAdTime - now;
  return remaining > 0 ? remaining : 0;
};

/**
 * Format time until next ad as human-readable string
 */
export const formatTimeUntilNextAd = (language: Language = 'en'): string => {
  const remaining = getTimeUntilNextAd();
  if (remaining <= 0) return language === 'en' ? 'Now' : 'अभी';
  
  const minutes = Math.floor(remaining / (60 * 1000));
  const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
  
  if (language === 'hi') {
    if (minutes > 0) {
      return `${minutes} मिनट ${seconds} सेकंड`;
    }
    return `${seconds} सेकंड`;
  }
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

