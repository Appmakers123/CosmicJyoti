import React, { useState, useEffect } from 'react';
import { Language, AppViewMode } from '../types';
import { getLunarPhase } from '../utils/lunarPhase';
import { calculatePersonalYear, calculatePersonalMonth } from '../utils/numerologyUtils';
import { getGlobalProfile } from '../utils/profileStorageService';
import { getDailyLuckScore, getDailyDoDonts, type DailyLuckScore as DailyLuckScoreData, type DailyDoDont } from '../services/dailyInsightsService';
import Logo from './Logo';

const WEEKDAY_NUM: Record<number, { num: number; colorEn: string; colorHi: string }> = {
  0: { num: 1, colorEn: 'Gold / Orange', colorHi: 'सोना / नारंगी' },
  1: { num: 2, colorEn: 'White / Silver', colorHi: 'सफेद / चांदी' },
  2: { num: 3, colorEn: 'Red / Pink', colorHi: 'लाल / गुलाबी' },
  3: { num: 4, colorEn: 'Blue', colorHi: 'नीला' },
  4: { num: 5, colorEn: 'Green', colorHi: 'हरा' },
  5: { num: 6, colorEn: 'Pink / Cream', colorHi: 'गुलाबी / क्रीम' },
  6: { num: 7, colorEn: 'White / Sea Green', colorHi: 'सफेद / समुद्री हरा' },
};

const MAX_DOS_DONTS_VISIBLE = 3;

interface TodayUnifiedProps {
  language: Language;
  onNavigate: (mode: AppViewMode) => void;
}

export default function TodayUnified({ language, onNavigate }: TodayUnifiedProps) {
  const hi = language === 'hi';
  const today = new Date();
  const lunar = getLunarPhase(today);
  const profile = getGlobalProfile();
  const dob = profile?.self?.date;
  const personalYear = dob ? calculatePersonalYear(dob, today) : 0;
  const personalMonth = dob ? calculatePersonalMonth(dob, today) : 0;
  const wd = WEEKDAY_NUM[today.getDay()];

  const [luck, setLuck] = useState<DailyLuckScoreData | null>(null);
  const [doDonts, setDoDonts] = useState<DailyDoDont | null>(null);
  const [loadingLuck, setLoadingLuck] = useState(true);
  const [loadingDoDonts, setLoadingDoDonts] = useState(true);
  const [showAllDoDonts, setShowAllDoDonts] = useState(false);

  const astro = profile?.astroDetails;
  const ctx = { sign: astro?.sunSign || astro?.moonSign, moonSign: astro?.moonSign, nakshatra: astro?.nakshatra };

  useEffect(() => {
    getDailyLuckScore(language, ctx).then(setLuck).finally(() => setLoadingLuck(false));
  }, [language, ctx.sign, ctx.moonSign, ctx.nakshatra]);

  useEffect(() => {
    getDailyDoDonts(language, ctx).then(setDoDonts).finally(() => setLoadingDoDonts(false));
  }, [language, ctx.sign, ctx.moonSign, ctx.nakshatra]);

  const shareUrl = typeof window !== 'undefined' ? (window.location.origin + (window.location.pathname || '/').replace(/\/?$/, '/')) : 'https://www.cosmicjyoti.com/';
  const shareText = hi ? `आज अपना राशिफल देखें – CosmicJyoti। ${shareUrl}` : `Check your daily horoscope – CosmicJyoti. ${shareUrl}`;

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

  const dateLabel = today.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const luckColor = luck ? (luck.luckPercent >= 70 ? 'text-emerald-400' : luck.luckPercent >= 40 ? 'text-amber-400' : 'text-rose-400') : '';
  const levelLabel = (l: string) => (hi ? { low: 'कम', medium: 'मध्यम', high: 'उच्च' }[l as keyof object] || l : (l.charAt(0).toUpperCase() + l.slice(1)));

  const dosToShow = doDonts?.dos ? (showAllDoDonts ? doDonts.dos : doDonts.dos.slice(0, MAX_DOS_DONTS_VISIBLE)) : [];
  const dontsToShow = doDonts?.donts ? (showAllDoDonts ? doDonts.donts : doDonts.donts.slice(0, MAX_DOS_DONTS_VISIBLE)) : [];
  const hasMoreDoDonts = doDonts && (doDonts.dos.length > MAX_DOS_DONTS_VISIBLE || doDonts.donts.length > MAX_DOS_DONTS_VISIBLE);

  return (
    <section
      className="animate-fade-in-up rounded-2xl border border-amber-500/25 bg-gradient-to-b from-slate-800/90 to-slate-900/80 shadow-xl overflow-hidden"
      aria-label={hi ? 'आज का सार' : "Today's summary"}
    >
      {/* Header */}
      <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-slate-600/50 bg-gradient-to-r from-amber-500/10 to-transparent">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base sm:text-lg font-serif font-bold text-amber-100 flex items-center gap-2">
            <span className="text-xl" aria-hidden>☀</span>
            {hi ? 'आज' : 'Today'}
          </h2>
          <span className="text-xs text-slate-500 font-medium tabular-nums">{dateLabel}</span>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-5">
        {/* 1. Quick actions */}
        <div>
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-500 mb-3">
            {hi ? 'जल्दी देखें' : 'Quick access'}
          </p>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { icon: '🌞', label: hi ? 'राशिफल' : 'Horoscope', sub: hi ? 'भविष्य' : 'Predictions', mode: 'daily' as AppViewMode },
              { icon: '📅', label: hi ? 'पंचांग' : 'Panchang', sub: hi ? 'तिथि, मुहूर्त' : 'Tithi, Muhurat', mode: 'panchang' as AppViewMode },
              { icon: '📝', label: hi ? 'लेख' : 'Articles', sub: hi ? 'ताज़ा पढ़ें' : 'Fresh reads', mode: 'ai-blog' as AppViewMode },
            ].map(({ icon, label, sub, mode }) => (
              <button
                key={mode}
                onClick={() => onNavigate(mode)}
                className="flex flex-col items-center justify-center gap-1 py-4 rounded-xl bg-slate-800/70 border border-slate-600/70 hover:border-amber-500/40 hover:bg-slate-700/50 transition-all active:scale-[0.98]"
              >
                <span className="text-2xl">{icon}</span>
                <span className="font-semibold text-amber-100 text-sm leading-tight">{label}</span>
                <span className="text-[10px] text-slate-500 leading-tight">{sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Daily vibe */}
        <div>
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-500 mb-2">
            {hi ? 'आज का वाइब' : "Today's vibe"}
          </p>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => onNavigate('panchang')}
              className="flex flex-col items-center gap-0.5 py-3 rounded-lg bg-slate-800/50 border border-slate-600/50 hover:border-violet-500/30 transition-colors"
            >
              <span className="text-xl">{lunar.emoji}</span>
              <span className="text-[10px] text-slate-400">{hi ? 'चंद्र' : 'Moon'}</span>
              <span className="text-[9px] text-slate-500 truncate w-full text-center px-0.5">{hi ? lunar.shortHi : lunar.shortEn}</span>
            </button>
            <div className="flex flex-col items-center justify-center py-3 rounded-lg bg-slate-800/50 border border-slate-600/50">
              <span className="text-lg font-bold text-amber-300">{wd.num}</span>
              <span className="text-[9px] text-slate-500">{hi ? 'लकी #' : 'Lucky #'}</span>
            </div>
            <div className="flex flex-col items-center justify-center py-3 rounded-lg bg-slate-800/50 border border-slate-600/50">
              <span className="text-[10px] text-slate-400 truncate w-full text-center px-1">{hi ? wd.colorHi : wd.colorEn}</span>
              <span className="text-[9px] text-slate-500">{hi ? 'रंग' : 'Colour'}</span>
            </div>
            {personalYear > 0 || personalMonth > 0 ? (
              <button
                onClick={() => onNavigate('numerology')}
                className="flex flex-col items-center justify-center py-3 rounded-lg bg-slate-800/50 border border-slate-600/50 hover:border-violet-500/30 transition-colors"
              >
                <span className="text-sm font-bold text-purple-300">{personalYear}/{personalMonth}</span>
                <span className="text-[9px] text-slate-500">{hi ? 'वर्ष/माह' : 'Y/M'}</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('numerology')}
                className="flex flex-col items-center justify-center py-3 rounded-lg bg-slate-800/50 border border-slate-600/50 hover:border-violet-500/30 transition-colors"
              >
                <span className="text-[10px] text-slate-400">#</span>
                <span className="text-[9px] text-slate-500">{hi ? 'अंक' : 'Num'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. Luck score */}
        <div className="rounded-xl bg-slate-800/40 border border-slate-600/50 p-4">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-500 mb-3">
            {hi ? 'भाग्य स्कोर' : 'Luck score'}
          </p>
          {loadingLuck ? (
            <div className="flex items-center gap-4 py-2">
              <Logo className="w-10 h-10 animate-spin-slow text-amber-500/50" />
              <span className="text-slate-500 text-sm">{hi ? 'लोड हो रहा है...' : 'Loading...'}</span>
            </div>
          ) : luck ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-shrink-0 flex items-center justify-center">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-500/40 flex items-center justify-center bg-slate-900/60 ${luckColor}`}>
                  <span className="text-xl sm:text-2xl font-bold">{luck.luckPercent}%</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 mb-2">
                  {[
                    { key: 'energyLevel', label: hi ? 'ऊर्जा' : 'Energy' },
                    { key: 'emotionalStability', label: hi ? 'भावनात्मक' : 'Emotional' },
                    { key: 'decisionReadiness', label: hi ? 'निर्णय' : 'Decisions' },
                  ].map(({ key, label }) => (
                    <span key={key} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-700/50 text-[10px] sm:text-xs">
                      <span className="text-slate-500">{label}</span>
                      <span className="font-semibold text-amber-200/90">{levelLabel(luck[key as keyof DailyLuckScoreData] as string)}</span>
                    </span>
                  ))}
                </div>
                <p className="text-slate-300 text-xs sm:text-sm leading-snug mb-2">{luck.summary}</p>
                <button
                  type="button"
                  onClick={() => onNavigate('daily')}
                  className="text-amber-400 hover:text-amber-300 text-xs font-semibold underline underline-offset-2"
                >
                  {hi ? 'पूरा राशिफल देखें' : 'View full horoscope'}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* 4. Do's & Don'ts */}
        <div className="rounded-xl border border-slate-600/50 overflow-hidden">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-500 px-4 pt-4 pb-2">
            {hi ? 'आज के करें और न करें' : "Do's & Don'ts"}
          </p>
          {loadingDoDonts ? (
            <div className="flex items-center gap-3 px-4 pb-4">
              <Logo className="w-8 h-8 animate-spin-slow text-amber-500/50" />
              <span className="text-slate-500 text-sm">{hi ? 'लोड हो रहा है...' : 'Loading...'}</span>
            </div>
          ) : doDonts ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-4">
                <div className="bg-emerald-950/30 border-t sm:border-t-0 border-r-0 sm:border-r border-slate-600/40 p-4">
                  <h4 className="text-emerald-400 font-bold text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="text-emerald-500">✓</span>
                    {hi ? 'करें' : 'Do'}
                  </h4>
                  <ul className="space-y-1.5">
                    {dosToShow.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-200 text-xs sm:text-sm">
                        <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-rose-950/20 border-t border-slate-600/40 p-4">
                  <h4 className="text-rose-400 font-bold text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="text-rose-500">✗</span>
                    {hi ? 'न करें' : "Don't"}
                  </h4>
                  <ul className="space-y-1.5">
                    {dontsToShow.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-200 text-xs sm:text-sm">
                        <span className="text-rose-500 mt-0.5 shrink-0">✗</span>
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {hasMoreDoDonts && (
                <div className="px-4 pb-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAllDoDonts((v) => !v)}
                    className="text-[10px] sm:text-xs font-medium text-slate-500 hover:text-amber-400 transition-colors"
                  >
                    {showAllDoDonts ? (hi ? 'कम दिखाएं' : 'Show less') : (hi ? 'और देखें' : 'Show more')}
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-6 py-3 border-t border-slate-600/50 flex items-center justify-between gap-2 bg-slate-800/30">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-amber-300 text-xs font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {hi ? 'शेयर करें' : 'Share'}
        </button>
        <button
          type="button"
          onClick={() => onNavigate('mantra')}
          className="text-slate-500 hover:text-amber-400 text-xs font-medium transition-colors"
        >
          {hi ? 'मंत्र' : 'Mantra'}
        </button>
      </div>
    </section>
  );
}
