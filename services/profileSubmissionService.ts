/**
 * Profile submission service - sends profile data to Google Apps Script when user gives consent.
 * Script appends to your Google Sheet. Set VITE_PROFILE_SUBMIT_URL in .env.local (and GitHub Secrets for deploy).
 */

import type { GlobalProfile } from '../types';

// Use literal so Vite inlines the value at build time (from .env.local or workflow secrets)
const SUBMIT_URL = import.meta.env.VITE_PROFILE_SUBMIT_URL || '';

export function isProfileSubmitEnabled(): boolean {
  return typeof SUBMIT_URL === 'string' && SUBMIT_URL.length > 0 && SUBMIT_URL.startsWith('http');
}

export async function submitProfileWithConsent(profile: GlobalProfile, accountName?: string, accountEmail?: string): Promise<boolean> {
  if (!isProfileSubmitEnabled()) {
    if (import.meta.env.DEV) {
      console.warn('[ProfileSubmit] Sheet not linked: add VITE_PROFILE_SUBMIT_URL to .env.local (see PROFILE_SHEET_SETUP.md) and restart dev server.');
    }
    return false;
  }

  if (import.meta.env.DEV) {
    console.log('[ProfileSubmit] Sending to sheet...', { hasSelf: !!profile?.self, hasPartner: !!profile?.partner });
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

    // Use text/plain to avoid CORS preflight (Google Apps Script often doesn't run doOptions for OPTIONS)
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
      const text = await res.text();
      console.warn('[ProfileSubmit] Sheet returned', res.status, text || '');
      return false;
    }
    if (import.meta.env.DEV) {
      console.log('[ProfileSubmit] Success – row added to sheet.');
    }
    return true;
  } catch (e) {
    console.warn('[ProfileSubmit] Request failed:', e);
    return false;
  }
}
