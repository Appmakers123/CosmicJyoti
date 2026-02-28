import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { generatePrashnaAnswer } from '../services/geminiService';
import { setErrorSafely } from '../utils/errorHandler';
import { requestScrollToMain } from '../utils/scrollToMain';
import AdBanner from './AdBanner';
import RichText from './RichText';
import { BackButton, ModuleIntro } from './common';

const PrashnaKundali: React.FC<{ language: Language; onBack?: () => void }> = ({ language, onBack }) => {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [askedAt, setAskedAt] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;
    const questionTime = new Date();
    const questionTimeIso = questionTime.toISOString();
    setAskedAt(questionTimeIso);
    setLoading(true);
    setError(null);
    try {
      const text = await generatePrashnaAnswer(q, questionTimeIso, language);
      setResult(text);
    } catch (err) {
      setErrorSafely(setError, err, language, 'PrashnaKundali');
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
            <BackButton onClick={onBack} label={language === 'hi' ? 'वापस' : 'Back'} />
          </div>
        )}
        <ModuleIntro
          language={language}
          subtitleEn="Prashna Kundali – horary astrology: answer by question time (no birth time needed)."
          subtitleHi="प्रश्न कुंडली – होररी ज्योतिष: प्रश्न पूछने के समय के आधार पर उत्तर। जन्म समय जरूरी नहीं।"
          descriptionEn="Ask a specific question and get an answer based on the exact moment you ask. Used in Vedic horary (Prashna) astrology for quick guidance."
          descriptionHi="कोई सवाल पूछें और जिस पल आप पूछते हैं उसी के आधार पर उत्तर पाएं। वैदिक प्रश्न कुंडली में त्वरित मार्गदर्शन के लिए।"
        />
        <h2 className="text-3xl font-serif text-amber-200 mb-2">
          {language === 'hi' ? 'प्रश्न कुंडली – होररी' : 'Prashna Kundali – Horary Astrology'}
        </h2>
        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs uppercase tracking-wider mb-1">{language === 'hi' ? 'Your question' : 'Your question'}</label>
              <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={4} placeholder="e.g. Will I get this job? Will this relationship work?" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 resize-none" />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold text-white disabled:opacity-50">
              {loading ? (language === 'hi' ? 'Getting answer...' : 'Getting answer...') : (language === 'hi' ? 'Ask now' : 'Ask now')}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            {askedAt && (
              <p className="text-slate-500 text-xs">
                {language === 'hi' ? 'Question asked at: ' : 'Question asked at: '}
                {new Date(askedAt).toLocaleString(language === 'hi' ? 'hi-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            )}
            <AdBanner variant="leaderboard" />
            <div className="bg-slate-900/60 p-4 sm:p-6 rounded-2xl border border-amber-500/20 min-w-0 w-full overflow-visible">
              <RichText text={result} className="break-words" />
            </div>
            <button type="button" onClick={() => { setResult(null); setError(null); setQuestion(''); setAskedAt(null); }} className="px-4 py-2 bg-slate-700 rounded-lg text-slate-300 text-sm">
              {language === 'hi' ? 'New question' : 'New question'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrashnaKundali;
