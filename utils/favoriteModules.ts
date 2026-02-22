/**
 * User's favorite modules (bookmarks) – stored in localStorage.
 */

import type { AppViewMode } from '../types';

const STORAGE_KEY = 'cosmicjyoti_favorite_modules';

export function getFavoriteModules(): AppViewMode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((m): m is AppViewMode => typeof m === 'string') : [];
  } catch {
    return [];
  }
}

export function isFavorite(mode: AppViewMode): boolean {
  return getFavoriteModules().includes(mode);
}

export function toggleFavorite(mode: AppViewMode): AppViewMode[] {
  const current = getFavoriteModules();
  const next = current.includes(mode) ? current.filter((m) => m !== mode) : [...current, mode];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (e) {
    console.warn('[Favorites] Failed to save:', e);
  }
  return next;
}
