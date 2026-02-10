/**
 * Kundali form utilities: validation, time format, location format, persistence
 */

import type { KundaliFormData } from '../types';

const KUNDALI_DRAFT_KEY = 'cosmicjyoti_kundali_draft';
const KUNDALI_DRAFT_TS_KEY = 'cosmicjyoti_kundali_draft_ts';

/** Validate time in HH:MM or HH:MM:SS format */
export function isValidTime(time: string): boolean {
  if (!time || typeof time !== 'string') return false;
  const match = time.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return false;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const s = match[3] ? parseInt(match[3], 10) : 0;
  return h >= 0 && h <= 23 && m >= 0 && m <= 59 && s >= 0 && s <= 59;
}

/** Convert 24h to 12h display */
export function time24To12(time24: string): string {
  if (!time24 || !isValidTime(time24)) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

/** Convert 12h display to 24h */
export function time12To24(display: string, ampm: 'AM' | 'PM'): string {
  const match = display.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return '';
  let h = parseInt(match[1], 10);
  const m = match[2];
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m}`;
}

/** Validate location format: "City, Country" (at least one comma) */
export function isValidLocationFormat(location: string): boolean {
  if (!location || typeof location !== 'string') return false;
  const trimmed = location.trim();
  if (trimmed.length < 3) return false;
  return trimmed.includes(',') && trimmed.split(',').some(p => p.trim().length > 0);
}

const PRESET_KEYS = ['today', '1yr', '5yr', '10yr', '20yr'] as const;

/** Get date preset values (YYYY-MM-DD) */
export function getDatePresets(): { key: typeof PRESET_KEYS[number]; value: string }[] {
  const today = new Date();
  const toStr = (d: Date) => d.toISOString().slice(0, 10);
  return [
    { key: 'today', value: toStr(today) },
    { key: '1yr', value: toStr(new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())) },
    { key: '5yr', value: toStr(new Date(today.getFullYear() - 5, today.getMonth(), today.getDate())) },
    { key: '10yr', value: toStr(new Date(today.getFullYear() - 10, today.getMonth(), today.getDate())) },
    { key: '20yr', value: toStr(new Date(today.getFullYear() - 20, today.getMonth(), today.getDate())) },
  ];
}

/** Load draft from localStorage */
export function loadKundaliDraft(): KundaliFormData | null {
  try {
    const raw = localStorage.getItem(KUNDALI_DRAFT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as KundaliFormData;
    return data && typeof data === 'object' ? data : null;
  } catch {
    return null;
  }
}

/** Save draft to localStorage */
export function saveKundaliDraft(data: Partial<KundaliFormData>): void {
  try {
    localStorage.setItem(KUNDALI_DRAFT_KEY, JSON.stringify(data));
    localStorage.setItem(KUNDALI_DRAFT_TS_KEY, String(Date.now()));
  } catch (e) {
    console.warn('Failed to save kundali draft:', e);
  }
}

/** Clear draft */
export function clearKundaliDraft(): void {
  try {
    localStorage.removeItem(KUNDALI_DRAFT_KEY);
    localStorage.removeItem(KUNDALI_DRAFT_TS_KEY);
  } catch {}
}

/** Check if user has existing draft (for overwrite confirmation) */
export function hasKundaliDraft(): boolean {
  return !!localStorage.getItem(KUNDALI_DRAFT_KEY);
}
