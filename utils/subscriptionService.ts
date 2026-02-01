/**
 * Subscription Service - Manages AI access tiers
 * Free: Limited AI usage + ads
 * Subscription: Unlimited AI, no ads (or fewer)
 */

const STORAGE_KEY = 'cosmicjyoti_subscription';

export type SubscriptionTier = 'day' | 'week' | 'month' | 'year';

export interface SubscriptionState {
  tier: SubscriptionTier;
  expiresAt: number;
  purchasedAt: number;
  /** For future: productId from Play Store / Stripe */
  productId?: string;
}

export const TIER_DURATION_MS: Record<SubscriptionTier, number> = {
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
};

/** Pricing (INR / USD / EUR) - market-aligned, covers India, US, Europe */
export const TIER_PRICING = {
  day: { inr: 19, usd: 0.99, eur: 0.99, labelEn: '1 Day', labelHi: '1 दिन' },
  week: { inr: 79, usd: 2.99, eur: 2.99, labelEn: '1 Week', labelHi: '1 सप्ताह' },
  month: { inr: 249, usd: 4.99, eur: 4.99, labelEn: '1 Month', labelHi: '1 महीना' },
  year: { inr: 1499, usd: 29.99, eur: 29.99, labelEn: '1 Year', labelHi: '1 वर्ष' },
} as const;

export type PricingCurrency = 'inr' | 'usd' | 'eur';

/**
 * Detect preferred currency from locale/timezone for global coverage.
 * India → INR, Europe → EUR, rest → USD (North America, Asia-Pacific, MEA).
 */
export function getPreferredCurrency(): PricingCurrency {
  if (typeof navigator === 'undefined') return 'usd';
  const locale = navigator.language || (navigator as any).userLanguage || 'en';
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  // India: hi, en-IN, or Asia/Kolkata
  const l = locale.toLowerCase();
  if (l.startsWith('hi') || l.endsWith('-in') || tz.includes('Kolkata') || tz.includes('Calcutta')) {
    return 'inr';
  }
  // Europe: common EU locales
  const euLocales = ['de', 'fr', 'it', 'es', 'nl', 'pl', 'pt', 'el', 'cs', 'ro', 'hu', 'sv', 'da', 'fi'];
  if (euLocales.some(l => locale.toLowerCase().startsWith(l))) return 'eur';
  return 'usd';
}

/** Get price for tier in preferred currency */
export function getTierPrice(tier: SubscriptionTier, currency?: PricingCurrency): { value: number; symbol: string; code: string } {
  const c = currency ?? getPreferredCurrency();
  const p = TIER_PRICING[tier];
  const value = p[c] ?? p.usd;
  const symbols: Record<PricingCurrency, string> = { inr: '₹', usd: '$', eur: '€' };
  const codes: Record<PricingCurrency, string> = { inr: 'INR', usd: 'USD', eur: 'EUR' };
  return { value, symbol: symbols[c], code: codes[c] };
}

/** Promo codes for testing (add your own) */
const PROMO_CODES: Record<string, SubscriptionTier> = {
  cosmic1d: 'day',
  cosmic1w: 'week',
  cosmic1m: 'month',
  cosmic1y: 'year',
  test: 'month',
};

function getStoredState(): SubscriptionState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as SubscriptionState;
    if (parsed.expiresAt && parsed.expiresAt > Date.now()) return parsed;
    localStorage.removeItem(STORAGE_KEY);
    return null;
  } catch {
    return null;
  }
}

function saveState(state: SubscriptionState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Check if user has active subscription
 */
export function hasActiveSubscription(): boolean {
  return getStoredState() !== null;
}

/**
 * Get subscription state (or null if expired/none)
 */
export function getSubscriptionState(): SubscriptionState | null {
  return getStoredState();
}

/**
 * Grant subscription (called after successful payment or promo)
 */
export function grantSubscription(tier: SubscriptionTier, productId?: string): void {
  const now = Date.now();
  const state: SubscriptionState = {
    tier,
    expiresAt: now + TIER_DURATION_MS[tier],
    purchasedAt: now,
    productId,
  };
  saveState(state);
}

/**
 * Redeem promo code
 */
export function redeemPromoCode(code: string): boolean {
  const normalized = code.trim().toLowerCase();
  const tier = PROMO_CODES[normalized];
  if (!tier) return false;
  grantSubscription(tier);
  return true;
}

/**
 * Format remaining time
 */
export function formatRemainingTime(language: 'en' | 'hi' = 'en'): string {
  const state = getStoredState();
  if (!state) return '';
  const remaining = state.expiresAt - Date.now();
  if (remaining <= 0) return '';

  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  if (language === 'hi') {
    if (days > 0) return `${days} दिन ${hours} घंटे शेष`;
    return `${hours} घंटे शेष`;
  }
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
}

/**
 * Clear subscription (for testing / logout)
 */
export function clearSubscription(): void {
  localStorage.removeItem(STORAGE_KEY);
}
