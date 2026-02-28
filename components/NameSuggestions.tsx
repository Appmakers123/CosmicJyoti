import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { generateNameSuggestions } from '../services/geminiService';
import { setErrorSafely } from '../utils/errorHandler';
import { requestScrollToMain } from '../utils/scrollToMain';
import AdBanner from './AdBanner';
import RichText from './RichText';
import { BackButton, ModuleIntro } from './common';

const NameSuggestions: React.FC<{ language: Language; onBack?: () => void }> = ({ language, onBack }) => {
  const [type, setType] = useState<'baby' | 'business'>('baby');
  const [preferences, setPreferences] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pref = preferences.trim() || 'No specific preference';
    const text = (type === 'baby' ? 'Baby name suggestions. Preferences: ' : 'Business brand name. Preferences: ') + pref;
    setLoading(true);
    setError(null);
    try {
      const out = await generateNameSuggestions(type, text, language);
      setResult(out);
    } catch (err) {
      setErrorSafely(setError, err, language, 'NameSuggestions');
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
        {onBack && <div className="mb-6"><BackButton onClick={onBack} label={language === 'hi' ? 'वापस' : 'Back'} /></div>}
        <ModuleIntro
          language={language}
          subtitleEn="Baby name & business name suggestions – by numerology and preferences (Vedic and modern)."
          subtitleHi="बेबी नाम और व्यापार नाम सुझाव – अंक ज्योतिष और पसंद के अनुसार।"
          descriptionEn="Get name ideas for your baby or for a business/brand. Share preferences (e.g. letter, meaning) for personalised suggestions."
          descriptionHi="बच्चे या व्यापार/ब्रांड के लिए नाम सुझाव पाएं। पसंद बताएं (अक्षर, अर्थ) – व्यक्तिगत सुझाव।"
        />
        <h2 className="text-3xl font-serif text-amber-200 mb-2">Name Suggestions</h2>
        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs uppercase tracking-wider mb-2">Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="type" checked={type === 'baby'} onChange={() => setType('baby')} className="rounded" /><span>Baby name</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="type" checked={type === 'business'} onChange={() => setType('business')} className="rounded" /><span>Business</span></label>
              </div>
            </div>
            <div><label className="block text-slate-400 text-xs uppercase tracking-wider mb-1">Preferences</label><textarea value={preferences} onChange={(e) => setPreferences(e.target.value)} rows={3} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100" /></div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold text-white disabled:opacity-50">{loading ? '...' : 'Get suggestions'}</button>
          </form>
        ) : (
          <div className="space-y-6">
            <AdBanner variant="leaderboard" />
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-amber-500/20"><RichText text={result} /></div>
            <button type="button" onClick={() => { setResult(null); setError(null); }} className="px-4 py-2 bg-slate-700 rounded-lg text-slate-300 text-sm">New suggestions</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NameSuggestions;
