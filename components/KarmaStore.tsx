
import React from 'react';
import { useTranslation } from '../utils/translations';
import { Language, User } from '../types';

interface KarmaStoreProps {
  language: Language;
  user: User | null;
  karmaBalance?: number;
  onEarnKarma: (amount: number) => void;
  onWatchAd?: () => void;
  onClose: () => void;
}

const KarmaStore: React.FC<KarmaStoreProps> = ({ language, user, karmaBalance = 0, onEarnKarma, onWatchAd, onClose }) => {
  const t = useTranslation(language);

  const StoreItem = ({ icon, title, price, action, color, disabled }: { icon: string; title: string; price: string; action: () => void; color: string; disabled?: boolean }) => (
    <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6 flex flex-col items-center text-center group hover:border-amber-500/40 transition-all">
       <div className={`text-4xl mb-4 group-hover:scale-110 transition-transform`}>{icon}</div>
       <h4 className="text-white font-bold mb-1">{title}</h4>
       <p className="text-slate-500 text-xs mb-6">{price}</p>
       <button 
         onClick={disabled ? undefined : action}
         disabled={disabled}
         className={`w-full py-2 rounded-xl text-white font-bold text-sm ${color} transition-opacity ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 active:scale-95'}`}
       >
         {disabled ? (language === 'hi' ? 'जल्द ही' : 'Coming soon') : t.earnKarma}
       </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-800 border border-amber-500/20 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex justify-between items-center bg-gradient-to-r from-amber-900/20 to-indigo-900/20">
           <div>
             <h2 className="text-2xl font-serif text-amber-200">{t.karmaStore}</h2>
             <p className="text-slate-400 text-sm">{t.limitedOffer}</p>
           </div>
           <div className="flex items-center gap-3">
              <div className="bg-slate-900 px-4 py-2 rounded-full border border-amber-500/30 flex items-center gap-2">
                 <span className="text-amber-400 text-lg">✨</span>
                 <span className="text-white font-bold font-mono">{karmaBalance}</span>
              </div>
              <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
           </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto space-y-8">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StoreItem 
                icon="📺" 
                title={t.watchAd} 
                price={t.free}
                color="bg-indigo-600"
                action={() => {
                   if (onWatchAd) {
                     onWatchAd();
                   }
                   // No fallback: karma only via real rewarded ad (Android app)
                }}
                disabled={!onWatchAd}
              />
              <StoreItem 
                icon="🙏" 
                title={t.tipAstrologer} 
                price={language === 'hi' ? '₹99 — जल्द ही' : '₹99 — Coming soon'}
                color="bg-amber-600"
                action={() => {}}
                disabled={true}
              />
           </div>

           <div className="bg-slate-900/40 border border-slate-700 rounded-2xl p-6">
              <h4 className="text-amber-100 font-serif mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.047a1 1 0 01.897.95V4.2a1 1 0 11-2 0V1.997a1 1 0 01.897-.95l.206-.003zM7 13a5 5 0 01-4.546-2.916A5.964 5.964 0 0110 5a5.964 5.964 0 017.546 5.084A5 5 0 0113 13H7zm-1.293.707a1 1 0 011.414 0L8 14.586l.879-.879a1 1 0 011.414 1.414l-1.586 1.586a1 1 0 01-1.414 0l-1.586-1.586a1 1 0 010-1.414zM10 15a2 2 0 100 4 2 2 0 000-4z" clipRule="evenodd" /></svg>
                Karma Usage Guide
              </h4>
              <ul className="space-y-3">
                 <li className="flex justify-between text-sm">
                   <span className="text-slate-400">Daily Horoscopes & Panchang</span>
                   <span className="text-emerald-400 font-bold uppercase">{t.free}</span>
                 </li>
                 <li className="flex justify-between text-sm">
                   <span className="text-slate-400">Kundali Analysis / Deep Readings</span>
                   <span className="text-amber-500 font-bold">1 {t.karma}</span>
                 </li>
                 <li className="flex justify-between text-sm">
                   <span className="text-slate-400">Tarot / Palm Readings</span>
                   <span className="text-amber-500 font-bold">1 {t.karma}</span>
                 </li>
                 <li className="flex justify-between text-sm">
                   <span className="text-slate-400">High-Res Cosmic Soul Art</span>
                   <span className="text-amber-500 font-bold">5 {t.karma}</span>
                 </li>
              </ul>
           </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 text-center text-[10px] text-slate-600 uppercase tracking-widest border-t border-slate-700">
           By acquiring karma you support our celestial servers.
        </div>
      </div>
    </div>
  );
};

export default KarmaStore;
