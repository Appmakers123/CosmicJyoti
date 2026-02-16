import React, { useState, useEffect } from 'react';
import { Language } from '../types';

const STORAGE_KEY = 'cosmicjyoti_check_today_hint_seen';

interface CheckTodayOnboardingHintProps {
  language: Language;
  onDismiss?: () => void;
}

const CheckTodayOnboardingHint: React.FC<CheckTodayOnboardingHintProps> = ({ language, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) setVisible(true);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
    onDismiss?.();
  };

  if (!visible) return null;

  return (
    <div
      className="animate-fade-in-up rounded-xl border-2 border-amber-400/80 bg-amber-500/10 p-4 mb-4 relative"
      role="dialog"
      aria-label={language === 'hi' ? 'शुरुआत संकेत' : 'Getting started'}
    >
      <p className="text-sm text-amber-100 pr-8">
        {language === 'hi'
          ? 'हर दिन यहाँ से शुरू करें – राशिफल, पंचांग और नए लेख।'
          : 'Start here every day – horoscope, Panchang & fresh articles.'}
      </p>
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-400 hover:text-amber-200 hover:bg-white/10 transition-colors"
        aria-label={language === 'hi' ? 'बंद करें' : 'Close'}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default CheckTodayOnboardingHint;
