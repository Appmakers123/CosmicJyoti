import React, { useState, useEffect } from 'react';
import { useTranslation } from '../utils/translations';
import { getExternalLinkProps } from '../utils/linkHandler';
import { Language } from '../types';
import { generateTarotReading } from '../services/geminiService';
import { isCapacitor } from '../utils/linkHandler';
import admobService from '../services/admobService';
import AdBanner from './AdBanner';
import RichText from './RichText';
import ModuleAskAI from './ModuleAskAI';
import { getCachedAI, setCachedAI } from '../utils/aiCacheService';

interface TarotReadingProps {
  language: Language;
}

// Generate the Tarot Deck
const SUITS = ['Cups', 'Wands', 'Swords', 'Pentacles'];
const RANKS = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Page', 'Knight', 'Queen', 'King'];
const MAJOR_ARCANA = [
  'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor', 
  'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit', 
  'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance', 
  'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World'
];

const generateDeck = () => {
  const deck: string[] = [...MAJOR_ARCANA];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      deck.push(`${rank} of ${suit}`);
    });
  });
  return deck;
};

const TarotReading: React.FC<TarotReadingProps> = ({ language }) => {
  const t = useTranslation(language);
  const [deck, setDeck] = useState<string[]>([]);
  const [gameState, setGameState] = useState<'intro' | 'shuffling' | 'selecting' | 'revealing' | 'reading'>('intro');
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [reading, setReading] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(() => localStorage.getItem('cosmic_notifications') === 'true');

  const handleNotifySub = () => {
    localStorage.setItem('cosmic_notifications', 'true');
    setNotifEnabled(true);
    const msg = language === 'hi'
      ? 'सदस्यता सफल! आप टैरो, राशिफल और दैनिक पूर्वानुमान के लिए अपडेट प्राप्त करेंगे।'
      : 'Subscribed! You will receive updates for Tarot, Horoscope & Daily Forecast.';
    alert(msg);
  };

  // Initialize deck
  useEffect(() => {
    setDeck(generateDeck());
  }, []);

  const handleShuffle = () => {
    setGameState('shuffling');
    
    // Shuffle animation duration
    setTimeout(() => {
        // Fisher-Yates Shuffle
        const newDeck = [...deck];
        for (let i = newDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
        }
        setDeck(newDeck);
        setGameState('selecting');
        setSelectedIndices([]);
    }, 1500);
  };

  const handleCardClick = (index: number) => {
    if (gameState !== 'selecting') return;
    if (selectedIndices.includes(index)) return;

    const newSelection = [...selectedIndices, index];
    setSelectedIndices(newSelection);

    if (newSelection.length === 3) {
      setGameState('revealing');
      // After short delay, fetch reading
      setTimeout(() => fetchReading(newSelection), 1000);
    }
  };

  const fetchReading = async (indices: number[]) => {
      const cards = indices.map(i => deck[i]);
      const cached = getCachedAI<string>('tarot', { cards });
      if (cached) {
        setReading(cached);
        setGameState('reading');
        return;
      }
      setLoading(true);
      try {
          const result = await generateTarotReading(cards, language);
          setCachedAI('tarot', { cards }, result);
          setReading(result);
          setGameState('reading');
          // Show interstitial ad after reading (Android only)
          if (isCapacitor()) {
            setTimeout(async () => {
              try {
                const isReady = await admobService.isInterstitialReady();
                if (!isReady) await admobService.loadInterstitial();
                await new Promise(r => setTimeout(r, 1000));
                await admobService.showInterstitial();
              } catch (err) {
                console.log('[AdMob] Interstitial after tarot:', err);
              }
            }, 2000);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const reset = () => {
      setGameState('intro');
      setSelectedIndices([]);
      setReading(null);
  };

  // Helper for card styling
  const getCardStyle = (index: number) => {
     // Fan effect for selecting phase
     if (gameState === 'selecting') {
         const total = 20; // Only show top 20 for visual simplicity
         if (index >= total) return { display: 'none' };
         
         const rotation = (index - total/2) * 5;
         const xOffset = (index - total/2) * 20;
         return {
             transform: `translateX(${xOffset}px) rotate(${rotation}deg)`,
             zIndex: index,
             transition: 'transform 0.3s ease'
         };
     }
     return {};
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-12 animate-fade-in-up min-h-[60vh] flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center mb-8">
            <h2 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 mb-2">
                {t.tarotTitle}
            </h2>
            <p className="text-slate-400 text-sm">{t.tarotSubtitle}</p>
        </div>

        {/* --- STATE: INTRO --- */}
        {gameState === 'intro' && (
            <div className="flex flex-col items-center gap-8">
                <div className="w-48 h-72 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl border-2 border-amber-500/50 shadow-[0_0_30px_rgba(168,85,247,0.3)] flex items-center justify-center relative overflow-hidden group cursor-pointer" onClick={handleShuffle}>
                    {/* Card Back Pattern */}
                    <div className="absolute inset-2 border border-dashed border-amber-500/30 rounded-lg"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                    <div className="text-6xl text-amber-500/50 group-hover:scale-110 transition-transform duration-500">✷</div>
                    <div className="absolute bottom-4 text-xs text-amber-500/70 font-serif tracking-widest uppercase">{t.shuffleDeck}</div>
                </div>
                
                <button 
                    onClick={handleShuffle}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-serif font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1"
                >
                    {t.shuffleDeck}
                </button>
            </div>
        )}

        {/* --- STATE: SHUFFLING --- */}
        {gameState === 'shuffling' && (
            <div className="flex items-center justify-center h-72">
                 <div className="relative w-48 h-72">
                     <div className="absolute inset-0 bg-indigo-900 rounded-xl border border-amber-500 animate-[ping_1s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                     <div className="absolute inset-0 bg-indigo-900 rounded-xl border border-amber-500 rotate-6 transition-all"></div>
                     <div className="absolute inset-0 bg-indigo-900 rounded-xl border border-amber-500 -rotate-6 transition-all"></div>
                     <div className="absolute inset-0 flex items-center justify-center text-amber-200 font-serif">
                         Shuffling...
                     </div>
                 </div>
            </div>
        )}

        {/* --- STATE: SELECTING --- */}
        {gameState === 'selecting' && (
            <div className="flex flex-col items-center w-full">
                <p className="text-amber-200 mb-8 animate-pulse text-lg font-serif">{t.pickCards} ({selectedIndices.length}/3)</p>
                
                <div className="relative h-80 w-full max-w-3xl flex justify-center items-center overflow-hidden perspective-1000">
                    {deck.map((_, idx) => {
                        const style = getCardStyle(idx);
                        if (style.display === 'none') return null;
                        
                        const isSelected = selectedIndices.includes(idx);

                        return (
                            <div
                                key={idx}
                                onClick={() => handleCardClick(idx)}
                                style={style}
                                className={`absolute w-32 md:w-40 h-48 md:h-60 rounded-xl border border-amber-500/40 cursor-pointer shadow-xl transition-all duration-300 hover:-translate-y-6 ${isSelected ? '-translate-y-10 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)]' : 'bg-gradient-to-br from-indigo-900 to-slate-900'}`}
                            >
                                <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {/* --- STATE: REVEALING / READING --- */}
        {(gameState === 'revealing' || gameState === 'reading') && (
            <div className="w-full flex flex-col items-center gap-10">
                
                {/* 3 Card Spread */}
                <div className="flex flex-wrap justify-center gap-6 md:gap-10 perspective-1000">
                    {selectedIndices.map((cardIndex, i) => {
                        const cardName = deck[cardIndex];
                        const positionName = i === 0 ? t.past : i === 1 ? t.present : t.future;
                        
                        return (
                            <div key={i} className="flex flex-col items-center gap-3 animate-fade-in-up" style={{ animationDelay: `${i * 200}ms` }}>
                                <span className="text-slate-400 text-xs uppercase tracking-widest">{positionName}</span>
                                <div className="relative w-40 h-64 md:w-48 md:h-72 group perspective-1000">
                                    <div className="relative w-full h-full text-center transition-transform duration-700 transform-style-3d rotate-y-180">
                                        
                                        {/* Front (Face) */}
                                        <div className="absolute inset-0 w-full h-full bg-[#fdf6e3] rounded-xl border-4 border-amber-900/80 shadow-2xl flex flex-col items-center justify-between p-4 backface-hidden">
                                            <div className="text-amber-900/20 text-4xl font-serif">I</div>
                                            <div className="text-center">
                                                <div className="text-4xl mb-2 text-amber-800">
                                                    {cardName.includes('Cups') ? '🏆' : cardName.includes('Swords') ? '⚔️' : cardName.includes('Wands') ? '🥢' : cardName.includes('Pentacles') ? '🪙' : '🎭'}
                                                </div>
                                                <h3 className="text-amber-900 font-serif font-bold text-sm md:text-base leading-tight">{cardName}</h3>
                                            </div>
                                            <div className="text-amber-900/20 text-4xl font-serif rotate-180">I</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* AI Reading */}
                {loading && (
                    <div className="flex flex-col items-center gap-3 py-10">
                         <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
                         <p className="text-purple-300 animate-pulse">{t.loadingTarot}</p>
                    </div>
                )}

                {!loading && reading && (
                    <>
                    <div className="w-full max-w-4xl bg-slate-900/80 border border-purple-500/30 p-8 rounded-2xl shadow-2xl relative overflow-hidden animate-fade-in">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                        <h3 className="text-2xl font-serif text-purple-200 mb-6 text-center">{t.yourReading}</h3>
                        
                        <div className="max-w-none">
                            <RichText text={reading} />
                        </div>
                        
                        <div className="mt-8 flex justify-center">
                             <button onClick={reset} className="px-6 py-2 border border-slate-600 hover:border-purple-500 text-slate-300 hover:text-white rounded-full transition-colors text-sm uppercase tracking-wide">
                                 {t.reshuffle}
                             </button>
                        </div>
                    </div>

                    {!notifEnabled && (
                      <div className="w-full max-w-4xl mt-8 bg-purple-900/10 border border-purple-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl animate-bounce">🔔</span>
                          <div>
                            <h4 className="text-purple-200 font-bold text-sm uppercase tracking-wider">
                              {language === 'hi' ? 'दैनिक अलर्ट' : 'Daily Alerts'}
                            </h4>
                            <p className="text-slate-500 text-xs">
                              {language === 'hi' ? 'टैरो, राशिफल, दैनिक पूर्वानुमान और कॉस्मिक हेल्थ के लिए सूचनाएं प्राप्त करें' : 'Get notifications for Tarot, Horoscope, Daily Forecast & Cosmic Health'}
                            </p>
                          </div>
                        </div>
                        <button onClick={handleNotifySub} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg cursor-pointer active:scale-95">
                          {language === 'hi' ? 'सदस्यता लें' : 'Subscribe'}
                        </button>
                      </div>
                    )}

                    <div className="w-full max-w-4xl mt-8">
                      <ModuleAskAI
                        contextStr={[
                          `Cards: ${selectedIndices.map(i => deck[i]).join(', ')}`,
                          `Reading: ${reading.substring(0, 800)}${reading.length > 800 ? '...' : ''}`,
                        ].join('. ')}
                        language={language}
                        moduleName={language === 'hi' ? 'तारो रीडिंग' : 'Tarot Reading'}
                        accentColor="purple"
                      />
                    </div>
                    </>
                )}

                {/* WhatsApp Contact Section */}
                {!loading && reading && (
                    <div className="w-full max-w-4xl bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-2xl p-6">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex-1 text-center md:text-left">
                          <h3 className="text-lg font-serif text-green-200 mb-2 flex items-center justify-center md:justify-start gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            {language === 'hi' ? 'तारो रीडिंग परामर्श के लिए संपर्क करें' : 'Get Expert Tarot Reading Consultation'}
                          </h3>
                          <p className="text-slate-400 text-sm">
                            {language === 'hi' 
                              ? 'विशेषज्ञ तारो ज्योतिषी से व्यक्तिगत रीडिंग और मार्गदर्शन प्राप्त करें'
                              : 'Get personalized tarot reading and guidance from our expert tarot reader'}
                          </p>
                        </div>
                        <a 
                          {...getExternalLinkProps("https://wa.me/919326715739", language)}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all hover:shadow-green-500/50 flex items-center gap-2 whitespace-nowrap"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                          <span>{language === 'hi' ? 'WhatsApp पर संपर्क करें' : 'Contact on WhatsApp'}</span>
                        </a>
                        </div>
                    </div>
                )}

                <AdBanner variant="leaderboard" />
            </div>
        )}
    </div>
  );
};

export default TarotReading;