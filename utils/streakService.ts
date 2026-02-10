/**
 * Daily streak: track consecutive days the user opened the app.
 * Used for engagement and optional rewards (e.g. karma bonus).
 */

const STORAGE_KEY = 'cosmicjyoti_streak';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

interface StreakData {
  lastVisitDate: string;
  currentStreak: number;
  longestStreak: number;
}

function getStreakData(): StreakData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { lastVisitDate: '', currentStreak: 0, longestStreak: 0 };
    }
    const parsed = JSON.parse(stored) as StreakData;
    return {
      lastVisitDate: parsed.lastVisitDate || '',
      currentStreak: Math.max(0, parsed.currentStreak || 0),
      longestStreak: Math.max(0, parsed.longestStreak || 0),
    };
  } catch {
    return { lastVisitDate: '', currentStreak: 0, longestStreak: 0 };
  }
}

function saveStreakData(data: StreakData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving streak:', e);
  }
}

/**
 * Call once per app open (e.g. when hub mounts).
 * Updates last visit and streak; returns updated streak count for today.
 */
export function recordVisit(): number {
  const today = getToday();
  const data = getStreakData();

  if (data.lastVisitDate === today) {
    return data.currentStreak;
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak = data.currentStreak;
  if (data.lastVisitDate === yesterdayStr) {
    newStreak += 1;
  } else if (data.lastVisitDate !== today) {
    newStreak = 1;
  }

  const longest = Math.max(newStreak, data.longestStreak);
  saveStreakData({
    lastVisitDate: today,
    currentStreak: newStreak,
    longestStreak: longest,
  });
  return newStreak;
}

/**
 * Get current streak without recording a visit.
 */
export function getStreak(): number {
  const today = getToday();
  const data = getStreakData();
  if (data.lastVisitDate !== today) return 0;
  return data.currentStreak;
}

/**
 * Get last visit date (YYYY-MM-DD) or null.
 */
export function getLastVisitDate(): string | null {
  const data = getStreakData();
  return data.lastVisitDate || null;
}

/**
 * Get longest streak ever.
 */
export function getLongestStreak(): number {
  return getStreakData().longestStreak;
}
