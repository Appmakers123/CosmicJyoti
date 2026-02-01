import React, { useEffect } from 'react';
import { Language } from '../types';
import { PLAY_STORE_URL } from '../constants';
import { getExternalLinkProps } from '../utils/linkHandler';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const AppDownloadModal: React.FC<AppDownloadModalProps> = ({ isOpen, onClose, language }) => {
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const title = language === 'hi' ? 'ऐप डाउनलोड करें' : 'Download the App';
  const subtitle =
    language === 'hi'
      ? 'CosmicJyoti ऐप में कुंडली, राशिफल, टैरो और बहुत कुछ पाएं।'
      : 'Get Kundali, Horoscope, Tarot & more in the CosmicJyoti app.';
  const ctaText = language === 'hi' ? 'Google Play से डाउनलोड करें' : 'Download on Google Play';
  const laterText = language === 'hi' ? 'बाद में' : 'Later';

  return (
    <>
      <div
        className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm animate-fade-in touch-manipulation"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[91] w-[min(360px,calc(100vw-2rem))] max-h-[min(85vh,560px)] overflow-y-auto bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-500/20 p-6 animate-fade-in-up touch-manipulation"
        style={{
          marginTop: 'env(safe-area-inset-top)',
          marginBottom: 'env(safe-area-inset-bottom)',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-download-title"
      >
        <div className="text-center">
          <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📱</div>
          <h2 id="app-download-title" className="text-lg sm:text-xl font-serif font-bold text-amber-200 mb-2">
            {title}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mb-4 sm:mb-6">{subtitle}</p>
          <div className="flex flex-col gap-3">
            <a
              {...getExternalLinkProps(PLAY_STORE_URL, language)}
              className="flex items-center justify-center gap-2 w-full min-h-[48px] py-3 px-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 active:from-amber-700 active:to-orange-700 text-white font-bold rounded-xl transition-all active:scale-[0.98] touch-manipulation"
            >
              <span>📱</span>
              <span className="text-sm sm:text-base">{ctaText}</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] text-slate-500 hover:text-slate-300 active:text-slate-200 text-sm font-medium py-3 transition-colors touch-manipulation"
              aria-label={laterText}
            >
              {laterText}
            </button>
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-slate-500 hover:text-white active:text-white rounded-full hover:bg-slate-700/50 active:bg-slate-700/70 transition-colors touch-manipulation"
          style={{ top: 'max(0.5rem, env(safe-area-inset-top))', right: 'max(0.5rem, env(safe-area-inset-right))' }}
          aria-label={language === 'hi' ? 'बंद करें' : 'Close'}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </>
  );
};

export default AppDownloadModal;
