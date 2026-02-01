/**
 * Global profile storage - used to auto-fill forms across Kundali, Compatibility, Numerology, etc.
 * All data stays on device. No data collection.
 */

import type { GlobalProfile, KundaliFormData } from '../types';

const STORAGE_KEY = 'cosmicjyoti_global_profile';

const defaultSelf: KundaliFormData = {
  name: '',
  date: '',
  time: '12:00',
  location: 'New Delhi, India',
  gender: undefined,
  observationPoint: 'topocentric',
  ayanamsha: 'lahiri',
  language: 'en',
};

export function getGlobalProfile(): GlobalProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GlobalProfile;
    if (!parsed || typeof parsed !== 'object' || !parsed.self || typeof parsed.self !== 'object') return null;
    return {
      ...parsed,
      self: { ...defaultSelf, ...parsed.self },
      partner: parsed.partner && typeof parsed.partner === 'object' ? { ...defaultSelf, ...parsed.partner } : undefined,
    };
  } catch (e) {
    console.warn('[ProfileStorage] Failed to load:', e);
    return null;
  }
}

export function saveGlobalProfile(profile: GlobalProfile): void {
  const toSave = { ...profile, updatedAt: new Date().toISOString() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e: unknown) {
    const isQuotaExceeded = e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22);
    if (isQuotaExceeded) {
      try {
        clearGlobalProfile();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch (retryErr) {
        console.warn('[ProfileStorage] Failed to save after quota clear:', retryErr);
      }
    } else {
      console.warn('[ProfileStorage] Failed to save:', e);
    }
  }
}

export function clearGlobalProfile(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('[ProfileStorage] Failed to clear:', e);
  }
}

export function hasGlobalProfile(): boolean {
  const p = getGlobalProfile();
  return !!(p?.self?.name && p?.self?.date && p?.self?.location);
}
