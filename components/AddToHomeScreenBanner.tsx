import React, { useState, useEffect } from 'react';
import { Language } from '../types';

const STORAGE_KEY = 'cosmicjyoti_a2hs_dismissed';

interface AddToHomeScreenBannerProps {
  language: Language;
}

const AddToHomeScreenBanner: React.FC<AddToHomeScreenBannerProps> = ({ language }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only on web (not in Capacitor app), not standalone (already installed), not previously dismissed
    const isStandalone = (window as any).matchMedia?.('(display-mode: standalone)')?.matches
      || (window.navigator as any).standalone
      || document.referrer.includes('android-app://');
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!isStandalone && !dismissed) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="animate-fade-in-up fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[55] p-4 rounded-xl bg-slate-800/95 border border-amber-500/40 shadow-xl backdrop-blur-md">
      <p className="text-sm text-slate-200 mb-2">
        {language === 'hi'
          ? 'रोज़ राशिफल और पंचांग के लिए CosmicJyoti को होम स्क्रीन पर जोड़ें।'
          : 'Add CosmicJyoti to your home screen for daily horoscope & Panchang.'}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={handleDismiss}
          className="flex-1 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-900 font-semibold text-sm transition-colors"
        >
          {language === 'hi' ? 'ठीक है' : 'OK'}
        </button>
        <button
          onClick={handleDismiss}
          className="px-3 py-2 rounded-lg text-slate-500 hover:text-slate-300 text-xs"
        >
          {language === 'hi' ? 'बाद में' : 'Later'}
        </button>
      </div>
    </div>
  );
};

export default AddToHomeScreenBanner;
