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

export type ProfileSubmitResult = { ok: true } | { ok: false; error: string };

export async function submitProfileWithConsent(profile: GlobalProfile, accountName?: string, accountEmail?: string): Promise<ProfileSubmitResult> {
  if (!isProfileSubmitEnabled()) {
    const msg = 'Sheet URL not set. Add VITE_PROFILE_SUBMIT_URL to .env.local and restart the dev server (npm run dev).';
    if (import.meta.env.DEV) console.warn('[ProfileSubmit]', msg);
    return { ok: false, error: msg };
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
      const err = `Sheet returned ${res.status}${text ? ': ' + text.slice(0, 100) : ''}`;
      console.warn('[ProfileSubmit]', err);
      return { ok: false, error: err };
    }
    if (import.meta.env.DEV) {
      console.log('[ProfileSubmit] Success – row added to sheet.');
    }
    return { ok: true };
  } catch (e: any) {
    const errMsg = e?.message || String(e);
    const isCors = /cors|network|failed to fetch/i.test(errMsg);
    const isAbort = /abort/i.test(errMsg);
    let error = 'Request failed: ' + (errMsg || 'Unknown error');
    if (isCors) error = 'Network or CORS error. Ensure the Web App is deployed with "Who has access: Anyone".';
    if (isAbort) error = 'Request timed out. Try again.';
    console.warn('[ProfileSubmit]', error);
    return { ok: false, error };
  }
}
