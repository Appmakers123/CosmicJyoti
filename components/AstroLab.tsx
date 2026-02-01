import React, { useState } from 'react';
import { Language } from '../types';
import { PLANETS_INFO, HOUSES_INFO, ZODIAC_SIGNS } from '../constants';
import { generateConjunctionAnalysis } from '../services/geminiService';
import { useTranslation } from '../utils/translations';
import RichText from './RichText';

interface AstroLabProps {
  language: Language;
}

const AstroLab: React.FC<AstroLabProps> = ({ language }) => {
  const t = useTranslation(language);
  const [p1, setP1] = useState(PLANETS_INFO[0].name);
  const [p2, setP2] = useState(PLANETS_INFO[1].name);
  const [house, setHouse] = useState(1);
  const [conjunctionSign, setConjunctionSign] = useState(ZODIAC_SIGNS[0].name);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis(null);
    try {
      const result = await generateConjunctionAnalysis([p1, p2], house, conjunctionSign, language);
      setAnalysis(result);
    } catch (e) {
      setAnalysis("The celestial archives are obscured. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-24 animate-fade-in-up">
      <div className="text-center mb-16">
        <span className="text-[10px] uppercase font-bold tracking-[1em] text-amber-500 mb-2 block">Interactive Lab</span>
        <h2 className="text-5xl md:text-7xl font-serif text-amber-100 drop-shadow-lg">
          {t.yogaLab}
        </h2>
        <p className="text-slate-500 text-sm italic tracking-[0.2em] mt-4 uppercase">
          {t.yogaLabSubtitle}
        </p>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800 rounded-[4rem] p-6 md:p-16 shadow-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="animate-fade-in max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="space-y-2">
              <label className="text-[10px] text-amber-500 font-bold uppercase tracking-widest ml-4">{t.celestialBodyA}</label>
              <select 
                value={p1} 
                onChange={(e) => setP1(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-5 text-sm text-white outline-none focus:border-amber-500"
              >
                {PLANETS_INFO.map(p => (
                  <option key={p.name} value={p.name}>
                    {language === 'hi' ? p.hindi : p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-amber-500 font-bold uppercase tracking-widest ml-4">{t.celestialBodyB}</label>
              <select 
                value={p2} 
                onChange={(e) => setP2(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-5 text-sm text-white outline-none focus:border-amber-500"
              >
                {PLANETS_INFO.map(p => (
                  <option key={p.name} value={p.name}>
                    {language === 'hi' ? p.hindi : p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-amber-500 font-bold uppercase tracking-widest ml-4">{t.bhavaHouse}</label>
              <select 
                value={house} 
                onChange={(e) => setHouse(Number(e.target.value))} 
                className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-5 text-sm text-white outline-none focus:border-amber-500"
              >
                {HOUSES_INFO.map(h => (
                  <option key={h.id} value={h.id}>
                    {t.house} {h.id} ({language === 'hi' ? h.nameHi : h.name})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-amber-500 font-bold uppercase tracking-widest ml-4">{t.rashiEnvironment}</label>
              <select 
                value={conjunctionSign} 
                onChange={(e) => setConjunctionSign(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-5 text-sm text-white outline-none focus:border-amber-500"
              >
                {ZODIAC_SIGNS.map(z => (
                  <option key={z.name} value={z.name}>
                    {language === 'hi' ? z.hindiName : z.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-700 text-white font-serif font-bold py-6 rounded-[2rem] shadow-2xl transition-all active:scale-95 disabled:opacity-50 text-xl"
          >
            {loading ? t.synthesizingData : t.revealYogaImpact}
          </button>

          {analysis && (
            <div className="mt-12 bg-slate-950/80 border border-amber-500/20 p-12 rounded-[3.5rem] shadow-3xl animate-fade-in-up">
              <RichText text={analysis} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AstroLab;

