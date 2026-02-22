import React, { useMemo, useState } from 'react';
import { listReports, deleteReport, type SavedReportMeta } from '../utils/reportStorageService';
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

/** Section order for grouped list */
const TYPE_ORDER: string[] = ['kundali', 'horoscope', 'panchang', 'matchmaking', 'muhurat', 'numerology', 'tarot', 'palm', 'face'];

interface MySavedReportsProps {
  language: Language;
  onOpenMode: (mode: AppViewMode) => void;
  /** When true, use compact styling for hamburger menu */
  compact?: boolean;
}

const MySavedReports: React.FC<MySavedReportsProps> = ({ language, onOpenMode, compact = false }) => {
  const [reportList, setReportList] = useState<SavedReportMeta[]>(() => listReports());
  const isHi = language === 'hi';
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    deleteReport(id);
    setReportList((prev) => prev.filter((m) => m.id !== id));
  };

  const toggle = (type: string) => {
    setExpanded((prev) => ({ ...prev, [type]: !prev[type] }));
  };

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

  const grouped = useMemo(() => {
    const byType: Record<string, SavedReportMeta[]> = {};
    for (const r of reportList) {
      if (!byType[r.type]) byType[r.type] = [];
      byType[r.type].push(r);
    }
    return TYPE_ORDER.filter((t) => byType[t]?.length).map((type) => ({ type, reports: byType[type] }));
  }, [reportList]);

  if (grouped.length === 0) return null;

  return (
    <section className={compact ? 'rounded-xl border border-slate-700/50 bg-slate-800/40 p-3' : 'animate-fade-in-up rounded-2xl border border-slate-600/50 bg-slate-800/30 p-5'}>
      <h3 className={`font-serif font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2 ${compact ? 'text-xs mb-3' : 'text-sm mb-4'}`}>
        <span>📁</span>
        {isHi ? 'मेरी सेव की गई रिपोर्ट' : 'My saved reports'}
      </h3>
      <div className={compact ? 'space-y-2' : 'space-y-4'}>
        {grouped.map(({ type, reports: items }) => {
          const mode = REPORT_TYPE_TO_MODE[type];
          const label = typeLabel[type] ? (isHi ? typeLabel[type].hi : typeLabel[type].en) : type;
          if (!mode) return null;
          const isOpen = expanded[type] === true;
          return (
            <div key={type} className={compact ? 'rounded-lg border border-slate-600/50 bg-slate-900/50 overflow-hidden' : 'rounded-lg border border-slate-600/50 bg-slate-900/40 overflow-hidden'}>
              <button
                type="button"
                onClick={() => toggle(type)}
                className={`w-full flex items-center gap-2 text-left hover:bg-slate-600/50 transition-colors ${compact ? 'px-2.5 py-1.5 bg-slate-700/40 border-b border-slate-600/50' : 'px-3 py-2 bg-slate-700/50 border-b border-slate-600/50'}`}
                aria-expanded={isOpen}
                aria-controls={`saved-reports-${type}`}
                id={`saved-reports-heading-${type}`}
              >
                <span
                  className={`text-slate-400 text-sm transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                  aria-hidden
                >
                  ▶
                </span>
                <span className="text-slate-400" aria-hidden style={{ fontSize: compact ? '0.875rem' : '1.125rem' }}>📂</span>
                <span className={`font-semibold text-amber-200/90 uppercase tracking-wider flex-1 ${compact ? 'text-[10px]' : 'text-xs'}`}>{label}</span>
                <span className="text-slate-500 text-xs">({items.length})</span>
              </button>
              <div
                id={`saved-reports-${type}`}
                role="region"
                aria-labelledby={`saved-reports-heading-${type}`}
                className={isOpen ? 'block' : 'hidden'}
              >
                <ul className="divide-y divide-slate-700/50">
                  {items.map((r) => (
                    <li key={r.id} className="flex items-center gap-1 group">
                      <button
                        type="button"
                        onClick={() => onOpenMode(mode)}
                        className={`flex-1 min-w-0 text-left text-slate-300 hover:bg-slate-700/40 hover:text-amber-100 transition-colors flex items-center gap-2 ${compact ? 'px-2.5 py-2 pl-5 text-xs' : 'px-3 py-2.5 pl-6 text-sm'}`}
                      >
                        <span className="text-slate-500 shrink-0">·</span>
                        <span className="truncate">{r.title}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, r.id)}
                        className={`shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors touch-manipulation ${compact ? 'mr-1' : 'mr-2'}`}
                        aria-label={isHi ? 'रिपोर्ट हटाएं' : 'Remove report'}
                        title={isHi ? 'रिपोर्ट हटाएं' : 'Remove report'}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MySavedReports;
