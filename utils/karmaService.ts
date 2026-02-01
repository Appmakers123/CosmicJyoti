/**
 * Karma Service - Manages in-app karma currency
 * Karma can be earned via rewarded ads and spent on premium features
 */

const STORAGE_KEY = 'cosmicjyoti_karma';

/**
 * Get current karma balance
 */
export function getKarma(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      return isNaN(parsed) ? 0 : Math.max(0, parsed);
    }
  } catch (e) {
    console.error('Error reading karma:', e);
  }
  return 0;
}

/**
 * Add karma (e.g. after watching rewarded ad)
 */
export function addKarma(amount: number): number {
  const current = getKarma();
  const newTotal = Math.max(0, current + amount);
  try {
    localStorage.setItem(STORAGE_KEY, String(newTotal));
  } catch (e) {
    console.error('Error saving karma:', e);
  }
  return newTotal;
}

/**
 * Spend karma on a feature. Returns true if successful.
 */
export function spendKarma(amount: number): boolean {
  const current = getKarma();
  if (current < amount) return false;
  const newTotal = current - amount;
  try {
    localStorage.setItem(STORAGE_KEY, String(newTotal));
    return true;
  } catch (e) {
    console.error('Error spending karma:', e);
    return false;
  }
}

/**
 * Check if user has enough karma
 */
export function hasEnoughKarma(amount: number): boolean {
  return getKarma() >= amount;
}
