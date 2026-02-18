import React from 'react';
import { Language } from '../types';
import { BackButton } from './common';

const WEEKDAY_DIRECTION: { day: number; en: string; hi: string; favourable: string; avoid: string }[] = [
  { day: 0, en: 'Sunday', hi: 'रविवार', favourable: 'East, North', avoid: 'South' },
  { day: 1, en: 'Monday', hi: 'सोमवार', favourable: 'North-West', avoid: 'South' },
  { day: 2, en: 'Tuesday', hi: 'मंगलवार', favourable: 'South', avoid: 'North' },
  { day: 3, en: 'Wednesday', hi: 'बुधवार', favourable: 'North', avoid: 'South' },
  { day: 4, en: 'Thursday', hi: 'गुरुवार', favourable: 'North-East, East', avoid: 'South' },
  { day: 5, en: 'Friday', hi: 'शुक्रवार', favourable: 'South-East', avoid: 'North-East' },
  { day: 6, en: 'Saturday', hi: 'शनिवार', favourable: 'West', avoid: 'East' },
];

const Disha: React.FC<{ language: Language; onBack?: () => void }> = ({ language, onBack }) => {
  const today = new Date().getDay();
  const row = WEEKDAY_DIRECTION.find((r) => r.day === today) || WEEKDAY_DIRECTION[0];
  const dayName = language === 'hi' ? row.hi : row.en;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-12 animate-fade-in-up">
      <div className="bg-slate-800/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-8 shadow-2xl">
        {onBack && (
          <div className="mb-6">
            <BackButton onClick={onBack} label={language === 'hi' ? 'वापस' : 'Back'} />
          </div>
        )}
        <h2 className="text-3xl font-serif text-amber-200 mb-2">
          {language === 'hi' ? 'दिशा शूल — आज की दिशा' : 'Disha — Today direction'}
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          {language === 'hi' ? 'वार के अनुसार शुभ और अशुभ दिशा' : 'Favourable and avoid directions by weekday'}
        </p>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 mb-6">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">{language === 'hi' ? 'आज' : 'Today'}</p>
          <p className="text-2xl font-serif text-amber-200 mb-4">{dayName}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-1">{language === 'hi' ? 'शुभ दिशा' : 'Favourable'}</p>
              <p className="text-slate-200">{row.favourable}</p>
            </div>
            <div>
              <p className="text-rose-400 text-sm font-bold uppercase tracking-wider mb-1">{language === 'hi' ? 'टालें' : 'Avoid'}</p>
              <p className="text-slate-200">{row.avoid}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="py-2 pr-4">{language === 'hi' ? 'वार' : 'Day'}</th>
                <th className="py-2 pr-4">{language === 'hi' ? 'शुभ दिशा' : 'Favourable'}</th>
                <th className="py-2">{language === 'hi' ? 'टालें' : 'Avoid'}</th>
              </tr>
            </thead>
            <tbody>
              {WEEKDAY_DIRECTION.map((r) => (
                <tr key={r.day} className={r.day === today ? 'bg-amber-500/10' : ''}>
                  <td className="py-2 pr-4">{language === 'hi' ? r.hi : r.en}</td>
                  <td className="py-2 pr-4 text-emerald-400/90">{r.favourable}</td>
                  <td className="py-2 text-rose-400/90">{r.avoid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Disha;
