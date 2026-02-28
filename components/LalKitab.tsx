import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { generateLalKitabTotkas } from '../services/geminiService';
import { PLANETS_INFO } from '../constants';
import { setErrorSafely } from '../utils/errorHandler';
import { requestScrollToMain } from '../utils/scrollToMain';
import AdBanner from './AdBanner';
import RichText from './RichText';
import { BackButton, ModuleIntro } from './common';

const LAL_KITAB_TOPICS = [
  'Financial problems', 'Health issues', 'Marriage delay', 'Enemy / competition',
  'Mental peace', 'Child / education', 'Property', 'Legal matters', 'Job / career',
];

const LalKitab: React.FC<{ language: Language; onBack?: () => void }> = ({ language, onBack }) => {
  const [mode, setMode] = useState<'planet' | 'topic'>('topic');
  const [planet, setPlanet] = useState(PLANETS_INFO[0].name);
  const [topic, setTopic] = useState(LAL_KITAB_TOPICS[0]);
  const [customTopic, setCustomTopic] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = mode === 'planet'
      ? (language === 'hi' ? planet + ' grah' : planet)
      : (customTopic.trim() || topic);
    setLoading(true);
    setError(null);
    try {
      const text = await generateLalKitabTotkas(input, language);
      setResult(text);
    } catch (err) {
      setErrorSafely(setError, err, language, 'LalKitab');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (result) requestScrollToMain();
  }, [result]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-12 animate-fade-in-up">
      <div className="bg-slate-800/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-8 shadow-2xl">
        {onBack && (
          <div className="mb-6">
            <BackButton onClick={onBack} label={language === 'hi' ? 'Vapas' : 'Back'} />
          </div>
        )}
        <ModuleIntro
          language={language}
          subtitleEn="Lal Kitab totkas and remedies – simple upay by planet or topic (free)."
          subtitleHi="लाल किताब टोटके और उपाय – ग्रह या विषय से सरल उपाय (मुफ्त)।"
          descriptionEn="Simple, non-ritualistic remedies popular in North India. Choose a planet or life topic (finance, health, marriage, etc.) for quick totkas and upay."
          descriptionHi="सरल, अनुष्ठान-रहित उपाय। ग्रह या विषय चुनें (धन, स्वास्थ्य, विवाह) – टोटके और उपाय।"
        />
        <h2 className="text-3xl font-serif text-amber-200 mb-2">
          {language === 'hi' ? 'लाल किताब – टोटके' : 'Lal Kitab – Totkas'}
        </h2>
        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs uppercase tracking-wider mb-2">Choose</label>
              <div className="flex gap-4 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="mode" checked={mode === 'topic'} onChange={() => setMode('topic')} className="rounded" />
                  <span>By topic</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="mode" checked={mode === 'planet'} onChange={() => setMode('planet')} className="rounded" />
                  <span>By planet</span>
                </label>
              </div>
            </div>
            {mode === 'planet' ? (
              <div>
                <label className="block text-slate-400 text-xs uppercase tracking-wider mb-1">Planet</label>
                <select value={planet} onChange={(e) => setPlanet(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100">
                  {PLANETS_INFO.map((p) => (
                    <option key={p.name} value={p.name}>{language === 'hi' ? p.hindi : p.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-slate-400 text-xs uppercase tracking-wider mb-1">Topic</label>
                  <select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100">
                    {LAL_KITAB_TOPICS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs uppercase tracking-wider mb-1">Your topic (optional)</label>
                  <input type="text" value={customTopic} onChange={(e) => setCustomTopic(e.target.value)} placeholder="e.g. job, money, health" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500" />
                </div>
              </>
            )}
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold text-white disabled:opacity-50">
              {loading ? 'Getting totkas...' : 'Get totkas'}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <AdBanner variant="leaderboard" />
            <div className="bg-slate-900/60 p-4 sm:p-6 rounded-2xl border border-amber-500/20 min-w-0 w-full overflow-visible">
              <RichText text={result} className="break-words" />
            </div>
            <button type="button" onClick={() => { setResult(null); setError(null); }} className="px-4 py-2 bg-slate-700 rounded-lg text-slate-300 text-sm">
              Another topic
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LalKitab;
