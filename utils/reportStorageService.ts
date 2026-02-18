/**
 * Local report storage - all data stays on user device. No data collection.
 * Saves generated reports (Kundali, Panchang, etc.) for reuse and sharing.
 */

export type ReportType = 'kundali' | 'panchang' | 'horoscope' | 'matchmaking' | 'muhurat' | 'numerology' | 'tarot' | 'palm' | 'face';

const STORAGE_PREFIX = 'cosmicjyoti_report_';
const INDEX_KEY = 'cosmicjyoti_report_index';

export interface SavedReportMeta {
  id: string;
  type: ReportType;
  title: string;
  createdAt: string; // ISO
  formInput?: Record<string, unknown>;
}

export interface SavedReport<T = unknown> {
  meta: SavedReportMeta;
  data: T;
}

function getIndex(): SavedReportMeta[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('[ReportStorage] Failed to load index:', e);
  }
  return [];
}

function saveIndex(index: SavedReportMeta[]) {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  } catch (e) {
    console.warn('[ReportStorage] Failed to save index:', e);
  }
}

/** Generate a stable cache ID from form data */
export function generateCacheId(type: ReportType, formInput: Record<string, unknown>): string {
  const keys = formInput && typeof formInput === 'object' ? Object.keys(formInput).sort() : [];
  const str = JSON.stringify(formInput ?? {}, keys);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + c;
    hash = hash & hash;
  }
  return `${type}_${Math.abs(hash).toString(36)}`;
}

/** Save a report. Returns the saved report ID. Handles QuotaExceeded by removing oldest reports. */
export function saveReport<T>(type: ReportType, data: T, formInput?: Record<string, unknown>, title?: string): string {
  const id = formInput ? generateCacheId(type, formInput) : `${type}_${Date.now()}`;
  const meta: SavedReportMeta = {
    id,
    type,
    title: title || `${type} report`,
    createdAt: new Date().toISOString(),
    formInput,
  };
  const saved: SavedReport<T> = { meta, data };
  const doSave = () => {
    localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(saved));
    const index = getIndex().filter((m) => m.id !== id);
    index.unshift(meta);
    if (index.length > 100) index.length = 100;
    saveIndex(index);
  };
  try {
    doSave();
  } catch (e: unknown) {
    const isQuotaExceeded = e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22);
    if (isQuotaExceeded) {
      try {
        const index = getIndex();
        if (index.length > 5) {
          const toRemove = index.slice(-10);
          toRemove.forEach((m) => localStorage.removeItem(STORAGE_PREFIX + m.id));
          saveIndex(index.slice(0, -10));
          doSave();
        }
      } catch (retryErr) {
        console.warn('[ReportStorage] Failed to save after quota clear:', retryErr);
      }
    } else {
      console.warn('[ReportStorage] Failed to save:', e);
    }
  }
  return id;
}

/** Get a report by ID */
export function getReport<T>(id: string): SavedReport<T> | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + id);
    if (raw) return JSON.parse(raw) as SavedReport<T>;
  } catch (e) {
    console.warn('[ReportStorage] Failed to get report:', e);
  }
  return null;
}

/** Get report by type and form input (cache lookup) */
export function getReportByForm<T>(type: ReportType, formInput: Record<string, unknown>): SavedReport<T> | null {
  if (!formInput || typeof formInput !== 'object') return null;
  const id = generateCacheId(type, formInput);
  return getReport<T>(id);
}

/** List all saved reports (optionally by type) */
export function listReports(type?: ReportType): SavedReportMeta[] {
  const index = getIndex();
  return type ? index.filter((m) => m.type === type) : index;
}

/** Delete a report */
export function deleteReport(id: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + id);
    const index = getIndex().filter((m) => m.id !== id);
    saveIndex(index);
  } catch (e) {
    console.warn('[ReportStorage] Failed to delete:', e);
  }
}
