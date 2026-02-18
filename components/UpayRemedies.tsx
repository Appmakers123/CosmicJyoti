import React, { useState } from 'react';
import { Language } from '../types';
import { generateUpayRemedies } from '../services/geminiService';
import { PLANETS_INFO } from '../constants';
import { setErrorSafely } from '../utils/errorHandler';
import AdBanner from './AdBanner';
import RichText from './RichText';
import { BackButton } from './common';

const PROBLEMS = [
  'Financial growth', 'Health and vitality', 'Love and relationships', 'Mental peace',
  'Career success', 'Spiritual growth', 'Delay in marriage', 'Enemy or competition',
  'Education', 'Property', 'Legal issues',
];

const UpayRemedies: React.FC<{ language: Language; onBack?: () => void }> = ({ language, onBack }) => {
  const [mode, setMode] = useState<'planet' | 'problem'>('planet');
  const [planet, setPlanet] = useState(PLANETS_INFO[0].name);
  const [problem, setProblem] = useState(PROBLEMS[0]);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = mode === 'planet' ? (language === 'hi' ? planet + ' ग्रह उपाय' : 'Strengthen planet ' + planet) : problem;
    setLoading(true);
    setError(null);
    try {
      const text = await generateUpayRemedies(input, language);
      setResult(text);
    } catch (err) {
      setErrorSafely(setError, err, language, 'UpayRemedies');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-12 animate-fade-in-up">
      <div className="bg-slate-800/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-8 shadow-2xl">
        {onBack && (
          <div className="mb-6">
            <BackButton onClick={onBack} label={language === 'hi' ? 'वापस' : 'Back'} />
          </div>
        )}
        <h2 className="text-3xl font-serif text-amber-200 mb-2">
          {language === 'hi' ? 'उपाय — ज्योतिषीय उपचार' : 'Upay — Vedic Remedies'}
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          {language === 'hi' ? 'ग्रह या समस्या के अनुसार व्यावहारिक उपाय' : 'Short remedies by planet or life problem'}
        </p>
        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs uppercase tracking-wider mb-2">{language === 'hi' ? 'चुनें' : 'Choose'}</label>
              <div className="flex gap-4 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="mode" checked={mode === 'planet'} onChange={() => setMode('planet')} className="rounded" />
                  <span>{language === 'hi' ? 'ग्रह के अनुसार' : 'By planet'}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="mode" checked={mode === 'problem'} onChange={() => setMode('problem')} className="rounded" />
                  <span>{language === 'hi' ? 'समस्या के अनुसार' : 'By problem'}</span>
                </label>
              </div>
            </div>
            {mode === 'planet' ? (
              <div>
                <label className="block text-slate-400 text-xs uppercase tracking-wider mb-1">{language === 'hi' ? 'ग्रह' : 'Planet'}</label>
                <select value={planet} onChange={(e) => setPlanet(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100">
                  {PLANETS_INFO.map((p) => (
                    <option key={p.name} value={p.name}>{language === 'hi' ? p.hindi : p.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-slate-400 text-xs uppercase tracking-wider mb-1">{language === 'hi' ? 'समस्या' : 'Problem or Goal'}</label>
                <select value={problem} onChange={(e) => setProblem(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100">
                  {PROBLEMS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            )}
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold text-white disabled:opacity-50">
              {loading ? (language === 'hi' ? 'उपाय बन रहे हैं...' : 'Getting remedies...') : (language === 'hi' ? 'उपाय देखें' : 'Get remedies')}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <AdBanner variant="leaderboard" />
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-amber-500/20">
              <RichText text={result} />
            </div>
            <button type="button" onClick={() => { setResult(null); setError(null); }} className="px-4 py-2 bg-slate-700 rounded-lg text-slate-300 text-sm">
              {language === 'hi' ? 'दूसरा उपाय' : 'Another remedy'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpayRemedies;
