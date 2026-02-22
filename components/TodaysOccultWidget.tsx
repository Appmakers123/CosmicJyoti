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

interface TodaysOccultWidgetProps {
  language: Language;
  onNavigate: (mode: AppViewMode) => void;
}

export default function TodaysOccultWidget({ language, onNavigate }: TodaysOccultWidgetProps) {
  const today = new Date();
  const lunar = getLunarPhase(today);
  const profile = getGlobalProfile();
  const dob = profile?.self?.date;
  const personalYear = dob ? calculatePersonalYear(dob, today) : 0;
  const personalMonth = dob ? calculatePersonalMonth(dob, today) : 0;
  const wd = WEEKDAY_NUM[today.getDay()];
  const hi = language === 'hi';

  return (
    <section className="animate-fade-in-up rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-purple-500/5 p-5 md:p-6">
      <h3 className="text-sm font-serif font-bold text-violet-200 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span>🌙</span>
        {hi ? 'आज का ऑकल्ट' : "Today's Occult"}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button onClick={() => onNavigate('panchang')} className="flex flex-col items-center gap-1 p-4 rounded-xl bg-slate-800/80 border border-slate-600 hover:border-violet-500/50 text-left transition-all">
          <span className="text-2xl">{lunar.emoji}</span>
          <span className="text-xs font-medium text-violet-200">{hi ? 'चंद्र' : 'Moon'}</span>
          <span className="text-[10px] text-slate-500">{hi ? lunar.shortHi : lunar.shortEn}</span>
        </button>
        <div className="flex flex-col items-center justify-center gap-1 p-4 rounded-xl bg-slate-800/60 border border-slate-700">
          <span className="text-xl font-bold text-amber-300">{wd.num}</span>
          <span className="text-xs font-medium text-slate-300">{hi ? 'आज का लकी अंक' : "Today's lucky number"}</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 p-4 rounded-xl bg-slate-800/60 border border-slate-700">
          <span className="text-xs text-slate-400 truncate w-full text-center">{hi ? wd.colorHi : wd.colorEn}</span>
          <span className="text-[10px] text-slate-500">{hi ? 'शुभ रंग' : 'Lucky colour'}</span>
        </div>
        {(personalYear > 0 || personalMonth > 0) ? (
          <button onClick={() => onNavigate('numerology')} className="flex flex-col items-center gap-1 p-4 rounded-xl bg-slate-800/80 border border-slate-600 hover:border-violet-500/50 transition-all">
            <span className="text-lg font-bold text-purple-300">{personalYear}/{personalMonth}</span>
            <span className="text-[10px] text-slate-500">{hi ? 'वर्ष/माह अंक' : 'Year/Month number'}</span>
          </button>
        ) : (
          <button onClick={() => onNavigate('numerology')} className="flex flex-col items-center justify-center gap-1 p-4 rounded-xl bg-slate-800/80 border border-slate-600 hover:border-violet-500/50 transition-all">
            <span className="text-xs text-slate-400">{hi ? 'अंक ज्योतिष' : 'Numerology'}</span>
          </button>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => onNavigate('daily')} className="text-xs text-slate-400 hover:text-violet-300">{hi ? 'राशिफल' : 'Horoscope'}</button>
        <span className="text-slate-600">·</span>
        <button onClick={() => onNavigate('panchang')} className="text-xs text-slate-400 hover:text-violet-300">{hi ? 'पंचांग' : 'Panchang'}</button>
        <span className="text-slate-600">·</span>
        <button onClick={() => onNavigate('mantra')} className="text-xs text-slate-400 hover:text-violet-300">{hi ? 'मंत्र' : 'Mantra'}</button>
      </div>
    </section>
  );
}
