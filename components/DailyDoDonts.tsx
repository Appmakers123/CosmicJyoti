import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { getDailyDoDonts, DailyDoDont } from '../services/dailyInsightsService';
import { getGlobalProfile } from '../utils/profileStorageService';
import Logo from './Logo';

interface DailyDoDontsProps {
  language: Language;
  sign?: string;
  moonSign?: string;
  nakshatra?: string;
  compact?: boolean;
}

const DailyDoDonts: React.FC<DailyDoDontsProps> = ({
  language,
  sign,
  moonSign,
  nakshatra,
  compact = false,
}) => {
  const [data, setData] = useState<DailyDoDont | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profile = getGlobalProfile();
    const astro = profile?.astroDetails;
    const ctx = {
      sign: sign || astro?.sunSign || astro?.moonSign || undefined,
      moonSign: moonSign || astro?.moonSign || undefined,
      nakshatra: nakshatra || astro?.nakshatra || undefined,
    };
    getDailyDoDonts(language, ctx).then(setData).finally(() => setLoading(false));
  }, [language, sign, moonSign, nakshatra]);

  if (loading) {
    return (
      <div className={`bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-6 ${compact ? 'p-4' : 'p-6 md:p-8'}`}>
        <div className="flex items-center justify-center gap-3 py-4">
          <Logo className="w-8 h-8 animate-spin-slow" />
          <span className="text-slate-500 text-sm">{language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const title = language === 'hi' ? 'आज के करें और न करें' : "Today's Do's & Don'ts";

  return (
    <div className={`bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl overflow-hidden ${compact ? 'p-4' : 'p-6 md:p-8'}`}>
      <h3 className="text-lg font-serif font-bold text-amber-200 mb-4 flex items-center gap-2">
        <span>✓</span>
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
          <h4 className="text-green-400 font-bold text-xs uppercase tracking-widest mb-3">
            {language === 'hi' ? 'करें' : 'Do'}
          </h4>
          <ul className="space-y-2">
            {data.dos.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-200 text-sm">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
          <h4 className="text-red-400 font-bold text-xs uppercase tracking-widest mb-3">
            {language === 'hi' ? 'न करें' : "Don't"}
          </h4>
          <ul className="space-y-2">
            {data.donts.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-200 text-sm">
                <span className="text-red-500 mt-0.5">✗</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DailyDoDonts;
