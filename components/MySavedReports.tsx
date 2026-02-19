import React from 'react';
import { listReports, type SavedReportMeta } from '../utils/reportStorageService';
import type { AppViewMode } from '../types';
import type { Language } from '../types';

const REPORT_TYPE_TO_MODE: Record<string, AppViewMode> = {
  kundali: 'kundali',
  panchang: 'panchang',
  horoscope: 'daily',
  matchmaking: 'matchmaking',
  muhurat: 'muhurat',
  numerology: 'numerology',
  tarot: 'tarot',
  palm: 'palm-reading',
  face: 'face-reading',
};

interface MySavedReportsProps {
  language: Language;
  onOpenMode: (mode: AppViewMode) => void;
}

const MySavedReports: React.FC<MySavedReportsProps> = ({ language, onOpenMode }) => {
  const reports = listReports().slice(0, 8);
  if (reports.length === 0) return null;

  const isHi = language === 'hi';
  const typeLabel: Record<string, { en: string; hi: string }> = {
    kundali: { en: 'Kundali', hi: 'कुंडली' },
    panchang: { en: 'Panchang', hi: 'पंचांग' },
    horoscope: { en: 'Horoscope', hi: 'राशिफल' },
    matchmaking: { en: 'Guna Milan', hi: 'गुण मिलान' },
    muhurat: { en: 'Muhurat', hi: 'मुहूर्त' },
    numerology: { en: 'Numerology', hi: 'अंक ज्योतिष' },
    tarot: { en: 'Tarot', hi: 'टैरो' },
    palm: { en: 'Palm', hi: 'हस्तरेखा' },
    face: { en: 'Face', hi: 'चेहरा' },
  };

  return (
    <section className="animate-fade-in-up rounded-2xl border border-slate-600/50 bg-slate-800/30 p-5">
      <h3 className="text-sm font-serif font-bold text-amber-200 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span>📁</span>
        {isHi ? 'मेरी सेव की गई रिपोर्ट' : 'My saved reports'}
      </h3>
      <div className="flex flex-wrap gap-2">
        {reports.map((r: SavedReportMeta) => {
          const mode = REPORT_TYPE_TO_MODE[r.type];
          const label = typeLabel[r.type] ? (isHi ? typeLabel[r.type].hi : typeLabel[r.type].en) : r.type;
          if (!mode) return null;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onOpenMode(mode)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 text-slate-300 hover:text-amber-200 text-xs font-medium transition-all"
            >
              <span>{label}</span>
              <span className="text-slate-500 truncate max-w-[100px]">· {r.title}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default MySavedReports;
