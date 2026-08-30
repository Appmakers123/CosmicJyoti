import React, { useState, useRef, useEffect } from 'react';
import { useTheme, Theme } from '../contexts/ThemeContext';
import { Language } from '../types';

interface ThemeToggleProps {
  language?: Language;
  variant?: 'icon' | 'segmented' | 'menu-item';
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  language = 'en',
  variant = 'icon',
  className = '',
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isHindi = language === 'hi';

  const themeOptions: { value: Theme; label: string; icon: string; desc: string }[] = [
    {
      value: 'light',
      label: isHindi ? 'लाइट' : 'Light',
      icon: '☀️',
      desc: isHindi ? 'उज्ज्वल दिवस' : 'Daylight theme',
    },
    {
      value: 'dark',
      label: isHindi ? 'डार्क' : 'Dark',
      icon: '🌙',
      desc: isHindi ? 'गहरा आकाश' : 'Midnight starry sky',
    },
    {
      value: 'system',
      label: isHindi ? 'सिस्टम' : 'System',
      icon: '💻',
      desc: isHindi ? 'डिवाइस अनुसार' : 'Follow device',
    },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  if (variant === 'segmented') {
    return (
      <div className={`flex items-center p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 light:bg-slate-100 light:border-slate-300 ${className}`}>
        {themeOptions.map((opt) => {
          const isActive = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all touch-manipulation min-h-[40px] ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm light:bg-amber-500/10 light:text-amber-700 light:border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:text-slate-900'
              }`}
              title={opt.desc}
              aria-pressed={isActive}
              aria-label={`${opt.label} ${isHindi ? 'थीम' : 'theme'}`}
            >
              <span className="text-base leading-none">{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'menu-item') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            {isHindi ? 'थीम सेटिंग' : 'Theme'}
          </span>
          <span className="text-xs text-amber-400 font-medium">
            {theme === 'system' ? (isHindi ? 'सिस्टम' : 'System') : (theme === 'dark' ? (isHindi ? 'डार्क' : 'Dark') : (isHindi ? 'लाइट' : 'Light'))}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((opt) => {
            const isActive = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all touch-manipulation min-h-[54px] ${
                  isActive
                    ? 'bg-amber-500/15 border-amber-400/50 text-amber-300 shadow-md ring-1 ring-amber-400/30'
                    : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-700/60 hover:text-white'
                }`}
                aria-pressed={isActive}
                aria-label={`${opt.label} ${isHindi ? 'थीम' : 'theme'}`}
              >
                <span className="text-xl mb-1">{opt.icon}</span>
                <span className="text-xs font-semibold">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Default: Compact Icon dropdown button
  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-center min-h-[40px] min-w-[40px] px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 hover:text-amber-200 transition-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        title={isHindi ? 'थीम बदलें (लाइट / डार्क / सिस्टम)' : 'Change theme (Light / Dark / System)'}
        aria-label={isHindi ? 'थीम बदलें' : 'Change theme'}
        aria-expanded={isOpen}
      >
        <span className="text-base leading-none">
          {theme === 'system' ? '💻' : (resolvedTheme === 'dark' ? '🌙' : '☀️')}
        </span>
        <span className="text-[11px] font-bold ml-1.5 hidden md:inline text-slate-200">
          {theme === 'system'
            ? (isHindi ? 'सिस्टम' : 'Auto')
            : (theme === 'dark' ? (isHindi ? 'डार्क' : 'Dark') : (isHindi ? 'लाइट' : 'Light'))}
        </span>
        <svg
          className={`w-3.5 h-3.5 ml-1 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-2xl p-1.5 z-[90] animate-fade-in-up-soft"
          role="menu"
        >
          <div className="px-2 py-1.5 mb-1 border-b border-slate-800">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
              {isHindi ? 'थीम चुनें' : 'Choose Theme'}
            </span>
          </div>
          {themeOptions.map((opt) => {
            const isSelected = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setTheme(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors touch-manipulation min-h-[38px] ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
                role="menuitem"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{opt.icon}</span>
                  <div className="text-left">
                    <p className="leading-none">{opt.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</p>
                  </div>
                </div>
                {isSelected && (
                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
