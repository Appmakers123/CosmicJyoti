import React, { useState, useEffect } from 'react';
import { useTranslation } from '../utils/translations';
import { getExternalLinkProps } from '../utils/linkHandler';
import { setErrorSafely } from '../utils/errorHandler';
import { Language, NumerologyInput, NumerologyResponse } from '../types';
import { getGlobalProfile } from '../utils/profileStorageService';
import { calculateLifePath, calculateDestiny, calculateSoulUrge, calculatePersonality, calculateBirthday, calculatePersonalYear, calculatePersonalMonth } from '../utils/numerologyUtils';
import { generateNumerologyReport } from '../services/geminiService';
import { isCapacitor } from '../utils/linkHandler';
import admobService from '../services/admobService';
import AdBanner from './AdBanner';
import RichText from './RichText';
import { ModuleIntro } from './common';
import { getCachedAI, setCachedAI } from '../utils/aiCacheService';

type LuckStatus = 'Very Lucky' | 'Lucky' | 'Neutral' | 'Avoid' | '-';

interface NumberGuide {
  number: number;
  status: LuckStatus;
}

const LIFE_PATH_LUCK_MAP: { [key: number]: { very_lucky: number[]; lucky: number[]; neutral: number[]; avoid: number[] } } = {
  1: { very_lucky: [1, 4, 7], lucky: [9], neutral: [5], avoid: [2, 6, 8, 3] },
  2: { very_lucky: [2, 8], lucky: [7], neutral: [4], avoid: [1, 5, 9, 3, 6] },
  3: { very_lucky: [3, 6, 9], lucky: [1, 5], neutral: [2, 4, 7], avoid: [8] },
  4: { very_lucky: [1, 4, 7], lucky: [8], neutral: [2, 6], avoid: [3, 5, 9] },
  5: { very_lucky: [5, 1, 3], lucky: [6], neutral: [4, 8], avoid: [2, 7, 9] },
  6: { very_lucky: [3, 6, 9], lucky: [5], neutral: [4, 8], avoid: [1, 2, 7] },
  7: { very_lucky: [1, 4, 7], lucky: [2], neutral: [3, 9], avoid: [5, 6, 8] },
  8: { very_lucky: [2, 8], lucky: [4], neutral: [1, 5], avoid: [3, 6, 7, 9] },
  9: { very_lucky: [3, 6, 9], lucky: [1, 5], neutral: [2, 7], avoid: [4, 8] },
};

const LIFE_PATH_META: { [key: number]: { days: string[]; colors: [string, string][]; gemstones: string[] } } = {
  1: { days: ["Sunday", "Monday"], colors: [["Red", "#FF0000"], ["Gold", "#FFD700"], ["Orange", "#FF8C00"]], gemstones: ["Ruby", "Red Garnet"] },
  2: { days: ["Monday", "Thursday"], colors: [["White", "#FFFFFF"], ["Cream", "#FFFDD0"], ["Light Blue", "#ADD8E6"]], gemstones: ["Pearl", "Moonstone"] },
  3: { days: ["Thursday", "Friday", "Sunday"], colors: [["Yellow", "#FFFF00"], ["Pink", "#FFC0CB"], ["Blue", "#0000FF"], ["Purple", "#800080"]], gemstones: ["Yellow Sapphire", "Amethyst"] },
  4: { days: ["Saturday", "Sunday"], colors: [["Blue", "#1E90FF"], ["Grey", "#808080"], ["Dark Green", "#006400"]], gemstones: ["Hessonite", "Emerald"] },
  5: { days: ["Wednesday", "Friday"], colors: [["Green", "#008000"], ["Light Brown", "#A52A2A"], ["Silver", "#C0C0C0"]], gemstones: ["Emerald", "Peridot"] },
  6: { days: ["Friday", "Tuesday"], colors: [["Pink", "#FFC0CB"], ["Sky Blue", "#87CEEB"], ["Cream", "#FFFDD0"]], gemstones: ["Diamond", "Opal"] },
  7: { days: ["Monday", "Thursday"], colors: [["White", "#FFFFFF"], ["Sea Green", "#2E8B57"], ["Grey", "#808080"]], gemstones: ["Cat's Eye", "Lapis Lazuli"] },
  8: { days: ["Saturday", "Friday"], colors: [["Black", "#000000"], ["Dark Blue", "#00008B"], ["Purple", "#800080"]], gemstones: ["Blue Sapphire", "Onyx"] },
  9: { days: ["Tuesday", "Sunday"], colors: [["Red", "#FF0000"], ["Maroon", "#800000"], ["Wine", "#722F37"]], gemstones: ["Red Coral", "Bloodstone"] },
};

const DAY_NAMES: { [key: string]: { en: string; hi: string } } = {
  "Sunday": { en: "Sunday", hi: "रविवार" },
  "Monday": { en: "Monday", hi: "सोमवार" },
  "Tuesday": { en: "Tuesday", hi: "मंगलवार" },
  "Wednesday": { en: "Wednesday", hi: "बुधवार" },
  "Thursday": { en: "Thursday", hi: "गुरुवार" },
  "Friday": { en: "Friday", hi: "शुक्रवार" },
  "Saturday": { en: "Saturday", hi: "शनिवार" },
};

// Letter to Number mapping (Pythagorean system)
const LETTER_MAP: { [key: string]: number } = {
  'A': 1, 'J': 1, 'S': 1, 'a': 1, 'j': 1, 's': 1,
  'B': 2, 'K': 2, 'T': 2, 'b': 2, 'k': 2, 't': 2,
  'C': 3, 'L': 3, 'U': 3, 'c': 3, 'l': 3, 'u': 3,
  'D': 4, 'M': 4, 'V': 4, 'd': 4, 'm': 4, 'v': 4,
  'E': 5, 'N': 5, 'W': 5, 'e': 5, 'n': 5, 'w': 5,
  'F': 6, 'O': 6, 'X': 6, 'f': 6, 'o': 6, 'x': 6,
  'G': 7, 'P': 7, 'Y': 7, 'g': 7, 'p': 7, 'y': 7,
  'H': 8, 'Q': 8, 'Z': 8, 'h': 8, 'q': 8, 'z': 8,
  'I': 9, 'R': 9, 'i': 9, 'r': 9,
};

interface NumerologyProps {
  language: Language;
}

const Numerology: React.FC<NumerologyProps> = ({ language }) => {
  const t = useTranslation(language);
  const [formData, setFormData] = useState<NumerologyInput>({ name: '', dob: '' });
  const [report, setReport] = useState<NumerologyResponse | null>(null);

  // Pre-fill from global profile on mount
  useEffect(() => {
    const profile = getGlobalProfile();
    if (profile?.self) {
      setFormData(prev => ({
        name: profile.self.name || prev.name,
        dob: profile.self.date ? profile.self.date : prev.dob,
      }));
      if (profile.self.gender === 'male') setGender('M');
      else if (profile.self.gender === 'female') setGender('F');
    }
  }, []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Extended numerology features state
  const [numberGuide, setNumberGuide] = useState<NumberGuide[]>([]);
  const [luckyDays, setLuckyDays] = useState<string[]>([]);
  const [luckyColors, setLuckyColors] = useState<[string, string][]>([]);
  const [luckyGemstones, setLuckyGemstones] = useState<string[]>([]);
  const [gender, setGender] = useState<'M' | 'F'>('M');
  
  // Extended features inputs
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [vehicleNumber, setVehicleNumber] = useState<string>('');
  const [businessName, setBusinessName] = useState<string>('');
  const [marriageDate, setMarriageDate] = useState<string>('');
  const [houseNumber, setHouseNumber] = useState<string>('');
  
  // Extended features results
  const [mobileResult, setMobileResult] = useState<any>(null);
  const [vehicleResult, setVehicleResult] = useState<any>(null);
  const [businessResult, setBusinessResult] = useState<any>(null);
  const [marriageResult, setMarriageResult] = useState<any>(null);
  const [houseResult, setHouseResult] = useState<any>(null);
  const [initialsResult, setInitialsResult] = useState<any>(null);
  const [kuaNumber, setKuaNumber] = useState<number | null>(null);
  const [loShuMatrix, setLoShuMatrix] = useState<{ [key: number]: number } | null>(null);

  // Helper functions for extended numerology
  const reduceNumber = (n: number): number => {
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
      n = n.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return n;
  };

  const nameToNumber = (name: string): number => {
    const digits: number[] = [];
    for (const ch of name) {
      if (ch.match(/[a-zA-Z]/) && LETTER_MAP[ch]) {
        digits.push(LETTER_MAP[ch]);
      }
    }
    return reduceNumber(digits.reduce((sum, d) => sum + d, 0));
  };

  const getLuckyMeta = (lifePath: number) => {
    const data = LIFE_PATH_META[lifePath] || { days: [], colors: [], gemstones: [] };
    return {
      luckyDays: data.days || [],
      luckyColors: data.colors || [],
      luckyGemstones: data.gemstones || []
    };
  };

  const checkMobileLucky = (mobile: string, lifePath: number) => {
    const digits = mobile.replace(/\D/g, '').split('').map(x => parseInt(x));
    if (digits.length === 0) return null;
    const totalReduced = reduceNumber(digits.reduce((sum, d) => sum + d, 0));
    const lastDigit = digits[digits.length - 1];
    const luck = LIFE_PATH_LUCK_MAP[lifePath] || { very_lucky: [], lucky: [], neutral: [], avoid: [] };
    let score = 'Weak';
    if (luck.very_lucky.includes(lastDigit)) score = 'Excellent';
    else if (luck.lucky.includes(lastDigit)) score = 'Good';
    else if (luck.neutral.includes(lastDigit)) score = 'Average';
    return { mobile, sumReduced: totalReduced, lastDigit, compatibility: score };
  };

  const checkVehicleLucky = (vehicle: string, lifePath: number) => {
    const digits = vehicle.replace(/\D/g, '').split('').map(x => parseInt(x));
    if (digits.length === 0) return null;
    const reduced = reduceNumber(digits.reduce((sum, d) => sum + d, 0));
    const luck = LIFE_PATH_LUCK_MAP[lifePath] || { very_lucky: [], lucky: [], neutral: [], avoid: [] };
    let status = 'Avoid';
    if (luck.very_lucky.includes(reduced)) status = 'Very Lucky';
    else if (luck.lucky.includes(reduced)) status = 'Lucky';
    else if (luck.neutral.includes(reduced)) status = 'Neutral';
    return { vehicleNumber: vehicle, reducedSum: reduced, status };
  };

  const businessNameRating = (name: string, lifePath: number) => {
    const nameNum = nameToNumber(name);
    const luck = LIFE_PATH_LUCK_MAP[lifePath] || { very_lucky: [], lucky: [], neutral: [], avoid: [] };
    let score = 'Weak';
    if (luck.very_lucky.includes(nameNum)) score = 'Excellent';
    else if (luck.lucky.includes(nameNum)) score = 'Good';
    else if (luck.neutral.includes(nameNum)) score = 'Average';
    return { businessName: name, nameNumber: nameNum, rating: score };
  };

  const marriageDateCompatibility = (dateStr: string, lifePath: number) => {
    const digits = dateStr.replace(/\D/g, '').split('').map(x => parseInt(x));
    if (digits.length === 0) return null;
    const dayNum = reduceNumber(digits.reduce((sum, d) => sum + d, 0));
    const luck = LIFE_PATH_LUCK_MAP[lifePath] || { very_lucky: [], lucky: [], neutral: [], avoid: [] };
    let status = 'Avoid';
    if (luck.very_lucky.includes(dayNum)) status = 'Very Auspicious';
    else if (luck.lucky.includes(dayNum)) status = 'Auspicious';
    else if (luck.neutral.includes(dayNum)) status = 'Neutral';
    return { marriageDate: dateStr, dayNum, status };
  };

  const houseNumberCompatibility = (house: string, lifePath: number) => {
    const digits = house.replace(/\D/g, '').split('').map(x => parseInt(x));
    if (digits.length === 0) return null;
    const reduced = reduceNumber(digits.reduce((sum, d) => sum + d, 0));
    const luck = LIFE_PATH_LUCK_MAP[lifePath] || { very_lucky: [], lucky: [], neutral: [], avoid: [] };
    let result = 'Energetic Clash — Avoid if possible';
    if (luck.very_lucky.includes(reduced)) result = 'Very Lucky Home';
    else if (luck.lucky.includes(reduced)) result = 'Lucky Home';
    else if (luck.neutral.includes(reduced)) result = 'Neutral / OK';
    return { houseNumber: house, vibration: reduced, compatibility: result };
  };

  const luckyInitials = (fullName: string, lifePath: number) => {
    const parts = fullName.trim().split(/\s+/);
    const initials = parts.map(p => p[0]).filter(ch => ch && ch.match(/[a-zA-Z]/));
    const luck = LIFE_PATH_LUCK_MAP[lifePath] || { very_lucky: [], lucky: [], neutral: [], avoid: [] };
    const rating = initials.map(ch => {
      const num = LETTER_MAP[ch.toUpperCase()] || LETTER_MAP[ch.toLowerCase()] || 0;
      let status = 'Avoid';
      if (num && luck.very_lucky.includes(num)) status = 'Very Lucky';
      else if (num && luck.lucky.includes(num)) status = 'Lucky';
      else if (num && luck.neutral.includes(num)) status = 'Neutral';
      return { ch, num, status };
    });
    return { initials: rating };
  };

  const calculateKuaNumber = (birthYear: number, gender: 'M' | 'F'): number => {
    const yearReduced = reduceNumber(birthYear);
    let kua = gender === 'M' ? 11 - yearReduced : 4 + yearReduced;
    kua = reduceNumber(kua);
    if (gender === 'M' && kua === 5) kua = 2;
    if (gender === 'F' && kua === 5) kua = 8;
    return kua;
  };

  const calculateLoShuMatrix = (birthDate: string) => {
    const digits = birthDate.replace(/\D/g, '').split('').map(x => parseInt(x));
    const matrix: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    digits.forEach(d => {
      if (d !== 0 && d >= 1 && d <= 9) {
        matrix[d] = (matrix[d] || 0) + 1;
      }
    });
    return matrix;
  };

  // Calculate extended features when report is generated
  useEffect(() => {
    if (report && formData.dob) {
      const lifePath = report.lifePath.number;
      
      // Generate lucky numbers guide
      const luckMap = LIFE_PATH_LUCK_MAP[lifePath] || { very_lucky: [], lucky: [], neutral: [], avoid: [] };
      const guide: NumberGuide[] = [];
      for (let num = 1; num <= 9; num++) {
        let status: LuckStatus = '-';
        if (luckMap.very_lucky.includes(num)) status = 'Very Lucky';
        else if (luckMap.lucky.includes(num)) status = 'Lucky';
        else if (luckMap.neutral.includes(num)) status = 'Neutral';
        else if (luckMap.avoid.includes(num)) status = 'Avoid';
        guide.push({ number: num, status });
      }
      setNumberGuide(guide);
      
      // Get lucky days, colors, gemstones
      const { luckyDays: days, luckyColors: colors, luckyGemstones: gemstones } = getLuckyMeta(lifePath);
      setLuckyDays(days);
      setLuckyColors(colors);
      setLuckyGemstones(gemstones);
      
      // Calculate Kua Number and Lo-Shu Matrix
      const year = parseInt(formData.dob.split('-')[0]);
      if (year) {
        setKuaNumber(calculateKuaNumber(year, gender));
        setLoShuMatrix(calculateLoShuMatrix(formData.dob));
      }
      
      // Calculate initials
      if (formData.name) {
        setInitialsResult(luckyInitials(formData.name, lifePath));
      }
      
      // Calculate compatibility checks if provided
      if (mobileNumber) setMobileResult(checkMobileLucky(mobileNumber, lifePath));
      if (vehicleNumber) setVehicleResult(checkVehicleLucky(vehicleNumber, lifePath));
      if (businessName) setBusinessResult(businessNameRating(businessName, lifePath));
      if (marriageDate) setMarriageResult(marriageDateCompatibility(marriageDate, lifePath));
      if (houseNumber) setHouseResult(houseNumberCompatibility(houseNumber, lifePath));
    }
  }, [report, formData, gender, mobileNumber, vehicleNumber, businessName, marriageDate, houseNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dob) return;
    const cacheInput = { name: formData.name, dob: formData.dob, lang: language };
    const cached = getCachedAI<NumerologyResponse>('numerology', cacheInput);
    if (cached) {
      setReport(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      // 1. Calculate Numbers locally (Standard Numerology Logic)
      const lifePath = calculateLifePath(formData.dob);
      const destiny = calculateDestiny(formData.name);
      const soulUrge = calculateSoulUrge(formData.name);
      const personality = calculatePersonality(formData.name);
      const birthday = calculateBirthday(formData.dob);

      // 2. Interpret with Gemini acting as the expert
      const data = await generateNumerologyReport(
        formData.name,
        lifePath,
        destiny,
        soulUrge,
        personality,
        birthday,
        language
      );

      setCachedAI('numerology', cacheInput, data);
      setReport(data);

      // Show interstitial ad after report (Android only)
      if (isCapacitor()) {
        setTimeout(async () => {
          try {
            const isReady = await admobService.isInterstitialReady();
            if (!isReady) await admobService.loadInterstitial();
            await new Promise(r => setTimeout(r, 1000));
            await admobService.showInterstitial();
          } catch (adErr) {
            console.log('[AdMob] Interstitial after numerology:', adErr);
          }
        }, 2000);
      }
    } catch (err) {
      setErrorSafely(setError, err, language, 'Numerology');
    } finally {
      setLoading(false);
    }
  };

  const NumberCard = ({ title, num, desc }: { title: string, num: number, desc: string }) => (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 relative overflow-hidden group hover:border-teal-500/50 transition-all duration-300 h-full flex flex-col">
      <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl font-serif font-bold group-hover:scale-110 transition-transform">
        {num}
      </div>
      <h3 className="text-teal-400 font-serif text-lg mb-2 uppercase tracking-widest">{title}</h3>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full border-2 border-teal-500/30 flex items-center justify-center text-3xl font-bold text-white bg-slate-900/50 shadow-[0_0_15px_rgba(20,184,166,0.2)] shrink-0">
          {num}
        </div>
        <div className="h-px bg-slate-700 flex-1"></div>
      </div>
      <p className="text-slate-300 text-sm leading-relaxed font-light">{desc}</p>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pb-12 animate-fade-in-up">
      {!report ? (
        <div className="bg-slate-800/80 backdrop-blur-md border border-teal-500/30 rounded-2xl p-8 shadow-2xl relative overflow-visible min-w-0 max-w-xl mx-auto">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-60"></div>
          <ModuleIntro
            language={language}
            subtitleEn="Numerology – life path number, destiny number, soul urge and personality from name and date of birth."
            subtitleHi="अंक ज्योतिष – नाम और जन्म तारीख से लाइफ पाथ, भाग्य अंक, सोल उर्ज और व्यक्तित्व।"
            descriptionEn="Get your core numbers and an AI-powered interpretation. Extended features include lucky mobile, vehicle, business name and marriage date compatibility."
            descriptionHi="मूल अंक और AI व्याख्या पाएं। मोबाइल, वाहन, व्यापार नाम और विवाह तारीख अनुकूलता भी।"
          />
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-emerald-200 to-teal-100 mb-2">
              {t.numerologyTitle}
            </h2>
            <p className="text-slate-400 text-sm">{t.numerologySubtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-teal-500/80 font-bold ml-1">{t.fullName}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-teal-500 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-teal-500/80 font-bold ml-1">{t.dob}</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({...formData, dob: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-teal-500 transition-all [color-scheme:dark]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-serif font-bold py-4 rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                 <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    {t.loadingButton}
                 </span>
              ) : t.revealDestiny}
            </button>
          </form>
          
          <div className="mt-8">
            <AdBanner variant="box" />
          </div>

        </div>
      ) : (
        <div className="space-y-8">
           <div className="flex justify-between items-center">
              <button 
                onClick={() => setReport(null)}
                className="flex items-center text-teal-400 hover:text-white transition-colors text-sm font-bold tracking-wide uppercase"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t.return}
              </button>
              <h2 className="text-2xl font-serif text-teal-100">{formData.name}</h2>
           </div>

           <AdBanner variant="leaderboard" />

           {/* Top 3 Core Numbers */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <NumberCard title={t.lifePath} num={report.lifePath.number} desc={report.lifePath.description} />
              <NumberCard title={t.destinyNum} num={report.destiny.number} desc={report.destiny.description} />
              <NumberCard title={t.soulUrge} num={report.soulUrge.number} desc={report.soulUrge.description} />
           </div>

           {/* Secondary Numbers Row */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <NumberCard title={t.personalityNum} num={report.personality.number} desc={report.personality.description} />
              <NumberCard title={t.birthdayNum} num={report.birthday.number} desc={report.birthday.description} />
           </div>

           {/* Personal Year / Month (today) */}
           {formData.dob && (
             <div className="grid grid-cols-2 gap-4 mt-6">
               <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
                 <span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">{language === 'hi' ? 'व्यक्तिगत वर्ष' : 'Personal Year'}</span>
                 <span className="text-2xl font-bold text-amber-300">{calculatePersonalYear(formData.dob, new Date())}</span>
               </div>
               <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
                 <span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">{language === 'hi' ? 'व्यक्तिगत माह' : 'Personal Month'}</span>
                 <span className="text-2xl font-bold text-amber-300">{calculatePersonalMonth(formData.dob, new Date())}</span>
               </div>
             </div>
           )}

           <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-8 mt-8">
              <h3 className="text-xl font-serif text-amber-200 mb-4 flex items-center gap-2">
                 <span className="text-2xl">✨</span> {t.dailyNumForecast}
              </h3>
              <RichText text={report.dailyForecast} className="text-slate-300 leading-relaxed italic text-lg" />
           </div>

           {/* Extended Numerology Features */}
           {numberGuide.length > 0 && (
             <div className="mt-8 space-y-6">
               <div className="border-t border-slate-700 pt-8">
                 <h3 className="text-2xl font-serif text-teal-200 mb-6 flex items-center gap-2">
                   <span className="text-3xl">🔮</span>
                   {language === 'hi' ? 'विस्तारित अंक ज्योतिष' : 'Extended Numerology'}
                 </h3>
               </div>

               {/* Lucky Numbers Guide */}
               <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
                 <h4 className="text-teal-200 font-serif text-lg mb-4">
                   {language === 'hi' ? 'भाग्यशाली संख्याएं' : 'Lucky Numbers Guide'}
                 </h4>
                 <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
                   {numberGuide.map((item) => {
                     const getStatusStyle = (status: LuckStatus) => {
                       switch (status) {
                         case 'Very Lucky':
                           return {
                             bg: 'bg-gradient-to-br from-emerald-900/50 to-teal-900/50',
                             border: 'border-emerald-500/60',
                             text: 'text-emerald-300',
                             shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]',
                             label: language === 'hi' ? 'बहुत शुभ' : 'Very Lucky'
                           };
                         case 'Lucky':
                           return {
                             bg: 'bg-gradient-to-br from-teal-900/40 to-cyan-900/40',
                             border: 'border-teal-500/50',
                             text: 'text-teal-300',
                             shadow: 'shadow-[0_0_15px_rgba(20,184,166,0.3)]',
                             label: language === 'hi' ? 'शुभ' : 'Lucky'
                           };
                         case 'Neutral':
                           return {
                             bg: 'bg-slate-900/50',
                             border: 'border-slate-700/50',
                             text: 'text-slate-400',
                             shadow: '',
                             label: language === 'hi' ? 'तटस्थ' : 'Neutral'
                           };
                         case 'Avoid':
                           return {
                             bg: 'bg-gradient-to-br from-red-900/30 to-rose-900/30',
                             border: 'border-red-500/40',
                             text: 'text-red-400',
                             shadow: '',
                             label: language === 'hi' ? 'टालें' : 'Avoid'
                           };
                         default:
                           return {
                             bg: 'bg-slate-900/30',
                             border: 'border-slate-800',
                             text: 'text-slate-600',
                             shadow: '',
                             label: '-'
                           };
                       }
                     };
                     const style = getStatusStyle(item.status);
                     return (
                       <div 
                         key={item.number} 
                         className={`p-3 rounded-xl text-center border transition-all ${style.bg} ${style.border} ${style.shadow}`}
                       >
                         <div className={`text-2xl font-bold mb-1 ${style.text}`}>
                           {item.number}
                         </div>
                         <div className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${style.text}`}>
                           {style.label}
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>

               {/* Lucky Days, Colors, Gemstones */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {luckyDays.length > 0 && (
                   <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/40 rounded-xl p-4">
                     <h5 className="text-indigo-300 font-serif text-sm mb-3 flex items-center gap-2">
                       <span>📅</span>
                       {language === 'hi' ? 'शुभ दिन' : 'Lucky Days'}
                     </h5>
                     <div className="flex flex-wrap gap-2">
                       {luckyDays.map((day, idx) => (
                         <span 
                           key={idx}
                           className="px-2 py-1 bg-indigo-800/40 border border-indigo-500/50 rounded-lg text-xs text-indigo-200 font-medium"
                         >
                           {DAY_NAMES[day]?.[language === 'hi' ? 'hi' : 'en'] || day}
                         </span>
                       ))}
                     </div>
                   </div>
                 )}

                 {luckyColors.length > 0 && (
                   <div className="bg-gradient-to-br from-rose-900/30 to-pink-900/30 border border-rose-500/40 rounded-xl p-4">
                     <h5 className="text-rose-300 font-serif text-sm mb-3 flex items-center gap-2">
                       <span>🎨</span>
                       {language === 'hi' ? 'शुभ रंग' : 'Lucky Colors'}
                     </h5>
                     <div className="flex flex-wrap gap-2">
                       {luckyColors.map((colorTuple, idx) => {
                         const [colorName, colorHex] = colorTuple;
                         return (
                           <div 
                             key={idx}
                             className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/40 border border-rose-500/50 rounded-lg"
                           >
                             <div 
                               className="w-3 h-3 rounded-full border border-slate-600"
                               style={{ backgroundColor: colorHex }}
                             ></div>
                             <span className="text-xs text-rose-200 font-medium">{colorName}</span>
                           </div>
                         );
                       })}
                     </div>
                   </div>
                 )}

                 {luckyGemstones.length > 0 && (
                   <div className="bg-gradient-to-br from-amber-900/30 to-yellow-900/30 border border-amber-500/40 rounded-xl p-4">
                     <h5 className="text-amber-300 font-serif text-sm mb-3 flex items-center gap-2">
                       <span>💎</span>
                       {language === 'hi' ? 'शुभ रत्न' : 'Lucky Gemstones'}
                     </h5>
                     <div className="flex flex-wrap gap-2">
                       {luckyGemstones.map((gemstone, idx) => (
                         <span 
                           key={idx}
                           className="px-2 py-1 bg-amber-800/40 border border-amber-500/50 rounded-lg text-xs text-amber-200 font-medium"
                         >
                           {gemstone}
                         </span>
                       ))}
                     </div>
                   </div>
                 )}
               </div>

               {/* Extended Features Input Form */}
               <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
                 <h4 className="text-teal-200 font-serif text-lg mb-4 flex items-center gap-2">
                   <span className="text-xl">🔮</span>
                   {language === 'hi' ? 'अतिरिक्त जांच' : 'Additional Checks'}
                 </h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                   <div>
                     <label className="block text-xs text-slate-400 mb-2">
                       {language === 'hi' ? 'लिंग' : 'Gender'}
                     </label>
                     <select
                       value={gender}
                       onChange={(e) => {
                         setGender(e.target.value as 'M' | 'F');
                         if (report && formData.dob) {
                           const year = parseInt(formData.dob.split('-')[0]);
                           if (year) {
                             setKuaNumber(calculateKuaNumber(year, e.target.value as 'M' | 'F'));
                           }
                         }
                       }}
                       className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:border-teal-500/50"
                     >
                       <option value="M">{language === 'hi' ? 'पुरुष' : 'Male'}</option>
                       <option value="F">{language === 'hi' ? 'महिला' : 'Female'}</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs text-slate-400 mb-2">
                       {language === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number'}
                     </label>
                     <input
                       type="text"
                       value={mobileNumber}
                       onChange={(e) => {
                         setMobileNumber(e.target.value);
                         if (report) {
                           setMobileResult(checkMobileLucky(e.target.value, report.lifePath.number));
                         }
                       }}
                       placeholder={language === 'hi' ? '9876543210' : '9876543210'}
                       className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:border-teal-500/50"
                     />
                   </div>
                   <div>
                     <label className="block text-xs text-slate-400 mb-2">
                       {language === 'hi' ? 'वाहन नंबर' : 'Vehicle Number'}
                     </label>
                     <input
                       type="text"
                       value={vehicleNumber}
                       onChange={(e) => {
                         setVehicleNumber(e.target.value);
                         if (report) {
                           setVehicleResult(checkVehicleLucky(e.target.value, report.lifePath.number));
                         }
                       }}
                       placeholder={language === 'hi' ? 'MH04AB1234' : 'MH04AB1234'}
                       className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:border-teal-500/50"
                     />
                   </div>
                   <div>
                     <label className="block text-xs text-slate-400 mb-2">
                       {language === 'hi' ? 'व्यापार का नाम' : 'Business Name'}
                     </label>
                     <input
                       type="text"
                       value={businessName}
                       onChange={(e) => {
                         setBusinessName(e.target.value);
                         if (report) {
                           setBusinessResult(businessNameRating(e.target.value, report.lifePath.number));
                         }
                       }}
                       placeholder={language === 'hi' ? 'व्यापार का नाम' : 'Business Name'}
                       className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:border-teal-500/50"
                     />
                   </div>
                   <div>
                     <label className="block text-xs text-slate-400 mb-2">
                       {language === 'hi' ? 'विवाह की तारीख' : 'Marriage Date'}
                     </label>
                     <input
                       type="date"
                       value={marriageDate}
                       onChange={(e) => {
                         setMarriageDate(e.target.value);
                         if (report) {
                           setMarriageResult(marriageDateCompatibility(e.target.value, report.lifePath.number));
                         }
                       }}
                       className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:border-teal-500/50"
                     />
                   </div>
                   <div>
                     <label className="block text-xs text-slate-400 mb-2">
                       {language === 'hi' ? 'घर का नंबर' : 'House Number'}
                     </label>
                     <input
                       type="text"
                       value={houseNumber}
                       onChange={(e) => {
                         setHouseNumber(e.target.value);
                         if (report) {
                           setHouseResult(houseNumberCompatibility(e.target.value, report.lifePath.number));
                         }
                       }}
                       placeholder={language === 'hi' ? '902' : '902'}
                       className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:border-teal-500/50"
                     />
                   </div>
                 </div>

                 {/* Results Display */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                   {mobileResult && (
                     <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                       <h6 className="text-teal-300 font-bold text-xs mb-2 flex items-center gap-1">
                         <span>📱</span> {language === 'hi' ? 'मोबाइल' : 'Mobile'}
                       </h6>
                       <p className="text-xs text-slate-400 mb-1">{mobileResult.mobile}</p>
                       <p className={`text-xs font-bold ${
                         mobileResult.compatibility === 'Excellent' ? 'text-emerald-400' :
                         mobileResult.compatibility === 'Good' ? 'text-teal-400' :
                         mobileResult.compatibility === 'Average' ? 'text-yellow-400' :
                         'text-red-400'
                       }`}>
                         {mobileResult.compatibility}
                       </p>
                     </div>
                   )}

                   {vehicleResult && (
                     <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                       <h6 className="text-teal-300 font-bold text-xs mb-2 flex items-center gap-1">
                         <span>🚗</span> {language === 'hi' ? 'वाहन' : 'Vehicle'}
                       </h6>
                       <p className="text-xs text-slate-400 mb-1">{vehicleResult.vehicleNumber}</p>
                       <p className={`text-xs font-bold ${
                         vehicleResult.status === 'Very Lucky' ? 'text-emerald-400' :
                         vehicleResult.status === 'Lucky' ? 'text-teal-400' :
                         vehicleResult.status === 'Neutral' ? 'text-yellow-400' :
                         'text-red-400'
                       }`}>
                         {vehicleResult.status}
                       </p>
                     </div>
                   )}

                   {businessResult && (
                     <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                       <h6 className="text-teal-300 font-bold text-xs mb-2 flex items-center gap-1">
                         <span>🏢</span> {language === 'hi' ? 'व्यापार' : 'Business'}
                       </h6>
                       <p className="text-xs text-slate-400 mb-1">{businessResult.businessName}</p>
                       <p className={`text-xs font-bold ${
                         businessResult.rating === 'Excellent' ? 'text-emerald-400' :
                         businessResult.rating === 'Good' ? 'text-teal-400' :
                         businessResult.rating === 'Average' ? 'text-yellow-400' :
                         'text-red-400'
                       }`}>
                         {businessResult.rating}
                       </p>
                     </div>
                   )}

                   {marriageResult && (
                     <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                       <h6 className="text-teal-300 font-bold text-xs mb-2 flex items-center gap-1">
                         <span>💍</span> {language === 'hi' ? 'विवाह' : 'Marriage'}
                       </h6>
                       <p className="text-xs text-slate-400 mb-1">{marriageResult.marriageDate}</p>
                       <p className={`text-xs font-bold ${
                         marriageResult.status === 'Very Auspicious' ? 'text-emerald-400' :
                         marriageResult.status === 'Auspicious' ? 'text-teal-400' :
                         marriageResult.status === 'Neutral' ? 'text-yellow-400' :
                         'text-red-400'
                       }`}>
                         {marriageResult.status}
                       </p>
                     </div>
                   )}

                   {houseResult && (
                     <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                       <h6 className="text-teal-300 font-bold text-xs mb-2 flex items-center gap-1">
                         <span>🏠</span> {language === 'hi' ? 'घर' : 'House'}
                       </h6>
                       <p className="text-xs text-slate-400 mb-1">{houseResult.houseNumber}</p>
                       <p className={`text-xs font-bold ${
                         houseResult.compatibility.includes('Very Lucky') ? 'text-emerald-400' :
                         houseResult.compatibility.includes('Lucky') ? 'text-teal-400' :
                         houseResult.compatibility.includes('Neutral') ? 'text-yellow-400' :
                         'text-red-400'
                       }`}>
                         {houseResult.compatibility}
                       </p>
                     </div>
                   )}
                 </div>

                 {/* Signature Initials */}
                 {initialsResult && initialsResult.initials.length > 0 && (
                   <div className="mt-4 p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                     <h6 className="text-teal-300 font-bold text-xs mb-2 flex items-center gap-1">
                       <span>✍️</span> {language === 'hi' ? 'हस्ताक्षर प्रारंभिक' : 'Signature Initials'}
                     </h6>
                     <div className="flex flex-wrap gap-2">
                       {initialsResult.initials.map((item: any, idx: number) => (
                         <div 
                           key={idx}
                           className={`px-2 py-1 rounded border text-xs ${
                             item.status === 'Very Lucky' ? 'bg-emerald-900/40 border-emerald-500/50 text-emerald-300' :
                             item.status === 'Lucky' ? 'bg-teal-900/40 border-teal-500/50 text-teal-300' :
                             item.status === 'Neutral' ? 'bg-slate-800/40 border-slate-700/50 text-slate-400' :
                             'bg-red-900/40 border-red-500/50 text-red-400'
                           }`}
                         >
                           <span className="font-bold">{item.ch}</span> ({item.num}) - {item.status}
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                 {/* Kua Number and Lo-Shu Matrix */}
                 {report && (kuaNumber || loShuMatrix) && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                     {kuaNumber && (
                       <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                         <h6 className="text-teal-300 font-bold text-xs mb-2 flex items-center gap-1">
                           <span>🧭</span> {language === 'hi' ? 'फेंग शुई कुआ' : 'Feng Shui Kua'}
                         </h6>
                         <p className="text-2xl font-bold text-teal-400">{kuaNumber}</p>
                       </div>
                     )}

                     {loShuMatrix && (
                       <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                         <h6 className="text-teal-300 font-bold text-xs mb-2 flex items-center gap-1">
                           <span>🔢</span> {language === 'hi' ? 'लो-शू मैट्रिक्स' : 'Lo-Shu Matrix'}
                         </h6>
                         <div className="grid grid-cols-3 gap-1">
                           {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                             <div 
                               key={num}
                               className={`p-1 rounded text-center border text-[10px] ${
                                 loShuMatrix[num] > 0 
                                   ? 'bg-teal-900/40 border-teal-500/50 text-teal-300' 
                                   : 'bg-slate-800/40 border-slate-700/50 text-slate-600'
                               }`}
                             >
                               <div className="font-bold">{num}</div>
                               <div className="text-[8px]">{loShuMatrix[num] || 0}x</div>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}
                   </div>
                 )}
               </div>
             </div>
           )}

           {/* WhatsApp Contact Section */}
           <div className="mt-8 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-2xl p-6">
             <div className="flex flex-col md:flex-row items-center justify-between gap-4">
               <div className="flex-1 text-center md:text-left">
                 <h3 className="text-lg font-serif text-green-200 mb-2 flex items-center justify-center md:justify-start gap-2">
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                   </svg>
                   {language === 'hi' ? 'अंक ज्योतिष परामर्श के लिए संपर्क करें' : 'Get Expert Numerology Consultation'}
                 </h3>
                 <p className="text-slate-400 text-sm">
                   {language === 'hi' 
                     ? 'विशेषज्ञ अंक ज्योतिषी से व्यक्तिगत रीडिंग और उपाय प्राप्त करें'
                     : 'Get personalized numerology reading and remedies from our expert numerologist'}
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
           
           <AdBanner variant="leaderboard" />
        </div>
      )}
    </div>
  );
};

export default Numerology;