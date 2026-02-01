import React from 'react';
import { Language } from '../types';
import { PLAY_STORE_URL } from '../constants';
import { getExternalLinkProps } from '../utils/linkHandler';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const AppDownloadModal: React.FC<AppDownloadModalProps> = ({ isOpen, onClose, language }) => {
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
        className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[91] w-[min(360px,90vw)] bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-500/20 p-6 animate-fade-in-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-download-title"
      >
        <div className="text-center">
          <div className="text-5xl mb-4">📱</div>
          <h2 id="app-download-title" className="text-xl font-serif font-bold text-amber-200 mb-2">
            {title}
          </h2>
          <p className="text-slate-400 text-sm mb-6">{subtitle}</p>
          <div className="flex flex-col gap-3">
            <a
              {...getExternalLinkProps(PLAY_STORE_URL, language)}
              className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl transition-all active:scale-[0.98]"
            >
              <span>📱</span>
              {ctaText}
            </a>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-300 text-sm font-medium py-2 transition-colors"
            >
              {laterText}
            </button>
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-slate-500 hover:text-white rounded-full hover:bg-slate-700/50 transition-colors"
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
