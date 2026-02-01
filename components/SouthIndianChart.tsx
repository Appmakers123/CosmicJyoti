
import React from 'react';
import { PlanetaryPosition, Language } from '../types';
import { translatePlanet } from '../constants';

interface SouthIndianChartProps {
  planets: PlanetaryPosition[];
  ascendantSignId: number;
  language: Language;
}

const SouthIndianChart: React.FC<SouthIndianChartProps> = ({ planets = [], ascendantSignId, language }) => {
  const cellMap = [
    { signId: 12, label: 'Pisces' }, { signId: 1, label: 'Aries' }, { signId: 2, label: 'Taurus' }, { signId: 3, label: 'Gemini' },
    { signId: 11, label: 'Aquarius' }, { isCenter: true }, { isCenter: true }, { signId: 4, label: 'Cancer' },
    { signId: 10, label: 'Capricorn' }, { isCenter: true }, { isCenter: true }, { signId: 5, label: 'Leo' },
    { signId: 9, label: 'Sagittarius' }, { signId: 8, label: 'Scorpio' }, { signId: 7, label: 'Libra' }, { signId: 6, label: 'Virgo' },
  ];

  const getPlanetsInSign = (signId: number) => {
    const inSign = (planets || []).filter(p => p.signId === signId);
    const elements = inSign.map(p => {
      const planetName = translatePlanet(p.planet, language);
      return (
        <span key={p.planet} className="text-[9px] sm:text-[10px] font-semibold text-amber-200 block leading-tight">
          {planetName.length > 6 ? planetName.substring(0, 6) : planetName}
          {p.isRetrograde && <span className="text-red-400 ml-1">R</span>}
        </span>
      );
    });

    if (ascendantSignId === signId) {
      elements.unshift(
        <span key="asc" className="text-[9px] sm:text-[10px] font-bold text-red-400 block leading-tight">
          {language === 'hi' ? 'लग्न' : 'Asc'}
        </span>
      );
    }
    return elements.length > 0 ? elements : (
      <span className="text-[8px] text-slate-600 opacity-50">-</span>
    );
  };

  return (
    <div className="w-full max-w-[400px] mx-auto aspect-square bg-slate-900 border-2 border-amber-600/50 rounded-lg shadow-2xl overflow-hidden grid grid-cols-4 grid-rows-4 relative">
       <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none">
         {Array.from({ length: 16 }).map((_, i) => (
           <div key={i} className="border border-amber-800/30"></div>
         ))}
       </div>

       {cellMap.map((cell, idx) => {
         if (cell.isCenter) {
           if (idx === 5) {
             return (
               <div key={idx} className="col-span-2 row-span-2 flex items-center justify-center p-2 bg-slate-900/50">
                 <div className="text-center">
                   <h4 className="text-amber-500 font-serif text-sm tracking-widest uppercase opacity-80">
                        {language === 'hi' ? 'राशि चक्र' : 'Rashi Chart'}
                   </h4>
                 </div>
               </div>
             );
           }
           return null;
         }

         return (
           <div key={idx} className="relative p-1 border border-amber-700/40 bg-slate-800/20 flex flex-wrap content-start gap-1 overflow-hidden">
             {getPlanetsInSign(cell.signId!)}
           </div>
         );
       })}
    </div>
  );
};

export default SouthIndianChart;
