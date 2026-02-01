import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { SUPPORTED_LANGUAGES } from '../utils/languageConfig';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

/**
 * Text-based language selector (EN / HI) - avoids flag confusion with country selector.
 * Closes on outside click (supports both mouse and touch).
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLanguage, onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click - supports both mouse and touch for mobile
  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    // Use both mousedown and touchstart for reliable mobile behavior
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-full hover:border-amber-500/50 transition-all text-[10px] font-bold uppercase tracking-widest min-h-[44px] min-w-[44px] justify-center"
        aria-label={currentLanguage === 'hi' ? 'भाषा बदलें' : 'Change language'}
        aria-expanded={isOpen}
      >
        <span className="text-amber-400 font-bold">{currentLanguage === 'hi' ? 'HI' : 'EN'}</span>
        <svg
          className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Invisible overlay for outside click - ensures touch works */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            onTouchStart={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-amber-500/30 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
            <div className="p-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onLanguageChange(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-left min-h-[44px] ${
                    currentLanguage === lang.code
                      ? 'bg-amber-500/20 border border-amber-500/50'
                      : 'hover:bg-slate-700/50 border border-transparent'
                  }`}
                >
                  <span className="text-sm font-bold text-amber-400 w-8">
                    {lang.code.toUpperCase()}
                  </span>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-white">{lang.nativeName}</div>
                    <div className="text-[10px] text-slate-400">{lang.name}</div>
                  </div>
                  {currentLanguage === lang.code && (
                    <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;
