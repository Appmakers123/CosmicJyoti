/**
 * Sync profile + saved reports to/from cloud by user id (e.g. Google id).
 * Requires VITE_SYNC_API_URL to be set (e.g. a Cloud Function or your backend).
 * GET ?userId=xxx returns { profile, reports }. POST body { userId, profile, reports } saves.
 */

import type { GlobalProfile } from '../types';
import { getGlobalProfile, saveGlobalProfile } from '../utils/profileStorageService';
import {
  listReports,
  getReport,
  replaceAllReports,
  type SavedReportMeta,
  type SavedReport,
} from '../utils/reportStorageService';

const SYNC_API_URL = import.meta.env.VITE_SYNC_API_URL as string | undefined;

export interface UserSyncPayload {
  profile: GlobalProfile | null;
  reports: {
    index: SavedReportMeta[];
    items: Record<string, SavedReport>;
  };
}

export function getSyncApiUrl(): string | undefined {
  return SYNC_API_URL?.trim() || undefined;
}

/** Fetch saved profile + reports for this user from the cloud */
export async function fetchUserData(userId: string): Promise<UserSyncPayload | null> {
  const base = getSyncApiUrl();
  if (!base || !userId) return null;
  try {
    const url = `${base.replace(/\/$/, '')}?userId=${encodeURIComponent(userId)}`;
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return null;
    const data = (await res.json()) as UserSyncPayload | null;
    if (!data || typeof data !== 'object') return null;
    return data;
  } catch (e) {
    console.warn('[UserSync] Fetch failed:', e);
    return null;
  }
}

/** Save current profile + reports to the cloud for this user */
export async function saveUserData(userId: string): Promise<boolean> {
  const base = getSyncApiUrl();
  if (!base || !userId) return false;
  const profile = getGlobalProfile();
  const index = listReports();
  const items: Record<string, SavedReport> = {};
  for (const meta of index) {
    const report = getReport(meta.id);
    if (report) items[meta.id] = report;
  }
  const payload: UserSyncPayload = {
    profile,
    reports: { index, items },
  };
  try {
    const res = await fetch(base.replace(/\/$/, ''), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...payload }),
    });
    return res.ok;
  } catch (e) {
    console.warn('[UserSync] Save failed:', e);
    return false;
  }
}

/** Merge fetched cloud data into local storage and notify UI to refresh */
export function mergeUserDataIntoLocal(data: UserSyncPayload): void {
  if (data.profile) saveGlobalProfile(data.profile);
  if (data.reports?.index && Array.isArray(data.reports.index) && data.reports.items && typeof data.reports.items === 'object') {
    replaceAllReports(data.reports.index, data.reports.items);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cosmicjyoti_reports_updated'));
    }
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cosmicjyoti_profile_updated'));
  }
}
