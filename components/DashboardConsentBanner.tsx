import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { getGlobalProfile } from '../utils/profileStorageService';

const STORAGE_KEY = 'cosmicjyoti_dashboard_consent';
const DISMISS_KEY = 'cosmicjyoti_dashboard_cta_dismissed';

export function hasDashboardConsent(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === 'granted';
}

export function setDashboardConsent(granted: boolean): void {
  try {
    if (granted) localStorage.setItem(STORAGE_KEY, 'granted');
    else localStorage.removeItem(STORAGE_KEY);
  } catch (_) {}
}

interface DashboardConsentBannerProps {
  language: Language;
  onAddBirthDetails: () => void;
  /** Increment when profile is saved so banner re-checks and hides if user added birth details */
  profileVersion?: number;
}

/**
 * Shown when user has not filled birth details (no profile or no astroDetails).
 * Asks them to add birth details to unlock full dashboard (Do's & Don'ts, Luck Score, personalized forecast)
 * and takes consent to save data on device.
 */
const DashboardConsentBanner: React.FC<DashboardConsentBannerProps> = ({
  language,
  onAddBirthDetails,
  profileVersion = 0,
}) => {
  const [visible, setVisible] = useState(false);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    const profile = getGlobalProfile();
    const hasAstro = !!(profile?.astroDetails?.moonSign || profile?.astroDetails?.nakshatra);
    const userNeedsToFill = !hasAstro;
    const wasDismissed = typeof localStorage !== 'undefined' && localStorage.getItem(DISMISS_KEY) === 'true';
    setVisible(userNeedsToFill && !wasDismissed);
    setConsent(hasDashboardConsent());
  }, [profileVersion]);

  const handleAddBirthDetails = () => {
    if (consent) {
      setDashboardConsent(true);
      onAddBirthDetails();
    }
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, 'true');
    } catch (_) {}
    setDismissed(true);
    setVisible(false);
  };

  if (!visible) return null;

  const isHi = language === 'hi';

  return (
    <section className="animate-fade-in-up rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/15 to-orange-500/10 p-5 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-serif font-bold text-amber-200 mb-2 flex items-center gap-2">
            <span>✨</span>
            {isHi ? 'पूरी डैशबोर्ड का उपयोग करें' : 'Unlock your full dashboard'}
          </h3>
          <p className="text-slate-400 text-sm mb-3">
            {isHi
              ? 'अपनी जन्म तारीख, समय और स्थान डालें ताकि आपको व्यक्तिगत Do\'s & Don\'ts, भाग्य स्कोर और दैनिक राशिफल मिल सके। डेटा सिर्फ आपके डिवाइस पर रहेगा।'
              : 'Add your birth date, time and place to get personalized Do\'s & Don\'ts, Luck Score and daily forecast. Data stays only on your device.'}
          </p>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 rounded border-amber-500/50 bg-slate-800 text-amber-500 focus:ring-amber-500/50"
              aria-describedby="consent-desc"
            />
            <span id="consent-desc" className="text-slate-300 text-xs">
              {isHi
                ? 'मैं अपने जन्म विवरण इस डिवाइस पर सहेजने के लिए सहमत हूं ताकि डैशबोर्ड व्यक्तिगत हो सके।'
                : 'I agree to save my birth details on this device to personalize my dashboard.'}
            </span>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAddBirthDetails}
            disabled={!consent}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all text-sm"
          >
            {isHi ? 'जन्म विवरण जोड़ें' : 'Add birth details'}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="px-4 py-2.5 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors"
          >
            {isHi ? 'अभी नहीं' : 'Not now'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default DashboardConsentBanner;
