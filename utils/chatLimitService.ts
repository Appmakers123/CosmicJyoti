/**
 * Chat Limit Service - Manages message limits for Rishi AI chat
 */

const FREE_CHAT_LIMIT = 10; // Free users get 10 messages per day
const BONUS_MESSAGES_PER_AD = 1; // One message per ad (light, non-intrusive)
const PREMIUM_CHAT_LIMIT = -1; // Premium users get unlimited (-1 means unlimited)
const STORAGE_KEY = 'cosmicjyoti_chat_usage';

interface ChatUsage {
  date: string; // YYYY-MM-DD format
  messageCount: number;
  bonusMessages: number; // Extra messages from watching ads
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get current chat usage
 */
export function getChatUsage(): ChatUsage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const usage: ChatUsage = JSON.parse(stored);
      // If it's a new day, reset the count
      if (usage.date !== getTodayDate()) {
        return { date: getTodayDate(), messageCount: 0, bonusMessages: 0 };
      }
      return { ...usage, bonusMessages: usage.bonusMessages ?? 0 };
    }
  } catch (e) {
    console.error('Error reading chat usage:', e);
  }
  return { date: getTodayDate(), messageCount: 0, bonusMessages: 0 };
}

/**
 * Increment message count
 */
export function incrementChatUsage(): void {
  const usage = getChatUsage();
  usage.messageCount += 1;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  } catch (e) {
    console.error('Error saving chat usage:', e);
  }
}

/**
 * Check if user can send a message
 */
export function canSendMessage(isPremium: boolean): boolean {
  if (isPremium) {
    return true; // Premium users have unlimited messages
  }
  const usage = getChatUsage();
  const totalLimit = FREE_CHAT_LIMIT + (usage.bonusMessages ?? 0);
  return usage.messageCount < totalLimit;
}

/**
 * Get remaining messages for free users
 */
export function getRemainingMessages(isPremium: boolean): number {
  if (isPremium) {
    return -1; // Unlimited
  }
  const usage = getChatUsage();
  const totalLimit = FREE_CHAT_LIMIT + (usage.bonusMessages ?? 0);
  return Math.max(0, totalLimit - usage.messageCount);
}

/**
 * Get total message limit
 */
export function getMessageLimit(isPremium: boolean): number {
  if (isPremium) {
    return -1; // Unlimited
  }
  const usage = getChatUsage();
  return FREE_CHAT_LIMIT + (usage.bonusMessages ?? 0);
}

/**
 * Add bonus messages when user watches rewarded ad
 */
export function addBonusMessages(count: number = BONUS_MESSAGES_PER_AD): void {
  const usage = getChatUsage();
  usage.bonusMessages = (usage.bonusMessages ?? 0) + count;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  } catch (e) {
    console.error('Error saving bonus messages:', e);
  }
}

/**
 * Reset chat usage (for testing or admin purposes)
 */
export function resetChatUsage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error resetting chat usage:', e);
  }
}

