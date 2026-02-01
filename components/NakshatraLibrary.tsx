import React, { useState } from 'react';
import { Language } from '../types';
import { NAKSHATRAS_INFO } from '../constants';
import { useTranslation } from '../utils/translations';

interface NakshatraLibraryProps {
  language: Language;
}

const NakshatraLibrary: React.FC<NakshatraLibraryProps> = ({ language }) => {
  const t = useTranslation(language);
  const [selectedNakshatra, setSelectedNakshatra] = useState<any>(NAKSHATRAS_INFO[0]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-24 animate-fade-in-up">
      <div className="text-center mb-16">
        <span className="text-[10px] uppercase font-bold tracking-[1em] text-amber-500 mb-2 block">Lunar Mansions</span>
        <h2 className="text-5xl md:text-7xl font-serif text-amber-100 drop-shadow-lg">
          {language === 'hi' ? 'नक्षत्र पुस्तकालय' : 'Nakshatra Library'}
        </h2>
        <p className="text-slate-500 text-sm italic tracking-[0.2em] mt-4 uppercase">
          {t.lunarMansions}
        </p>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800 rounded-[2rem] sm:rounded-[4rem] p-4 sm:p-6 md:p-16 shadow-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-12">
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
            <h3 className="text-2xl sm:text-3xl font-serif text-amber-200">{t.starLibrary}</h3>
            <p className="text-slate-500 text-xs sm:text-sm italic">{t.lunarMansions}</p>
            <div className="grid grid-cols-3 gap-2 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-2 sm:pr-3 custom-scrollbar">
              {NAKSHATRAS_INFO.map((n, idx) => (
                <button 
                  key={n.name} 
                  onClick={() => setSelectedNakshatra(n)}
                  className={`group relative p-3 text-[10px] font-bold rounded-xl border transition-all duration-300 overflow-hidden ${
                    selectedNakshatra?.name === n.name 
                      ? 'bg-gradient-to-br from-amber-600 to-orange-600 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-105' 
                      : 'bg-gradient-to-br from-slate-950 to-slate-900 border-slate-800 text-slate-500 hover:text-white hover:border-amber-500/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  }`}
                  style={{ animationDelay: `${idx * 20}ms` }}
                >
                  {/* Shine Effect */}
                  {selectedNakshatra?.name === n.name && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                  )}
                  <div className="relative z-10">
                    <div className={`text-lg mb-1 transition-transform duration-300 ${
                      selectedNakshatra?.name === n.name ? 'scale-125 rotate-12' : 'group-hover:scale-110 group-hover:rotate-6'
                    }`}>
                      {n.symbol}
                    </div>
                    {n.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-8 bg-gradient-to-br from-slate-950/80 to-slate-900/80 p-4 sm:p-8 md:p-12 rounded-[1.5rem] sm:rounded-[3rem] border border-slate-800 relative overflow-hidden shadow-2xl">
            {/* Animated Background */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            
            <div className="relative z-10 animate-fade-in-up">
              <div className="text-center mb-4 sm:mb-8">
                <div className="relative inline-block">
                  <span className="text-4xl sm:text-6xl md:text-8xl mb-2 sm:mb-4 block drop-shadow-[0_0_30px_rgba(245,158,11,0.6)] animate-pulse hover:scale-110 transition-transform duration-300 cursor-pointer">
                    {selectedNakshatra.symbol}
                  </span>
                  <div className="absolute inset-0 text-4xl sm:text-6xl md:text-8xl opacity-20 blur-xl animate-pulse">
                    {selectedNakshatra.symbol}
                  </div>
                </div>
                <h4 className="text-2xl sm:text-4xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-purple-300 to-amber-400 mb-4 sm:mb-6 animate-fade-in px-2 break-words">
                  {selectedNakshatra.name}
                </h4>
              </div>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-12 mb-6 sm:mb-10">
                <div className="text-center p-3 sm:p-4 bg-slate-900/40 rounded-xl sm:rounded-2xl border border-slate-800 hover:border-amber-500/30 transition-all w-full sm:w-auto">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">{t.rulerPlanet}</p>
                  <p className="text-lg sm:text-xl text-white font-serif">{selectedNakshatra.ruler}</p>
                </div>
                <div className="hidden sm:block w-px h-12 bg-slate-800"></div>
                <div className="text-center p-3 sm:p-4 bg-slate-900/40 rounded-xl sm:rounded-2xl border border-slate-800 hover:border-purple-500/30 transition-all w-full sm:w-auto">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">{t.natureTrait}</p>
                  <p className="text-lg sm:text-xl text-white font-serif">{selectedNakshatra.trait}</p>
                </div>
              </div>
              <div className="p-4 sm:p-8 md:p-10 bg-gradient-to-br from-slate-900/80 to-slate-950/80 rounded-[1.5rem] sm:rounded-[2.5rem] text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl mx-auto border border-amber-500/20 shadow-inner relative overflow-hidden">
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]"></div>
                <div className="relative z-10">
                  <p className="mb-4">{language === 'hi' ? selectedNakshatra.descriptionHi : selectedNakshatra.description}</p>
                  <p className="text-sm opacity-80">
                    {t.thoseBornUnder} <strong>{selectedNakshatra.name}</strong> {t.nakshatraGifted} <em>{selectedNakshatra.trait}</em>. {t.underGuidance} <strong>{selectedNakshatra.ruler}</strong>, {t.theyEvolve}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NakshatraLibrary;

