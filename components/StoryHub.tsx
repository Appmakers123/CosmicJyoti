
import React, { useState } from 'react';
import { useTranslation } from '../utils/translations';
import { Language } from '../types';
import { generateAstroStory } from '../services/geminiService';
import { ZODIAC_SIGNS, PLANETS_INFO } from '../constants';
import RichText from './RichText';

interface StoryHubProps {
  language: Language;
}

const NAKSHATRAS = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];


const StoryHub: React.FC<StoryHubProps> = ({ language }) => {
  const t = useTranslation(language);
  const [activeType, setActiveType] = useState<'sign' | 'planet' | 'nakshatra'>('sign');
  const [target, setTarget] = useState<string>("");
  const [story, setStory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  

  const handleTellStory = async (val: string) => {
    setTarget(val);
    setLoading(true);
    setStory(null);
    try {
        const result = await generateAstroStory(val, activeType, language);
        setStory(result);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!story) return;

    const shareData = {
      title: `Legend of ${target} - CosmicJyoti`,
      text: `Discover the mystical legend of ${target}:\n\n${story.substring(0, 300)}...\n\nRead more on CosmicJyoti.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n\n${story}\n\nRead more at ${shareData.url}`);
        alert(language === 'hi' ? "कहानी क्लिपबोर्ड पर कॉपी हो गई है!" : "Story copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pb-12 animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 mb-2">
          {t.storyHub}
        </h2>
        <p className="text-slate-400 text-sm">Discover the legends and cosmic relationships of the stars.</p>
      </div>

      <div className="flex justify-center gap-4 mb-10">
        {(['sign', 'planet', 'nakshatra'] as const).map(type => (
          <button
            key={type}
            onClick={() => { setActiveType(type); setStory(null); setTarget(""); }}
            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeType === type ? 'bg-amber-500 text-slate-900 shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            {type}s
          </button>
        ))}
      </div>

      {!story && !loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 animate-fade-in">
           {activeType === 'sign' && ZODIAC_SIGNS.map(s => (
             <button key={s.id} onClick={() => handleTellStory(s.name)} className="p-4 bg-slate-800/40 border border-slate-700 rounded-xl hover:border-amber-500/50 hover:bg-slate-700/50 transition-all text-center group">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{s.symbol}</div>
                <span className="text-xs font-bold text-slate-300">{language === 'hi' ? s.hindiName : s.name}</span>
             </button>
           ))}
           {activeType === 'planet' && PLANETS_INFO.map(p => (
             <button key={p.name} onClick={() => handleTellStory(p.name)} className="p-4 bg-slate-800/40 border border-slate-700 rounded-xl hover:border-amber-500/50 hover:bg-slate-700/50 transition-all text-center group">
                <div className={`text-2xl mb-2 group-hover:scale-110 transition-transform ${p.color}`}>●</div>
                <span className="text-xs font-bold text-slate-300">{language === 'hi' ? p.hindi : p.name}</span>
             </button>
           ))}
           {activeType === 'nakshatra' && NAKSHATRAS.map(n => (
             <button key={n} onClick={() => handleTellStory(n)} className="p-2 bg-slate-800/40 border border-slate-700 rounded-lg hover:border-amber-500/50 hover:bg-slate-700/50 transition-all text-center">
                <span className="text-[10px] font-bold text-slate-400 block truncate">{n}</span>
             </button>
           ))}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4"></div>
            <p className="font-serif text-amber-200 uppercase tracking-widest">{t.loadingStory}</p>
        </div>
      )}

      {story && (
        <div className="animate-fade-in">
           <div className="relative bg-slate-900/90 text-amber-50 border-4 border-amber-500/40 p-8 md:p-12 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.15)] max-w-3xl mx-auto overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
                
                <div className="absolute top-4 right-4 flex gap-2 z-20">
                    <button 
                      onClick={handleShare}
                      className="bg-slate-800 text-amber-400 w-8 h-8 rounded-full border border-amber-500/30 flex items-center justify-center shadow-lg hover:bg-amber-900/50 hover:text-white transition-all"
                      title="Share Legend"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => setStory(null)}
                      className="bg-slate-800 text-amber-400 w-8 h-8 rounded-full border border-amber-500/30 flex items-center justify-center shadow-lg hover:bg-amber-900/50 hover:text-white transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                </div>

                <div className="text-center mb-8 relative z-10">
                    <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-amber-500/60">Celestial Legend</span>
                    <h3 className="text-3xl md:text-4xl font-serif mt-2 border-b border-amber-500/20 pb-4 inline-block text-amber-200 drop-shadow-lg">{target}</h3>
                </div>


                <div className="relative z-10">
                    <RichText text={story} className="text-slate-200 leading-relaxed text-lg md:text-xl font-light italic" />
                </div>

                <div className="mt-12 text-center opacity-30 relative z-10">
                    <div className="h-px w-32 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-4"></div>
                    <span className="text-3xl">✧</span>
                </div>
           </div>

           <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={() => setStory(null)} className="px-10 py-3 bg-slate-800/60 text-amber-400 rounded-full border border-amber-500/30 hover:bg-amber-500 hover:text-slate-900 transition-all uppercase text-xs font-bold tracking-widest shadow-lg">
                Explore Another Legend
              </button>
              <button onClick={handleShare} className="px-10 py-3 bg-amber-600/20 text-amber-200 rounded-full border border-amber-500/30 hover:bg-amber-500 hover:text-slate-900 transition-all uppercase text-xs font-bold tracking-widest shadow-lg flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {language === 'hi' ? "कहानी शेयर करें" : "Share This Legend"}
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default StoryHub;
