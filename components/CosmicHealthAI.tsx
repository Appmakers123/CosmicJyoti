import React, { useState, useEffect } from 'react';
import { useTranslation } from '../utils/translations';
import { Language } from '../types';
import { getGlobalProfile } from '../utils/profileStorageService';
import { generateChartBasedHealthAnalysis, HealthRemedy, ChartHealthAnalysis } from '../services/healthService';
import Logo from './Logo';
import { getCachedAI, setCachedAI } from '../utils/aiCacheService';

interface CosmicHealthAIProps {
  language: Language;
}

interface BirthData {
  date: string;
  time: string;
  city: string;
  lat?: number;
  lon?: number;
}

const COMMON_LOCATIONS = [
  'New Delhi, India', 'Mumbai, India', 'Bangalore, India', 'Chennai, India', 'Kolkata, India',
  'Hyderabad, India', 'Pune, India', 'Ahmedabad, India', 'Jaipur, India', 'Lucknow, India',
  'Patna, India', 'Indore, India', 'Bhopal, India', 'Chandigarh, India', 'Varanasi, India',
  'New York, USA', 'Los Angeles, USA', 'London, UK', 'Manchester, UK', 'Toronto, Canada',
  'Vancouver, Canada', 'Dubai, UAE', 'Singapore', 'Sydney, Australia', 'Melbourne, Australia',
  'Lagos, Nigeria', 'Nairobi, Kenya', 'Johannesburg, South Africa', 'Cairo, Egypt',
  'Tokyo, Japan', 'Hong Kong, China', 'Paris, France', 'Berlin, Germany',
  'Amsterdam, Netherlands', 'Madrid, Spain', 'Rome, Italy', 'Moscow, Russia', 'São Paulo, Brazil',
  'Mexico City, Mexico', 'Buenos Aires, Argentina', 'Dhaka, Bangladesh', 'Karachi, Pakistan',
  'Colombo, Sri Lanka', 'Kathmandu, Nepal'
];

const CosmicHealthAI: React.FC<CosmicHealthAIProps> = ({ language }) => {
  const t = useTranslation(language);
  const [step, setStep] = useState<'splash' | 'birth' | 'remedies' | 'settings'>('splash');
  const [notifEnabled, setNotifEnabled] = useState(() => localStorage.getItem('cosmic_notifications') === 'true');

  const handleNotifySub = () => {
    localStorage.setItem('cosmic_notifications', 'true');
    setNotifEnabled(true);
    const msg = language === 'hi'
      ? 'सदस्यता सफल! आप कॉस्मिक हेल्थ, राशिफल और दैनिक पूर्वानुमान के लिए अपडेट प्राप्त करेंगे।'
      : 'Subscribed! You will receive updates for Cosmic Health, Horoscope & Daily Forecast.';
    alert(msg);
  };
  const [birthData, setBirthData] = useState<BirthData>({ date: '', time: '12:00', city: '' });
  const [loading, setLoading] = useState(false);
  const [healthAnalysis, setHealthAnalysis] = useState<ChartHealthAnalysis | null>(null);
  const [selectedModel, setSelectedModel] = useState<'cloud' | 'nano'>('cloud');
  const [showMandala, setShowMandala] = useState(true);

  // Pre-fill birth data from global profile on mount
  useEffect(() => {
    const profile = getGlobalProfile();
    if (profile?.self && (profile.self.date || profile.self.location)) {
      const s = profile.self;
      setBirthData(prev => ({
        date: s.date || prev.date,
        time: s.time || prev.time,
        city: s.location || prev.city,
      }));
    }
  }, []);

  // Animated mandala loader for splash
  useEffect(() => {
    if (step === 'splash') {
      const timer = setTimeout(() => {
        setShowMandala(false);
        setTimeout(() => setStep('birth'), 500);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleBirthSubmit = () => {
    if (!birthData.date?.trim() || !birthData.time?.trim() || !birthData.city?.trim()) {
      alert(language === 'hi' ? 'कृपया सभी फ़ील्ड भरें' : 'Please fill all fields');
      return;
    }
    const dateObj = new Date(birthData.date);
    if (isNaN(dateObj.getTime())) {
      alert(language === 'hi' ? 'कृपया मान्य जन्म तिथि दर्ज करें' : 'Please enter a valid date of birth');
      return;
    }
    loadHealthAnalysis();
  };

  const loadHealthAnalysis = async () => {
    const cacheInput = { date: birthData.date, time: birthData.time, city: birthData.city, lang: language };
    const cached = getCachedAI<ChartHealthAnalysis>('cosmicHealth', cacheInput);
    if (cached) {
      setHealthAnalysis(cached);
      setStep('remedies');
      return;
    }
    setLoading(true);
    try {
      const analysis = await generateChartBasedHealthAnalysis(birthData, language);
      setCachedAI('cosmicHealth', cacheInput, analysis);
      setHealthAnalysis(analysis);
      setStep('remedies');
    } catch (error) {
      alert(language === 'hi' ? 'स्वास्थ्य विश्लेषण लोड करने में त्रुटि' : 'Error loading health analysis');
    } finally {
      setLoading(false);
    }
  };

  const exportRemediesToPDF = () => {
    if (!healthAnalysis || healthAnalysis.remedies.length === 0) return;
    const remedies = healthAnalysis.remedies;
    
    // Create printable content
    const content = remedies.map((remedy) => {
      const items = Array.isArray(remedy.remedies) ? remedy.remedies : [];
      return `
        <div style="page-break-after: always; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #9333ea; font-size: 24px; margin-bottom: 10px;">${remedy.dosha || ''}</h2>
          <p style="color: #666; margin-bottom: 15px;">${remedy.description || ''}</p>
          <h3 style="color: #9333ea; font-size: 18px; margin-bottom: 10px;">${language === 'hi' ? 'उपाय' : 'Remedies'}</h3>
          <ul style="color: #333; line-height: 1.8;">
            ${items.map((r) => `<li>${String(r)}</li>`).join('')}
          </ul>
        </div>
      `;
    }).join('');

    const printWindow = window.open('', '_blank');
    if (printWindow && printWindow.document) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${language === 'hi' ? 'दैनिक दोष उपाय' : 'Daily Dosha Remedies'}</title>
            <style>
              @media print {
                @page { margin: 1cm; }
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            <h1 style="text-align: center; color: #9333ea; margin-bottom: 30px;">
              ${language === 'hi' ? 'कॉस्मिक हेल्थ AI - दैनिक उपाय' : 'CosmicHealth AI - Daily Remedies'}
            </h1>
            ${content}
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        try {
          if (printWindow && !printWindow.closed) printWindow.print();
        } catch (e) {
          console.warn('[CosmicHealth] Print failed:', e);
        }
      }, 250);
    }
  };

  // Splash Screen with Animated Mandala
  if (step === 'splash') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-950 via-slate-900 to-purple-950 px-4">
        <div className="flex flex-col items-center gap-8 sm:gap-12">
          {showMandala && (
            <div className="relative flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
              <Logo className="w-full h-full animate-spin-slow text-purple-400" />
              <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full animate-ping pointer-events-none"></div>
            </div>
          )}
          <div className="text-center flex flex-col gap-2 min-h-[120px]">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-amber-300 to-purple-300">
              {language === 'hi' ? 'कॉस्मिक हेल्थ AI' : 'CosmicHealth AI'}
            </h1>
            <p className="text-purple-200 text-base sm:text-lg animate-pulse">
              {language === 'hi' ? 'वैदिक स्वास्थ्य सलाहकार' : 'Vedic Health Advisor'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Birth Input Form
  if (step === 'birth') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-purple-950 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-amber-300 to-purple-300 mb-2">
              {language === 'hi' ? 'जन्म विवरण दर्ज करें' : 'Enter Birth Details'}
            </h2>
            <p className="text-purple-200 text-sm">
              {language === 'hi' ? 'सटीक स्वास्थ्य सलाह के लिए' : 'For accurate health advice'}
            </p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-sm border-2 border-purple-500/50 rounded-2xl p-6 md:p-8 space-y-6">
            <div>
              <label className="block text-amber-300 font-bold text-sm uppercase tracking-widest mb-2">
                {language === 'hi' ? 'जन्म तिथि' : 'Date of Birth'}
              </label>
              <input
                type="date"
                value={birthData.date}
                onChange={(e) => setBirthData({ ...birthData, date: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            <div>
              <label className="block text-amber-300 font-bold text-sm uppercase tracking-widest mb-2">
                {language === 'hi' ? 'जन्म समय' : 'Birth Time'}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="time"
                  value={birthData.time}
                  onChange={(e) => setBirthData({ ...birthData, time: e.target.value })}
                  className="flex-1 px-4 py-3 bg-slate-800 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                />
                <div className="text-xs text-purple-300">
                  {language === 'hi' ? '24 घंटे प्रारूप' : '24hr format'}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-amber-300 font-bold text-sm uppercase tracking-widest mb-2">
                {language === 'hi' ? 'शहर / जन्म स्थान' : 'City / Birth place'}
              </label>
              <input
                type="text"
                list="cosmic-health-locations"
                value={birthData.city}
                onChange={(e) => setBirthData({ ...birthData, city: e.target.value })}
                placeholder={t.pobPlaceholder || 'City, Country (e.g. Mumbai, London, Lagos...)'}
                className="w-full px-4 py-3 bg-slate-800 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                autoComplete="off"
              />
              <datalist id="cosmic-health-locations">
                {COMMON_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
              <p className="text-xs text-purple-300/80 mt-1.5">
                {t.locationOrEnterHint || 'Pick from list or type any city, country'}
              </p>
            </div>

            <button
              onClick={handleBirthSubmit}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 disabled:opacity-70 disabled:cursor-wait rounded-lg font-bold text-white uppercase tracking-widest text-sm transition-all shadow-lg hover:shadow-purple-500/50"
            >
              {loading ? (language === 'hi' ? 'लोड हो रहा है...' : 'Loading...') : (language === 'hi' ? 'शुरू करें' : 'Start Consultation')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Remedies List
  if (step === 'remedies') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-purple-950 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {!notifEnabled && (
            <div className="mb-4 bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔔</span>
                <div>
                  <h4 className="text-purple-200 font-bold text-xs uppercase tracking-wider">
                    {language === 'hi' ? 'दैनिक अलर्ट' : 'Daily Alerts'}
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    {language === 'hi' ? 'कॉस्मिक हेल्थ, राशिफल, टैरो के लिए सूचनाएं' : 'Notifications for Cosmic Health, Horoscope & Tarot'}
                  </p>
                </div>
              </div>
              <button onClick={handleNotifySub} className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all">
                {language === 'hi' ? 'सदस्यता लें' : 'Subscribe'}
              </button>
            </div>
          )}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-amber-300">
              {language === 'hi' ? 'स्वास्थ्य विश्लेषण और उपाय' : 'Health Analysis & Remedies'}
            </h2>
            <div className="flex gap-2">
              {healthAnalysis && healthAnalysis.remedies.length > 0 && (
                <button
                  onClick={exportRemediesToPDF}
                  className="px-4 py-2 bg-amber-600/50 hover:bg-amber-600 rounded-lg text-xs font-bold text-white uppercase tracking-widest"
                >
                  📄 {language === 'hi' ? 'PDF' : 'PDF'}
                </button>
              )}
              <button
                onClick={() => setStep('settings')}
                className="px-4 py-2 bg-purple-600/50 hover:bg-purple-600 rounded-lg text-xs font-bold text-white uppercase tracking-widest"
              >
                ⚙️
              </button>
            </div>
          </div>

          {/* Health Issues Section */}
          {healthAnalysis && (healthAnalysis.healthIssues?.length > 0 || healthAnalysis.chartSummary) && (
            <div className="mb-8 bg-slate-900/80 backdrop-blur-sm border-2 border-amber-500/50 rounded-xl p-6">
              <h3 className="text-xl font-serif font-bold text-amber-300 mb-4 flex items-center gap-2">
                <span>🏥</span>
                {language === 'hi' ? 'आपके चार्ट के अनुसार स्वास्थ्य संकेत' : 'Health Issues as per Your Chart'}
              </h3>
              {healthAnalysis.chartSummary && (
                <p className="text-purple-200 text-sm mb-4">{healthAnalysis.chartSummary}</p>
              )}
              {healthAnalysis.healthIssues?.length > 0 && (
                <ul className="list-disc list-inside text-purple-100 space-y-2">
                  {healthAnalysis.healthIssues.map((issue, i) => (
                    <li key={i} className="text-sm">{issue}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!healthAnalysis || healthAnalysis.remedies.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <button
                  onClick={loadHealthAnalysis}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 rounded-lg font-bold text-white uppercase tracking-widest"
                >
                  {language === 'hi' ? 'विश्लेषण लोड करें' : 'Load Analysis'}
                </button>
              </div>
            ) : (
              healthAnalysis.remedies.map((remedy, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/80 backdrop-blur-sm border-2 border-purple-500/50 rounded-xl p-6 hover:border-purple-500 transition-all"
                >
                  <h3 className="text-xl font-serif font-bold text-amber-300 mb-2">{remedy.dosha}</h3>
                  <p className="text-purple-200 text-sm mb-4">{remedy.description}</p>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-purple-300 uppercase tracking-widest">
                      {language === 'hi' ? 'उपाय' : 'Remedies'}
                    </h4>
                    <ul className="list-disc list-inside text-sm text-purple-100 space-y-1">
                      {(Array.isArray(remedy.remedies) ? remedy.remedies : []).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            )}
          </div>

          <p className="mt-6 text-xs text-slate-500 text-center">
            {language === 'hi'
              ? '⚠️ यह वैदिक ज्योतिष पर आधारित मार्गदर्शन है। गंभीर स्वास्थ्य समस्याओं के लिए कृपया योग्य चिकित्सक से परामर्श लें।'
              : '⚠️ This is Vedic astrology-based guidance. Please consult a qualified medical professional for serious health concerns.'}
          </p>
        </div>
      </div>
    );
  }

  // Settings
  if (step === 'settings') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-purple-950 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-amber-300">
              {language === 'hi' ? 'सेटिंग्स' : 'Settings'}
            </h2>
            <button
              onClick={() => setStep('remedies')}
              className="px-4 py-2 bg-purple-600/50 hover:bg-purple-600 rounded-lg text-xs font-bold text-white uppercase tracking-widest"
            >
              {language === 'hi' ? 'वापस' : 'Back'}
            </button>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-sm border-2 border-purple-500/50 rounded-2xl p-6 space-y-6">
            <div>
              <label className="block text-amber-300 font-bold text-sm uppercase tracking-widest mb-2">
                {language === 'hi' ? 'भाषा' : 'Language'}
              </label>
              <select className="w-full px-4 py-3 bg-slate-800 border border-purple-500/30 rounded-lg text-white">
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
              </select>
            </div>

            <div>
              <label className="block text-amber-300 font-bold text-sm uppercase tracking-widest mb-2">
                {language === 'hi' ? 'मॉडल' : 'Model'}
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedModel('cloud')}
                  className={`flex-1 py-3 rounded-lg font-bold uppercase tracking-widest text-sm transition-all ${
                    selectedModel === 'cloud'
                      ? 'bg-gradient-to-r from-purple-600 to-amber-600 text-white'
                      : 'bg-slate-800 text-purple-300 border border-purple-500/30'
                  }`}
                >
                  {language === 'hi' ? 'क्लाउड' : 'Cloud'}
                </button>
                <button
                  onClick={() => setSelectedModel('nano')}
                  className={`flex-1 py-3 rounded-lg font-bold uppercase tracking-widest text-sm transition-all ${
                    selectedModel === 'nano'
                      ? 'bg-gradient-to-r from-purple-600 to-amber-600 text-white'
                      : 'bg-slate-800 text-purple-300 border border-purple-500/30'
                  }`}
                >
                  {language === 'hi' ? 'नैनो (ऑफलाइन)' : 'Nano (Offline)'}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-purple-500/30">
              <a
                href="/privacy-policy.html"
                className="text-purple-300 hover:text-amber-300 text-sm underline"
              >
                {language === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy'}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CosmicHealthAI;
