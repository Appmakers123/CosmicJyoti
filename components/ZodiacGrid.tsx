
import React from 'react';
import { ZODIAC_SIGNS } from '../constants';
import { ZodiacSignData, Language } from '../types';

interface ZodiacGridProps {
  onSelect: (sign: ZodiacSignData) => void;
  language: Language;
}

const ZodiacGrid: React.FC<ZodiacGridProps> = ({ onSelect, language }) => {
  return (
    <div className="animate-fade-in space-y-12">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif text-amber-100">Which sign are you?</h2>
        <div className="h-1 w-12 bg-amber-500 mx-auto rounded-full"></div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-5xl mx-auto pb-12">
        {ZODIAC_SIGNS.map((sign) => (
          <button
            key={sign.id}
            onClick={() => onSelect(sign)}
            className="group relative flex flex-col items-center justify-center p-8 bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-3xl hover:bg-slate-700/50 hover:border-amber-500/50 hover:shadow-[0_10px_40px_rgba(245,158,11,0.1)] transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
            
            <div className="w-16 h-16 mb-4 text-amber-500/80 group-hover:text-amber-300 group-hover:scale-110 transition-all duration-500 ease-out">
              {sign.symbol}
            </div>
            
            <h3 className="text-xl font-serif text-slate-100 mb-1 tracking-wider">
              {language === 'hi' ? sign.hindiName : sign.name}
            </h3>
            
            <span className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">
              {sign.dateRange}
            </span>

            <div className={`mt-4 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
              sign.element === 'Fire' ? 'border-red-900/50 text-red-400 bg-red-900/10' :
              sign.element === 'Water' ? 'border-blue-900/50 text-blue-400 bg-blue-900/10' :
              sign.element === 'Air' ? 'border-yellow-900/50 text-yellow-400 bg-yellow-900/10' :
              'border-emerald-900/50 text-emerald-400 bg-emerald-900/10'
            }`}>
              {sign.element}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ZodiacGrid;
