/**
 * Time-based notification scheduler for subscribed users.
 * Sends horoscope reminder at 8 AM and blog/article reminder at 12 PM (user's local time).
 * Runs when the app is open; for background delivery use Capacitor Local Notifications or server push.
 */

import type { Language } from '../types';

const STORAGE_HOROSCOPE_SENT = 'cosmic_notification_horoscope_date';
const STORAGE_BLOG_SENT = 'cosmic_notification_blog_date';
const CHECK_INTERVAL_MS = 60 * 1000; // check every minute

function isSubscribed(): boolean {
  try {
    return localStorage.getItem('cosmic_notifications') === 'true';
  } catch {
    return false;
  }
}

function todayKey(): string {
  return new Date().toDateString();
}

/** Return true if we're in the 8 AM window (8:00–8:04) local time */
function isHoroscopeWindow(): boolean {
  const d = new Date();
  return d.getHours() === 8 && d.getMinutes() < 5;
}

/** Return true if we're in the 12 PM window (12:00–12:04) local time */
function isBlogWindow(): boolean {
  const d = new Date();
  return d.getHours() === 12 && d.getMinutes() < 5;
}

function sendHoroscopeNotification(lang: Language): void {
  try {
    const title = lang === 'hi'
      ? '🌟 आज का राशिफल तैयार है'
      : "🌟 Your daily horoscope is ready";
    const body = lang === 'hi'
      ? 'अपना राशिफल देखें – CosmicJyoti पर टैप करें।'
      : "Check your sign's predictions. Tap to open.";
    new Notification(title, { body, icon: '/favicon.ico', tag: 'cosmic-horoscope-8am' });
    localStorage.setItem(STORAGE_HOROSCOPE_SENT, todayKey());
  } catch (e) {
    console.warn('[NotificationScheduler] Horoscope notification failed', e);
  }
}

function sendBlogNotification(lang: Language): void {
  try {
    const title = lang === 'hi'
      ? '📝 नया ज्योतिष लेख'
      : "📝 Fresh astrology reads";
    const body = lang === 'hi'
      ? 'आज के लेख और भविष्यवाणियाँ देखें।'
      : "Today's articles & predictions. Tap to open.";
    new Notification(title, { body, icon: '/favicon.ico', tag: 'cosmic-blog-12pm' });
    localStorage.setItem(STORAGE_BLOG_SENT, todayKey());
  } catch (e) {
    console.warn('[NotificationScheduler] Blog notification failed', e);
  }
}

function checkAndMaybeSend(lang: Language): void {
  if (!('Notification' in window) || Notification.permission !== 'granted' || !isSubscribed()) return;
  const today = todayKey();
  if (isHoroscopeWindow() && localStorage.getItem(STORAGE_HOROSCOPE_SENT) !== today) {
    sendHoroscopeNotification(lang);
  }
  if (isBlogWindow() && localStorage.getItem(STORAGE_BLOG_SENT) !== today) {
    sendBlogNotification(lang);
  }
}

let intervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Start the scheduler. Call when user has notifications enabled and app is in foreground.
 * Stops automatically when notifications are disabled.
 */
export function startNotificationScheduler(language: Language): void {
  if (intervalId) return;
  checkAndMaybeSend(language);
  intervalId = setInterval(() => checkAndMaybeSend(language), CHECK_INTERVAL_MS);
}

export function stopNotificationScheduler(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

/** Copy for onboarding: when user enables notifications */
export function getNotificationScheduleCopy(language: Language): { title: string; body: string } {
  if (language === 'hi') {
    return {
      title: 'अधिसूचनाएं चालू!',
      body: 'रोज़ सुबह 8 बजे राशिफल और दोपहर 12 बजे नए लेख की याद दिलाएंगे (आपके समय के अनुसार)।',
    };
  }
  return {
    title: 'Notifications on!',
    body: "We'll remind you: horoscope at 8 AM, fresh reads at 12 PM (your local time).",
  };
}
