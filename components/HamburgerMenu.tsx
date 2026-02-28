import React, { useEffect, useRef } from 'react';
import { Language, User, AppViewMode } from '../types';
import { PLAY_STORE_URL } from '../constants';
import { getExternalLinkProps, isCapacitor } from '../utils/linkHandler';
import MySavedReports from './MySavedReports';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: AppViewMode;
  onNavigate: (mode: AppViewMode) => void;
  /** When opening a saved report (e.g. horoscope), open that report's result instead of just the module */
  onOpenReport?: (mode: AppViewMode, reportId: string) => void;
  language: Language;
  onOpenProfile: () => void;
  user: User | null;
  onLogout: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onClose,
  currentMode,
  onNavigate,
  onOpenReport,
  language,
  onOpenProfile,
  user,
  onLogout,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - device-safe, touch-friendly */}
      <div
        className="fixed inset-0 z-[70] animate-fade-in bg-black/70 backdrop-blur-sm touch-manipulation"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Menu panel - slide-in, flush right, device-safe */}
      <div
        ref={menuRef}
        className="fixed top-0 right-0 h-full z-[80] flex flex-col overflow-hidden shadow-2xl animate-slide-in-right backdrop-blur-xl"
        style={{
          width: 'min(340px, 100vw)',
          right: 0,
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))',
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
          paddingLeft: 'max(1.25rem, env(safe-area-inset-left))',
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.99) 0%, rgba(2, 6, 23, 0.98) 100%)',
          borderLeft: '1px solid rgba(251, 191, 36, 0.15)',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center py-4 border-b border-slate-700/50 shrink-0">
          <span className="text-lg font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400 uppercase tracking-wider">
            {language === 'hi' ? 'मेनू' : 'Menu'}
          </span>
          <button
            onClick={onClose}
            className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-xl bg-slate-800/60 hover:bg-slate-700/80 active:scale-95 border border-slate-700/50 text-slate-400 hover:text-white transition-all touch-manipulation"
            aria-label={language === 'hi' ? 'बंद करें' : 'Close'}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - scrollable, touch-friendly */}
        <div className="flex-1 py-6 flex flex-col gap-5 overflow-y-auto overflow-x-hidden custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>

          {/* Download App - only show on web (not in native app) */}
          {!isCapacitor() && (
            <div className="space-y-2">
              <a
                {...getExternalLinkProps(PLAY_STORE_URL, language)}
                className="flex items-center gap-4 w-full min-h-[56px] px-4 py-3 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-600/30 hover:from-amber-600/50 hover:to-orange-600/50 border-2 border-amber-500/50 text-amber-200 font-bold transition-all touch-manipulation active:scale-[0.99]"
              >
                <span className="text-2xl">📱</span>
                <span>{language === 'hi' ? 'ऐप डाउनलोड करें' : 'Download App'}</span>
              </a>
            </div>
          )}

          {/* Profile */}
          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block px-1">
              {language === 'hi' ? 'प्रोफ़ाइल' : 'Profile'}
            </span>
            <button
              onClick={() => { onOpenProfile(); }}
              className="flex items-center gap-4 w-full min-h-[56px] px-4 py-3 rounded-xl bg-slate-800/60 hover:bg-slate-700/70 active:scale-[0.99] border border-slate-700/50 hover:border-amber-500/30 transition-all text-left touch-manipulation"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/20 border border-amber-500/40 flex items-center justify-center text-xl font-bold text-amber-300 shrink-0">
                {user ? user.name[0].toUpperCase() : '👤'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-white truncate">{user ? user.name : (language === 'hi' ? 'प्रोफ़ाइल' : 'Profile')}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email || (language === 'hi' ? 'जानकारी जोड़ें' : 'Add your info')}</p>
              </div>
              <svg className="w-5 h-5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {user && (
              <button
                onClick={() => { onLogout(); onClose(); }}
                className="min-h-[44px] px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors touch-manipulation w-full text-left"
              >
                {language === 'hi' ? 'लॉगआउट' : 'Logout'}
              </button>
            )}
          </div>

          {/* My saved reports – after Profile */}
          <MySavedReports
            language={language}
            onOpenMode={(mode) => { onNavigate(mode); onClose(); }}
            onOpenReport={onOpenReport ? (mode, reportId) => { onOpenReport(mode, reportId); onClose(); } : undefined}
            compact
          />
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;
