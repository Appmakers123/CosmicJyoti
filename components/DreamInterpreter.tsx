import React, { useState } from 'react';
import { generateDreamAnalysis } from '../services/geminiService';
import { Language } from '../types';
import { useTranslation } from '../utils/translations';
import RichText from './RichText';
import AdBanner from './AdBanner';
import { ModuleIntro } from './common';
import { getCachedAI, setCachedAI } from '../utils/aiCacheService';

const DreamInterpreter: React.FC<{ language: Language }> = ({ language }) => {
  const t = useTranslation(language);
  const [dream, setDream] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!dream.trim()) return;
    const cached = getCachedAI<string>('dream', dream.trim());
    if (cached) {
      setAnalysis(cached);
      return;
    }
    setLoading(true);
    try {
      const result = await generateDreamAnalysis(dream, language);
      setCachedAI('dream', dream.trim(), result);
      setAnalysis(result);
    } catch (e) {
      setAnalysis(t.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in-up">
      <div className="bg-slate-800/80 border border-indigo-500/30 rounded-2xl p-8 shadow-2xl">
        <ModuleIntro
          language={language}
          subtitleEn="Dream interpretation – meanings of dreams and symbols (Vedic and universal)."
          subtitleHi="सपनों की व्याख्या – सपनों और प्रतीकों के अर्थ (वैदिक और सार्वभौम)।"
          descriptionEn="Describe your dream and get an AI analysis. Covers common symbols, emotions and possible messages for reflection."
          descriptionHi="सपना बताएं और AI विश्लेषण पाएं। प्रतीक, भावनाएं और संदेश।"
        />
        <div className="text-center mb-8">
            <h2 className="text-3xl font-serif text-indigo-200 mb-2">{t.dreamMeaning}</h2>
            <p className="text-slate-400 text-sm">{t.dreamSubtitle}</p>
        </div>

        <div className="space-y-4 mb-8">
          <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{t.describeDream}</label>
          <textarea 
            value={dream} 
            onChange={(e) => setDream(e.target.value)} 
            placeholder={language === 'hi' ? "उदाहरण: मैं एक जंगल के ऊपर उड़ रहा था..." : "e.g. I was flying over a forest..."}
            className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <button 
          onClick={handleAnalyze} 
          disabled={loading || !dream.trim()} 
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-bold text-white shadow-lg hover:from-indigo-500 transition-all disabled:opacity-50"
        >
          {loading ? t.searchingMind : t.discoverMeaning}
        </button>

        {analysis && (
          <div className="mt-10 space-y-6">
            <div className="bg-slate-900/60 p-8 rounded-2xl border border-indigo-500/20 animate-fade-in">
                <h3 className="text-xl font-serif text-indigo-100 mb-4">{language === 'hi' ? 'मार्गदर्शक कहता है:' : 'The Guide Says:'}</h3>
                <RichText text={analysis} />
            </div>
            <AdBanner variant="leaderboard" />
          </div>
        )}
      </div>
    </div>
  );
};

export default DreamInterpreter;
