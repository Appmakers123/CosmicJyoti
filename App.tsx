
import React, { useState, useCallback, useEffect } from 'react';
import StarBackground from './components/StarBackground';
import ZodiacGrid from './components/ZodiacGrid';
import HoroscopeCard from './components/HoroscopeCard';
import KundaliForm from './components/KundaliForm';
import KundaliResult from './components/KundaliResult';
import DailyPanchang from './components/DailyPanchang';
import Numerology from './components/Numerology'; 
import LearningCenter from './components/LearningCenter';
import PlanetsHouses from './components/PlanetsHouses';
import ZodiacSignsGuide from './components/ZodiacSignsGuide';
import NakshatraLibrary from './components/NakshatraLibrary';
import KundaliBasics from './components/KundaliBasics';
// Removed lazy loading for better performance - load immediately
import PalmistryGuide from './components/PalmistryGuide';
import NumerologyGuide from './components/NumerologyGuide';
import StarLegends from './components/StarLegends'; 
import CompatibilityTab from './components/CompatibilityTab'; 
import TarotReading from './components/TarotReading'; 
import AstroGames from './components/AstroGames';
import ChatWidget from './components/ChatWidget'; 
import PalmReading from './components/PalmReading';
import AshtaSiddhis from './components/AshtaSiddhis';
import RasaShastra from './components/RasaShastra';
import SadesatiDashaCalculator from './components/SadesatiDashaCalculator';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import FaceReading from './components/FaceReading';
import Varshphal from './components/Varshphal';
import NameSuggestions from './components/NameSuggestions';
import UpayRemedies from './components/UpayRemedies';
import Disha from './components/Disha';
import BirthstoneByDob from './components/BirthstoneByDob';
import VastuLab from './components/VastuLab';
import GemstoneLab from './components/GemstoneLab';
import DreamInterpreter from './components/DreamInterpreter';
import MantraLab from './components/MantraLab';
import RudrakshLab from './components/RudrakshLab';
import YantraLab from './components/YantraLab';
import CosmicHealthAI from './components/CosmicHealthAI';
import BookAppointment from './components/BookAppointment';
import MuhuratLab from './components/MuhuratLab';
import MatchMaking from './components/MatchMaking';
import NotificationToggle from './components/NotificationToggle';
import UserProfileModal from './components/UserProfileModal';
import Logo from './components/Logo';
import ThoughtOfTheDay from './components/ThoughtOfTheDay';
import DashboardConsentBanner from './components/DashboardConsentBanner';
import DailyDoDonts from './components/DailyDoDonts';
import DailyAIBlog from './components/DailyAIBlog';
import DailyLuckScore from './components/DailyLuckScore';
import PremiumFeatureCard from './components/PremiumFeatureCard';
import AdBanner from './components/AdBanner';
import HamburgerMenu from './components/HamburgerMenu';
import KarmaStore from './components/KarmaStore';
import { ZodiacSignData, HoroscopeResponse, KundaliFormData, KundaliResponse, Language, DailyPanchangResponse, ViewMode, AppViewMode, User } from './types';
import { ZODIAC_SIGNS, PLAY_STORE_URL } from './constants';
import { generateHoroscope, generateKundali, generateDailyPanchang } from './services/geminiService';
import { generatePersonalizedDailyForecast } from './services/perplexityService';
import { useTranslation, UI_LANGUAGES } from './utils/translations';
import { TranslationProvider, useTranslationContext } from './contexts/TranslationContext';
import { setErrorSafely } from './utils/errorHandler';
import { getExternalLinkProps, openExternalLink } from './utils/linkHandler';
import { isCapacitor } from './utils/linkHandler';
import admobService from './services/admobService';
import { addBonusMessages } from './utils/chatLimitService';
import { canUseAI, incrementAIUsage, canGetChartWithAd, recordChartAdBonus } from './utils/freeUsageLimits';
import { addKarma, getKarma } from './utils/karmaService';
import { unlockFeature, isFeatureUnlocked } from './utils/adUnlockService';
import { getReportByForm, saveReport, listReports, getReport, deleteReport } from './utils/reportStorageService';
import { getGlobalProfile, saveGlobalProfile } from './utils/profileStorageService';
import { recordVisit, getStreak } from './utils/streakService';
import { submitProfileWithConsent, isProfileSubmitEnabled } from './services/profileSubmissionService';
import { useNetworkStatus } from './utils/useNetworkStatus';
import { getPageMeta, getCanonicalPath } from './utils/pageMeta';
import { getFavoriteModules, toggleFavorite } from './utils/favoriteModules';
import { trackToolOpen, trackReviewPromptDismissed } from './utils/dataLayer';
import OfflineBanner from './components/OfflineBanner';
import AppDownloadModal from './components/AppDownloadModal';
import AdWatchModal from './components/AdWatchModal';
import AddToHomeScreenBanner from './components/AddToHomeScreenBanner';
import CheckTodayOnboardingHint from './components/CheckTodayOnboardingHint';
import StreakRewardToast from './components/StreakRewardToast';
import InviteFriendBanner from './components/InviteFriendBanner';
import FAQSection from './components/FAQSection';
import HowItWorks from './components/HowItWorks';
import MySavedReports from './components/MySavedReports';
import LoshuGrid from './components/LoshuGrid';
import IChing from './components/IChing';
import Runes from './components/Runes';
import TodaysOccultWidget from './components/TodaysOccultWidget';
import SignatureAnalysis from './components/SignatureAnalysis';
import LalKitab from './components/LalKitab';
import PrashnaKundali from './components/PrashnaKundali';
import MobileNumerology from './components/MobileNumerology';

// Type-safe conditional import for Capacitor App plugin
type CapacitorAppType = {
  exitApp: () => Promise<void>;
  addListener: (event: string, handler: () => void) => Promise<{ remove: () => Promise<void> }>;
};

// Categorized modules for user-friendly hub
type ModuleDef = { mode: AppViewMode; labelEn: string; labelHi: string; icon: string; descEn: string; descHi: string; isPremium: boolean };
type CategoryDef = { id: string; labelEn: string; labelHi: string; icon: string; color: string; modules: ModuleDef[] };

const MODULE_CATEGORIES: CategoryDef[] = [
  {
    id: 'popular',
    labelEn: 'Popular',
    labelHi: 'लोकप्रिय',
    icon: '⭐',
    color: 'from-amber-500/20 to-orange-500/10',
    modules: [
      { mode: 'kundali', labelEn: 'Birth Chart', labelHi: 'जन्म कुंडली', icon: '🧭', descEn: 'Your cosmic blueprint', descHi: 'आपका आकाशीय नक्शा', isPremium: false },
      { mode: 'matchmaking', labelEn: 'Guna Milan', labelHi: 'गुण मिलान', icon: '💒', descEn: 'Ashtakoot match score', descHi: 'अष्टकूट मिलान', isPremium: false },
      { mode: 'daily', labelEn: 'Horoscope', labelHi: 'राशिफल', icon: '🌞', descEn: 'Today\'s predictions', descHi: 'आज का भविष्य', isPremium: false },
      { mode: 'panchang', labelEn: 'Panchang', labelHi: 'पंचांग', icon: '📅', descEn: 'Celestial almanac', descHi: 'दैनिक पंचांग', isPremium: false },
      { mode: 'muhurat', labelEn: 'Muhurat', labelHi: 'मुहूर्त', icon: '🕐', descEn: 'Auspicious timing', descHi: 'शुभ समय', isPremium: false },
      { mode: 'compatibility', labelEn: 'Compatibility', labelHi: 'कुंडली मिलान', icon: '❤️', descEn: 'Match & harmony', descHi: 'मिलान और सामंजस्य', isPremium: false },
      { mode: 'varshphal', labelEn: 'Varshphal', labelHi: 'वार्षिक फल', icon: '📆', descEn: 'Yearly horoscope', descHi: 'साल भर का भविष्य', isPremium: false },
      { mode: 'disha', labelEn: 'Disha', labelHi: 'दिशा शूल', icon: '🧭', descEn: 'Lucky direction today', descHi: 'आज की शुभ दिशा', isPremium: false },
    ],
  },
  {
    id: 'readings',
    labelEn: 'Readings & Divination',
    labelHi: 'पाठ और भविष्यवाणी',
    icon: '🔮',
    color: 'from-purple-500/20 to-indigo-500/10',
    modules: [
      { mode: 'tarot', labelEn: 'Tarot', labelHi: 'टैरो', icon: '🃏', descEn: 'Card readings', descHi: 'कार्ड पाठ', isPremium: true },
      { mode: 'palm-reading', labelEn: 'Palmistry', labelHi: 'हस्तरेखा', icon: '✋', descEn: 'AI palm reading from photo', descHi: 'फोटो से AI हस्तरेखा', isPremium: true },
      { mode: 'face-reading', labelEn: 'Face Reading', labelHi: 'चेहरा पढ़ना', icon: '👤', descEn: 'Samudrik Shastra', descHi: 'समुद्रिक शास्त्र', isPremium: true },
      { mode: 'dreams', labelEn: 'Dreams', labelHi: 'स्वप्न शास्त्र', icon: '🌙', descEn: 'Dream meanings', descHi: 'स्वप्न अर्थ', isPremium: false },
      { mode: 'numerology', labelEn: 'Numerology', labelHi: 'अंक ज्योतिष', icon: '🔢', descEn: 'Numbers & destiny', descHi: 'अंक और भाग्य', isPremium: true },
      { mode: 'loshu', labelEn: 'Lo Shu Grid', labelHi: 'लो शू ग्रिड', icon: '🔳', descEn: 'Magic square numerology', descHi: 'अंक ज्योतिष ग्रिड', isPremium: false },
      { mode: 'i-ching', labelEn: 'I Ching', labelHi: 'ई चिंग', icon: '☰', descEn: 'Chinese hexagram wisdom', descHi: 'चीनी हेक्साग्राम', isPremium: false },
      { mode: 'runes', labelEn: 'Runes', labelHi: 'रून्स', icon: 'ᚠ', descEn: 'Norse rune draw', descHi: 'नॉर्स रून', isPremium: false },
      { mode: 'signature', labelEn: 'Signature Meaning', labelHi: 'हस्ताक्षर अर्थ', icon: '✍️', descEn: 'Draw or upload, AI analysis', descHi: 'बनाएं या अपलोड, AI विश्लेषण', isPremium: false },
      { mode: 'prashna-kundali', labelEn: 'Prashna Kundali', labelHi: 'प्रश्न कुंडली', icon: '❓', descEn: 'Horary – answer by question time', descHi: 'प्रश्न के समय पर उत्तर', isPremium: false },
      { mode: 'mobile-numerology', labelEn: 'Mobile Numerology', labelHi: 'मोबाइल अंक ज्योतिष', icon: '📱', descEn: 'Phone number vibration & luck', descHi: 'नंबर कंपन और भाग्य', isPremium: false },
      { mode: 'name-suggestions', labelEn: 'Name Suggestions', labelHi: 'नाम सुझाव', icon: '✏️', descEn: 'Baby & business names', descHi: 'बच्चा और व्यवसाय नाम', isPremium: false },
    ],
  },
  {
    id: 'remedies',
    labelEn: 'Remedies & Healing',
    labelHi: 'उपाय और उपचार',
    icon: '🕉️',
    color: 'from-emerald-500/20 to-teal-500/10',
    modules: [
      { mode: 'mantra', labelEn: 'Mantra', labelHi: 'मंत्र', icon: '🕉️', descEn: 'Sacred chants', descHi: 'पवित्र मंत्र', isPremium: false },
      { mode: 'gemstones', labelEn: 'Gemstones', labelHi: 'रत्न शास्त्र', icon: '💎', descEn: 'Planetary gems', descHi: 'ग्रह रत्न', isPremium: false },
      { mode: 'vastu', labelEn: 'Vastu', labelHi: 'वास्तु', icon: '🏠', descEn: 'Sacred space', descHi: 'पवित्र स्थान', isPremium: false },
      { mode: 'rudraksh', labelEn: 'Rudraksh', labelHi: 'रुद्राक्ष', icon: '📿', descEn: 'Sacred beads', descHi: 'पवित्र माला', isPremium: false },
      { mode: 'yantra', labelEn: 'Yantra', labelHi: 'यंत्र', icon: '🔺', descEn: 'Sacred geometry', descHi: 'पवित्र ज्यामिति', isPremium: false },
      { mode: 'cosmic-health', labelEn: 'Cosmic Health', labelHi: 'कॉस्मिक हेल्थ', icon: '🏥', descEn: 'Vedic wellness', descHi: 'वैदिक स्वास्थ्य', isPremium: false },
      { mode: 'upay', labelEn: 'Upay Remedies', labelHi: 'उपाय', icon: '🪔', descEn: 'Quick Vedic remedies', descHi: 'ज्योतिषीय उपाय', isPremium: false },
      { mode: 'lal-kitab', labelEn: 'Lal Kitab', labelHi: 'लाल किताब', icon: '📕', descEn: 'Simple totkas & remedies', descHi: 'सरल टोटके और उपाय', isPremium: false },
      { mode: 'birthstone', labelEn: 'Birthstone by DOB', labelHi: 'राशि रत्न', icon: '💎', descEn: 'Your rashi gemstone', descHi: 'जन्म तिथि से रत्न', isPremium: false },
    ],
  },
  {
    id: 'learn',
    labelEn: 'Learn Astrology',
    labelHi: 'ज्योतिष सीखें',
    icon: '📚',
    color: 'from-blue-500/20 to-cyan-500/10',
    modules: [
      { mode: 'learning', labelEn: 'Learning Center', labelHi: 'गुरुकुल', icon: '📚', descEn: 'Master the basics', descHi: 'मूल बातें सीखें', isPremium: false },
      { mode: 'kundali-basics', labelEn: 'Kundali Basics', labelHi: 'कुंडली मूल', icon: '📖', descEn: 'Chart fundamentals', descHi: 'चार्ट मूल', isPremium: false },
      { mode: 'planets-houses', labelEn: 'Planets & Houses', labelHi: 'ग्रह और भाव', icon: '🪐', descEn: 'Planetary wisdom', descHi: 'ग्रह ज्ञान', isPremium: false },
      { mode: 'zodiac-signs', labelEn: 'Zodiac Signs', labelHi: 'राशि चक्र', icon: '♈', descEn: '12 signs guide', descHi: '12 राशि गाइड', isPremium: false },
      { mode: 'nakshatra-library', labelEn: 'Nakshatra', labelHi: 'नक्षत्र', icon: '✨', descEn: '27 lunar mansions', descHi: '27 चंद्र निवास', isPremium: false },
      { mode: 'palmistry-guide', labelEn: 'Palmistry Guide', labelHi: 'हस्तरेखा गाइड', icon: '✋', descEn: 'Hand lines', descHi: 'हाथ की रेखाएं', isPremium: false },
      { mode: 'numerology-guide', labelEn: 'Numerology Guide', labelHi: 'अंक गाइड', icon: '🔢', descEn: 'Number meanings', descHi: 'अंक अर्थ', isPremium: false },
      { mode: 'star-legends', labelEn: 'Star Legends', labelHi: 'तारा कथाएं', icon: '🌟', descEn: 'Cosmic stories', descHi: 'आकाशीय कथाएं', isPremium: false },
      { mode: 'ai-blog', labelEn: 'AI Articles', labelHi: 'AI लेख', icon: '📝', descEn: 'Daily astrology articles', descHi: 'दैनिक ज्योतिष लेख', isPremium: false },
      { mode: 'ashta-siddhis', labelEn: 'Ashta Siddhis & Nav Nidhi', labelHi: 'अष्ट सिद्धि व नव निधि', icon: '✨', descEn: 'Eight siddhis, nine nidhis', descHi: 'आठ सिद्धि, नव निधि', isPremium: false },
      { mode: 'rasa-shastra', labelEn: 'Rasa Shastra', labelHi: 'रस शास्त्र', icon: '⚗️', descEn: 'Indian alchemy & Rasayana', descHi: 'भारतीय रसायन विद्या', isPremium: false },
      { mode: 'sadesati-dasha', labelEn: 'Sade Sati & Dasha', labelHi: 'साढ़े साती और दशा', icon: '🪐', descEn: 'Calculator with AI interpretation', descHi: 'कैलकुलेटर और AI व्याख्या', isPremium: false },
    ],
  },
  {
    id: 'explore',
    labelEn: 'Explore & Fun',
    labelHi: 'खोजें और मस्ती',
    icon: '🎲',
    color: 'from-pink-500/20 to-rose-500/10',
    modules: [
      { mode: 'games', labelEn: 'Astro Games', labelHi: 'पहेलियाँ', icon: '🎲', descEn: 'Play & learn', descHi: 'खेलें और सीखें', isPremium: false },
    ],
  },
  {
    id: 'services',
    labelEn: 'Services',
    labelHi: 'सेवाएं',
    icon: '📅',
    color: 'from-amber-500/20 to-yellow-500/10',
    modules: [
      { mode: 'appointment', labelEn: 'Book Appointment', labelHi: 'अपॉइंटमेंट बुक करें', icon: '📅', descEn: 'Google Meet consultation', descHi: 'Google Meet परामर्श', isPremium: false },
    ],
  },
];

const VALID_APP_MODES: AppViewMode[] = ['daily', 'kundali', 'panchang', 'numerology', 'learning', 'tarot', 'compatibility', 'games', 'palm-reading', 'face-reading', 'muhurat', 'mantra', 'rudraksh', 'planets-houses', 'zodiac-signs', 'nakshatra-library', 'kundali-basics', 'palmistry-guide', 'numerology-guide', 'star-legends', 'matchmaking', 'vastu', 'gemstones', 'dreams', 'cosmic-health', 'yantra', 'appointment', 'ai-blog', 'varshphal', 'name-suggestions', 'upay', 'disha', 'birthstone', 'lal-kitab', 'prashna-kundali', 'mobile-numerology', 'loshu', 'i-ching', 'runes', 'signature', 'ashta-siddhis', 'rasa-shastra', 'sadesati-dasha', 'about', 'contact'];

/** Renders when Sarvam/Shunya are loading UI translations (must be inside TranslationProvider). */
function TranslationLoadingIndicator() {
  const ctx = useTranslationContext();
  if (!ctx?.isLocaleLoading) return null;
  return (
    <span className="text-[10px] text-amber-400/90 animate-pulse whitespace-nowrap" aria-live="polite">
      {ctx.language === 'hi' ? 'अनुवाद हो रहा है...' : 'Translating...'}
    </span>
  );
}

const App: React.FC = () => {
  const isOnline = useNetworkStatus();
  const [mode, setMode] = useState<AppViewMode>('hub');
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const modeHistoryRef = React.useRef<AppViewMode[]>(['hub']);
  const isPopStateRef = React.useRef(false);

  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const s = localStorage.getItem('cosmicjyoti_language');
      if (s && UI_LANGUAGES.some((l) => l.code === s)) return s;
    } catch (_) {}
    return 'en';
  });
  const setLanguage = (lang: Language) => {
    const valid = UI_LANGUAGES.some((l) => l.code === lang) ? lang : 'en';
    setLanguageState(valid);
    try {
      localStorage.setItem('cosmicjyoti_language', valid);
    } catch (_) {}
  };
  const t = useTranslation(language);
  const [user, setUser] = useState<User | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  
  // Monetization: subscription + ads for free tier
  const [chatRefreshKey, setChatRefreshKey] = useState(0);
  const [showKarmaStore, setShowKarmaStore] = useState(false);
  const [karmaBalance, setKarmaBalance] = useState(0);
  const [showAdWatchModal, setShowAdWatchModal] = useState(false);
  const [adWatchPurpose, setAdWatchPurpose] = useState<'karma' | 'chat' | 'premium' | 'chart-ad' | null>(null);
  const [adWatchFeature, setAdWatchFeature] = useState<string | null>(null);
  const [pendingKundaliAfterAd, setPendingKundaliAfterAd] = useState<KundaliFormData | null>(null);
  
  // AdMob interstitial ad tracking
  const lastAdShownTime = React.useRef<number>(0);
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const reviewPromptShownRef = React.useRef(false);

  // Store current mode for external link restoration
  useEffect(() => {
    (window as any).__cosmicjyoti_current_mode = mode;
  }, [mode]);

  // Open correct module when user arrives via ?mode= (e.g. from blog "Try" button or share link)
  const appliedUrlModeRef = React.useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined' || appliedUrlModeRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const urlMode = params.get('mode');
    if (!urlMode) return;
    const normalized = urlMode.toLowerCase().trim() as AppViewMode;
    if (VALID_APP_MODES.includes(normalized)) {
      appliedUrlModeRef.current = true;
      switchMode(normalized);
      // Keep ?mode= in URL for shareable links
      const path = (window.location.pathname || '/').replace(/\/?$/, '');
      const base = path || '/';
      window.history.replaceState({ mode: normalized }, '', `${base}?mode=${normalized}`);
    }
  }, []);

  
  // Sync karma balance from storage
  useEffect(() => {
    setKarmaBalance(getKarma());
  }, [showKarmaStore]);

  // Check for existing user session on app start
  useEffect(() => {
    const checkExistingSession = async () => {
      // Check localStorage for stored user
      const storedUser = localStorage.getItem('cosmicjyoti_user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser) as User;
          setUser(user);
        } catch (e) {
          console.warn('[Auth] Failed to parse stored user:', e);
        }
      }
    };

    checkExistingSession();
  }, []);

  // Load AdSense script only on web (not in app) - policy compliance, AdMob used in app
  useEffect(() => {
    if (isCapacitor() || typeof window === 'undefined') return;
    if (document.querySelector('script[src*="adsbygoogle"]')) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3559865379099936';
    s.crossOrigin = 'anonymous';
    document.head.appendChild(s);
  }, []);

  // Initialize and preload AdMob ads on app start (Android only)
  useEffect(() => {
    if (!isCapacitor()) return;
    const loadAdsAfterDelay = () => {
      setTimeout(() => admobService.preloadAd().catch(() => {}), 3000);
      setTimeout(() => admobService.loadRewarded().catch(() => {}), 3500);
      setTimeout(() => {
        admobService.loadBanner().then(() => admobService.showBanner()).catch(() => {});
      }, 4000);
    };
    loadAdsAfterDelay();
  }, []);

  // Load Capacitor App plugin for back-button handling (must run before back-button effect)
  useEffect(() => {
    if (!isCapacitor() || typeof window === 'undefined') return;
    try {
      const parts = ['@capacitor', '/app'];
      const modulePath = parts.join('');
      const importFn = new Function('p', 'return import(p)');
      importFn(modulePath)
        .then((appModule: any) => {
          appPluginRef.current = appModule.App as CapacitorAppType;
          setBackButtonPluginReady(true);
        })
        .catch(() => {
          console.warn('@capacitor/app not available, back button may exit app');
        });
    } catch (e) {
      console.warn('Failed to load @capacitor/app:', e);
    }
  }, []);

  
  // Ref to track mode switch count for AdMob ads
  const modeSwitchCountRef = React.useRef(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const appPluginRef = React.useRef<CapacitorAppType | null>(null);
  const backButtonListenerRef = React.useRef<{ remove: () => Promise<void> } | null>(null);
  const [backButtonPluginReady, setBackButtonPluginReady] = useState(false);

  const [selectedSign, setSelectedSign] = useState<ZodiacSignData | null>(null);
  const [horoscopeData, setHoroscopeData] = useState<HoroscopeResponse | null>(null);
  const [dailyForecastPersonalizedName, setDailyForecastPersonalizedName] = useState<string | null>(null);
  const [kundaliData, setKundaliData] = useState<KundaliResponse | null>(null);
  const [kundaliFormData, setKundaliFormData] = useState<KundaliFormData | null>(null);
  const [savedKundaliCharts, setSavedKundaliCharts] = useState<KundaliFormData[]>([]);
  const [panchangData, setPanchangData] = useState<DailyPanchangResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAppDownloadModal, setShowAppDownloadModal] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [showRemindToast, setShowRemindToast] = useState(false);
  const [profileVersion, setProfileVersion] = useState(0);
  const [favoriteModules, setFavoriteModules] = useState<AppViewMode[]>(() => getFavoriteModules());

  // Record visit and update streak when hub is shown; check "remind me tomorrow"
  useEffect(() => {
    if (mode === 'hub') {
      const updated = recordVisit();
      setStreakCount(updated);
      const remind = localStorage.getItem('cosmicjyoti_remind_tomorrow');
      const today = new Date().toISOString().slice(0, 10);
      if (remind === today) {
        localStorage.removeItem('cosmicjyoti_remind_tomorrow');
        setShowRemindToast(true);
        const t = setTimeout(() => setShowRemindToast(false), 5000);
        return () => clearTimeout(t);
      }
    }
  }, [mode]);

  // Show app download popup on web only, after delay, once per 7 days
  useEffect(() => {
    if (isCapacitor()) return;
    const key = 'cosmicjyoti_app_download_seen';
    const seen = localStorage.getItem(key);
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    if (seen && Date.now() - parseInt(seen, 10) < sevenDaysMs) return;
    const t = setTimeout(() => setShowAppDownloadModal(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const handleCloseAppDownloadModal = useCallback(() => {
    setShowAppDownloadModal(false);
    localStorage.setItem('cosmicjyoti_app_download_seen', String(Date.now()));
  }, []);

  const getCachedHoroscope = (signName: string, lang: Language): HoroscopeResponse | null => {
    const today = new Date().toDateString();
    const cacheKey = `horoscope_${signName}_${lang}_${today}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { return null; }
    }
    return null;
  };

  const setCachedHoroscope = (signName: string, lang: Language, data: HoroscopeResponse) => {
    const today = new Date().toDateString();
    const cacheKey = `horoscope_${signName}_${lang}_${today}`;
    localStorage.setItem(cacheKey, JSON.stringify(data));
  };

  const handleSelectSign = useCallback(async (sign: ZodiacSignData) => {
    setSelectedSign(sign);
    setDailyForecastPersonalizedName(null);
    setMode('daily');
    const cached = getCachedHoroscope(sign.name, language);
    if (cached) {
      setHoroscopeData(cached);
      return;
    }
    setLoading(true);
    try {
      const data = await generateHoroscope(sign.name, language);
      setHoroscopeData(data);
      setCachedHoroscope(sign.name, language, data);
    } catch (err) { 
      setErrorSafely(setError, err, language, 'Horoscope');
    } finally { setLoading(false); }
  }, [language, t]);

  const loadSavedKundaliCharts = useCallback(() => {
    const reports = listReports('kundali');
    const charts: KundaliFormData[] = reports
      .filter((m) => m.formInput && typeof m.formInput === 'object')
      .map((m) => {
        const f = m.formInput as Record<string, unknown>;
        return {
          id: m.id,
          name: String(f?.name ?? ''),
          date: String(f?.date ?? ''),
          time: String(f?.time ?? '12:00'),
          location: String(f?.location ?? ''),
        } as KundaliFormData;
      });
    setSavedKundaliCharts(charts);
  }, []);

  useEffect(() => {
    if (mode === 'kundali' || mode === 'hub') loadSavedKundaliCharts();
  }, [mode, loadSavedKundaliCharts]);

  const handleLoadChart = useCallback((chart: KundaliFormData) => {
    const report = chart.id ? getReport<KundaliResponse>(chart.id) : null;
    if (report?.data) {
      setKundaliFormData(chart);
      setKundaliData(report.data);
      setMode('kundali');
    }
  }, []);

  const handleDeleteChart = useCallback((id: string) => {
    deleteReport(id);
    loadSavedKundaliCharts();
    if (kundaliFormData?.id === id) {
      setKundaliData(null);
      setKundaliFormData(null);
    }
  }, [kundaliFormData?.id, loadSavedKundaliCharts]);

  const handleGetDaily = useCallback(async (chart: KundaliFormData) => {
    const formInput = { name: chart.name, date: chart.date, time: chart.time, location: chart.location };
    const report = getReportByForm<KundaliResponse>('kundali', formInput);
    const data = report?.data;
    const moonSign = data?.basicDetails?.moonSign;
    const sign = moonSign ? ZODIAC_SIGNS.find((z) => z.name === moonSign) : null;
    if (!sign) {
      setError(language === 'hi' ? 'चंद्र राशि नहीं मिली। पहले कुंडली देखें।' : 'Moon sign not found. View chart first.');
      return;
    }
    const lagna = data?.basicDetails?.ascendant || moonSign;
    const sunSign = data?.basicDetails?.sunSign || moonSign;
    const nakshatra = data?.basicDetails?.nakshatra || 'Unknown';
    setSelectedSign(sign);
    setDailyForecastPersonalizedName(chart.name);
    setMode('daily');
    const cacheKey = `horoscope_personalized_${chart.name}_${lagna}_${moonSign}_${sunSign}_${nakshatra}_${language}_${new Date().toDateString()}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setHoroscopeData(JSON.parse(cached));
        return;
      } catch (e) { /* ignore */ }
    }
    setLoading(true);
    try {
      const forecast = await generatePersonalizedDailyForecast(
        {
          lagna: lagna ?? moonSign ?? '',
          moonSign: moonSign ?? '',
          sunSign: sunSign ?? moonSign ?? '',
          nakshatra: nakshatra ?? 'Unknown',
          name: chart.name,
        },
        language
      );
      setHoroscopeData(forecast);
      localStorage.setItem(cacheKey, JSON.stringify(forecast));
    } catch (err) {
      setErrorSafely(setError, err, language, 'Horoscope');
      setDailyForecastPersonalizedName(null);
      handleSelectSign(sign);
    } finally {
      setLoading(false);
    }
  }, [handleSelectSign, language]);

  const handleGenerateKundali = useCallback(async (formData: KundaliFormData, options?: { saveToProfile?: boolean; consentToShare?: boolean }) => {
    const saveToProfile = options?.saveToProfile !== false;
    const formInput = { name: formData.name, date: formData.date, time: formData.time, location: formData.location };
    if (saveToProfile) {
      const cached = getReportByForm<KundaliResponse>('kundali', formInput);
      if (cached?.data) {
        setKundaliFormData(formData);
        setKundaliData(cached.data);
        setMode('kundali');
        return;
      }
    }
    if (!canUseAI('chart')) {
      if (canGetChartWithAd()) {
        setPendingKundaliAfterAd(formData);
        setAdWatchPurpose('chart-ad');
        setAdWatchFeature(null);
        setShowAdWatchModal(true);
        return;
      }
      setError(language === 'hi' ? 'आज का कुंडली लिमिट पूरा। कल फिर कोशिश करें।' : 'Daily Kundali limit reached. Try again tomorrow.');
      return;
    }
    setKundaliFormData(formData);
    setLoading(true);
    try {
      const data = await generateKundali(formData, language);
      setKundaliData(data);
      setMode('kundali');
      incrementAIUsage('chart');
      if (isCapacitor() && !reviewPromptShownRef.current) {
        reviewPromptShownRef.current = true;
        setShowReviewPrompt(true);
      }
      if (saveToProfile) {
        saveReport('kundali', data, formInput, `Kundali for ${formData.name}`);
        loadSavedKundaliCharts();
        const b = data.basicDetails;
        const nakshatraStr = typeof b?.nakshatra === 'string' ? b.nakshatra : (b?.nakshatra as { name?: string })?.name;
        const existing = getGlobalProfile();
        const profileData = {
          self: { ...formData, language },
          partner: existing?.partner,
          astroDetails: {
            moonSign: b?.moonSign,
            sunSign: b?.sunSign,
            nakshatra: nakshatraStr || b?.nakshatra,
            ascendant: b?.ascendant,
          },
        };
        saveGlobalProfile(profileData);
        setProfileVersion((v) => v + 1);
        try {
          localStorage.removeItem('cosmicjyoti_dashboard_cta_dismissed');
        } catch (_) {}
        if (options?.consentToShare) {
          try { localStorage.setItem('cosmicjyoti_profile_consent', 'granted'); } catch {}
        }
        const hasConsent = typeof localStorage !== 'undefined' && localStorage.getItem('cosmicjyoti_profile_consent') === 'granted';
        if (hasConsent && isProfileSubmitEnabled()) {
          let accountName = formData.name;
          let accountEmail = '';
          try {
            const raw = localStorage.getItem('cosmicjyoti_user');
            if (raw) {
              const u = JSON.parse(raw) as User;
              if (u?.name) accountName = u.name;
              if (u?.email) accountEmail = u.email;
            }
          } catch {}
          submitProfileWithConsent(profileData, accountName, accountEmail).catch(() => {});
        }
      }
      if (isCapacitor()) admobService.showInterstitialDelayed(4500, () => { lastAdShownTime.current = Date.now(); });
    } catch (err) { 
      setErrorSafely(setError, err, language, 'Kundali');
    } finally { setLoading(false); }
  }, [language, t, loadSavedKundaliCharts]);

  const fetchPanchang = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
          const profile = getGlobalProfile();
          const location = profile?.self?.location || "New Delhi, India";
          const today = new Date().toISOString().slice(0, 10);
          const formInput = { date: today, location };
          const cached = getReportByForm<DailyPanchangResponse>('panchang', formInput);
          if (cached?.data) {
            setPanchangData(cached.data);
            setMode('panchang');
            setLoading(false);
            return;
          }
          if (typeof navigator !== 'undefined' && !navigator.onLine) {
            setErrorSafely(setError, new Error('Offline'), language, 'Panchang');
            setLoading(false);
            return;
          }
          const data = await generateDailyPanchang(location, language);
          setPanchangData(data);
          setMode('panchang');
          saveReport('panchang', data, formInput, `Panchang ${today}`);
      } catch (err) { 
        setErrorSafely(setError, err, language, 'Panchang');
      } finally { setLoading(false); }
  }, [language, t]);

  const scrollToTop = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const switchMode = useCallback((newMode: AppViewMode) => {
    // Track history for back navigation (push current before navigating)
    if (newMode !== mode) {
      modeHistoryRef.current = [...modeHistoryRef.current, mode].slice(-20);
    }
    // Reset horoscope state when navigating to daily horoscope from another mode
    if (newMode === 'daily' && mode !== 'daily') {
      setSelectedSign(null);
      setHoroscopeData(null);
      setDailyForecastPersonalizedName(null);
    }
    if (newMode === 'panchang') fetchPanchang();
    else setMode(newMode);
    scrollToTop();
    setError(null);
    
    // Track mode switches for AdMob interstitial ads
    if (newMode !== mode && mode !== 'hub' && isCapacitor()) {
      modeSwitchCountRef.current += 1;
      
      // Show ad after delay so user sees new content first
      setTimeout(async () => {
        const now = Date.now();
        const timeSinceLastAd = now - lastAdShownTime.current;
        const cooldownPeriod = 4 * 60 * 1000; // 4 minutes cooldown
        
        // Show ad every 6+ mode switches, 4 min cooldown
        if (modeSwitchCountRef.current >= 6 && timeSinceLastAd > 4 * 60 * 1000) {
          try {
            const isReady = await admobService.isInterstitialReady();
            if (!isReady) {
              // Load ad if not ready
              await admobService.loadInterstitial();
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for load
            }
            await admobService.showInterstitial();
            lastAdShownTime.current = now;
            modeSwitchCountRef.current = 0; // Reset counter
          } catch (error) {
            console.log('[AdMob] Failed to show interstitial:', error);
            // Continue anyway - don't block user experience
          }
        }
      }, 500);
    }
  }, [mode, fetchPanchang, scrollToTop]);

  // Handle navigation to learning center with specific tab
  useEffect(() => {
    const handleNavigateToLearning = (event: CustomEvent) => {
      const tab = (event as CustomEvent<{ tab: string }>).detail?.tab;
      setMode('learning');
      // Store the tab to open in LearningCenter
      if (tab) {
        sessionStorage.setItem('learningActiveTab', tab);
      }
      scrollToTop();
    };

    // Handle direct mode switching from components
    const handleSwitchMode = (event: CustomEvent) => {
      const newMode = (event as CustomEvent<{ mode: AppViewMode }>).detail?.mode;
      if (newMode) {
        switchMode(newMode);
      }
    };

    window.addEventListener('navigateToLearning', handleNavigateToLearning as EventListener);
    window.addEventListener('switchMode', handleSwitchMode as EventListener);
    return () => {
      window.removeEventListener('navigateToLearning', handleNavigateToLearning as EventListener);
      window.removeEventListener('switchMode', handleSwitchMode as EventListener);
    };
  }, [switchMode, scrollToTop]);

  const performBackNavigation = useCallback(() => {
    const history = modeHistoryRef.current;
    if (mode !== 'hub' && history.length > 0) {
      const prevMode = history[history.length - 1];
      modeHistoryRef.current = history.slice(0, -1);
      if (kundaliData && mode === 'kundali') setKundaliData(null);
      if (horoscopeData && mode === 'daily') {
        setHoroscopeData(null);
        setSelectedSign(null);
      }
      if (panchangData && mode === 'panchang') setPanchangData(null);
      setMode(prevMode);
      setError(null);
      scrollToTop();
    }
  }, [mode, kundaliData, horoscopeData, panchangData, scrollToTop]);

  // Android back button + browser history back — go to previous screen
  const handleBackNavigation = useCallback(() => {
    if (showProfile) {
      setShowProfile(false);
      return;
    }
    const history = modeHistoryRef.current;
    if (mode !== 'hub' && history.length > 0) {
      const isLeavingFreeModule = !['tarot', 'palm-reading', 'face-reading', 'numerology', 'cosmic-health', 'games', 'dreams'].includes(mode);
      if (isCapacitor() && isLeavingFreeModule) {
        admobService.showInterstitial()
          .then(() => performBackNavigation())
          .catch(() => performBackNavigation());
        return;
      }
      performBackNavigation();
    }
  }, [mode, showProfile, performBackNavigation]);

  // Push state when navigating so Android/browser back has history; use ?mode= for shareable URLs
  useEffect(() => {
    if (typeof window !== 'undefined' && window.history) {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get('mode');
      if (!urlMode) window.history.replaceState({ mode: 'hub' }, '', window.location.pathname || '/');
    }
  }, []);
  useEffect(() => {
    if (isPopStateRef.current) {
      isPopStateRef.current = false;
      return;
    }
    if (mode && typeof window !== 'undefined' && window.history) {
      const base = (window.location.pathname || '/').replace(/\/?$/, '') || '/';
      const url = mode === 'hub' ? base : `${base}?mode=${mode}`;
      window.history.pushState({ mode }, '', url);
    }
  }, [mode]);

  // Document title, meta (description, og), canonical and og:url per view for SEO
  useEffect(() => {
    const { title, description } = getPageMeta(mode, language);
    document.title = title;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', title);
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', description);
    const baseUrl = typeof window !== 'undefined' ? (window.location.origin + (window.location.pathname || '/').replace(/\/?$/, '')) : 'https://www.cosmicjyoti.com';
    const canonicalUrl = mode === 'hub' ? `${baseUrl}/` : `${baseUrl}/?mode=${mode}`;
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('content', canonicalUrl);
    let twitterUrl = document.querySelector('meta[name="twitter:url"]');
    if (!twitterUrl) {
      twitterUrl = document.createElement('meta');
      twitterUrl.setAttribute('name', 'twitter:url');
      document.head.appendChild(twitterUrl);
    }
    twitterUrl.setAttribute('content', canonicalUrl);
  }, [mode, language]);

  // GTM: track tool open when mode changes (skip hub)
  useEffect(() => {
    if (mode && mode !== 'hub' && typeof window !== 'undefined') trackToolOpen(mode);
  }, [mode]);

  // Listen for popstate (browser/Android back)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const prevState = e.state as { mode?: AppViewMode } | null;
      const targetMode = prevState?.mode || 'hub';
      isPopStateRef.current = true;
      if (kundaliData && mode === 'kundali') setKundaliData(null);
      if (horoscopeData && mode === 'daily') {
        setHoroscopeData(null);
        setSelectedSign(null);
      }
      if (panchangData && mode === 'panchang') setPanchangData(null);
      setMode(targetMode);
      setError(null);
      scrollToTop();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [mode, kundaliData, horoscopeData, panchangData, scrollToTop]);

  // Android back button via Capacitor App plugin (when available)
  useEffect(() => {
    if (!isCapacitor() || !backButtonPluginReady) return;
    const AppPlugin = appPluginRef.current;
    if (!AppPlugin || typeof AppPlugin.addListener !== 'function') return;

    const handleBackButton = () => {
      handleBackNavigation();
    };

    AppPlugin.addListener('backButton', handleBackButton)
      .then((l) => { backButtonListenerRef.current = l; })
      .catch((err: any) => console.error("Failed to add back button listener:", err));

    return () => {
      const L = backButtonListenerRef.current;
      backButtonListenerRef.current = null;
      if (L?.remove) L.remove().catch(() => {});
    };
  }, [backButtonPluginReady, handleBackNavigation]);

  const showInterstitialDelayed = (delayMs = 4000, onShown?: () => void) => {
    if (!isCapacitor()) return;
    admobService.showInterstitialDelayed(delayMs, onShown);
  };

  const handleToggleFavorite = (mode: AppViewMode) => {
    setFavoriteModules(toggleFavorite(mode));
  };

  const handleFeatureClick = (target: string) => {
    const mode = target as AppViewMode;
    if (['tarot', 'palm-reading', 'face-reading', 'numerology'].includes(mode) && !isFeatureUnlocked(mode)) {
      setAdWatchPurpose('premium');
      setAdWatchFeature(mode);
      setShowAdWatchModal(true);
      return;
    }
    switchMode(mode);
  };



  const getModuleByMode = (mode: AppViewMode): ModuleDef | null => {
    for (const cat of MODULE_CATEGORIES) {
      const m = cat.modules.find((x) => x.mode === mode);
      if (m) return m;
    }
    return null;
  };

  const FeatureCard = ({ target, label, icon, desc, category, color, isPremium = false, isSubscriptionOnly = false, mustRead = false, isFeatured = false, isFavorite = false, onToggleFavorite }: any) => (
    <div className="relative w-full h-full flex flex-col min-h-0">
      {onToggleFavorite && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(target); }}
          className="absolute bottom-2 right-2 z-20 w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600 hover:border-amber-500/50 text-slate-400 hover:text-amber-400 transition-all"
          aria-label={isFavorite ? (language === 'hi' ? 'पसंदीदा से हटाएं' : 'Remove from favorites') : (language === 'hi' ? 'पसंदीदा में जोड़ें' : 'Add to favorites')}
        >
          {isFavorite ? (
            <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.38 8.411c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
          )}
        </button>
      )}
      <div className="flex-1 min-h-0 min-w-0 flex flex-col">
        <PremiumFeatureCard
          target={target}
          label={label}
          icon={icon}
          desc={desc}
          category={category}
          color={color}
          onClick={() => handleFeatureClick(target)}
          user={user}
          isPremium={isPremium}
          isSubscriptionOnly={isSubscriptionOnly}
          mustRead={mustRead}
          isFeatured={isFeatured}
          language={language}
        />
      </div>
    </div>
  );

  return (
    <>
      <TranslationProvider language={language}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[10000] focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-slate-900 focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400">
        {language === 'hi' ? 'मुख्य सामग्री पर जाएं' : 'Skip to main content'}
      </a>
    <div
      id="main-content"
      ref={scrollContainerRef}
      className="cosmicjyoti-scroll-container"
      style={{
        position: 'fixed',
        inset: 0,
        overflowY: 'auto',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y pan-x',
      }}
    >
      <div className="min-h-screen w-full min-h-full relative text-slate-200 selection:bg-amber-500/30">
      <StarBackground />
      <OfflineBanner isOnline={isOnline} language={language} />
      {showProfile && (
        <UserProfileModal 
          user={user}
          language={language} 
          onSave={(updatedUser) => {
            setUser(updatedUser);
            localStorage.setItem('cosmicjyoti_user', JSON.stringify(updatedUser));
          }} 
          onClose={() => setShowProfile(false)}
          onLogout={async () => {
            setUser(null);
            localStorage.removeItem('cosmicjyoti_user');
            localStorage.removeItem('cosmicjyoti_auth_token');
          }}
        />
      )}
      
      <HamburgerMenu
        isOpen={hamburgerOpen}
        onClose={() => setHamburgerOpen(false)}
        currentMode={mode}
        onNavigate={(m) => {
          setHamburgerOpen(false);
          if (['tarot', 'palm-reading', 'face-reading', 'numerology'].includes(m) && !isFeatureUnlocked(m)) {
            setAdWatchPurpose('premium');
            setAdWatchFeature(m);
            setShowAdWatchModal(true);
            return;
          }
          switchMode(m);
        }}
        language={language}
        onOpenProfile={() => { setShowProfile(true); setHamburgerOpen(false); }}
        user={user}
        onLogout={async () => {
          setUser(null);
          localStorage.removeItem('cosmicjyoti_user');
          localStorage.removeItem('cosmicjyoti_auth_token');
        }}
      />
      
      <AppDownloadModal
        isOpen={showAppDownloadModal}
        onClose={handleCloseAppDownloadModal}
        language={language}
      />
      {showKarmaStore && (
        <KarmaStore
          language={language}
          user={user}
          karmaBalance={karmaBalance}
          onEarnKarma={(amt) => { addKarma(amt); setKarmaBalance(getKarma()); }}
          onWatchAd={() => {
            setShowKarmaStore(false);
            setAdWatchPurpose('karma');
            setShowAdWatchModal(true);
          }}
          onClose={() => setShowKarmaStore(false)}
        />
      )}
      <AdWatchModal
        isOpen={showAdWatchModal}
        onClose={() => { setShowAdWatchModal(false); setAdWatchPurpose(null); setAdWatchFeature(null); setPendingKundaliAfterAd(null); }}
        onSuccess={() => {
          if (adWatchPurpose === 'karma') {
            addKarma(2);
            setKarmaBalance(getKarma());
            if (isCapacitor()) showInterstitialDelayed(1500);
          } else if (adWatchPurpose === 'chat') {
            addBonusMessages(1);
            setChatRefreshKey(k => k + 1);
            if (isCapacitor()) showInterstitialDelayed(2000);
          } else if (adWatchPurpose === 'chart-ad') {
            recordChartAdBonus();
            const toGenerate = pendingKundaliAfterAd;
            setPendingKundaliAfterAd(null);
            if (toGenerate) handleGenerateKundali(toGenerate);
            if (isCapacitor()) showInterstitialDelayed(1500);
          } else if (adWatchPurpose === 'premium' && adWatchFeature) {
            unlockFeature(adWatchFeature);
            switchMode(adWatchFeature as AppViewMode);
            if (isCapacitor()) showInterstitialDelayed(4000);
          }
          setShowAdWatchModal(false);
          setAdWatchPurpose(null);
          setAdWatchFeature(null);
        }}
        language={language}
        rewardDescription={adWatchPurpose === 'karma' 
          ? (language === 'hi' ? '+2 कर्मा अर्जित करें' : 'Earn +2 Karma')
          : adWatchPurpose === 'chat'
            ? (language === 'hi' ? '+1 अतिरिक्त संदेश' : '+1 bonus message')
            : adWatchPurpose === 'chart-ad'
              ? (language === 'hi' ? 'आज एक और कुंडली' : 'One more Kundali today')
              : adWatchPurpose === 'premium'
                ? (language === 'hi' ? '5 मिनट के लिए प्रीमियम सुविधा अनलॉक' : 'Unlock premium feature for 5 minutes')
                : undefined}
      />
      <ChatWidget 
        language={language} 
        context={kundaliData} 
        onUseKarma={() => karmaBalance > 0} 
        hasKarma={karmaBalance > 0} 
        onOpenStore={() => setShowKarmaStore(true)} 
        isPremium={false}
        onWatchAdForChat={() => {
          setAdWatchPurpose('chat');
          setShowAdWatchModal(true);
        }}
        refreshTrigger={chatRefreshKey}
      />
      {!isCapacitor() && <AddToHomeScreenBanner language={language} />}
      {mode === 'hub' && [3, 7, 30].includes(streakCount) && (
        <StreakRewardToast language={language} streakCount={streakCount} onClose={() => {}} />
      )}
      {showRemindToast && (
        <div className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[54] p-4 rounded-xl bg-amber-500/20 border border-amber-400/50 shadow-xl backdrop-blur-md flex items-center justify-between gap-3 animate-fade-in-up">
          <p className="text-sm text-amber-100">
            {language === 'hi' ? 'आज का राशिफल और पंचांग तैयार है।' : "Today's horoscope & Panchang are ready."}
          </p>
          <button onClick={() => setShowRemindToast(false)} className="p-1 rounded text-slate-400 hover:text-amber-200" aria-label="Close">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
      <header 
        className="fixed top-0 left-0 right-0 w-full z-[60] py-2 sm:py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-slate-900/95 border-b border-white/5 backdrop-blur-md"
        style={{ 
          paddingTop: 'max(1rem, calc(env(safe-area-inset-top) + 0.75rem))',
          paddingLeft: 'max(1rem, calc(env(safe-area-inset-left) + 0.75rem))',
          paddingRight: 'max(1rem, calc(env(safe-area-inset-right) + 0.75rem))',
          paddingBottom: '0.5rem',
        }}
      >
        <div className="flex items-center justify-between gap-2 min-h-[44px] w-full sm:w-auto sm:min-w-0">
          {/* Logo - collapses when search focused to give more space */}
          <div 
            className={`flex items-center gap-2 cursor-pointer touch-manipulation min-h-[44px] flex-shrink-0 overflow-hidden transition-all duration-300 ease-out ${
              searchFocused ? 'max-w-0 sm:max-w-0 opacity-0 sm:opacity-0' : 'max-w-[200px] sm:max-w-none opacity-100'
            }`}
            onClick={() => { setMode('hub'); setKundaliData(null); setSelectedSign(null); setHamburgerOpen(false); }}
          >
            <Logo className="w-8 h-8 sm:w-10 sm:h-10 animate-spin-slow shrink-0" />
            <span className="text-base sm:text-lg md:text-xl font-serif font-bold text-amber-100 hidden sm:block tracking-widest uppercase whitespace-nowrap">CosmicJyoti</span>
          </div>
          {/* Language dropdown + Translating indicator + Hamburger + Notif - always visible on mobile */}
          <div className="flex items-center gap-2 sm:hidden shrink-0">
            <div className="flex items-center gap-1.5">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                aria-label="Select language"
                className="min-h-[40px] pl-2 pr-7 py-1 text-xs font-bold rounded-lg border border-slate-700 bg-slate-800/80 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/30 appearance-none bg-no-repeat bg-[length:12px] bg-[right_6px_center]"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")" }}
              >
                {UI_LANGUAGES.map(({ code, label }) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
              <TranslationLoadingIndicator />
            </div>
            {mode === 'hub' && streakCount > 0 && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-semibold" title={language === 'hi' ? `${streakCount} दिन स्ट्रीक` : `${streakCount} day streak`}>
                <span>🔥</span>
                <span>{streakCount}</span>
              </div>
            )}
            <NotificationToggle language={language} />
            <button
              onClick={() => setHamburgerOpen(true)}
              className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl bg-slate-800/80 border border-slate-700 hover:border-amber-500/50 text-amber-400 transition-colors touch-manipulation active:scale-[0.98]"
              aria-label={language === 'hi' ? 'मेनू खोलें' : 'Open menu'}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        {/* Search bar - expands left when focused (logo collapses) */}
        <div className={`flex-1 min-w-0 transition-all duration-300 ease-out ${searchFocused ? 'sm:max-w-none' : 'sm:max-w-md'}`}>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 min-h-[44px] bg-slate-800/60 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 text-sm touch-manipulation"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-500 hover:text-slate-300 touch-manipulation"
                aria-label="Clear"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 shrink-0 ml-auto">
          {mode === 'hub' && streakCount > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-semibold">
              <span>🔥</span>
              <span>{streakCount}</span>
              <span>{language === 'hi' ? 'दिन स्ट्रीक' : 'day streak'}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              aria-label="Select language"
              className="min-h-[40px] pl-3 pr-8 py-2 text-xs font-bold rounded-lg border border-slate-700 bg-slate-800/80 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/30 appearance-none bg-no-repeat bg-[length:12px] bg-[right_8px_center] max-w-[180px]"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")" }}
            >
              {UI_LANGUAGES.map(({ code, label }) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
            <TranslationLoadingIndicator />
          </div>
          <a 
            href="/landing.html"
            className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-full hover:border-amber-500/50 transition-all text-[10px] font-bold uppercase tracking-widest text-amber-200 min-h-[44px] touch-manipulation"
          >
            Know More
          </a>
          <NotificationToggle language={language} />
          <button
            onClick={() => setHamburgerOpen(true)}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl bg-slate-800/80 border border-slate-700 hover:border-amber-500/50 text-amber-400 transition-colors touch-manipulation active:scale-[0.98]"
            aria-label={language === 'hi' ? 'मेनू खोलें' : 'Open menu'}
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      <main 
        className="relative z-10 w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 pb-20 sm:pb-24 md:pb-32"
        style={{ 
          paddingTop: 'max(7.5rem, calc(env(safe-area-inset-top) + 6rem))',
          paddingBottom: 'max(5rem, calc(env(safe-area-inset-bottom) + 4rem))',
        }}
      >
        {loading && !(mode === 'daily' && selectedSign) && (
          <div className="flex flex-col items-center justify-center py-32">
            <Logo className="w-24 h-24 animate-spin-slow" />
            <p className="text-amber-200 font-serif uppercase tracking-[0.3em] mt-6 animate-pulse">{t.loadingButton}</p>
          </div>
        )}
        
        {error && !loading && (
            <div className="max-w-md mx-auto mb-10 bg-red-900/20 border border-red-500/30 rounded-2xl p-6 text-center animate-fade-in">
                <p className="text-red-300 text-sm mb-4">{error}</p>
                <button onClick={() => setError(null)} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white underline">Dismiss</button>
            </div>
        )}

        {mode === 'kundali' && kundaliData && showReviewPrompt && isCapacitor() && (
          <div className="max-w-xl mx-auto mb-4 px-4 py-3 rounded-xl bg-amber-500/15 border border-amber-500/40 flex flex-wrap items-center justify-between gap-2">
            <span className="text-amber-200 text-sm">{language === 'hi' ? 'CosmicJyoti पसंद आया? Play Store पर रेट करें' : 'Enjoying CosmicJyoti? Rate us on Play Store'}</span>
            <div className="flex gap-2">
              <a {...getExternalLinkProps(PLAY_STORE_URL, language)} className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-900 text-xs font-bold">Rate us</a>
              <button type="button" onClick={() => { setShowReviewPrompt(false); trackReviewPromptDismissed(); }} className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs">Maybe later</button>
            </div>
          </div>
        )}

        {mode === 'hub' && !loading && (
          <div className="animate-fade-in-up space-y-10 md:space-y-14 pb-8">
            {/* Hero */}
            <div className="text-center space-y-2">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-white to-amber-200">CosmicJyoti</h2>
              <p className="text-slate-400 italic tracking-[0.3em] sm:tracking-[0.5em] uppercase text-xs">{t.subtitle}</p>
            </div>
            
            <ThoughtOfTheDay language={language} />

            {/* Favorites – quick access at top */}
            {favoriteModules.length > 0 && (
              <section className="animate-fade-in-up rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-5 md:p-6">
                <h3 className="text-sm font-serif font-bold text-amber-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span>⭐</span>
                  {language === 'hi' ? 'पसंदीदा' : 'Favorites'}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 items-stretch">
                  {favoriteModules.map((mode) => {
                    const m = getModuleByMode(mode);
                    if (!m) return null;
                    return (
                      <FeatureCard
                        key={mode}
                        target={m.mode}
                        label={language === 'hi' ? m.labelHi : m.labelEn}
                        icon={m.icon}
                        desc={language === 'hi' ? m.descHi : m.descEn}
                        category={language === 'hi' ? 'पसंदीदा' : 'Favorites'}
                        color="from-amber-500 to-orange-500"
                        isPremium={m.isPremium}
                        isFeatured={false}
                        isFavorite={true}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    );
                  })}
                </div>
              </section>
            )}

            <DashboardConsentBanner
              language={language}
              onAddBirthDetails={() => switchMode('kundali')}
              profileVersion={profileVersion}
            />

            <CheckTodayOnboardingHint language={language} />

            {/* Search results – show matching modules above "Check today" when user searches */}
            {searchQuery.trim() && (() => {
              const q = searchQuery.toLowerCase().trim();
              const searchMatches: { m: ModuleDef; cat: CategoryDef }[] = [];
              MODULE_CATEGORIES.forEach((cat) => {
                cat.modules.forEach((m) => {
                  if (m.labelEn.toLowerCase().includes(q) || m.labelHi.includes(q) || m.mode.toLowerCase().includes(q) || m.descEn.toLowerCase().includes(q) || m.descHi.includes(q) || cat.labelEn.toLowerCase().includes(q) || cat.labelHi.includes(q)) {
                    searchMatches.push({ m, cat });
                  }
                });
              });
              if (searchMatches.length === 0) return null;
              return (
                <section className="animate-fade-in-up mb-6">
                  <h3 className="text-sm font-serif font-bold text-amber-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>🔍</span>
                    {language === 'hi' ? 'खोज परिणाम' : 'Search results'}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {searchMatches.map(({ m, cat }) => (
                      <FeatureCard
                        key={m.mode}
                        target={m.mode}
                        label={language === 'hi' ? m.labelHi : m.labelEn}
                        icon={m.icon}
                        desc={language === 'hi' ? m.descHi : m.descEn}
                        category={language === 'hi' ? cat.labelHi : cat.labelEn}
                        color="from-amber-500 to-orange-500"
                        isPremium={m.isPremium}
                        isSubscriptionOnly={false}
                        isFeatured
                        isFavorite={favoriteModules.includes(m.mode)}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                </section>
              );
            })()}

            {/* Today – daily habit: Horoscope, Panchang, AI Articles */}
            <section className="animate-fade-in-up rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-5 md:p-6">
              <h3 className="text-sm font-serif font-bold text-amber-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>☀</span>
                {language === 'hi' ? 'आज देखें' : 'Check today'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => switchMode('daily')}
                  className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/80 border border-slate-600 hover:border-amber-500/50 text-left transition-all group"
                >
                  <span className="text-2xl">🌞</span>
                  <div className="min-w-0">
                    <span className="block font-semibold text-amber-100 group-hover:text-amber-200">{language === 'hi' ? 'राशिफल' : "Today's Horoscope"}</span>
                    <span className="text-xs text-slate-500">{language === 'hi' ? 'दैनिक भविष्यवाणी' : 'Daily predictions'}</span>
                  </div>
                </button>
                <button
                  onClick={() => switchMode('panchang')}
                  className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/80 border border-slate-600 hover:border-amber-500/50 text-left transition-all group"
                >
                  <span className="text-2xl">📅</span>
                  <div className="min-w-0">
                    <span className="block font-semibold text-amber-100 group-hover:text-amber-200">{language === 'hi' ? 'पंचांग' : "Today's Panchang"}</span>
                    <span className="text-xs text-slate-500">{language === 'hi' ? 'तिथि, मुहूर्त' : 'Tithi, Muhurat'}</span>
                  </div>
                </button>
                <button
                  onClick={() => switchMode('ai-blog')}
                  className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/80 border border-slate-600 hover:border-amber-500/50 text-left transition-all group"
                >
                  <span className="text-2xl">📝</span>
                  <div className="min-w-0">
                    <span className="block font-semibold text-amber-100 group-hover:text-amber-200">{language === 'hi' ? 'आज के लेख' : "Today's Articles"}</span>
                    <span className="text-xs text-slate-500">{language === 'hi' ? 'नए ज्योतिष लेख' : 'Fresh astrology reads'}</span>
                  </div>
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-600/50">
                <button
                  type="button"
                  onClick={async () => {
                    const url = typeof window !== 'undefined' ? (window.location.origin + (window.location.pathname || '/').replace(/\/?$/, '/')) : 'https://www.cosmicjyoti.com/';
                    const text = language === 'hi'
                      ? `आज अपना राशिफल देखें – CosmicJyoti (मुफ्त कुंडली, पंचांग)। ${url}`
                      : `Check your daily horoscope – CosmicJyoti (free Kundali & Panchang). ${url}`;
                    if (navigator.share) {
                      try { await navigator.share({ title: 'CosmicJyoti', text, url }); } catch (e) {
                        if ((e as Error).name !== 'AbortError') window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                      }
                    } else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-300 text-xs font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  {language === 'hi' ? "आज का राशिफल शेयर करें" : "Share today's horoscope"}
                </button>
              </div>
            </section>

            <TodaysOccultWidget language={language} onNavigate={switchMode} />

            {/* Daily Luck Score - KundaliCard style */}
            <section className="animate-fade-in-up">
              <DailyLuckScore
                language={language}
                onViewHoroscope={() => switchMode('daily')}
              />
            </section>

            {/* Daily Do's & Don'ts - Co-Star style */}
            <section className="animate-fade-in-up">
              <DailyDoDonts language={language} />
            </section>

            {/* Daily Forecast - personalized if Kundali saved, else CTA */}
            <section className="animate-fade-in-up bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-6 md:p-8">
              <h3 className="text-xl font-serif font-bold text-amber-200 mb-4 flex items-center gap-2">
                <span>🌞</span>
                {language === 'hi' ? 'दैनिक राशिफल' : 'Daily Forecast'}
              </h3>
              {savedKundaliCharts.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-slate-400 text-sm">
                    {language === 'hi' 
                      ? 'अपनी कुंडली के आधार पर व्यक्तिगत दैनिक भविष्यवाणी प्राप्त करें।'
                      : 'Get personalized daily predictions based on your Kundali (Lagna, Moon, Sun, Nakshatra).'}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {savedKundaliCharts.slice(0, 3).map((chart) => (
                      <button
                        key={chart.id || chart.name}
                        onClick={() => handleGetDaily(chart)}
                        className="px-5 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl transition-all active:scale-95"
                      >
                        {language === 'hi' ? `${chart.name} का राशिफल` : `Forecast for ${chart.name}`}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-400 text-sm">
                    {language === 'hi' 
                      ? 'व्यक्तिगत दैनिक राशिफल के लिए कृपया पहले अपनी कुंडली बनाएं। लग्न, चंद्र राशि, सूर्य राशि और नक्षत्र के आधार पर भविष्यवाणी मिलेगी।'
                      : 'For personalized daily forecast, please fill your Kundali details first. Predictions will be based on your Lagna, Moon Sign, Sun Sign, and Nakshatra.'}
                  </p>
                  <button
                    onClick={() => switchMode('kundali')}
                    className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl transition-all active:scale-95"
                  >
                    {language === 'hi' ? 'कुंडली बनाएं' : 'Create Kundali'}
                  </button>
                </div>
              )}
            </section>

            {/* Categorized modules - user-friendly sections */}
            {MODULE_CATEGORIES.map((cat, catIdx) => {
              const filteredModules = cat.modules.filter((m) => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase().trim();
                return m.labelEn.toLowerCase().includes(q) || m.labelHi.includes(q) || m.mode.toLowerCase().includes(q) || cat.labelEn.toLowerCase().includes(q) || cat.labelHi.includes(q);
              });
              if (filteredModules.length === 0) return null;
              const isPopular = cat.id === 'popular';
              return (
                <section key={cat.id} className="animate-fade-in-up" style={{ animationDelay: `${catIdx * 80}ms`, animationFillMode: 'both' }}>
                  {/* Category header */}
                  <div className={`flex items-center gap-3 mb-4 px-1 rounded-xl py-2 bg-gradient-to-r ${cat.color} border border-slate-700/30`}>
                    <span className="text-2xl">{cat.icon}</span>
                    <h3 className="text-sm font-serif font-bold text-amber-200 uppercase tracking-wider">
                      {language === 'hi' ? cat.labelHi : cat.labelEn}
                    </h3>
                    <div className="h-px flex-1 bg-slate-600/50 rounded-full"></div>
                  </div>
                  {/* Module grid - larger for Popular */}
                  <div className={`grid items-stretch ${isPopular ? 'grid-cols-2 sm:grid-cols-4 gap-4' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'}`}>
                    {filteredModules.map((m) => (
                      <FeatureCard
                        key={m.mode}
                        target={m.mode}
                        label={language === 'hi' ? m.labelHi : m.labelEn}
                        icon={m.icon}
                        desc={language === 'hi' ? m.descHi : m.descEn}
                        category={language === 'hi' ? cat.labelHi : cat.labelEn}
                        color={isPopular ? 'from-amber-500 to-orange-500' : 'from-amber-500 to-transparent'}
                        isPremium={m.isPremium}
                        isSubscriptionOnly={false}
                        isFeatured={isPopular}
                        isFavorite={favoriteModules.includes(m.mode)}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Guides – How to use our tools (SEO: keyword-rich content + internal links to tools) */}
            <section className="animate-fade-in-up mt-8" aria-label={language === 'hi' ? 'टूल गाइड' : 'Tool guides'}>
              <div className="flex items-center gap-3 mb-4 px-1 rounded-xl py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-slate-700/30">
                <span className="text-2xl">📖</span>
                <h3 className="text-sm font-serif font-bold text-amber-200 uppercase tracking-wider">
                  {language === 'hi' ? 'गाइड – टूल कैसे इस्तेमाल करें' : 'Guides – How to use our tools'}
                </h3>
                <div className="h-px flex-1 bg-slate-600/50 rounded-full" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 hover:border-amber-500/40 transition-colors">
                  <h4 className="font-serif font-bold text-amber-200 text-sm mb-1">{language === 'hi' ? 'साढ़े साती कैसे जांचें' : 'How to check Sade Sati by Moon sign'}</h4>
                  <p className="text-slate-400 text-xs mb-3">{language === 'hi' ? 'चंद्र राशि दर्ज करें या जन्म से ढूंढें। 12वाँ, 1ला, 2रा भाव तारीखें और AI व्याख्या मिलती है।' : 'Enter your Moon sign or find it from birth details. Get dates for 12th, 1st, 2nd house phase and AI interpretation.'}</p>
                  <button type="button" onClick={() => switchMode('sadesati-dasha')} className="text-amber-400 hover:text-amber-300 text-xs font-medium">{language === 'hi' ? 'साढ़े साती कैलकुलेटर खोलें' : 'Try Sade Sati calculator'}</button>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 hover:border-amber-500/40 transition-colors">
                  <h4 className="font-serif font-bold text-amber-200 text-sm mb-1">{language === 'hi' ? 'मुफ्त कुंडली कैसे बनाएं' : 'How to create your free Kundali'}</h4>
                  <p className="text-slate-400 text-xs mb-3">{language === 'hi' ? 'जन्म तारीख, समय और स्थान दर्ज करें। D1 व D9 चार्ट, ग्रह स्थिति और भविष्यवाणी मिलती है।' : 'Enter birth date, time and place. Get D1 & D9 chart, planetary positions and predictions.'}</p>
                  <button type="button" onClick={() => switchMode('kundali')} className="text-amber-400 hover:text-amber-300 text-xs font-medium">{language === 'hi' ? 'मुफ्त कुंडली खोलें' : 'Try free Kundali'}</button>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 hover:border-amber-500/40 transition-colors">
                  <h4 className="font-serif font-bold text-amber-200 text-sm mb-1">{language === 'hi' ? 'लाल किताब टोटके और उपाय' : 'Lal Kitab totkas and simple remedies'}</h4>
                  <p className="text-slate-400 text-xs mb-3">{language === 'hi' ? 'ग्रह या समस्या लिखें। सरल, अनुष्ठान-रहित टोटके मिलते हैं।' : 'Enter a planet or problem. Get simple, non-ritualistic totkas popular in North India.'}</p>
                  <button type="button" onClick={() => switchMode('lal-kitab')} className="text-amber-400 hover:text-amber-300 text-xs font-medium">{language === 'hi' ? 'लाल किताब खोलें' : 'Try Lal Kitab totkas'}</button>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 hover:border-amber-500/40 transition-colors">
                  <h4 className="font-serif font-bold text-amber-200 text-sm mb-1">{language === 'hi' ? 'आज का पंचांग देखें' : "Today's Panchang – tithi, nakshatra, muhurat"}</h4>
                  <p className="text-slate-400 text-xs mb-3">{language === 'hi' ? 'तिथि, नक्षत्र, योग, करण, सूर्योदय/अस्त और मुहूर्त।' : 'Tithi, nakshatra, yoga, karana, sunrise/sunset and muhurat.'}</p>
                  <button type="button" onClick={() => switchMode('panchang')} className="text-amber-400 hover:text-amber-300 text-xs font-medium">{language === 'hi' ? 'पंचांग खोलें' : 'Check today\'s Panchang'}</button>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 hover:border-amber-500/40 transition-colors">
                  <h4 className="font-serif font-bold text-amber-200 text-sm mb-1">{language === 'hi' ? 'गुण मिलान – विवाह मिलान' : 'Guna Milan – marriage compatibility'}</h4>
                  <p className="text-slate-400 text-xs mb-3">{language === 'hi' ? 'दोनों की जन्म तारीख से अष्टकूट गुण मिलान और स्कोर।' : 'Ashtakoot Guna Milan from both birth details. Get total score and guna breakdown.'}</p>
                  <button type="button" onClick={() => switchMode('matchmaking')} className="text-amber-400 hover:text-amber-300 text-xs font-medium">{language === 'hi' ? 'गुण मिलान खोलें' : 'Try Guna Milan'}</button>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 hover:border-amber-500/40 transition-colors">
                  <h4 className="font-serif font-bold text-amber-200 text-sm mb-1">{language === 'hi' ? 'प्रश्न कुंडली – प्रश्न के समय पर उत्तर' : 'Prashna Kundali – answer by question time'}</h4>
                  <p className="text-slate-400 text-xs mb-3">{language === 'hi' ? 'जन्म समय जरूरी नहीं। प्रश्न पूछने का समय दर्ज करें और उत्तर पाएं।' : 'No birth time needed. Enter when you asked the question and get an answer.'}</p>
                  <button type="button" onClick={() => switchMode('prashna-kundali')} className="text-amber-400 hover:text-amber-300 text-xs font-medium">{language === 'hi' ? 'प्रश्न कुंडली खोलें' : 'Try Prashna Kundali'}</button>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 hover:border-amber-500/40 transition-colors">
                  <h4 className="font-serif font-bold text-amber-200 text-sm mb-1">{language === 'hi' ? 'मोबाइल नंबर अंक ज्योतिष' : 'Mobile number numerology – phone luck'}</h4>
                  <p className="text-slate-400 text-xs mb-3">{language === 'hi' ? 'नंबर की कंपन और व्यवसाय/भाग्य पर प्रभाव। मुफ्त विश्लेषण।' : 'Phone number vibration and impact on business and luck. Free analysis.'}</p>
                  <button type="button" onClick={() => switchMode('mobile-numerology')} className="text-amber-400 hover:text-amber-300 text-xs font-medium">{language === 'hi' ? 'मोबाइल अंक ज्योतिष खोलें' : 'Try mobile numerology'}</button>
                </div>
              </div>
            </section>

            {/* How it works & FAQ – after modules, compact and attractive */}
            <section className="animate-fade-in-up mt-10">
              <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-slate-800/60 to-slate-900/60 overflow-visible shadow-xl">
                <div className="p-5 md:p-6 border-b border-slate-700/50">
                  <h3 className="text-base font-serif font-bold text-amber-200 flex items-center gap-2">
                    <span className="text-xl">✨</span>
                    {language === 'hi' ? 'यह कैसे काम करता है' : 'How it works'}
                  </h3>
                  <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                    {language === 'hi'
                      ? 'कुंडली, गुण मिलान, राशिफल और पंचांग – सही जन्म तारीख व समय दर्ज करें। मनोरंजन व शैक्षिक उद्देश्य के लिए; महत्वपूर्ण निर्णय के लिए कुशल ज्योतिषी से सलाह लें।'
                      : 'Kundali, Guna Milan, Horoscope & Panchang – enter correct birth details for accuracy. For entertainment and education; consult an astrologer for important decisions.'}
                  </p>
                </div>
                <div className="p-5 md:p-6">
                  <FAQSection language={language} inline compact />
                </div>
              </div>
            </section>
            
            <InviteFriendBanner language={language} karmaBalance={karmaBalance} onKarmaUpdate={() => setKarmaBalance(getKarma())} />

            {/* Search no results */}
            {searchQuery.trim() && !MODULE_CATEGORIES.some((cat) =>
              cat.modules.some((m) => {
                const q = searchQuery.toLowerCase().trim();
                return m.labelEn.toLowerCase().includes(q) || m.labelHi.includes(q) || m.mode.toLowerCase().includes(q) || cat.labelEn.toLowerCase().includes(q) || cat.labelHi.includes(q);
              })
            ) && (
              <div className="text-center py-12 px-4">
                <p className="text-slate-500 text-sm mb-2">
                  {t.searchNoResults}
                </p>
                <p className="text-slate-600 text-xs">
                  {t.searchHint}
                </p>
              </div>
            )}

            <div className="py-4">
              <AdBanner variant="multiplex" />
            </div>
          </div>
        )}

        {mode === 'daily' && (
          !selectedSign ? (
            <ZodiacGrid onSelect={handleSelectSign} language={language} />
          ) : horoscopeData && selectedSign ? (
            <HoroscopeCard data={horoscopeData} sign={selectedSign} language={language} personalizedName={dailyForecastPersonalizedName} onBack={() => {setSelectedSign(null); setHoroscopeData(null); setDailyForecastPersonalizedName(null); setError(null); setMode('hub');}}  />
          ) : (
            <div className="animate-fade-in space-y-6 max-w-md mx-auto px-4 py-12 text-center">
              {loading ? (
                <>
                  <Logo className="w-16 h-16 mx-auto animate-spin-slow" />
                  <p className="text-amber-200 font-serif uppercase tracking-[0.2em] animate-pulse">{t.loadingButton}</p>
                </>
              ) : (
                <>
                  <p className="text-slate-400">{language === 'hi' ? 'राशिफल लोड नहीं हुआ। पुनः प्रयास करें।' : 'Horoscope could not load. Please try again.'}</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => selectedSign && handleSelectSign(selectedSign)}
                      className="px-6 py-3 bg-amber-600/80 hover:bg-amber-500/80 text-white font-bold rounded-xl transition-colors"
                    >
                      {language === 'hi' ? 'पुनः प्रयास करें' : 'Retry'}
                    </button>
                    <button
                      onClick={() => { setSelectedSign(null); setHoroscopeData(null); setError(null); setMode('hub'); }}
                      className="px-6 py-3 border border-slate-600 text-slate-300 hover:text-white rounded-xl transition-colors"
                    >
                      {language === 'hi' ? 'वापस जाएं' : 'Go Back'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )
        )}
        {mode === 'kundali' && (kundaliData ? <KundaliResult data={kundaliData} name={kundaliFormData?.name || 'Seeker'} formInput={kundaliFormData ? { name: kundaliFormData.name, date: kundaliFormData.date, time: kundaliFormData.time, location: kundaliFormData.location } : undefined} language={language} onBack={() => { setKundaliData(null); setKundaliFormData(null); loadSavedKundaliCharts(); }}  /> : <KundaliForm onSubmit={handleGenerateKundali} isLoading={loading} language={language} savedCharts={savedKundaliCharts} onLoadChart={handleLoadChart} onDeleteChart={handleDeleteChart} onGetDaily={handleGetDaily} />)}
        {mode === 'panchang' && panchangData && <DailyPanchang data={panchangData} language={language} onBack={() => { setPanchangData(null); setMode('hub'); }} formInput={{ date: panchangData.date, location: panchangData.location }} />}
        {mode === 'mantra' && <MantraLab language={language} />}
        {mode === 'rudraksh' && <RudrakshLab language={language} />}
        {mode === 'yantra' && <YantraLab language={language} />}
        {mode === 'dreams' && <DreamInterpreter language={language} />}
        {mode === 'vastu' && (
          <VastuLab
            language={language}
            onUseKarma={() => karmaBalance > 0}
            hasKarma={karmaBalance > 0}
            onOpenStore={() => setShowKarmaStore(true)}
            onWatchAdForChat={() => { setAdWatchPurpose('chat'); setShowAdWatchModal(true); }}
            chatRefreshTrigger={chatRefreshKey}
          />
        )}
        {mode === 'gemstones' && <GemstoneLab language={language} />}
        {mode === 'cosmic-health' && <CosmicHealthAI language={language} />}
        {mode === 'palm-reading' && <PalmReading language={language} />}
        {mode === 'ashta-siddhis' && <AshtaSiddhis language={language} onBack={() => setMode('hub')} />}
        {mode === 'rasa-shastra' && <RasaShastra language={language} onBack={() => setMode('hub')} />}
        {mode === 'sadesati-dasha' && <SadesatiDashaCalculator language={language} onBack={() => setMode('hub')} />}
        {mode === 'about' && <AboutUs language={language} onBack={() => setMode('hub')} />}
        {mode === 'contact' && <ContactUs language={language} onBack={() => setMode('hub')} />}
        {mode === 'face-reading' && <FaceReading language={language} />}
        {mode === 'tarot' && <TarotReading language={language}  />}
        {mode === 'numerology' && <Numerology language={language} />}
        {mode === 'loshu' && <LoshuGrid language={language} />}
        {mode === 'i-ching' && <IChing language={language} />}
        {mode === 'runes' && <Runes language={language} />}
        {mode === 'signature' && <SignatureAnalysis language={language} />}
        {mode === 'learning' && <LearningCenter language={language} />}
        {mode === 'planets-houses' && <PlanetsHouses language={language} />}
        {mode === 'zodiac-signs' && <ZodiacSignsGuide language={language} />}
        {mode === 'nakshatra-library' && <NakshatraLibrary language={language} />}
        {mode === 'kundali-basics' && <KundaliBasics language={language} />}
        {mode === 'palmistry-guide' && <PalmistryGuide language={language} />}
        {mode === 'numerology-guide' && <NumerologyGuide language={language} />}
        {mode === 'star-legends' && <StarLegends language={language} />}
        {mode === 'ai-blog' && (
          <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-8 h-8 border-2 border-amber-500/50 border-t-amber-400 rounded-full animate-spin" /></div>}>
            <DailyAIBlog language={language} onBack={() => setMode('hub')} onTryModule={(m) => { const mode = (m || '').toLowerCase().trim() as AppViewMode; if (mode && VALID_APP_MODES.includes(mode)) switchMode(mode); }} />
          </React.Suspense>
        )}
        {mode === 'compatibility' && <CompatibilityTab language={language}  />}
        {mode === 'muhurat' && <MuhuratLab language={language} onBack={() => setMode('hub')} />}
        {mode === 'matchmaking' && <MatchMaking language={language} />}
        {mode === 'games' && <AstroGames language={language} />}
        {mode === 'appointment' && <BookAppointment language={language} onBack={() => setMode('hub')} />}
        {mode === 'varshphal' && <Varshphal language={language} onBack={() => setMode('hub')} />}
        {mode === 'name-suggestions' && <NameSuggestions language={language} onBack={() => setMode('hub')} />}
        {mode === 'upay' && <UpayRemedies language={language} onBack={() => setMode('hub')} />}
        {mode === 'disha' && <Disha language={language} onBack={() => setMode('hub')} />}
        {mode === 'birthstone' && <BirthstoneByDob language={language} onBack={() => setMode('hub')} onOpenGemstones={() => setMode('gemstones')} />}
        {mode === 'lal-kitab' && <LalKitab language={language} onBack={() => setMode('hub')} />}
        {mode === 'prashna-kundali' && <PrashnaKundali language={language} onBack={() => setMode('hub')} />}
        {mode === 'mobile-numerology' && <MobileNumerology language={language} onBack={() => setMode('hub')} />}
        
        {mode !== 'hub' && !loading && (
          <button onClick={() => {setMode('hub'); setError(null);}} className="mt-12 mx-auto flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 hover:text-amber-400 uppercase tracking-[0.4em] bg-slate-900/50 px-10 py-3 rounded-full border border-slate-800 transition-all shadow-lg">
            {t.return}
          </button>
        )}
      </main>

      <footer className="relative z-10 bg-gradient-to-b from-slate-900/95 to-slate-950/95 border-t border-amber-500/20 backdrop-blur-xl py-12 sm:py-16 px-4 sm:px-6 mb-24 md:mb-32">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5 pointer-events-none"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 mb-8 sm:mb-12">
            {/* Brand Section */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Logo className="w-10 h-10 sm:w-12 sm:h-12 animate-spin-slow" />
                <span className="text-xl sm:text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 tracking-widest uppercase">CosmicJyoti</span>
              </div>
              <p className="text-slate-400 text-sm sm:text-base max-w-sm italic leading-relaxed">{t.footer}</p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <a 
                  href="/landing.html"
                  className="group inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold text-xs sm:text-sm uppercase tracking-widest border-b-2 border-amber-500/30 pb-1 hover:border-amber-400 transition-all"
                >
                  <span>Know More</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                {!isCapacitor() && (
                  <a 
                    {...getExternalLinkProps(PLAY_STORE_URL, language)}
                    className="group inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold text-xs sm:text-sm uppercase tracking-widest border-b-2 border-amber-500/30 pb-1 hover:border-amber-400 transition-all"
                  >
                    <span>📱</span>
                    <span>{language === 'hi' ? 'ऐप डाउनलोड करें' : 'Download App'}</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links Section */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
              <h3 className="text-amber-300 font-serif font-bold text-base sm:text-lg uppercase tracking-wider mb-2">Quick Links</h3>
              <div className="flex flex-col gap-3">
                <button type="button" onClick={() => switchMode('about')} className="group inline-flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors text-sm sm:text-base text-left">
                  <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {language === 'hi' ? 'हमारे बारे में' : 'About Us'}
                </button>
                <button type="button" onClick={() => switchMode('contact')} className="group inline-flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors text-sm sm:text-base text-left">
                  <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {language === 'hi' ? 'संपर्क करें' : 'Contact Us'}
                </button>
                <a 
                  href="/privacy-policy.html" 
                  className="group inline-flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Privacy Policy
                </a>
                <a 
                  href="/terms-of-service.html" 
                  className="group inline-flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Terms of Service
                </a>
              </div>
            </div>

            {/* Contact & Social Section */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
              <h3 className="text-amber-300 font-serif font-bold text-base sm:text-lg uppercase tracking-wider mb-2">Connect With Us</h3>
              <div className="flex gap-4 sm:gap-6 mb-4">
                <a 
                  {...getExternalLinkProps("https://www.linkedin.com/in/nikeshmaurya/", language)} 
                  className="group w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-slate-800/50 border border-slate-700 hover:border-blue-400 hover:bg-blue-500/10 transition-all"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-hover:text-blue-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a 
                  {...getExternalLinkProps("https://www.youtube.com/@NikeshMaurya", language)} 
                  className="group w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-slate-800/50 border border-slate-700 hover:border-red-400 hover:bg-red-500/10 transition-all"
                  aria-label="YouTube"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-hover:text-red-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a 
                  {...getExternalLinkProps("https://www.instagram.com/cosmicjyoti.ai", language)} 
                  className="group w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-slate-800/50 border border-slate-700 hover:border-pink-400 hover:bg-pink-500/10 transition-all"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-hover:text-pink-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-700/50 backdrop-blur-sm w-full max-w-xs space-y-2.5 sm:space-y-3 text-left">
                <div className="flex items-start gap-2 text-slate-400 text-xs sm:text-sm">
                  <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <a {...getExternalLinkProps("https://www.cosmicjyoti.com/", language)} className="text-blue-400 hover:text-blue-300 transition-colors hover:underline break-all">www.cosmicjyoti.com</a>
                </div>
                <div className="flex items-start gap-2 text-slate-400 text-xs sm:text-sm">
                  <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:+919326715739" className="text-blue-400 hover:text-blue-300 transition-colors hover:underline whitespace-nowrap">+91 9326715739</a>
                </div>
                <div className="flex items-start gap-2 text-slate-400 text-xs sm:text-sm">
                  <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:consultcosmicjyoti@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors hover:underline break-all">consultcosmicjyoti@gmail.com</a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800/50 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
              <p className="text-slate-500 text-[10px] sm:text-xs uppercase tracking-widest">
                © 2025 CosmicJyoti Team. All rights reserved.
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4 justify-center text-[9px] sm:text-xs text-slate-600">
                <a href="/privacy-policy.html" className="hover:text-amber-400 transition-colors px-2 py-1 rounded hover:bg-amber-500/10">Privacy Policy</a>
                <span className="text-slate-700">•</span>
                <a href="/terms-of-service.html" className="hover:text-amber-400 transition-colors px-2 py-1 rounded hover:bg-amber-500/10">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
      </TranslationProvider>
    </>
  );
};

export default App;
