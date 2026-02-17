
import React from 'react';
import { PlanetaryPosition, Language, ImportantPoint } from '../types';
import { translatePlanet } from '../constants';

interface NorthIndianChartProps {
  planets: PlanetaryPosition[];
  ascendantSignId: number;
  language: Language;
  importantPoints?: ImportantPoint[];
}

const NorthIndianChart: React.FC<NorthIndianChartProps> = ({ planets = [], ascendantSignId, language, importantPoints = [] }) => {
  // Ensure we have valid ascendantSignId
  const validAscendantSignId = (ascendantSignId >= 1 && ascendantSignId <= 12) ? ascendantSignId : 1;
  
  const getSignForHouse = (houseNum: number) => {
    return ((validAscendantSignId + houseNum - 2) % 12) + 1;
  };

  const getHouseContent = (houseNum: number) => {
    const signId = getSignForHouse(houseNum);
    // Filter planets that are in this house's sign
    // Also check if planet's house number matches (if available)
    const planetsInHouse = (planets || []).filter(p => {
      // Match by signId (primary method)
      if (p.signId === signId) {
        return true;
      }
      // Also match by house number if available (fallback)
      if (p.house === houseNum) {
        return true;
      }
      return false;
    });
    const pointsInHouse = (importantPoints || [])
      .filter(p => {
        // Hide GUL and Mandi as calculation logic needs correction
        // BB is now shown with corrected anticlockwise calculation
        const pointName = (language === 'hi' ? p.nameHi : p.name).toLowerCase();
        return !pointName.includes('gulika') && 
               !pointName.includes('gul') && 
               !pointName.includes('mandi') &&
               !pointName.includes('मंडी') &&
               !pointName.includes('गुलिका');
      })
      .filter(p => p.house === houseNum);
    
    return { signId, planets: planetsInHouse, points: pointsInHouse };
  };

  const houseConfig = [
    { id: 1,  x: 200, y: 90, labelX: 200, labelY: 155 },
    { id: 2,  x: 100, y: 60,  labelX: 80,  labelY: 30 },
    { id: 3,  x: 50,  y: 110, labelX: 30,  labelY: 90 },
    { id: 4,  x: 110, y: 200, labelX: 155, labelY: 200 },
    { id: 5,  x: 50,  y: 290, labelX: 30,  labelY: 310 },
    { id: 6,  x: 100, y: 340, labelX: 80,  labelY: 370 },
    { id: 7,  x: 200, y: 290, labelX: 200, labelY: 245 },
    { id: 8,  x: 300, y: 340, labelX: 320, labelY: 370 },
    { id: 9,  x: 350, y: 290, labelX: 370, labelY: 310 },
    { id: 10, x: 290, y: 200, labelX: 245, labelY: 200 },
    { id: 11, x: 350, y: 110, labelX: 370, labelY: 90 },
    { id: 12, x: 300, y: 60,  labelX: 320, labelY: 30 },
  ];

  return (
    <div className="w-full max-w-[450px] aspect-square bg-slate-950 border-4 border-amber-900/40 rounded-xl shadow-2xl relative">
      <svg viewBox="0 0 400 400" className="w-full h-full stroke-amber-500/20" strokeWidth="1.5">
        {/* Chart grid lines */}
        <line x1="0" y1="0" x2="400" y2="400" />
        <line x1="0" y1="400" x2="400" y2="0" />
        <line x1="200" y1="0" x2="0" y2="200" />
        <line x1="0" y1="200" x2="200" y2="400" />
        <line x1="200" y1="400" x2="400" y2="200" />
        <line x1="400" y1="200" x2="200" y2="0" />
        
        {/* Center point indicator */}
        <circle cx="200" cy="200" r="3" fill="#fbbf24" opacity="0.5" />

        {houseConfig.map((h) => {
          const content = getHouseContent(h.id);
          const signIdForHouse = getSignForHouse(h.id);
          return (
            <g key={h.id}>
              {/* House number */}
              <text x={h.labelX} y={h.labelY - 5} fill="#64748b" fontSize="10" fontWeight="900" textAnchor="middle" className="font-mono">H{h.id}</text>
              {/* Sign ID - always show even if no planets */}
              <text x={h.labelX} y={h.labelY + 8} fill="#94a3b8" fontSize="9" fontWeight="700" textAnchor="middle" className="font-mono">S{signIdForHouse}</text>
              {/* Planets in this house */}
              {/* Adjust transform for house 1 to prevent overlap with labels - move content higher */}
              <g transform={`translate(${h.x - 25}, ${h.id === 1 ? h.y - 30 : h.y - 10})`}>
                 {content.planets.length === 0 && content.points.length === 0 ? (
                   <text x={25} y={8} fill="#475569" fontSize="8" textAnchor="middle" opacity="0.5">-</text>
                 ) : (
                   <>
                     {/* Important Points - Display ABOVE planets (BB, GUL, Mandi filtered out) */}
                     {content.points.map((point, idx) => {
                       const pointName = language === 'hi' ? point.nameHi : point.name;
                       // Display points at the top, with more spacing to avoid overlap
                       // Start from -12 to give more space from center, each point takes 16px
                       const pointY = -12 - (content.points.length - idx - 1) * 16;
                       return (
                         <g key={`point-${idx}`}>
                           <text 
                             x={25} 
                             y={pointY} 
                             fill="#ef4444" 
                             fontSize="6" 
                             fontWeight="bold" 
                             textAnchor="middle"
                             className="font-serif"
                           >
                             {pointName.length > 6 ? pointName.substring(0, 6) : pointName}
                           </text>
                         </g>
                       );
                     })}
                     {/* Planets - Display BELOW important points */}
                     {content.planets.map((p, idx) => {
                       const planetName = translatePlanet(p.planet, language);
                       // Use abbreviations for longer planet names to fit better
                       const getAbbreviation = (name: string): string => {
                         const abbrevMap: { [key: string]: string } = {
                           'Jupiter': 'Jup',
                           'Mercury': 'Mer',
                           'Saturn': 'Sat',
                           'Venus': 'Ven',
                           'Mars': 'Mar',
                           'Sun': 'Sun',
                           'Moon': 'Mo',
                           'Rahu': 'Rah',
                           'Ketu': 'Ket',
                           // Hindi names
                           'गुरु': 'गुरु',
                           'बुध': 'बुध',
                           'शनि': 'शनि',
                           'शुक्र': 'शुक्र',
                           'मंगल': 'मंगल',
                           'सूर्य': 'सूर्य',
                           'चंद्र': 'चंद्र',
                           'राहु': 'राहु',
                           'केतु': 'केतु'
                         };
                         return abbrevMap[name] || (name.length > 6 ? name.substring(0, 6) : name);
                       };
                       const displayName = getAbbreviation(planetName);
                       // Calculate vertical position: start after points with more spacing
                       // Each planet takes 22px (11px for name + 11px for degree) to prevent overlap
                       const offsetFromPoints = content.points.length > 0 ? content.points.length * 16 + 8 : 6;
                       const baseY = 2 + offsetFromPoints + idx * 22;
                       return (
                         <g key={`planet-${idx}`}>
                           <text 
                             x={25} 
                             y={baseY} 
                             fill={p.planet.includes('Sun') ? '#fbbf24' : p.planet.includes('Moon') ? '#e2e8f0' : '#cbd5e1'} 
                             fontSize="7" 
                             fontWeight="bold" 
                             textAnchor="middle"
                             className="font-serif"
                           >
                             {displayName}
                             {p.isRetrograde ? ' R' : ''}
                           </text>
                           {p.degree && (
                             <text 
                               x={25} 
                               y={baseY + 11} 
                               fill="#94a3b8" 
                               fontSize="6" 
                               textAnchor="middle"
                               className="font-mono"
                             >
                               {p.degree}°
                             </text>
                           )}
                         </g>
                       );
                     })}
                   </>
                 )}
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default NorthIndianChart;
