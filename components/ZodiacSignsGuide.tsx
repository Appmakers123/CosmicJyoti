import React, { useState } from 'react';
import { Language } from '../types';
import { ZODIAC_SIGNS_DETAILED } from '../constants';
import { useTranslation } from '../utils/translations';

interface ZodiacSignsGuideProps {
  language: Language;
}

const ZodiacSignsGuide: React.FC<ZodiacSignsGuideProps> = ({ language }) => {
  const [selectedSign, setSelectedSign] = useState<any>(ZODIAC_SIGNS_DETAILED[0]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-24 animate-fade-in-up">
      <div className="text-center mb-16">
        <span className="text-[10px] uppercase font-bold tracking-[1em] text-amber-500 mb-2 block">Zodiac Knowledge</span>
        <h2 className="text-5xl md:text-7xl font-serif text-amber-100 drop-shadow-lg">
          {language === 'hi' ? 'राशि चक्र' : 'Zodiac Signs'}
        </h2>
        <p className="text-slate-500 text-sm italic tracking-[0.2em] mt-4 uppercase">
          {language === 'hi' ? 'प्रत्येक राशि की शक्तियाँ और गुण' : 'Strengths and qualities of each sign'}
        </p>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800 rounded-[4rem] p-6 md:p-16 shadow-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-6">
            <h3 className="text-3xl font-serif text-amber-200">
              {language === 'hi' ? 'राशि चक्र' : 'Zodiac Signs'}
            </h3>
            <p className="text-slate-500 text-sm italic">
              {language === 'hi' ? 'प्रत्येक राशि की शक्तियाँ और गुण' : 'Strengths and qualities of each sign'}
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar">
              {ZODIAC_SIGNS_DETAILED.map((sign, idx) => (
                <button
                  key={sign.name}
                  onClick={() => setSelectedSign(sign)}
                  className={`group relative p-4 rounded-2xl border transition-all duration-300 text-left overflow-hidden ${
                    selectedSign?.name === sign.name
                      ? 'bg-gradient-to-br from-amber-600 to-orange-600 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-105'
                      : 'bg-gradient-to-br from-slate-950 to-slate-900 border-slate-800 text-slate-500 hover:text-white hover:border-amber-500/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  }`}
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  {/* Animated Background */}
                  {selectedSign?.name === sign.name && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                  )}
                  <div className="relative z-10">
                    <div className={`text-2xl mb-2 transition-transform duration-300 ${
                      selectedSign?.name === sign.name ? 'scale-125 rotate-12' : 'group-hover:scale-110 group-hover:rotate-6'
                    }`}>
                      {sign.symbol}
                    </div>
                    <div className="text-xs font-bold">{language === 'hi' ? sign.hindiName : sign.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-8 bg-gradient-to-br from-slate-950/80 to-slate-900/80 p-12 rounded-[3rem] border border-slate-800 relative overflow-hidden shadow-2xl">
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            
            <div className="relative z-10 animate-fade-in-up">
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <span className="text-8xl mb-4 block drop-shadow-[0_0_30px_rgba(245,158,11,0.6)] animate-pulse hover:scale-110 transition-transform duration-300 cursor-pointer">
                    {selectedSign.symbol}
                  </span>
                  <div className="absolute inset-0 text-8xl opacity-20 blur-xl animate-pulse">
                    {selectedSign.symbol}
                  </div>
                </div>
                <h4 className="text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 mb-6 animate-fade-in">
                  {language === 'hi' ? selectedSign.hindiName : selectedSign.name}
                </h4>
              </div>
              <div className="p-10 bg-gradient-to-br from-slate-900/80 to-slate-950/80 rounded-[2.5rem] text-slate-300 text-lg leading-relaxed max-w-xl mx-auto border border-amber-500/20 shadow-inner relative overflow-hidden">
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]"></div>
                <p className="mb-4 relative z-10">
                  {language === 'hi' ? selectedSign.descriptionHi : selectedSign.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZodiacSignsGuide;

