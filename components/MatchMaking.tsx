
import React, { useState } from 'react';
import { MatchMakingInput, MatchMakingResponse, Language } from '../types';
import { useTranslation } from '../utils/translations';
import { generateMatchMaking, generateCompatibilityReport } from '../services/geminiService';
import AdBanner from './AdBanner';
import RichText from './RichText';
import { ModuleIntro } from './common';

interface MatchMakingProps {
  language: Language;
}

const MatchMaking: React.FC<MatchMakingProps> = ({ language }) => {
  const t = useTranslation(language);
  const [boy, setBoy] = useState<MatchMakingInput>({ name: '', date: '', time: '', location: '' });
  const [girl, setGirl] = useState<MatchMakingInput>({ name: '', date: '', time: '', location: '' });
  const [result, setResult] = useState<MatchMakingResponse | null>(null);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      try {
          const gunaMatch = await generateMatchMaking(boy, girl, language);
          setResult(gunaMatch);
          const report = await generateCompatibilityReport(boy, girl, gunaMatch.ashtakoot_score?.total?.obtained_points, language);
          setAiReport(report);
      } catch (err) { setError("The stars are currently cloudy. Try again later."); }
      finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-12 animate-fade-in-up">
        {!result ? (
            <div className="bg-slate-800/80 border border-amber-500/30 rounded-2xl p-6 md:p-10 shadow-2xl">
                <ModuleIntro
                  language={language}
                  subtitleEn="Guna Milan & marriage compatibility – Ashtakoot matching by birth details (Vedic astrology)."
                  subtitleHi="गुण मिलान और विवाह अनुकूलता – जन्म विवरण से अष्टकूट मिलान (वैदिक ज्योतिष)।"
                  descriptionEn="Enter birth details of both partners to get Ashtakoot (36 points) Guna Milan score and a compatibility report for marriage or relationship."
                  descriptionHi="दोनों साथियों का जन्म विवरण डालें – अष्टकूट गुण मिलान अंक और विवाह/रिश्ते की अनुकूलता रिपोर्ट पाएं।"
                />
                <h2 className="text-3xl font-serif text-amber-200 text-center mb-10">{t.matchmaking}</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-xl font-serif text-blue-300">Boy's Details</h3>
                        <div>
                            <label className="block text-slate-400 text-sm mb-1">Name</label>
                            <input type="text" placeholder="Enter name" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3" value={boy.name} onChange={e => setBoy({...boy, name: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-1">Birth date</label>
                            <input type="date" placeholder="Birth date" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 [color-scheme:dark]" value={boy.date} onChange={e => setBoy({...boy, date: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-1">Birth time</label>
                            <input type="time" placeholder="Birth time" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 [color-scheme:dark]" value={boy.time} onChange={e => setBoy({...boy, time: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-1">Place of birth (e.g. Mumbai, Delhi)</label>
                            <input type="text" placeholder="e.g. Mumbai, Delhi" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3" value={boy.location} onChange={e => setBoy({...boy, location: e.target.value})} required />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-xl font-serif text-pink-300">Girl's Details</h3>
                        <div>
                            <label className="block text-slate-400 text-sm mb-1">Name</label>
                            <input type="text" placeholder="Enter name" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3" value={girl.name} onChange={e => setGirl({...girl, name: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-1">Birth date</label>
                            <input type="date" placeholder="Birth date" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 [color-scheme:dark]" value={girl.date} onChange={e => setGirl({...girl, date: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-1">Birth time</label>
                            <input type="time" placeholder="Birth time" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 [color-scheme:dark]" value={girl.time} onChange={e => setGirl({...girl, time: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-1">Place of birth (e.g. Mumbai, Delhi)</label>
                            <input type="text" placeholder="e.g. Mumbai, Delhi" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3" value={girl.location} onChange={e => setGirl({...girl, location: e.target.value})} required />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="md:col-span-2 py-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl text-white font-serif font-bold disabled:opacity-50">
                        {loading ? "Calculating Vedic Bond..." : t.matchSubmit}
                    </button>
                </form>
                <AdBanner variant="display" className="mt-8" />
            </div>
        ) : (
            <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     <div className="bg-slate-900 border border-pink-500/30 rounded-2xl p-8 text-center shadow-2xl">
                         <h3 className="text-slate-400 uppercase tracking-widest text-sm mb-2">{t.matchScore}</h3>
                         <span className="text-6xl font-serif font-bold text-white">{result.ashtakoot_score?.total?.obtained_points ?? 0} / 36</span>
                     </div>
                     <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-8">
                         <h3 className="text-xl font-serif text-amber-200 mb-4">Deep Truth Analysis</h3>
                         <RichText text={aiReport || ""} />
                     </div>
                </div>
                <button onClick={() => setResult(null)} className="px-6 py-2 border border-slate-600 text-slate-400 rounded-full text-xs uppercase font-bold">{t.return}</button>
                <AdBanner variant="display" className="mt-8" />
            </div>
        )}
    </div>
  );
};

export default MatchMaking;
