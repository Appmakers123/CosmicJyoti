import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../utils/translations';
import { getExternalLinkProps } from '../utils/linkHandler';
import { Language } from '../types';
import { generateTarotReading } from '../services/geminiService';
import { isCapacitor } from '../utils/linkHandler';
import admobService from '../services/admobService';
import AdBanner from './AdBanner';
import RichText from './RichText';
import ModuleAskAI from './ModuleAskAI';
import { ModuleIntro, SaveShareBar } from './common';
import { getCachedAI, setCachedAI } from '../utils/aiCacheService';
import { requestScrollToMain } from '../utils/scrollToMain';
import { saveReport, getReportByForm, deleteReport } from '../utils/reportStorageService';
import { 
  getTarotCardDetails, 
  TAROT_CARDS_DATA, 
  TarotCardDetails 
} from '../utils/tarotData';
import { 
  Sparkles, 
  BookOpen, 
  RotateCcw, 
  Heart, 
  Briefcase, 
  Activity, 
  Compass, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  X, 
  Layers, 
  Flame, 
  Droplet, 
  Wind, 
  Mountain,
  ChevronRight,
  Eye
} from 'lucide-react';

interface TarotReadingProps {
  language: Language;
}

// Generate the 78-Card Tarot Deck
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
  const isHi = language === 'hi';
  
  const [deck, setDeck] = useState<string[]>([]);
  const [gameState, setGameState] = useState<'intro' | 'shuffling' | 'selecting' | 'revealing' | 'reading'>('intro');
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [reading, setReading] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(() => localStorage.getItem('cosmic_notifications') === 'true');
  const [isSaved, setIsSaved] = useState(false);
  const [savedReportId, setSavedReportId] = useState<string | null>(null);

  // Active detail inspector tab for 3-card spread (0 = Past, 1 = Present, 2 = Future)
  const [activeSpreadTab, setActiveSpreadTab] = useState<number>(0);
  
  // Library Modal or Deck Explorer
  const [showEncyclopedia, setShowEncyclopedia] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suitFilter, setSuitFilter] = useState<'All' | 'Major' | 'Cups' | 'Wands' | 'Swords' | 'Pentacles'>('All');
  const [modalCard, setModalCard] = useState<TarotCardDetails | null>(null);

  // Quick detail category tab in inspector
  const [activeCategory, setActiveCategory] = useState<'overview' | 'position' | 'love' | 'career' | 'health' | 'advice'>('overview');

  useEffect(() => {
    if (!reading || selectedIndices.length !== 3 || deck.length === 0) {
      setIsSaved(false);
      setSavedReportId(null);
      return;
    }
    const cardsKey = selectedIndices.map(i => deck[i]).sort().join(',');
    const fi = { cards: cardsKey, lang: language };
    const sr = getReportByForm('tarot', fi);
    if (sr?.meta?.id) {
      setIsSaved(true);
      setSavedReportId(sr.meta.id);
    } else {
      setIsSaved(false);
      setSavedReportId(null);
    }
  }, [reading, selectedIndices, deck, language]);

  const handleNotifySub = () => {
    localStorage.setItem('cosmic_notifications', 'true');
    setNotifEnabled(true);
    const msg = isHi
      ? 'सदस्यता सफल! आप टैरो, राशिफल और दैनिक पूर्वानुमान के लिए अपडेट प्राप्त करेंगे।'
      : 'Subscribed! You will receive updates for Tarot, Horoscope & Daily Forecast.';
    alert(msg);
  };

  // Initialize deck
  useEffect(() => {
    setDeck(generateDeck());
  }, []);

  useEffect(() => {
    if (reading) requestScrollToMain();
  }, [reading]);

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
      setActiveSpreadTab(0);
      setActiveCategory('overview');
    }, 1500);
  };

  const handleCardClick = (index: number) => {
    if (gameState !== 'selecting') return;
    if (selectedIndices.includes(index)) return;

    const newSelection = [...selectedIndices, index];
    setSelectedIndices(newSelection);

    if (newSelection.length === 3) {
      setGameState('revealing');
      // After short delay, trigger reading and reveal details immediately
      setTimeout(() => fetchReading(newSelection), 600);
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
    setActiveSpreadTab(0);
  };

  // Helper for card styling in selection fan
  const getCardStyle = (index: number) => {
    if (gameState === 'selecting') {
      const total = 22; // Show top 22 for smooth visual arc
      if (index >= total) return { display: 'none' };
      
      const rotation = (index - total / 2) * 4.5;
      const xOffset = (index - total / 2) * 16;
      return {
        transform: `translateX(${xOffset}px) rotate(${rotation}deg)`,
        zIndex: index,
        transition: 'transform 0.3s ease'
      };
    }
    return {};
  };

  // Resolved details for the 3 selected cards
  const drawnCardsDetails: TarotCardDetails[] = useMemo(() => {
    if (selectedIndices.length !== 3 || deck.length === 0) return [];
    return selectedIndices.map(idx => getTarotCardDetails(deck[idx]));
  }, [selectedIndices, deck]);

  // Element icon helper
  const renderElementIcon = (element: string) => {
    switch (element.toLowerCase()) {
      case 'fire':
        return <Flame className="w-3.5 h-3.5 text-amber-400 inline mr-1" />;
      case 'water':
        return <Droplet className="w-3.5 h-3.5 text-cyan-400 inline mr-1" />;
      case 'air':
        return <Wind className="w-3.5 h-3.5 text-sky-300 inline mr-1" />;
      case 'earth':
        return <Mountain className="w-3.5 h-3.5 text-emerald-400 inline mr-1" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-purple-400 inline mr-1" />;
    }
  };

  // Yes/No badge helper
  const renderYesNoBadge = (yesNo: string, yesNoHi: string) => {
    const isYes = yesNo.toLowerCase().includes('yes');
    const isNo = yesNo.toLowerCase().includes('no');
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
        isYes 
          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
          : isNo 
          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
      }`}>
        {isYes ? <CheckCircle2 className="w-3 h-3" /> : isNo ? <AlertTriangle className="w-3 h-3" /> : <HelpCircle className="w-3 h-3" />}
        {isHi ? yesNoHi : yesNo}
      </span>
    );
  };

  // Filtered list for encyclopedia
  const filteredAllCards = useMemo(() => {
    return Object.values(TAROT_CARDS_DATA).filter(card => {
      const matchesSuit = suitFilter === 'All' ? true : card.suit === suitFilter;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesSuit;
      const matchesSearch = 
        card.name.toLowerCase().includes(query) ||
        card.nameHi.toLowerCase().includes(query) ||
        card.keywords.some(k => k.toLowerCase().includes(query)) ||
        card.keywordsHi.some(k => k.toLowerCase().includes(query));
      return matchesSuit && matchesSearch;
    });
  }, [suitFilter, searchQuery]);

  // Spread positions data
  const positionMeta = [
    { 
      labelEn: "Past Foundation", 
      labelHi: "अतीत की नींव", 
      icon: "🕰️",
      color: "from-blue-500/20 to-indigo-500/20 border-blue-400/40 text-blue-300",
      descEn: "Root cause, past experiences, and karma leading to this moment.",
      descHi: "मूल कारण, अतीत का अनुभव और वर्तमान स्थिति की आधारशिला।"
    },
    { 
      labelEn: "Present Energy", 
      labelHi: "वर्तमान स्थिति", 
      icon: "⚡",
      color: "from-amber-500/20 to-purple-500/20 border-amber-400/40 text-amber-300",
      descEn: "Active forces, mindset, challenges, and opportunities right now.",
      descHi: "सक्रिय ऊर्जा, मौजूदा मनोदशा, अवसर और मुख्य चुनौती।"
    },
    { 
      labelEn: "Future Outcome", 
      labelHi: "भविष्य की दिशा", 
      icon: "🌅",
      color: "from-purple-500/20 to-pink-500/20 border-purple-400/40 text-purple-300",
      descEn: "Trajectory, likely breakthrough, advice, and forthcoming blessing.",
      descHi: "आगे का मार्ग, संभावित परिणाम और आने वाला सुखद बदलाव।"
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-12 animate-fade-in-up min-h-[60vh] flex flex-col items-center">
      <ModuleIntro
        language={language}
        subtitleEn="Tarot Reading — Instant Card Meanings & AI Synthesis"
        subtitleHi="टैरो रीडिंग — त्वरित कार्ड अर्थ और एआई मार्गदर्शन"
        descriptionEn="Draw 3 cards to instantly read detailed meanings for love, career, health & destiny. No waiting required to understand your cards."
        descriptionHi="3 कार्ड चुनें और प्रेम, करियर, स्वास्थ्य और भाग्य के विस्तृत अर्थ तुरंत देखें। बिना प्रतीक्षा किए कार्ड का अर्थ समझें।"
      />

      {/* Top Action Bar: Reshuffle & Encyclopedia Explorer */}
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse"></span>
          <span className="text-xs uppercase tracking-widest text-purple-300 font-semibold">
            {isHi ? "78 कार्ड वैदिक व रहस्यमयी टैरो" : "78-Card Arcana Divination Deck"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEncyclopedia(true)}
            className="px-4 py-1.5 bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-200 hover:text-white rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>{isHi ? "सभी 78 कार्ड पढ़ें" : "Explore 78-Card Encyclopedia"}</span>
          </button>

          {(gameState === 'revealing' || gameState === 'reading') && (
            <button
              onClick={reset}
              className="px-3.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.reshuffle}</span>
            </button>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-amber-200 to-purple-200 mb-2">
          {t.tarotTitle}
        </h2>
        <p className="text-slate-300 text-sm max-w-xl mx-auto">
          {isHi 
            ? "कार्ड निकालते ही उनका विस्तृत अर्थ, प्रेम, करियर, स्वास्थ्य मार्गदर्शन और हाँ/ना उत्तर तुरंत देखें।"
            : "Draw your cards to instantly reveal their deep symbols, life guidance, love, career, and yes/no answers."}
        </p>
      </div>

      {/* --- STATE: INTRO --- */}
      {gameState === 'intro' && (
        <div className="flex flex-col items-center gap-8 py-4">
          <div 
            className="w-52 h-80 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 rounded-2xl border-2 border-amber-400/60 shadow-[0_0_40px_rgba(168,85,247,0.35)] flex flex-col items-center justify-between p-5 relative overflow-hidden group cursor-pointer hover:scale-105 transition-all duration-500" 
            onClick={handleShuffle}
          >
            {/* Mystic Background Patterns */}
            <div className="absolute inset-2 border border-dashed border-amber-400/30 rounded-xl pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15)_0,transparent_70%)]"></div>
            
            <div className="text-amber-400/70 text-xs uppercase tracking-widest font-serif font-bold">
              CosmicJyoti
            </div>

            <div className="relative flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full bg-purple-900/40 border border-amber-400/40 flex items-center justify-center text-4xl shadow-inner group-hover:rotate-12 transition-transform duration-500">
                🔮
              </div>
              <div className="text-amber-200 font-serif text-center font-bold text-sm">
                {isHi ? "भाग्य चक्र" : "Mystic Arcana"}
              </div>
            </div>

            <div className="w-full text-center">
              <div className="text-[10px] text-amber-300/80 font-serif tracking-widest uppercase bg-amber-950/60 py-1 px-3 rounded-full border border-amber-500/30 inline-block">
                {isHi ? "कार्ड फेंटने के लिए क्लिक करें" : "Click to Shuffle Deck"}
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleShuffle}
            className="px-8 py-3.5 bg-gradient-to-r from-amber-600 via-purple-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-serif font-bold text-base rounded-2xl shadow-[0_0_25px_rgba(217,119,6,0.4)] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>{t.shuffleDeck}</span>
          </button>
        </div>
      )}

      {/* --- STATE: SHUFFLING --- */}
      {gameState === 'shuffling' && (
        <div className="flex flex-col items-center justify-center h-80 gap-6">
          <div className="relative w-52 h-80 flex items-center justify-center">
            <div className="absolute inset-0 bg-indigo-950 rounded-2xl border-2 border-amber-400/70 animate-[ping_1.2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-40"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 to-purple-950 rounded-2xl border border-amber-400/60 rotate-12 transition-all shadow-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-950 to-indigo-950 rounded-2xl border border-amber-400/60 -rotate-12 transition-all shadow-xl"></div>
            <div className="absolute inset-0 bg-slate-950 rounded-2xl border-2 border-amber-400 flex flex-col items-center justify-center gap-3 z-10 shadow-2xl p-4 text-center">
              <div className="w-12 h-12 rounded-full border-3 border-amber-400 border-t-transparent animate-spin"></div>
              <p className="text-amber-200 font-serif font-bold text-lg">
                {isHi ? "कार्ड फेंटे जा रहे हैं..." : "Shuffling Sacred Deck..."}
              </p>
              <p className="text-slate-400 text-xs">
                {isHi ? "ब्रह्मांडीय ऊर्जा संरेखित हो रही है" : "Aligning cosmic frequencies"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- STATE: SELECTING --- */}
      {gameState === 'selecting' && (
        <div className="flex flex-col items-center w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-sm font-serif font-semibold mb-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{t.pickCards} ({selectedIndices.length}/3)</span>
            </div>
            <p className="text-slate-400 text-xs">
              {selectedIndices.length === 0 && (isHi ? "पहला कार्ड चुनें: अतीत (Past)" : "Pick 1st Card: Past Foundation")}
              {selectedIndices.length === 1 && (isHi ? "दूसरा कार्ड चुनें: वर्तमान (Present)" : "Pick 2nd Card: Present Energy")}
              {selectedIndices.length === 2 && (isHi ? "तीसरा कार्ड चुनें: भविष्य (Future)" : "Pick 3rd Card: Future Outcome")}
            </p>
          </div>
          
          <div className="relative h-88 w-full max-w-4xl flex justify-center items-center overflow-visible perspective-1000 py-6">
            {deck.map((cardName, idx) => {
              const style = getCardStyle(idx);
              if (style.display === 'none') return null;
              
              const isSelected = selectedIndices.includes(idx);
              const selectionOrder = selectedIndices.indexOf(idx);

              return (
                <div
                  key={idx}
                  onClick={() => handleCardClick(idx)}
                  style={style}
                  className={`absolute w-32 sm:w-36 md:w-44 h-52 sm:h-56 md:h-64 rounded-2xl border-2 cursor-pointer shadow-2xl transition-all duration-300 hover:-translate-y-8 flex flex-col items-center justify-between p-3 select-none ${
                    isSelected 
                      ? '-translate-y-12 border-amber-300 ring-4 ring-amber-400/50 shadow-[0_0_30px_rgba(251,191,36,0.6)] bg-gradient-to-br from-purple-900 to-indigo-900 z-50' 
                      : 'border-amber-500/40 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 hover:border-amber-400'
                  }`}
                >
                  <div className="w-full flex justify-between items-center text-[10px] text-amber-400/80 font-serif">
                    <span>✦</span>
                    <span>{isSelected ? `#${selectionOrder + 1}` : '✦'}</span>
                  </div>

                  <div className="w-12 h-12 rounded-full border border-amber-400/30 bg-purple-950/60 flex items-center justify-center text-xl text-amber-300 shadow-inner">
                    ✷
                  </div>

                  <div className="text-[10px] text-center font-serif text-amber-300/80">
                    {isSelected 
                      ? (selectionOrder === 0 ? (isHi ? "अतीत" : "Past") : selectionOrder === 1 ? (isHi ? "वर्तमान" : "Present") : (isHi ? "भविष्य" : "Future"))
                      : "CosmicJyoti"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- STATE: REVEALING / READING --- */}
      {(gameState === 'revealing' || gameState === 'reading') && drawnCardsDetails.length === 3 && (
        <div className="w-full flex flex-col items-center gap-8 animate-fade-in">
          
          {/* Spread Overview Banner */}
          <div className="w-full max-w-4xl bg-gradient-to-r from-purple-950/70 via-indigo-950/70 to-slate-900/80 border border-purple-500/40 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-400/40 flex items-center justify-center text-xl shadow-inner">
                ✨
              </div>
              <div>
                <h3 className="text-sm font-serif font-bold text-amber-200">
                  {isHi ? "3-कार्ड विस्तृत विश्लेषण तैयार है" : "3-Card Detailed Reading Ready"}
                </h3>
                <p className="text-xs text-slate-300">
                  {isHi 
                    ? "कार्डों का पूरा विवरण, प्रेम, करियर व सलाह नीचे देखें — एआई का इंतजार करने की आवश्यकता नहीं है।"
                    : "Instant meaning, love, career & advice available below — no waiting required."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEncyclopedia(true)}
                className="px-3.5 py-1.5 bg-purple-900/60 hover:bg-purple-800 border border-purple-400/40 text-purple-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span>{isHi ? "78 कार्ड देखें" : "All 78 Cards"}</span>
              </button>
            </div>
          </div>

          {/* 3 Visual Interactive Tarot Cards */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
            {drawnCardsDetails.map((card, i) => {
              const meta = positionMeta[i];
              const isCardSelected = activeSpreadTab === i;

              return (
                <div 
                  key={i} 
                  onClick={() => setActiveSpreadTab(i)}
                  className={`flex flex-col items-center gap-3 cursor-pointer transition-all duration-300 transform ${
                    isCardSelected ? 'scale-102 -translate-y-1' : 'opacity-90 hover:opacity-100'
                  }`}
                >
                  {/* Position Header Tag */}
                  <div className={`w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border bg-gradient-to-r ${meta.color} text-xs font-bold font-serif`}>
                    <span className="flex items-center gap-1.5">
                      <span>{meta.icon}</span>
                      <span>{isHi ? meta.labelHi : meta.labelEn}</span>
                    </span>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900/60 border border-slate-700">
                      Card #{i + 1}
                    </span>
                  </div>

                  {/* Card Visual Artwork */}
                  <div className={`relative w-full h-[420px] rounded-2xl border-2 p-4 flex flex-col justify-between overflow-hidden shadow-2xl transition-all ${
                    isCardSelected 
                      ? 'border-amber-400 ring-4 ring-amber-400/40 shadow-[0_0_35px_rgba(251,191,36,0.3)] bg-[#111322]' 
                      : 'border-slate-700 bg-slate-950/90 hover:border-slate-500'
                  }`}>
                    
                    {/* Background Gradients & Filigree */}
                    <div className={`absolute inset-0 bg-gradient-to-b ${card.colorGradient} pointer-events-none opacity-80`}></div>
                    <div className="absolute inset-1.5 border border-dashed border-amber-400/30 rounded-xl pointer-events-none"></div>

                    {/* Top Bar: Numeral & Element */}
                    <div className="relative z-10 flex justify-between items-center text-xs">
                      <span className="font-serif font-bold text-amber-300 text-sm px-2 py-0.5 rounded bg-slate-950/80 border border-amber-500/30">
                        {card.numeral}
                      </span>
                      <span className="inline-flex items-center text-[11px] font-semibold text-slate-200 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-700">
                        {renderElementIcon(card.element)}
                        {isHi ? card.elementHi : card.element}
                      </span>
                    </div>

                    {/* Center Artwork Medallion */}
                    <div className="relative z-10 flex flex-col items-center my-auto py-2">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-slate-950 via-purple-950/80 to-slate-900 border-2 border-amber-400/50 flex flex-col items-center justify-center shadow-lg relative group">
                        <div className="text-4xl filter drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]">
                          {card.icon}
                        </div>
                        <div className="absolute -bottom-2 text-[9px] px-2 py-0.5 rounded-full bg-amber-950 border border-amber-500/40 text-amber-200 font-serif font-bold tracking-wider">
                          {card.arcana} Arcana
                        </div>
                      </div>

                      {/* Card Title */}
                      <h4 className="mt-4 font-serif font-bold text-lg text-center text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-100 leading-tight">
                        {card.name}
                      </h4>
                      <p className="text-xs text-amber-300/90 font-serif text-center mt-0.5">
                        {card.nameHi}
                      </p>
                    </div>

                    {/* Bottom Section: Keywords & Yes/No Pill */}
                    <div className="relative z-10 flex flex-col gap-2 pt-2 border-t border-slate-800">
                      {/* Keyword Pills */}
                      <div className="flex flex-wrap justify-center gap-1">
                        {(isHi ? card.keywordsHi : card.keywords).slice(0, 3).map((kw, kIdx) => (
                          <span key={kIdx} className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-200 border border-purple-500/30">
                            {kw}
                          </span>
                        ))}
                      </div>

                      {/* Yes/No & Inspect Indicator */}
                      <div className="flex items-center justify-between pt-1">
                        {renderYesNoBadge(card.yesNo, card.yesNoHi)}
                        <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{isCardSelected ? (isHi ? "सक्रिय" : "Selected") : (isHi ? "विवरण" : "Details")}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* INSTANT CARD DEEP DIVE INSPECTOR (NO WAITING FOR AI RESPONSE!) */}
          {/* ========================================================================= */}
          <div className="w-full max-w-4xl bg-slate-900/90 border-2 border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500"></div>

            {/* Inspector Title & Tab Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-amber-400">
                  {isHi ? "तुरंत कार्ड व्याख्या" : "Instant Card Deep Dive"}
                </span>
                <h3 className="text-xl md:text-2xl font-serif font-bold text-purple-100 flex items-center gap-2 mt-0.5">
                  <span>{positionMeta[activeSpreadTab].icon}</span>
                  <span>
                    {drawnCardsDetails[activeSpreadTab].name} 
                    <span className="text-amber-300 text-lg ml-2 font-normal">
                      ({drawnCardsDetails[activeSpreadTab].nameHi})
                    </span>
                  </span>
                </h3>
              </div>

              {/* 3 Spread Switcher Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-700">
                {drawnCardsDetails.map((c, tabIdx) => (
                  <button
                    key={tabIdx}
                    onClick={() => setActiveSpreadTab(tabIdx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      activeSpreadTab === tabIdx
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>{positionMeta[tabIdx].icon}</span>
                    <span>{tabIdx === 0 ? (isHi ? "अतीत" : "Past") : tabIdx === 1 ? (isHi ? "वर्तमान" : "Present") : (isHi ? "भविष्य" : "Future")}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Card Core Essence One-Liner Box */}
            <div className="my-6 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-950 border border-amber-400/30">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div className="flex-1">
                  <h5 className="text-xs uppercase tracking-wider text-amber-300 font-bold mb-1">
                    {isHi ? "मुख्य संदेश (Core Essence)" : "Instant Takeaway"}
                  </h5>
                  <p className="text-slate-100 text-sm leading-relaxed font-serif">
                    {isHi ? drawnCardsDetails[activeSpreadTab].essenceHi : drawnCardsDetails[activeSpreadTab].essence}
                  </p>
                </div>
              </div>
            </div>

            {/* Category Navigation Pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { id: 'overview', labelEn: 'Overview & Upright', labelHi: 'सामान्य अर्थ', icon: <Sparkles className="w-3.5 h-3.5" /> },
                { id: 'position', labelEn: `${positionMeta[activeSpreadTab].labelEn} Role`, labelHi: `${positionMeta[activeSpreadTab].labelHi} प्रभाव`, icon: <Compass className="w-3.5 h-3.5" /> },
                { id: 'love', labelEn: 'Love & Romance', labelHi: 'प्रेम व संबंध', icon: <Heart className="w-3.5 h-3.5" /> },
                { id: 'career', labelEn: 'Career & Wealth', labelHi: 'करियर व धन', icon: <Briefcase className="w-3.5 h-3.5" /> },
                { id: 'health', labelEn: 'Health & Mindset', labelHi: 'स्वास्थ्य व ऊर्जा', icon: <Activity className="w-3.5 h-3.5" /> },
                { id: 'advice', labelEn: 'Golden Advice', labelHi: 'मार्गदर्शक सलाह', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                    activeCategory === cat.id
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md scale-102'
                      : 'bg-slate-950/60 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  {cat.icon}
                  <span>{isHi ? cat.labelHi : cat.labelEn}</span>
                </button>
              ))}
            </div>

            {/* Category Content Area */}
            <div className="bg-slate-950/80 rounded-2xl p-6 border border-slate-800 min-h-[160px] animate-fade-in">
              {activeCategory === 'overview' && (
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-bold text-amber-200 mb-1 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>{isHi ? "कार्ड का विस्तृत अर्थ (Upright Meaning)" : "Upright Card Meaning"}</span>
                    </h5>
                    <p className="text-slate-200 text-sm leading-relaxed">
                      {isHi ? drawnCardsDetails[activeSpreadTab].uprightMeaningHi : drawnCardsDetails[activeSpreadTab].uprightMeaning}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block mb-1">{isHi ? "ज्योतिष व तत्व संबंध" : "Astrology & Element"}:</span>
                      <span className="text-amber-200 font-semibold">
                        {isHi ? drawnCardsDetails[activeSpreadTab].astrologyHi : drawnCardsDetails[activeSpreadTab].astrology}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block mb-1">{isHi ? "हाँ / ना मार्गदर्शन" : "Yes / No Verdict"}:</span>
                      <div>{renderYesNoBadge(drawnCardsDetails[activeSpreadTab].yesNo, drawnCardsDetails[activeSpreadTab].yesNoHi)}</div>
                    </div>
                  </div>
                </div>
              )}

              {activeCategory === 'position' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-base">
                    <span>{positionMeta[activeSpreadTab].icon}</span>
                    <span>
                      {isHi 
                        ? `${positionMeta[activeSpreadTab].labelHi} में इस कार्ड का विशेष अर्थ:`
                        : `Meaning in the ${positionMeta[activeSpreadTab].labelEn} Position:`}
                    </span>
                  </div>
                  
                  <p className="text-slate-100 text-sm leading-relaxed bg-purple-950/30 p-4 rounded-xl border border-purple-500/30">
                    {activeSpreadTab === 0 && (isHi ? drawnCardsDetails[0].pastMeaningHi : drawnCardsDetails[0].pastMeaning)}
                    {activeSpreadTab === 1 && (isHi ? drawnCardsDetails[1].presentMeaningHi : drawnCardsDetails[1].presentMeaning)}
                    {activeSpreadTab === 2 && (isHi ? drawnCardsDetails[2].futureMeaningHi : drawnCardsDetails[2].futureMeaning)}
                  </p>

                  <p className="text-xs text-slate-400 italic">
                    {isHi ? positionMeta[activeSpreadTab].descHi : positionMeta[activeSpreadTab].descEn}
                  </p>
                </div>
              )}

              {activeCategory === 'love' && (
                <div className="space-y-3">
                  <h5 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span>{isHi ? "प्रेम, संबंध और जीवनसाथी मार्गदर्शन" : "Love & Relationship Forecast"}</span>
                  </h5>
                  <p className="text-slate-100 text-sm leading-relaxed bg-rose-950/20 p-4 rounded-xl border border-rose-500/30">
                    {isHi ? drawnCardsDetails[activeSpreadTab].loveHi : drawnCardsDetails[activeSpreadTab].love}
                  </p>
                </div>
              )}

              {activeCategory === 'career' && (
                <div className="space-y-3">
                  <h5 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-400" />
                    <span>{isHi ? "नौकरी, व्यवसाय और वित्तीय स्थिति" : "Career, Business & Financial Guidance"}</span>
                  </h5>
                  <p className="text-slate-100 text-sm leading-relaxed bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/30">
                    {isHi ? drawnCardsDetails[activeSpreadTab].careerHi : drawnCardsDetails[activeSpreadTab].career}
                  </p>
                </div>
              )}

              {activeCategory === 'health' && (
                <div className="space-y-3">
                  <h5 className="text-sm font-bold text-sky-300 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-sky-400" />
                    <span>{isHi ? "स्वास्थ्य, ऊर्जा और मानसिक शांति" : "Health, Mindset & Spiritual Vitality"}</span>
                  </h5>
                  <p className="text-slate-100 text-sm leading-relaxed bg-sky-950/20 p-4 rounded-xl border border-sky-500/30">
                    {isHi ? drawnCardsDetails[activeSpreadTab].healthHi : drawnCardsDetails[activeSpreadTab].health}
                  </p>
                </div>
              )}

              {activeCategory === 'advice' && (
                <div className="space-y-3">
                  <h5 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>{isHi ? "टैरो की मुख्य सलाह (Actionable Advice)" : "Golden Actionable Advice"}</span>
                  </h5>
                  <p className="text-slate-100 text-sm leading-relaxed bg-amber-950/30 p-4 rounded-xl border border-amber-500/40">
                    {isHi ? drawnCardsDetails[activeSpreadTab].adviceHi : drawnCardsDetails[activeSpreadTab].advice}
                  </p>
                  <p className="text-xs text-slate-400">
                    {isHi ? `प्रतीक व्याख्या: ${drawnCardsDetails[activeSpreadTab].symbolismHi}` : `Symbolism: ${drawnCardsDetails[activeSpreadTab].symbolism}`}
                  </p>
                </div>
              )}
            </div>

            {/* Quick 3-Card Summary Strip */}
            <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">{isHi ? "कार्ड स्विच करें:" : "Quick Switch:"}</span>
                {drawnCardsDetails.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSpreadTab(idx)}
                    className={`px-2.5 py-1 rounded-lg border transition-all ${
                      activeSpreadTab === idx
                        ? 'border-amber-400 bg-amber-500/20 text-amber-200 font-bold'
                        : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    #{idx + 1} {c.name.split(' ')[0]}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setModalCard(drawnCardsDetails[activeSpreadTab])}
                className="text-purple-300 hover:text-white flex items-center gap-1 font-semibold"
              >
                <span>{isHi ? "कार्ड का पूरा पृष्ठ देखें" : "View Full Card Profile"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* AI HOLISTIC READING SYNTHESIS SECTION */}
          {/* ========================================================================= */}
          {loading && (
            <div className="w-full max-w-4xl bg-purple-950/30 border border-purple-500/30 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full border-4 border-purple-400 border-t-transparent animate-spin"></div>
              <p className="text-purple-200 font-serif font-semibold animate-pulse text-base">
                {t.loadingTarot}
              </p>
              <p className="text-slate-400 text-xs max-w-md">
                {isHi 
                  ? "ऋषि तीनों कार्डों के आपसी संबंध और संयुक्त भविष्यफल की व्याख्या कर रहे हैं..."
                  : "Synthesizing holistic story connecting your Past, Present, and Future..."}
              </p>
            </div>
          )}

          {!loading && reading && (
            <>
              <div className="w-full max-w-4xl flex flex-col gap-4 animate-fade-in">
                <div className="flex flex-wrap items-center justify-end">
                  <SaveShareBar
                    language={language}
                    onSave={() => {
                      const cardsKey = selectedIndices.map(i => deck[i]).sort().join(',');
                      const cards = selectedIndices.map(i => deck[i]);
                      const id = saveReport('tarot', { reading, cards }, { cards: cardsKey, lang: language }, `Tarot: ${cards.join(', ')}`);
                      setIsSaved(true);
                      setSavedReportId(id);
                    }}
                    onUnsave={savedReportId ? () => { deleteReport(savedReportId); setIsSaved(false); setSavedReportId(null); } : undefined}
                    isSaved={isSaved}
                    savedReportId={savedReportId}
                    shareContent={`Tarot: ${selectedIndices.map(i => deck[i]).join(', ')}. ${reading.replace(/<[^>]*>/g, '').slice(0, 300)}... – CosmicJyoti`}
                    shareTitle="Tarot Reading – CosmicJyoti"
                    contentType="tarot"
                  />
                </div>

                <div className="w-full max-w-4xl bg-slate-900/80 border border-purple-500/30 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                  <h3 className="text-2xl font-serif text-purple-200 mb-6 text-center">
                    {t.yourReading}
                  </h3>
                  
                  <div className="max-w-none prose-invert">
                    <RichText text={reading} />
                  </div>
                  
                  <div className="mt-8 flex justify-center">
                    <button 
                      onClick={() => { reset(); setIsSaved(false); setSavedReportId(null); }} 
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-900 to-indigo-900 border border-purple-500/40 hover:border-purple-400 text-purple-200 hover:text-white rounded-full transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t.reshuffle}</span>
                    </button>
                  </div>
                </div>
              </div>

              {!notifEnabled && (
                <div className="w-full max-w-4xl bg-purple-900/10 border border-purple-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl animate-bounce">🔔</span>
                    <div>
                      <h4 className="text-purple-200 font-bold text-sm uppercase tracking-wider">
                        {isHi ? 'दैनिक अलर्ट' : 'Daily Alerts'}
                      </h4>
                      <p className="text-slate-400 text-xs">
                        {isHi ? 'टैरो, राशिफल, दैनिक पूर्वानुमान और कॉस्मिक हेल्थ के लिए सूचनाएं प्राप्त करें' : 'Get notifications for Tarot, Horoscope, Daily Forecast & Cosmic Health'}
                      </p>
                    </div>
                  </div>
                  <button onClick={handleNotifySub} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-lg cursor-pointer active:scale-95">
                    {isHi ? 'सदस्यता लें' : 'Subscribe'}
                  </button>
                </div>
              )}

              <div className="w-full max-w-4xl">
                <ModuleAskAI
                  contextStr={[
                    `Cards Drawn: ${selectedIndices.map(i => deck[i]).join(', ')}`,
                    `Card 1 Past: ${drawnCardsDetails[0]?.name} (${drawnCardsDetails[0]?.essence})`,
                    `Card 2 Present: ${drawnCardsDetails[1]?.name} (${drawnCardsDetails[1]?.essence})`,
                    `Card 3 Future: ${drawnCardsDetails[2]?.name} (${drawnCardsDetails[2]?.essence})`,
                    `AI Holistic Synthesis: ${reading.substring(0, 700)}${reading.length > 700 ? '...' : ''}`,
                  ].join('. ')}
                  language={language}
                  moduleName={isHi ? 'तारो रीडिंग' : 'Tarot Reading'}
                  accentColor="purple"
                />
              </div>
            </>
          )}

          {/* WhatsApp Expert Consultation */}
          {!loading && reading && (
            <div className="w-full max-w-4xl bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-serif text-green-200 mb-2 flex items-center justify-center md:justify-start gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    {isHi ? 'विशेषज्ञ टैरो ज्योतिषी से व्यक्तिगत परामर्श' : 'Get Expert Tarot Reading Consultation'}
                  </h3>
                  <p className="text-slate-300 text-sm">
                    {isHi 
                      ? 'विशेषज्ञ टैरो रीडर से 1-ऑन-1 व्यक्तिगत मार्गदर्शन और उपाय प्राप्त करें'
                      : 'Get 1-on-1 personalized tarot reading and deep guidance from our expert reader'}
                  </p>
                </div>
                <a 
                  {...getExternalLinkProps("https://wa.me/919326715739", language)}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all hover:shadow-green-500/50 flex items-center gap-2 whitespace-nowrap text-sm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span>{isHi ? 'WhatsApp पर संपर्क करें' : 'Contact on WhatsApp'}</span>
                </a>
              </div>
            </div>
          )}

          <AdBanner variant="leaderboard" />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 78-CARD TAROT DECK ENCYCLOPEDIA MODAL */}
      {/* ========================================================================= */}
      {showEncyclopedia && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-5xl max-h-[90vh] bg-slate-900 border-2 border-purple-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-400/40 flex items-center justify-center text-xl">
                  📖
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-serif font-bold text-amber-200">
                    {isHi ? "टैरो कार्ड इनसाइक्लोपीडिया (78 कार्ड)" : "78-Card Tarot Encyclopedia & Meanings"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isHi ? "किसी भी कार्ड पर क्लिक करके उसका संपूर्ण अर्थ व मार्गदर्शन देखें" : "Click on any card to view its comprehensive meaning and guidance"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowEncyclopedia(false)}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              {/* Suit Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(['All', 'Major', 'Cups', 'Wands', 'Swords', 'Pentacles'] as const).map(suit => (
                  <button
                    key={suit}
                    onClick={() => setSuitFilter(suit)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      suitFilter === suit
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {suit === 'All' ? (isHi ? 'सभी' : 'All') : suit === 'Major' ? (isHi ? 'मेजर (22)' : 'Major (22)') : suit}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={isHi ? "कार्ड नाम या कीवर्ड खोजें..." : "Search card or keyword..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            {/* Cards Grid */}
            <div className="p-6 overflow-y-auto max-h-[60vh] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredAllCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => setModalCard(card)}
                  className="bg-slate-950 border border-slate-800 hover:border-amber-400/80 rounded-2xl p-3 flex flex-col items-center text-center cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg group"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-slate-700 group-hover:border-amber-400 flex items-center justify-center text-2xl mb-2 transition-all">
                    {card.icon}
                  </div>
                  <span className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider">
                    {card.numeral} • {card.element}
                  </span>
                  <h5 className="text-xs font-serif font-bold text-slate-200 mt-1 line-clamp-1 group-hover:text-amber-200">
                    {card.name}
                  </h5>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {card.nameHi}
                  </p>
                  <div className="mt-2">
                    {renderYesNoBadge(card.yesNo, card.yesNoHi)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SINGLE CARD DETAILED PROFILE MODAL */}
      {/* ========================================================================= */}
      {modalCard && (
        <div className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border-2 border-amber-400/50 rounded-3xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-950 border border-amber-400/50 flex items-center justify-center text-3xl shadow-inner">
                  {modalCard.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400">{modalCard.numeral}</span>
                    <span className="text-xs text-slate-400">• {modalCard.arcana} Arcana</span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-amber-200">
                    {modalCard.name}
                  </h3>
                  <p className="text-xs text-slate-300">{modalCard.nameHi}</p>
                </div>
              </div>

              <button
                onClick={() => setModalCard(null)}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-sm">
              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30">
                <span className="text-xs uppercase tracking-wider text-amber-300 font-bold block mb-1">
                  {isHi ? "मुख्य संदेश" : "Core Essence"}
                </span>
                <p className="text-slate-100 font-serif leading-relaxed">
                  {isHi ? modalCard.essenceHi : modalCard.essence}
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  {isHi ? "विस्तृत अर्थ (Upright Meaning)" : "Upright Meaning"}
                </h5>
                <p className="text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                  {isHi ? modalCard.uprightMeaningHi : modalCard.uprightMeaning}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30">
                  <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5 mb-1">
                    <Heart className="w-3.5 h-3.5" />
                    <span>{isHi ? "प्रेम व संबंध" : "Love & Relationship"}</span>
                  </span>
                  <p className="text-xs text-slate-200">
                    {isHi ? modalCard.loveHi : modalCard.love}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{isHi ? "करियर व धन" : "Career & Finance"}</span>
                  </span>
                  <p className="text-xs text-slate-200">
                    {isHi ? modalCard.careerHi : modalCard.career}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isHi ? "मार्गदर्शक सलाह" : "Actionable Advice"}</span>
                </span>
                <p className="text-xs text-slate-200">
                  {isHi ? modalCard.adviceHi : modalCard.advice}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              {renderYesNoBadge(modalCard.yesNo, modalCard.yesNoHi)}
              <button
                onClick={() => setModalCard(null)}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all"
              >
                {isHi ? "बंद करें" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TarotReading;
