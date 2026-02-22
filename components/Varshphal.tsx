import React, { useState } from 'react';
import { Language } from '../types';
import { generateVarshphal } from '../services/geminiService';
import { setErrorSafely } from '../utils/errorHandler';
import AdBanner from './AdBanner';
import RichText from './RichText';
import { BackButton, ModuleIntro } from './common';

export default function Varshphal({ language, onBack }: { language: Language; onBack?: () => void }) {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !dob) {
      setError('Please enter name and birth date');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const text = await generateVarshphal(name.trim(), dob, year, language);
      setResult(text);
    } catch (err) {
      setErrorSafely(setError, err, language, 'Varshphal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-12 animate-fade-in-up">
      <div className="bg-slate-800/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-8 shadow-2xl">
        {onBack && <div className="mb-6"><BackButton onClick={onBack} label={language === 'hi' ? 'वापस' : 'Back'} /></div>}
        <ModuleIntro
          language={language}
          subtitleEn="Varshphal – yearly horoscope; year ahead forecast by birth date (Vedic annual prediction)."
          subtitleHi="वर्षफल – वार्षिक राशिफल; जन्म तारीख के आधार पर साल भर का पूर्वानुमान।"
          descriptionEn="Enter name, birth date and the year you want. Get a personalised yearly forecast for career, health, finance and relationships."
          descriptionHi="नाम, जन्म तारीख और वर्ष डालें। करियर, स्वास्थ्य, धन और रिश्तों के लिए वार्षिक पूर्वानुमान।"
        />
        <h2 className="text-3xl font-serif text-amber-200 mb-2">Varshphal Yearly Horoscope</h2>
        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-slate-400 text-xs uppercase mb-1">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-slate-400 text-xs uppercase mb-1">Birth date</label><input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100" /></div>
              <div><label className="block text-slate-400 text-xs uppercase mb-1">Year</label><input type="number" min={2020} max={2040} value={year} onChange={(e) => setYear(parseInt(e.target.value, 10) || new Date().getFullYear())} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100" /></div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold text-white disabled:opacity-50">{loading ? 'Generating...' : 'Get Yearly Forecast'}</button>
          </form>
        ) : (
          <div className="space-y-6">
            <AdBanner variant="leaderboard" />
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-amber-500/20"><RichText text={result} /></div>
            <button type="button" onClick={() => { setResult(null); setError(null); }} className="px-4 py-2 bg-slate-700 rounded-lg text-slate-300 text-sm">Choose another year</button>
          </div>
        )}
      </div>
    </div>
  );
}
