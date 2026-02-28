import React from 'react';
import { Language, AppViewMode } from '../types';
import { getLunarPhase } from '../utils/lunarPhase';
import { calculatePersonalYear, calculatePersonalMonth } from '../utils/numerologyUtils';
import { getGlobalProfile } from '../utils/profileStorageService';

const WEEKDAY_NUM: Record<number, { num: number; colorEn: string; colorHi: string }> = {
  0: { num: 1, colorEn: 'Gold / Orange', colorHi: 'सोना / नारंगी' },
  1: { num: 2, colorEn: 'White / Silver', colorHi: 'सफेद / चांदी' },
  2: { num: 3, colorEn: 'Red / Pink', colorHi: 'लाल / गुलाबी' },
  3: { num: 4, colorEn: 'Blue', colorHi: 'नीला' },
  4: { num: 5, colorEn: 'Green', colorHi: 'हरा' },
  5: { num: 6, colorEn: 'Pink / Cream', colorHi: 'गुलाबी / क्रीम' },
  6: { num: 7, colorEn: 'White / Sea Green', colorHi: 'सफेद / समुद्री हरा' },
};

interface TodaySectionProps {
  language: Language;
  onNavigate: (mode: AppViewMode) => void;
}

/**
 * Single "Today" block: main actions (Horoscope, Panchang, Articles) + daily vibe (Moon, lucky number, colour, numerology).
 * No duplicate links — one clear hierarchy so users aren’t bored or confused.
 */
export default function TodaySection({ language, onNavigate }: TodaySectionProps) {
  const today = new Date();
  const lunar = getLunarPhase(today);
  const profile = getGlobalProfile();
  const dob = profile?.self?.date;
  const personalYear = dob ? calculatePersonalYear(dob, today) : 0;
  const personalMonth = dob ? calculatePersonalMonth(dob, today) : 0;
  const wd = WEEKDAY_NUM[today.getDay()];
  const hi = language === 'hi';

  const shareUrl = typeof window !== 'undefined' ? (window.location.origin + (window.location.pathname || '/').replace(/\/?$/, '/')) : 'https://www.cosmicjyoti.com/';
  const shareText = hi
    ? `आज अपना राशिफल देखें – CosmicJyoti (मुफ्त कुंडली, पंचांग)। ${shareUrl}`
    : `Check your daily horoscope – CosmicJyoti (free Kundali & Panchang). ${shareUrl}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'CosmicJyoti', text: shareText, url: shareUrl });
      } catch (e) {
        if ((e as Error).name !== 'AbortError') window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  return (
    <section className="animate-fade-in-up rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-5 md:p-6" aria-label={hi ? 'आज का सार' : "Today's summary"}>
      <h3 className="text-sm font-serif font-bold text-amber-200 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span>☀</span>
        {hi ? 'आज का सार' : "Your day at a glance"}
      </h3>

      {/* Primary actions – no repetition elsewhere */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <button
          onClick={() => onNavigate('daily')}
          className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-slate-800/80 border border-slate-600 hover:border-amber-500/50 text-center transition-all group"
        >
          <span className="text-2xl">🌞</span>
          <span className="font-semibold text-amber-100 group-hover:text-amber-200 text-sm">{hi ? 'राशिफल' : 'Horoscope'}</span>
          <span className="text-[10px] text-slate-500">{hi ? 'भविष्य' : 'Predictions'}</span>
        </button>
        <button
          onClick={() => onNavigate('panchang')}
          className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-slate-800/80 border border-slate-600 hover:border-amber-500/50 text-center transition-all group"
        >
          <span className="text-2xl">📅</span>
          <span className="font-semibold text-amber-100 group-hover:text-amber-200 text-sm">{hi ? 'पंचांग' : 'Panchang'}</span>
          <span className="text-[10px] text-slate-500">{hi ? 'तिथि, मुहूर्त' : 'Tithi, Muhurat'}</span>
        </button>
        <button
          onClick={() => onNavigate('ai-blog')}
          className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-slate-800/80 border border-slate-600 hover:border-amber-500/50 text-center transition-all group"
        >
          <span className="text-2xl">📝</span>
          <span className="font-semibold text-amber-100 group-hover:text-amber-200 text-sm">{hi ? 'लेख' : 'Articles'}</span>
          <span className="text-[10px] text-slate-500">{hi ? 'ताज़ा पढ़ें' : 'Fresh reads'}</span>
        </button>
      </div>

      {/* Daily vibe – compact row */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <button
          onClick={() => onNavigate('panchang')}
          className="flex flex-col items-center gap-0.5 py-3 rounded-lg bg-slate-800/60 border border-slate-700 hover:border-violet-500/40 transition-all"
        >
          <span className="text-xl">{lunar.emoji}</span>
          <span className="text-[10px] text-slate-400">{hi ? 'चंद्र' : 'Moon'}</span>
          <span className="text-[9px] text-slate-500 truncate w-full px-0.5 text-center">{hi ? lunar.shortHi : lunar.shortEn}</span>
        </button>
        <div className="flex flex-col items-center justify-center py-3 rounded-lg bg-slate-800/60 border border-slate-700">
          <span className="text-lg font-bold text-amber-300">{wd.num}</span>
          <span className="text-[9px] text-slate-500">{hi ? 'लकी अंक' : 'Lucky #'}</span>
        </div>
        <div className="flex flex-col items-center justify-center py-3 rounded-lg bg-slate-800/60 border border-slate-700">
          <span className="text-[10px] text-slate-400 truncate w-full px-1 text-center">{hi ? wd.colorHi : wd.colorEn}</span>
          <span className="text-[9px] text-slate-500">{hi ? 'रंग' : 'Colour'}</span>
        </div>
        {personalYear > 0 || personalMonth > 0 ? (
          <button
            onClick={() => onNavigate('numerology')}
            className="flex flex-col items-center justify-center py-3 rounded-lg bg-slate-800/60 border border-slate-700 hover:border-violet-500/40 transition-all"
          >
            <span className="text-sm font-bold text-purple-300">{personalYear}/{personalMonth}</span>
            <span className="text-[9px] text-slate-500">{hi ? 'वर्ष/माह' : 'Y/M'}</span>
          </button>
        ) : (
          <button
            onClick={() => onNavigate('numerology')}
            className="flex flex-col items-center justify-center py-3 rounded-lg bg-slate-800/60 border border-slate-700 hover:border-violet-500/40 transition-all"
          >
            <span className="text-[10px] text-slate-400">#</span>
            <span className="text-[9px] text-slate-500">{hi ? 'अंक ज्योतिष' : 'Numerology'}</span>
          </button>
        )}
      </div>

      {/* Single footer: share only; no duplicate Horoscope · Panchang · Mantra */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-600/50">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-amber-300 text-xs font-medium transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {hi ? 'शेयर करें' : 'Share'}
        </button>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <button type="button" onClick={() => onNavigate('mantra')} className="hover:text-amber-400 transition-colors">
            {hi ? 'मंत्र' : 'Mantra'}
          </button>
        </div>
      </div>
    </section>
  );
}
