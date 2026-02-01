/**
 * Free tier daily limits - AI features
 * Subscription = unlimited
 */

import { hasActiveSubscription } from './subscriptionService';

const STORAGE_KEY = 'cosmicjyoti_free_usage';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

interface FreeUsage {
  date: string;
  chart: number;  // Shared by kundali + compatibility (1 free use total)
  horoscope: number;
  dream: number;
  tarot: number;
  palm: number;
  numerology: number;
  cosmicHealth: number;
  games: number;
}

/** Each AI module: 1 free use per day to try, then subscription required */
const FREE_LIMITS: Record<Exclude<keyof FreeUsage, 'date'>, number> = {
  chart: 1,  // Kundali + Compatibility share 1 free use
  horoscope: 1,
  dream: 1,
  tarot: 1,
  palm: 1,
  numerology: 1,
  cosmicHealth: 1,
  games: 1,
};

export type AIFeatureKey = Exclude<keyof FreeUsage, 'date'>;

function getUsage(): FreeUsage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return initUsage();
    const parsed = JSON.parse(stored) as FreeUsage;
    if (parsed.date !== getToday()) return initUsage();
    return parsed;
  } catch {
    return initUsage();
  }
}

function initUsage(): FreeUsage {
  return {
    date: getToday(),
    chart: 0,
    horoscope: 0,
    dream: 0,
    tarot: 0,
    palm: 0,
    numerology: 0,
    cosmicHealth: 0,
    games: 0,
  };
}

function saveUsage(u: FreeUsage): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
}

export function canUseAI(feature: AIFeatureKey): boolean {
  if (hasActiveSubscription()) return true;
  const usage = getUsage();
  const limit = FREE_LIMITS[feature] ?? 0;
  const used = usage[feature] ?? 0;
  return used < limit;
}

export function getRemainingAI(feature: AIFeatureKey): number {
  if (hasActiveSubscription()) return -1;
  const usage = getUsage();
  const limit = FREE_LIMITS[feature] ?? 0;
  const used = usage[feature] ?? 0;
  return Math.max(0, limit - used);
}

export function incrementAIUsage(feature: AIFeatureKey): void {
  if (hasActiveSubscription()) return;
  const usage = getUsage();
  const used = usage[feature] ?? 0;
  usage[feature] = used + 1;
  saveUsage(usage);
}
