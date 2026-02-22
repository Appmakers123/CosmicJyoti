import React, { useState } from 'react';
import { generateGemstoneAdvice } from '../services/geminiService';
import { Language } from '../types';
import { PLANETS_INFO } from '../constants';
import { useTranslation } from '../utils/translations';
import RichText from './RichText';
import AdBanner from './AdBanner';
import { ModuleIntro } from './common';

const PROBLEMS = ["Financial Growth", "Health & Vitality", "Love & Relationships", "Mental Peace", "Career Success", "Spiritual Growth"];

const GemstoneLab: React.FC<{ language: Language }> = ({ language }) => {
  const t = useTranslation(language);
  const [planet, setPlanet] = useState(PLANETS_INFO[0].name);
  const [problem, setProblem] = useState(PROBLEMS[0]);
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await generateGemstoneAdvice(planet, problem, language);
      setAdvice(result);
    } catch (e) {
      setAdvice(t.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in-up">
      <div className="bg-slate-800/80 border border-cyan-500/30 rounded-2xl p-8 shadow-2xl">
        <ModuleIntro
          language={language}
          subtitleEn="Gemstone lab – planetary gems (ruby, pearl, emerald, blue sapphire, etc.) and which to wear for which planet."
          subtitleHi="रत्न लैब – ग्रह रत्न (माणिक, मोती, पन्ना, नीलम आदि) और किस ग्रह के लिए कौन सा पहनें।"
          descriptionEn="Select afflicted planet and life objective. Get Vedic gemstone advice: which gem suits you, benefits and wearing guidelines."
          descriptionHi="पीड़ित ग्रह और जीवन लक्ष्य चुनें। वैदिक रत्न सलाह: कौन सा रत्न आपके लिए, लाभ और पहनने के नियम।"
        />
        <h2 className="text-3xl font-serif text-cyan-200 text-center mb-8">{t.gemstoneAlchemy}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">{t.afflictedPlanet}</label>
            <select value={planet} onChange={(e) => setPlanet(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white outline-none">
              {PLANETS_INFO.map(p => <option key={p.name} value={p.name}>{language === 'hi' ? p.hindi : p.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">{t.lifeObjective}</label>
            <select value={problem} onChange={(e) => setProblem(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white outline-none">
              {PROBLEMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <button onClick={handleAnalyze} disabled={loading} className="w-full py-4 bg-cyan-600 rounded-xl font-bold text-white shadow-lg hover:bg-cyan-500 transition-all disabled:opacity-50">
          {loading ? t.forgingInsight : t.revealGemstone}
        </button>

        {advice && (
          <>
            <div className="mt-10 bg-slate-900/60 p-8 rounded-2xl border border-cyan-500/20 animate-fade-in">
              <RichText text={advice} />
            </div>
            <AdBanner variant="display" className="mt-8" />
          </>
        )}
      </div>
    </div>
  );
};

export default GemstoneLab;
