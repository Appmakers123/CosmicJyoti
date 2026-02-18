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
  chart: number;  // Shared by kundali + compatibility
  chartAdBonus: number; // 0 or 1: one extra chart use per day after watching ad
  horoscope: number;
  dream: number;
  tarot: number;
  palm: number;
  face: number;
  numerology: number;
  cosmicHealth: number;
  games: number;
}

/** Each AI module: 1 free use per day; chart gets +1 after ad */
const FREE_LIMITS: Record<Exclude<keyof FreeUsage, 'date'>, number> = {
  chart: 1,
  chartAdBonus: 1, // max 1 bonus per day
  horoscope: 1,
  dream: 1,
  tarot: 1,
  palm: 1,
  face: 1,
  numerology: 1,
  cosmicHealth: 1,
  games: 1,
};

export type AIFeatureKey = Exclude<keyof FreeUsage, 'date' | 'chartAdBonus'>;

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
    chartAdBonus: 0,
    horoscope: 0,
    dream: 0,
    tarot: 0,
    palm: 0,
    face: 0,
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
  if (feature === 'chart') {
    const limit = FREE_LIMITS.chart + (usage.chartAdBonus ?? 0);
    const used = usage.chart ?? 0;
    return used < limit;
  }
  const limit = FREE_LIMITS[feature] ?? 0;
  const used = usage[feature] ?? 0;
  return used < limit;
}

/** True if user has used 1 chart but can get 1 more by watching ad (chartAdBonus not yet used today). */
export function canGetChartWithAd(): boolean {
  if (hasActiveSubscription()) return false;
  const usage = getUsage();
  const used = usage.chart ?? 0;
  const bonus = usage.chartAdBonus ?? 0;
  return used >= FREE_LIMITS.chart && bonus < (FREE_LIMITS.chartAdBonus ?? 1);
}

/** Record that user watched ad for one extra chart use today. */
export function recordChartAdBonus(): void {
  if (hasActiveSubscription()) return;
  const usage = getUsage();
  const maxBonus = FREE_LIMITS.chartAdBonus ?? 1;
  if ((usage.chartAdBonus ?? 0) >= maxBonus) return;
  usage.chartAdBonus = (usage.chartAdBonus ?? 0) + 1;
  saveUsage(usage);
}

export function getRemainingAI(feature: AIFeatureKey): number {
  if (hasActiveSubscription()) return -1;
  const usage = getUsage();
  if (feature === 'chart') {
    const limit = FREE_LIMITS.chart + (usage.chartAdBonus ?? 0);
    const used = usage.chart ?? 0;
    return Math.max(0, limit - used);
  }
  const limit = FREE_LIMITS[feature] ?? 0;
  const used = usage[feature] ?? 0;
  return Math.max(0, limit - used);
}

export function incrementAIUsage(feature: AIFeatureKey): void {
  if (hasActiveSubscription()) return;
  const usage = getUsage();
  if (feature === 'chart') {
    usage.chart = (usage.chart ?? 0) + 1;
  } else {
    const used = usage[feature] ?? 0;
    usage[feature] = used + 1;
  }
  saveUsage(usage);
}
