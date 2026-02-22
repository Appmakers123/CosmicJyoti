import React from 'react';
import { User, Language } from '../types';

interface PremiumFeatureCardProps {
  target: string;
  label: string;
  icon: string;
  desc: string;
  category: string;
  color: string;
  onClick: () => void;
  user: User | null;
  isPremium?: boolean;
  isSubscriptionOnly?: boolean;
  language?: Language;
  mustRead?: boolean;
  isFeatured?: boolean;
}

const PremiumFeatureCard: React.FC<PremiumFeatureCardProps> = ({
  target,
  label,
  icon,
  desc,
  category,
  color,
  onClick,
  user,
  isPremium = false,
  isSubscriptionOnly = false,
  language = 'en',
  mustRead = false,
  isFeatured = false,
}) => {
  const showSubscribeBadge = false; // Subscription removed - ads only
  // Ad-unlock badge/footer removed: ads are shown in every module now

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-start rounded-xl sm:rounded-2xl transition-all text-left overflow-visible shadow-xl w-full touch-manipulation active:scale-[0.98] min-w-0 h-full min-h-[140px] ${
        isFeatured
          ? 'min-h-[164px] sm:min-h-[180px] md:min-h-[188px] p-5 sm:p-6 md:p-7 bg-slate-800/50 backdrop-blur-md border-2 border-slate-700/50 hover:bg-slate-700/60 hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(251,191,36,0.1)]'
          : 'p-4 sm:p-5 md:p-5 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 hover:bg-slate-700/60 hover:border-amber-500/50'
      }`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity rounded-bl-full`}></div>
      
      {mustRead && (
        <>
          {/* Animated glow effect behind badge */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-red-500/10 rounded-2xl animate-pulse z-0"></div>
          
          {/* Ribbon-style badge with star icon */}
          <div className="absolute top-0 right-0 z-30 transform rotate-12 group-hover:scale-105 transition-transform duration-300">
            <div className="relative">
              {/* Ribbon tail effect */}
              <div className="absolute -bottom-1 right-0 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-amber-600/90"></div>
              
              {/* Main badge with gradient - compact size */}
              <div className="relative bg-gradient-to-br from-amber-400 via-orange-400 to-red-500 px-3 py-2 rounded-tl-lg rounded-tr-lg rounded-br-lg shadow-[0_6px_24px_rgba(245,158,11,0.9),0_0_20px_rgba(251,146,60,0.6)] flex items-center gap-1.5 animate-bounce-slow overflow-hidden ring-2 ring-amber-300/50">
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_3s_infinite]"></div>
                
                {/* Star icon - compact and visible */}
                <div className="relative z-10 flex-shrink-0">
                  {/* Glowing background circle for star */}
                  <div className="absolute inset-0 -m-0.5 bg-white/30 rounded-full blur-sm animate-pulse"></div>
                  <svg className="w-5 h-5 relative z-10 text-white" fill="currentColor" viewBox="0 0 20 20" style={{
                    filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.9)) drop-shadow(0 0 8px rgba(255,255,255,0.7)) drop-shadow(0 2px 4px rgba(0,0,0,0.8)) brightness(1.2)'
                  }}>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
                  </svg>
                </div>
                
                {/* Text with enhanced contrast - compact */}
                <span className="text-[10px] font-black uppercase tracking-wider relative z-10 text-white whitespace-nowrap" style={{
                  textShadow: '0 2px 4px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,1)',
                  WebkitTextStroke: '0.3px rgba(0,0,0,1)'
                }}>
                  {language === 'en' ? 'ESSENTIAL' : 'आवश्यक'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Corner accent glow - enhanced */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/25 via-orange-400/20 to-red-400/15 rounded-bl-full z-0 animate-pulse"></div>
        </>
      )}
      {/* Top right badges - positioned to avoid overlap */}
      <div className="absolute top-2 right-2 flex flex-col items-end gap-1 z-10">
        {showSubscribeBadge && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">
            {language === 'hi' ? 'सब्सक्राइब' : 'Subscribe'}
          </div>
        )}
        <div className="text-[8px] uppercase tracking-tighter text-slate-500 font-bold group-hover:text-amber-500 transition-colors max-w-[80px] truncate" title={category}>
          {category}
        </div>
      </div>
      
      {/* Content area with flex-grow to push footer to bottom - padding to avoid badge overlap */}
      <div className="flex-1 flex flex-col w-full min-h-0 min-w-0 pr-14 sm:pr-16 overflow-visible">
        <div className={`mb-2 sm:mb-3 flex-shrink-0 ${isFeatured ? 'text-4xl sm:text-5xl' : 'text-3xl'}`}>{icon}</div>
        <h3 className={`font-serif font-bold text-white mb-0.5 group-hover:text-amber-300 line-clamp-2 break-words ${isFeatured ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'}`} title={label}>
          {label}
        </h3>
        <p className="text-[10px] sm:text-[11px] text-slate-400 leading-tight tracking-wider mb-auto line-clamp-2 break-words min-w-0" title={desc}>{desc}</p>
      </div>
      
      {/* Footer section - always at bottom with consistent alignment */}
      {showSubscribeBadge && (
        <div className="mt-auto pt-3 border-t border-slate-700/50 w-full">
          <div className="flex items-center justify-start gap-2 text-xs text-amber-400">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="whitespace-nowrap">{language === 'en' ? 'Subscribe for unlimited AI' : 'असीमित AI के लिए सब्सक्राइब करें'}</span>
          </div>
        </div>
      )}
    </button>
  );
};

export default PremiumFeatureCard;

