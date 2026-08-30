
import React from 'react';
import { ZODIAC_SIGNS } from '../constants';

const Logo: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => {
  return (
    <div 
      className={`relative flex items-center justify-center ${className} group cosmic-brand-logo`}
      style={{ isolation: 'isolate' }}
    >
      {/* Premium Outer Glow - Dark mode luminous amber glow */}
      <div 
        className="absolute inset-0 blur-2xl rounded-full transition-all duration-1000 group-hover:opacity-100 opacity-75 pointer-events-none"
        style={{ backgroundColor: 'rgba(245, 158, 11, 0.25)' }}
      />
      
      {/* Metallic Border Ring */}
      <div 
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ 
          border: '2px solid rgba(245, 158, 11, 0.4)',
          boxShadow: 'inset 0 0 10px rgba(245, 158, 11, 0.5), 0 0 12px rgba(245, 158, 11, 0.3)'
        }}
      />

      {/* Spinning Zodiac Icons */}
      <div className="absolute inset-0 animate-[spin_80s_linear_infinite] pointer-events-none">
        <div 
          className="absolute inset-[10%] rounded-full border border-dashed pointer-events-none"
          style={{ borderColor: 'rgba(245, 158, 11, 0.2)' }}
        />

        {ZODIAC_SIGNS.map((sign, i) => {
          const angle = (i * 360) / 12;
          return (
            <div
              key={sign.id}
              className="absolute inset-0"
              style={{ transform: `rotate(${angle}deg)` }}
            >
               <div 
                 className="absolute top-[3%] left-1/2 -translate-x-1/2 w-[10%] h-[10%] flex items-center justify-center transition-colors"
                 style={{ color: 'rgba(245, 158, 11, 0.75)', fontSize: '0.65em' }}
               >
                  {sign.symbol}
               </div>
            </div>
          );
        })}
      </div>

      {/* Central 3D-effect Glowing Golden Sun */}
      <div 
        className="relative z-10 w-[50%] h-[50%]"
        style={{ 
          color: '#fbbf24',
          filter: 'drop-shadow(0 0 15px rgba(251, 191, 36, 1))'
        }}
      >
        <svg viewBox="0 0 24 24" fill="#fbbf24" className="w-full h-full" style={{ color: '#fbbf24' }}>
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.061-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>
      </div>
    </div>
  );
};

export default Logo;
