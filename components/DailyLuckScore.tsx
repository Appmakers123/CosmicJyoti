import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { getDailyLuckScore, type DailyLuckScore as DailyLuckScoreData } from '../services/dailyInsightsService';
import { getGlobalProfile } from '../utils/profileStorageService';
import Logo from './Logo';

interface DailyLuckScoreProps {
  language: Language;
  sign?: string;
  moonSign?: string;
  onViewHoroscope?: () => void;
}

const DailyLuckScore: React.FC<DailyLuckScoreProps> = ({
  language,
  sign,
  moonSign,
  onViewHoroscope,
}) => {
  const [data, setData] = useState<DailyLuckScoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profile = getGlobalProfile();
    const ctx = {
      sign: sign || (profile?.self?.location ? 'From profile' : undefined),
      moonSign: moonSign || undefined,
    };
    getDailyLuckScore(language, ctx).then(setData).finally(() => setLoading(false));
  }, [language, sign, moonSign]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-500/10 to-amber-500/10 border border-purple-500/30 rounded-2xl p-6">
        <div className="flex items-center justify-center gap-3 py-8">
          <Logo className="w-8 h-8 animate-spin-slow" />
          <span className="text-slate-500 text-sm">{language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const luckColor = data.luckPercent >= 70 ? 'text-green-400' : data.luckPercent >= 40 ? 'text-amber-400' : 'text-red-400';
  const levelLabel = (l: string) =>
    language === 'hi'
      ? { low: 'कम', medium: 'मध्यम', high: 'उच्च' }[l as keyof object] || l
      : l.charAt(0).toUpperCase() + l.slice(1);

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-amber-500/10 border border-purple-500/30 rounded-2xl p-6 md:p-8">
      <h3 className="text-lg font-serif font-bold text-amber-200 mb-4 flex items-center gap-2">
        <span>🍀</span>
        {language === 'hi' ? 'आज का भाग्य स्कोर' : "Today's Luck Score"}
      </h3>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="flex-shrink-0">
          <div className={`w-24 h-24 rounded-full border-4 border-amber-500/50 flex items-center justify-center bg-slate-900/50 ${luckColor}`}>
            <span className="text-3xl font-bold">{data.luckPercent}%</span>
          </div>
        </div>
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-800/50 rounded-lg px-3 py-2">
              <span className="text-slate-500 block">{language === 'hi' ? 'ऊर्जा' : 'Energy'}</span>
              <span className="text-amber-300 font-bold">{levelLabel(data.energyLevel)}</span>
            </div>
            <div className="bg-slate-800/50 rounded-lg px-3 py-2">
              <span className="text-slate-500 block">{language === 'hi' ? 'भावनात्मक' : 'Emotional'}</span>
              <span className="text-amber-300 font-bold">{levelLabel(data.emotionalStability)}</span>
            </div>
            <div className="bg-slate-800/50 rounded-lg px-3 py-2">
              <span className="text-slate-500 block">{language === 'hi' ? 'निर्णय' : 'Decisions'}</span>
              <span className="text-amber-300 font-bold">{levelLabel(data.decisionReadiness)}</span>
            </div>
          </div>
          <p className="text-slate-300 text-sm">{data.summary}</p>
          {onViewHoroscope && (
            <button
              onClick={onViewHoroscope}
              className="text-amber-400 hover:text-amber-300 text-sm font-bold underline"
            >
              {language === 'hi' ? 'पूरा राशिफल देखें' : 'View full horoscope'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyLuckScore;
