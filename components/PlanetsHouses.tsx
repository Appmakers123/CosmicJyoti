import React, { useState } from 'react';
import { Language } from '../types';
import { PLANETS_INFO_DETAILED, HOUSES_INFO } from '../constants';
import { useTranslation } from '../utils/translations';

interface PlanetsHousesProps {
  language: Language;
}

const PlanetsHouses: React.FC<PlanetsHousesProps> = ({ language }) => {
  const t = useTranslation(language);
  const [view, setView] = useState<'planets' | 'houses'>('planets');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-24 animate-fade-in-up">
      <div className="text-center mb-16">
        <span className="text-[10px] uppercase font-bold tracking-[1em] text-amber-500 mb-2 block">Vedic Foundations</span>
        <h2 className="text-5xl md:text-7xl font-serif text-amber-100 drop-shadow-lg">
          {language === 'hi' ? 'ग्रह और भाव' : 'Planets & Houses'}
        </h2>
        <p className="text-slate-500 text-sm italic tracking-[0.2em] mt-4 uppercase">
          {language === 'hi' ? 'वैदिक ज्योतिष की नींव' : 'Foundation of Vedic Astrology'}
        </p>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800 rounded-[4rem] p-6 md:p-16 min-h-[700px] shadow-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="animate-fade-in space-y-12">
          <div className="flex justify-center gap-4 mb-12">
            <button 
              onClick={() => setView('planets')} 
              className={`px-10 py-3 rounded-full text-xs font-bold transition-all ${
                view === 'planets' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-slate-950 border border-slate-800 text-slate-500'
              }`}
            >
              {t.the9Navagrahas}
            </button>
            <button 
              onClick={() => setView('houses')} 
              className={`px-10 py-3 rounded-full text-xs font-bold transition-all ${
                view === 'houses' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-slate-950 border border-slate-800 text-slate-500'
              }`}
            >
              {t.the12Bhavas}
            </button>
          </div>

          {view === 'planets' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {PLANETS_INFO_DETAILED.map((p, idx) => (
                <div 
                  key={p.name} 
                  className="group relative bg-gradient-to-br from-slate-950/80 to-slate-900/80 p-8 rounded-[2.5rem] border border-slate-800 hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all duration-300 hover:scale-[1.02] overflow-hidden"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Animated Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/10 group-hover:to-orange-500/10 transition-all duration-500"></div>
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <div className="relative z-10">
                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center text-4xl mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] border-2 border-slate-800 group-hover:border-amber-500/50 ${p.color} group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      {p.symbol}
                    </div>
                    <h4 className={`text-2xl font-serif font-bold ${p.color} mb-3 group-hover:scale-105 transition-transform`}>
                      {language === 'hi' ? p.hindi : p.name}
                    </h4>
                    <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">
                      {language === 'hi' ? p.descriptionHi : p.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {HOUSES_INFO.map((h, idx) => (
                <div 
                  key={h.id} 
                  className="group relative bg-gradient-to-br from-slate-950/60 to-slate-900/60 p-8 rounded-3xl border border-slate-800 hover:border-amber-500/40 hover:shadow-[0_0_25px_rgba(245,158,11,0.2)] transition-all duration-300 hover:scale-[1.03] overflow-hidden"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/8 group-hover:to-orange-500/8 transition-all duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-5xl font-bold text-slate-800 group-hover:text-amber-500/30 transition-colors group-hover:scale-110 transform duration-300">
                        {h.id}
                      </div>
                      <div className="text-4xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                        {h.icon}
                      </div>
                    </div>
                    <h5 className={`font-serif text-lg mb-2 ${h.color || 'text-amber-100'} group-hover:scale-105 transition-transform`}>
                      {language === 'hi' ? h.nameHi : h.name}
                    </h5>
                    <p className="text-slate-500 text-xs leading-relaxed group-hover:text-slate-400 transition-colors">
                      {language === 'hi' ? h.descHi : h.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanetsHouses;

