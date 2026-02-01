/**
 * Profile submission service - sends profile data to backend when user gives consent.
 * Backend (Google Apps Script / serverless) appends to Excel/Google Sheet.
 * Set VITE_PROFILE_SUBMIT_URL in .env to enable.
 */

import type { GlobalProfile } from '../types';

const SUBMIT_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_PROFILE_SUBMIT_URL) || (typeof process !== 'undefined' && (process as any).env?.VITE_PROFILE_SUBMIT_URL) || '';

export function isProfileSubmitEnabled(): boolean {
  return !!SUBMIT_URL && SUBMIT_URL.startsWith('http');
}

export async function submitProfileWithConsent(profile: GlobalProfile, accountName?: string, accountEmail?: string): Promise<boolean> {
  if (!isProfileSubmitEnabled()) {
    console.warn('[ProfileSubmit] VITE_PROFILE_SUBMIT_URL not configured. Add it to .env.local and rebuild. See PROFILE_SHEET_SETUP.md');
    return false;
  }

  try {
    const payload = {
      timestamp: new Date().toISOString(),
      accountName: accountName || '',
      accountEmail: accountEmail || '',
      self: {
        name: profile.self?.name || '',
        date: profile.self?.date || '',
        time: profile.self?.time || '',
        location: profile.self?.location || '',
        gender: profile.self?.gender || '',
      },
      partner: profile.partner ? {
        name: profile.partner.name || '',
        date: profile.partner.date || '',
        time: profile.partner.time || '',
        location: profile.partner.location || '',
        gender: profile.partner.gender || '',
      } : null,
    };

    // Use text/plain to avoid CORS preflight (Google Apps Script doesn't handle OPTIONS)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(SUBMIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn('[ProfileSubmit] Failed:', res.status);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('[ProfileSubmit] Error:', e);
    return false;
  }
}
