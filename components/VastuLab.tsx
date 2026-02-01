import React, { useState } from 'react';
import { generateVastuAnalysis } from '../services/geminiService';
import { Language } from '../types';
import { useTranslation } from '../utils/translations';
import RichText from './RichText';
import AdBanner from './AdBanner';

const DIRECTIONS = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"];
const ROOMS = ["Entrance", "Kitchen", "Bedroom", "Pooja Room", "Living Room", "Toilet", "Study", "Balcony"];

const VastuLab: React.FC<{ language: Language }> = ({ language }) => {
  const t = useTranslation(language);
  const [room, setRoom] = useState(ROOMS[0]);
  const [direction, setDirection] = useState(DIRECTIONS[0]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await generateVastuAnalysis(room, direction, language);
      setAnalysis(result);
    } catch (e) {
      setAnalysis(t.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in-up">
      <div className="bg-slate-800/80 border border-emerald-500/30 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-3xl font-serif text-emerald-200 text-center mb-8">{t.vastuLabTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{t.selectRoom}</label>
            <select value={room} onChange={(e) => setRoom(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white outline-none">
              {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{t.selectDirection}</label>
            <select value={direction} onChange={(e) => setDirection(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white outline-none">
              {DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <button onClick={handleAnalyze} disabled={loading} className="w-full py-4 bg-emerald-600 rounded-xl font-bold text-white shadow-lg hover:bg-emerald-500 transition-all disabled:opacity-50">
          {loading ? t.analyzingEnergy : t.interpretVastu}
        </button>

        {analysis && (
          <>
            <div className="mt-10 bg-slate-900/60 p-8 rounded-2xl border border-emerald-500/20 animate-fade-in">
              <RichText text={analysis} />
            </div>
            <AdBanner variant="display" className="mt-8" />
          </>
        )}
      </div>
    </div>
  );
};

export default VastuLab;
