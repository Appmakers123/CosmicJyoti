import React, { useState } from 'react';
import { Language } from '../types';
import { useTranslation } from '../utils/translations';
import AdBanner from './AdBanner';

interface NumerologyGuideProps {
  language: Language;
}

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

const NumerologyGuide: React.FC<NumerologyGuideProps> = ({ language }) => {
  const t = useTranslation(language);
  const [birthDate, setBirthDate] = useState<string>('');
  const [lifePathNumber, setLifePathNumber] = useState<number | null>(null);
  const [numberGuide, setNumberGuide] = useState<NumberGuide[]>([]);
  const [luckyDays, setLuckyDays] = useState<string[]>([]);
  const [luckyColors, setLuckyColors] = useState<[string, string][]>([]);
  const [luckyGemstones, setLuckyGemstones] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<{
    coreConcepts: boolean;
    masterNumbers: boolean;
    numberMeanings: boolean;
    calculations: boolean;
    compatibility: boolean;
    history: boolean;
  }>({
    coreConcepts: false,
    masterNumbers: false,
    numberMeanings: false,
    calculations: false,
    compatibility: false,
    history: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Extended features state
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [vehicleNumber, setVehicleNumber] = useState<string>('');
  const [businessName, setBusinessName] = useState<string>('');
  const [marriageDate, setMarriageDate] = useState<string>('');
  const [houseNumber, setHouseNumber] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  
  // Results state
  const [mobileResult, setMobileResult] = useState<any>(null);
  const [vehicleResult, setVehicleResult] = useState<any>(null);
  const [businessResult, setBusinessResult] = useState<any>(null);
  const [marriageResult, setMarriageResult] = useState<any>(null);
  const [houseResult, setHouseResult] = useState<any>(null);
  const [initialsResult, setInitialsResult] = useState<any>(null);
  const [kuaNumber, setKuaNumber] = useState<number | null>(null);
  const [loShuMatrix, setLoShuMatrix] = useState<{ [key: number]: number } | null>(null);

  const reduceNumber = (n: number): number => {
    // Reduce to single digit unless master number 11/22/33
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
      n = n.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return n;
  };

  const calcLifePath = (birthDate: string): number => {
    // Extract all digits from birth date (format: YYYY-MM-DD)
    const digits = birthDate.replace(/\D/g, '').split('').map(x => parseInt(x));
    const total = digits.reduce((sum, digit) => sum + digit, 0);
    return reduceNumber(total);
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
    if (luck.very_lucky.includes(lastDigit)) {
      score = 'Excellent';
    } else if (luck.lucky.includes(lastDigit)) {
      score = 'Good';
    } else if (luck.neutral.includes(lastDigit)) {
      score = 'Average';
    }

    return {
      mobile,
      sumReduced: totalReduced,
      lastDigit,
      compatibility: score
    };
  };

  const checkVehicleLucky = (vehicle: string, lifePath: number) => {
    const digits = vehicle.replace(/\D/g, '').split('').map(x => parseInt(x));
    if (digits.length === 0) return null;
    
    const reduced = reduceNumber(digits.reduce((sum, d) => sum + d, 0));
    const luck = LIFE_PATH_LUCK_MAP[lifePath] || { very_lucky: [], lucky: [], neutral: [], avoid: [] };

    let status = 'Avoid';
    if (luck.very_lucky.includes(reduced)) {
      status = 'Very Lucky';
    } else if (luck.lucky.includes(reduced)) {
      status = 'Lucky';
    } else if (luck.neutral.includes(reduced)) {
      status = 'Neutral';
    }

    return {
      vehicleNumber: vehicle,
      reducedSum: reduced,
      status
    };
  };

  const businessNameRating = (name: string, lifePath: number) => {
    const nameNum = nameToNumber(name);
    const luck = LIFE_PATH_LUCK_MAP[lifePath] || { very_lucky: [], lucky: [], neutral: [], avoid: [] };
    
    let score = 'Weak';
    if (luck.very_lucky.includes(nameNum)) {
      score = 'Excellent';
    } else if (luck.lucky.includes(nameNum)) {
      score = 'Good';
    } else if (luck.neutral.includes(nameNum)) {
      score = 'Average';
    }

    return {
      businessName: name,
      nameNumber: nameNum,
      rating: score
    };
  };

  const marriageDateCompatibility = (dateStr: string, lifePath: number) => {
    const digits = dateStr.replace(/\D/g, '').split('').map(x => parseInt(x));
    if (digits.length === 0) return null;
    
    const dayNum = reduceNumber(digits.reduce((sum, d) => sum + d, 0));
    const luck = LIFE_PATH_LUCK_MAP[lifePath] || { very_lucky: [], lucky: [], neutral: [], avoid: [] };

    let status = 'Avoid';
    if (luck.very_lucky.includes(dayNum)) {
      status = 'Very Auspicious';
    } else if (luck.lucky.includes(dayNum)) {
      status = 'Auspicious';
    } else if (luck.neutral.includes(dayNum)) {
      status = 'Neutral';
    }

    return {
      marriageDate: dateStr,
      dayNum,
      status
    };
  };

  const houseNumberCompatibility = (house: string, lifePath: number) => {
    const digits = house.replace(/\D/g, '').split('').map(x => parseInt(x));
    if (digits.length === 0) return null;
    
    const reduced = reduceNumber(digits.reduce((sum, d) => sum + d, 0));
    const luck = LIFE_PATH_LUCK_MAP[lifePath] || { very_lucky: [], lucky: [], neutral: [], avoid: [] };

    let result = 'Energetic Clash — Avoid if possible';
    if (luck.very_lucky.includes(reduced)) {
      result = 'Very Lucky Home';
    } else if (luck.lucky.includes(reduced)) {
      result = 'Lucky Home';
    } else if (luck.neutral.includes(reduced)) {
      result = 'Neutral / OK';
    }

    return {
      houseNumber: house,
      vibration: reduced,
      compatibility: result
    };
  };

  const luckyInitials = (fullName: string, lifePath: number) => {
    const parts = fullName.trim().split(/\s+/);
    const initials = parts.map(p => p[0]).filter(ch => ch && ch.match(/[a-zA-Z]/));
    const luck = LIFE_PATH_LUCK_MAP[lifePath] || { very_lucky: [], lucky: [], neutral: [], avoid: [] };
    
    const rating = initials.map(ch => {
      const num = LETTER_MAP[ch.toUpperCase()] || LETTER_MAP[ch.toLowerCase()] || 0;
      let status = 'Avoid';
      if (num && luck.very_lucky.includes(num)) {
        status = 'Very Lucky';
      } else if (num && luck.lucky.includes(num)) {
        status = 'Lucky';
      } else if (num && luck.neutral.includes(num)) {
        status = 'Neutral';
      }
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

  const generateLuckyGuide = (birthDate: string) => {
    if (!birthDate) {
      setLifePathNumber(null);
      setNumberGuide([]);
      setLuckyDays([]);
      setLuckyColors([]);
      return;
    }

    const lifePath = calcLifePath(birthDate);
    setLifePathNumber(lifePath);
    
    const luckMap = LIFE_PATH_LUCK_MAP[lifePath] || { very_lucky: [], lucky: [], neutral: [], avoid: [] };
    
    const guide: NumberGuide[] = [];
    for (let num = 1; num <= 9; num++) {
      let status: LuckStatus = '-';
      
      if (luckMap.very_lucky.includes(num)) {
        status = 'Very Lucky';
      } else if (luckMap.lucky.includes(num)) {
        status = 'Lucky';
      } else if (luckMap.neutral.includes(num)) {
        status = 'Neutral';
      } else if (luckMap.avoid.includes(num)) {
        status = 'Avoid';
      }
      
      guide.push({ number: num, status });
    }
    
    setNumberGuide(guide);
    
    // Get lucky days, colors, and gemstones
    const { luckyDays: days, luckyColors: colors, luckyGemstones: gemstones } = getLuckyMeta(lifePath);
    setLuckyDays(days);
    setLuckyColors(colors);
    setLuckyGemstones(gemstones);
    
    // Calculate Kua Number and Lo-Shu Matrix
    const year = parseInt(birthDate.split('-')[0]);
    if (year) {
      setKuaNumber(calculateKuaNumber(year, gender));
      setLoShuMatrix(calculateLoShuMatrix(birthDate));
    }
    
    // Calculate initials if name provided
    if (fullName) {
      setInitialsResult(luckyInitials(fullName, lifePath));
    }
    
    // Calculate compatibility checks if provided
    if (mobileNumber) {
      setMobileResult(checkMobileLucky(mobileNumber, lifePath));
    }
    if (vehicleNumber) {
      setVehicleResult(checkVehicleLucky(vehicleNumber, lifePath));
    }
    if (businessName) {
      setBusinessResult(businessNameRating(businessName, lifePath));
    }
    if (marriageDate) {
      setMarriageResult(marriageDateCompatibility(marriageDate, lifePath));
    }
    if (houseNumber) {
      setHouseResult(houseNumberCompatibility(houseNumber, lifePath));
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-24 animate-fade-in-up">
      <div className="text-center mb-16">
        <span className="text-[10px] uppercase font-bold tracking-[1em] text-amber-500 mb-2 block">Numerology Secrets</span>
        <h2 className="text-5xl md:text-7xl font-serif text-amber-100 drop-shadow-lg">
          {language === 'hi' ? 'अंक ज्योतिष गाइड' : 'Numerology Guide'}
        </h2>
        <p className="text-slate-500 text-sm italic tracking-[0.2em] mt-4 uppercase">
          {language === 'hi' ? 'संख्याओं की शक्ति' : 'The Power of Numbers'}
        </p>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800 rounded-[4rem] p-6 md:p-16 shadow-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="animate-fade-in space-y-8 sm:space-y-12">
          {/* Core Numerology Concepts */}
          <div className="bg-slate-950/60 p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-xl">
            <button
              onClick={() => toggleSection('coreConcepts')}
              className="w-full flex items-center justify-between mb-6"
            >
              <h3 className="text-2xl font-serif text-amber-300 flex items-center gap-3">
                <span className="text-3xl">📚</span>
                {language === 'hi' ? 'अंक ज्योतिष के मूल सिद्धांत' : 'Core Numerology Concepts'}
              </h3>
              <svg 
                className={`w-6 h-6 text-amber-400 transition-transform duration-300 ${expandedSections.coreConcepts ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSections.coreConcepts && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      name: language === 'hi' ? 'जीवन पथ संख्या' : 'Life Path Number',
                      icon: '🛤️',
                      desc: language === 'hi' 
                        ? 'जन्म तिथि से गणना की जाती है। यह आपके जीवन का मुख्य उद्देश्य और दिशा दिखाता है। यह सबसे महत्वपूर्ण अंक है जो आपके जीवन के मार्ग को निर्धारित करता है।'
                        : 'Calculated from birth date. Shows your main life purpose and direction. This is the most important number that determines your life path.',
                      calculation: language === 'hi' 
                        ? 'जन्म तिथि के सभी अंकों को जोड़कर एक अंक में कम करें (11, 22, 33 को छोड़कर)'
                        : 'Add all digits of birth date and reduce to single digit (except 11, 22, 33)'
                    },
                    {
                      name: language === 'hi' ? 'भाग्य संख्या' : 'Destiny Number',
                      icon: '⭐',
                      desc: language === 'hi' 
                        ? 'पूरे नाम से गणना की जाती है। यह आपकी जन्मजात क्षमताओं और जीवन में प्राप्त होने वाली सफलता को दर्शाता है।'
                        : 'Calculated from full name. Represents your innate talents and success you\'ll achieve in life.',
                      calculation: language === 'hi' 
                        ? 'नाम के सभी अक्षरों को संख्याओं में बदलकर जोड़ें और एक अंक में कम करें'
                        : 'Convert all letters of name to numbers, add and reduce to single digit'
                    },
                    {
                      name: language === 'hi' ? 'आत्मा की इच्छा' : 'Soul Urge Number',
                      icon: '💖',
                      desc: language === 'hi' 
                        ? 'नाम के स्वरों (vowels) से गणना की जाती है। यह आपकी आंतरिक इच्छाओं, सपनों और मन की गहरी इच्छाओं को दर्शाता है।'
                        : 'Calculated from vowels in name. Represents your inner desires, dreams, and heart\'s deepest wishes.',
                      calculation: language === 'hi' 
                        ? 'नाम के सभी स्वरों (A, E, I, O, U) को संख्याओं में बदलकर जोड़ें'
                        : 'Convert all vowels (A, E, I, O, U) in name to numbers and add'
                    },
                    {
                      name: language === 'hi' ? 'व्यक्तित्व संख्या' : 'Personality Number',
                      icon: '🎭',
                      desc: language === 'hi' 
                        ? 'नाम के व्यंजनों (consonants) से गणना की जाती है। यह दिखाता है कि दूसरे लोग आपको कैसे देखते हैं और आपकी बाहरी छवि क्या है।'
                        : 'Calculated from consonants in name. Shows how others perceive you and your outer image.',
                      calculation: language === 'hi' 
                        ? 'नाम के सभी व्यंजनों को संख्याओं में बदलकर जोड़ें'
                        : 'Convert all consonants in name to numbers and add'
                    },
                    {
                      name: language === 'hi' ? 'जन्मदिन संख्या' : 'Birthday Number',
                      icon: '🎂',
                      desc: language === 'hi' 
                        ? 'जन्म के दिन से गणना की जाती है। यह आपकी प्राकृतिक प्रतिभा और विशेष क्षमताओं को दर्शाता है।'
                        : 'Calculated from day of birth. Represents your natural talents and special abilities.',
                      calculation: language === 'hi' 
                        ? 'जन्म के दिन को एक अंक में कम करें (1-31)'
                        : 'Reduce day of birth to single digit (1-31)'
                    },
                    {
                      name: language === 'hi' ? 'चुनौती संख्या' : 'Challenge Number',
                      icon: '⚔️',
                      desc: language === 'hi' 
                        ? 'जीवन पथ संख्या से गणना की जाती है। यह जीवन में आने वाली मुख्य चुनौतियों और सबक को दर्शाता है।'
                        : 'Calculated from life path number. Represents main challenges and lessons in life.',
                      calculation: language === 'hi' 
                        ? 'जीवन पथ संख्या के आधार पर विशिष्ट गणना'
                        : 'Specific calculation based on life path number'
                    }
                  ].map((concept, idx) => (
                    <div 
                      key={idx}
                      className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 hover:border-amber-500/30 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{concept.icon}</span>
                        <h4 className="text-amber-300 font-bold text-lg">{concept.name}</h4>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed mb-3">{concept.desc}</p>
                      <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                        <p className="text-xs text-slate-400 mb-1">{language === 'hi' ? 'गणना:' : 'Calculation:'}</p>
                        <p className="text-xs text-amber-200 font-mono">{concept.calculation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Master Numbers */}
          <div className="bg-slate-950/60 p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-xl">
            <button
              onClick={() => toggleSection('masterNumbers')}
              className="w-full flex items-center justify-between mb-6"
            >
              <h3 className="text-2xl font-serif text-purple-300 flex items-center gap-3">
                <span className="text-3xl">👑</span>
                {language === 'hi' ? 'मास्टर संख्याएं (11, 22, 33)' : 'Master Numbers (11, 22, 33)'}
              </h3>
              <svg 
                className={`w-6 h-6 text-purple-400 transition-transform duration-300 ${expandedSections.masterNumbers ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSections.masterNumbers && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 mb-6">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {language === 'hi' 
                      ? 'मास्टर संख्याएं विशेष शक्ति वाली संख्याएं हैं जिन्हें कभी भी एक अंक में नहीं कम किया जाता। ये उच्च आध्यात्मिक ऊर्जा और महान क्षमता का प्रतिनिधित्व करती हैं।'
                      : 'Master Numbers are special numbers with great power that are never reduced to single digits. They represent higher spiritual energy and great potential.'}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      number: 11,
                      name: language === 'hi' ? 'दूत' : 'The Messenger',
                      icon: '🔮',
                      traits: language === 'hi' 
                        ? ['आध्यात्मिक जागरूकता', 'अंतर्ज्ञान', 'प्रेरणा', 'दूसरों को मार्गदर्शन', 'संवेदनशीलता']
                        : ['Spiritual awareness', 'Intuition', 'Inspiration', 'Guiding others', 'Sensitivity'],
                      challenges: language === 'hi' 
                        ? ['अधिक संवेदनशीलता', 'चिंता', 'आत्म-संदेह', 'अधिक अपेक्षाएं']
                        : ['Over-sensitivity', 'Anxiety', 'Self-doubt', 'High expectations'],
                      career: language === 'hi' 
                        ? 'आध्यात्मिक शिक्षक, सलाहकार, कलाकार, लेखक'
                        : 'Spiritual teacher, counselor, artist, writer'
                    },
                    {
                      number: 22,
                      name: language === 'hi' ? 'मास्टर बिल्डर' : 'The Master Builder',
                      icon: '🏗️',
                      traits: language === 'hi' 
                        ? ['व्यावहारिक आदर्शवाद', 'बड़ी योजनाएं', 'निर्माण क्षमता', 'नेतृत्व', 'दीर्घकालिक सोच']
                        : ['Practical idealism', 'Big plans', 'Building capacity', 'Leadership', 'Long-term thinking'],
                      challenges: language === 'hi' 
                        ? ['अधिक महत्वाकांक्षा', 'पूर्णतावाद', 'तनाव', 'अधिक जिम्मेदारी']
                        : ['Over-ambition', 'Perfectionism', 'Stress', 'Too much responsibility'],
                      career: language === 'hi' 
                        ? 'आर्किटेक्ट, इंजीनियर, व्यापारी, संगठन निर्माता'
                        : 'Architect, engineer, businessman, organization builder'
                    },
                    {
                      number: 33,
                      name: language === 'hi' ? 'मास्टर शिक्षक' : 'The Master Teacher',
                      icon: '🎓',
                      traits: language === 'hi' 
                        ? ['सेवा और करुणा', 'शिक्षण क्षमता', 'उपचार ऊर्जा', 'प्रेम और देखभाल', 'आध्यात्मिक मार्गदर्शन']
                        : ['Service and compassion', 'Teaching ability', 'Healing energy', 'Love and care', 'Spiritual guidance'],
                      challenges: language === 'hi' 
                        ? ['अधिक देखभाल', 'आत्म-त्याग', 'भावनात्मक थकान', 'अधिक जिम्मेदारी']
                        : ['Over-caring', 'Self-sacrifice', 'Emotional exhaustion', 'Too much responsibility'],
                      career: language === 'hi' 
                        ? 'शिक्षक, चिकित्सक, सामाजिक कार्यकर्ता, आध्यात्मिक गुरु'
                        : 'Teacher, healer, social worker, spiritual guru'
                    }
                  ].map((master, idx) => (
                    <div 
                      key={idx}
                      className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 p-6 rounded-2xl border border-purple-500/30 hover:border-purple-400/50 transition-all"
                    >
                      <div className="text-center mb-4">
                        <div className="text-5xl font-bold text-purple-300 mb-2">{master.number}</div>
                        <div className="text-3xl mb-2">{master.icon}</div>
                        <h4 className="text-purple-200 font-bold text-lg">{master.name}</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-purple-400 font-bold mb-2 uppercase">
                            {language === 'hi' ? 'गुण' : 'Traits'}
                          </p>
                          <ul className="space-y-1">
                            {master.traits.map((trait, i) => (
                              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                <span className="text-purple-400 mt-1">•</span>
                                <span>{trait}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs text-purple-400 font-bold mb-2 uppercase">
                            {language === 'hi' ? 'चुनौतियां' : 'Challenges'}
                          </p>
                          <ul className="space-y-1">
                            {master.challenges.map((challenge, i) => (
                              <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                <span className="text-red-400 mt-1">⚠</span>
                                <span>{challenge}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="pt-3 border-t border-purple-700/50">
                          <p className="text-xs text-purple-400 font-bold mb-1 uppercase">
                            {language === 'hi' ? 'करियर' : 'Career'}
                          </p>
                          <p className="text-xs text-slate-300">{master.career}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Detailed Number Meanings */}
          <div className="bg-slate-950/60 p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-xl">
            <button
              onClick={() => toggleSection('numberMeanings')}
              className="w-full flex items-center justify-between mb-6"
            >
              <h3 className="text-2xl font-serif text-cyan-300 flex items-center gap-3">
                <span className="text-3xl">🔍</span>
                {language === 'hi' ? 'संख्या अर्थ और विशेषताएं' : 'Number Meanings & Characteristics'}
              </h3>
              <svg 
                className={`w-6 h-6 text-cyan-400 transition-transform duration-300 ${expandedSections.numberMeanings ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSections.numberMeanings && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      num: 1,
                      planet: 'Sun',
                      keywords: language === 'hi' ? ['नेतृत्व', 'स्वतंत्रता', 'मौलिकता', 'आत्मविश्वास'] : ['Leadership', 'Independence', 'Originality', 'Confidence'],
                      strengths: language === 'hi' ? ['प्राकृतिक नेता', 'निर्णायक', 'साहसी', 'आत्मनिर्भर'] : ['Natural leader', 'Decisive', 'Courageous', 'Self-reliant'],
                      weaknesses: language === 'hi' ? ['अहंकारी', 'जिद्दी', 'अधीर', 'अकेलापन'] : ['Arrogant', 'Stubborn', 'Impatient', 'Loneliness'],
                      advice: language === 'hi' ? 'दूसरों की राय सुनें और सहयोग करना सीखें' : 'Listen to others and learn to collaborate'
                    },
                    {
                      num: 2,
                      planet: 'Moon',
                      keywords: language === 'hi' ? ['सहयोग', 'संवेदनशीलता', 'शांति', 'सहजज्ञान'] : ['Cooperation', 'Sensitivity', 'Peace', 'Intuition'],
                      strengths: language === 'hi' ? ['सहयोगी', 'धैर्यवान', 'सहानुभूतिशील', 'शांतिप्रिय'] : ['Cooperative', 'Patient', 'Empathetic', 'Peace-loving'],
                      weaknesses: language === 'hi' ? ['अधिक संवेदनशील', 'निर्णय न ले पाना', 'आत्म-संदेह', 'निर्भरता'] : ['Over-sensitive', 'Indecisive', 'Self-doubt', 'Dependency'],
                      advice: language === 'hi' ? 'आत्मविश्वास बढ़ाएं और अपने निर्णय खुद लें' : 'Build confidence and make your own decisions'
                    },
                    {
                      num: 3,
                      planet: 'Jupiter',
                      keywords: language === 'hi' ? ['रचनात्मकता', 'आनंद', 'अभिव्यक्ति', 'सामाजिकता'] : ['Creativity', 'Joy', 'Expression', 'Sociability'],
                      strengths: language === 'hi' ? ['रचनात्मक', 'मनोरंजक', 'उत्साही', 'संचार कुशल'] : ['Creative', 'Entertaining', 'Enthusiastic', 'Good communicator'],
                      weaknesses: language === 'hi' ? ['बिखराव', 'अधिक बोलना', 'असावधानी', 'अधिक खर्च'] : ['Scattered', 'Talkative', 'Careless', 'Overspending'],
                      advice: language === 'hi' ? 'ध्यान केंद्रित करें और अनुशासन बनाए रखें' : 'Focus and maintain discipline'
                    },
                    {
                      num: 4,
                      planet: 'Rahu',
                      keywords: language === 'hi' ? ['स्थिरता', 'व्यवस्था', 'कड़ी मेहनत', 'विश्वसनीयता'] : ['Stability', 'Organization', 'Hard work', 'Reliability'],
                      strengths: language === 'hi' ? ['व्यवस्थित', 'विश्वसनीय', 'धैर्यवान', 'व्यावहारिक'] : ['Organized', 'Reliable', 'Patient', 'Practical'],
                      weaknesses: language === 'hi' ? ['कठोर', 'रूढ़िवादी', 'अधिक सतर्क', 'रचनात्मकता की कमी'] : ['Rigid', 'Conservative', 'Over-cautious', 'Lack of creativity'],
                      advice: language === 'hi' ? 'लचीलापन सीखें और नए विचारों के लिए खुले रहें' : 'Learn flexibility and stay open to new ideas'
                    },
                    {
                      num: 5,
                      planet: 'Mercury',
                      keywords: language === 'hi' ? ['स्वतंत्रता', 'जिज्ञासा', 'यात्रा', 'बहुमुखी प्रतिभा'] : ['Freedom', 'Curiosity', 'Travel', 'Versatility'],
                      strengths: language === 'hi' ? ['साहसी', 'जिज्ञासु', 'अनुकूलनशील', 'बहुमुखी'] : ['Adventurous', 'Curious', 'Adaptable', 'Versatile'],
                      weaknesses: language === 'hi' ? ['अस्थिर', 'अधीर', 'अनुशासनहीन', 'जोखिम लेने वाला'] : ['Restless', 'Impatient', 'Undisciplined', 'Risk-taker'],
                      advice: language === 'hi' ? 'स्थिरता और अनुशासन सीखें' : 'Learn stability and discipline'
                    },
                    {
                      num: 6,
                      planet: 'Venus',
                      keywords: language === 'hi' ? ['प्रेम', 'देखभाल', 'सौंदर्य', 'जिम्मेदारी'] : ['Love', 'Care', 'Beauty', 'Responsibility'],
                      strengths: language === 'hi' ? ['दयालु', 'देखभाल करने वाला', 'कलात्मक', 'जिम्मेदार'] : ['Kind', 'Caring', 'Artistic', 'Responsible'],
                      weaknesses: language === 'hi' ? ['अधिक देखभाल', 'आलोचनात्मक', 'आदर्शवादी', 'अधिक जिम्मेदारी'] : ['Over-caring', 'Critical', 'Idealistic', 'Too much responsibility'],
                      advice: language === 'hi' ? 'स्वयं की देखभाल करें और सीमाएं निर्धारित करें' : 'Take care of yourself and set boundaries'
                    },
                    {
                      num: 7,
                      planet: 'Ketu',
                      keywords: language === 'hi' ? ['आध्यात्मिकता', 'ज्ञान', 'अंतर्दृष्टि', 'रहस्य'] : ['Spirituality', 'Wisdom', 'Insight', 'Mystery'],
                      strengths: language === 'hi' ? ['आध्यात्मिक', 'विश्लेषणात्मक', 'गहरा सोचने वाला', 'अंतर्ज्ञानी'] : ['Spiritual', 'Analytical', 'Deep thinker', 'Intuitive'],
                      weaknesses: language === 'hi' ? ['अकेलापन', 'अविश्वास', 'अधिक आलोचनात्मक', 'व्यावहारिकता की कमी'] : ['Loneliness', 'Skepticism', 'Over-critical', 'Lack of practicality'],
                      advice: language === 'hi' ? 'दूसरों से जुड़ें और विश्वास करना सीखें' : 'Connect with others and learn to trust'
                    },
                    {
                      num: 8,
                      planet: 'Saturn',
                      keywords: language === 'hi' ? ['शक्ति', 'धन', 'सफलता', 'अधिकार'] : ['Power', 'Wealth', 'Success', 'Authority'],
                      strengths: language === 'hi' ? ['मजबूत इच्छाशक्ति', 'व्यापारिक', 'संगठित', 'नेतृत्व क्षमता'] : ['Strong will', 'Business-minded', 'Organized', 'Leadership'],
                      weaknesses: language === 'hi' ? ['भौतिकवादी', 'कठोर', 'अधिक महत्वाकांक्षी', 'भावनात्मक रूप से दूर'] : ['Materialistic', 'Harsh', 'Over-ambitious', 'Emotionally distant'],
                      advice: language === 'hi' ? 'भावनात्मक संतुलन बनाए रखें और दूसरों की मदद करें' : 'Maintain emotional balance and help others'
                    },
                    {
                      num: 9,
                      planet: 'Mars',
                      keywords: language === 'hi' ? ['सार्वभौमिक प्रेम', 'सेवा', 'मानवता', 'उदारता'] : ['Universal love', 'Service', 'Humanity', 'Generosity'],
                      strengths: language === 'hi' ? ['उदार', 'सेवा भावना', 'कलात्मक', 'आदर्शवादी'] : ['Generous', 'Service-oriented', 'Artistic', 'Idealistic'],
                      weaknesses: language === 'hi' ? ['अधिक आदर्शवादी', 'भावनात्मक', 'अधिक देने वाला', 'अस्वीकार करने में कठिनाई'] : ['Over-idealistic', 'Emotional', 'Over-giving', 'Difficulty saying no'],
                      advice: language === 'hi' ? 'स्वयं की देखभाल करें और यथार्थवादी बनें' : 'Take care of yourself and be realistic'
                    }
                  ].map((numData, idx) => (
                    <div 
                      key={idx}
                      className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-4xl font-bold text-cyan-400">{numData.num}</div>
                        <div>
                          <h4 className="text-cyan-300 font-bold">{numData.planet}</h4>
                          <p className="text-xs text-slate-500">{language === 'hi' ? 'ग्रह' : 'Planet'}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-cyan-400 font-bold mb-2 uppercase">
                            {language === 'hi' ? 'मुख्य शब्द' : 'Keywords'}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {numData.keywords.map((kw, i) => (
                              <span key={i} className="px-2 py-1 bg-cyan-900/30 rounded text-xs text-cyan-200">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-green-400 font-bold mb-2 uppercase">
                            {language === 'hi' ? 'शक्तियां' : 'Strengths'}
                          </p>
                          <ul className="space-y-1">
                            {numData.strengths.map((s, i) => (
                              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                <span className="text-green-400 mt-1">✓</span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs text-orange-400 font-bold mb-2 uppercase">
                            {language === 'hi' ? 'कमजोरियां' : 'Weaknesses'}
                          </p>
                          <ul className="space-y-1">
                            {numData.weaknesses.map((w, i) => (
                              <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                <span className="text-orange-400 mt-1">⚠</span>
                                <span>{w}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="pt-3 border-t border-slate-700">
                          <p className="text-xs text-amber-400 font-bold mb-1 uppercase">
                            {language === 'hi' ? 'सलाह' : 'Advice'}
                          </p>
                          <p className="text-xs text-amber-200 italic">{numData.advice}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Calculation Methods */}
          <div className="bg-slate-950/60 p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-xl">
            <button
              onClick={() => toggleSection('calculations')}
              className="w-full flex items-center justify-between mb-6"
            >
              <h3 className="text-2xl font-serif text-emerald-300 flex items-center gap-3">
                <span className="text-3xl">🧮</span>
                {language === 'hi' ? 'गणना विधियां' : 'Calculation Methods'}
              </h3>
              <svg 
                className={`w-6 h-6 text-emerald-400 transition-transform duration-300 ${expandedSections.calculations ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSections.calculations && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                  <h4 className="text-emerald-300 font-bold text-lg mb-4">
                    {language === 'hi' ? 'पाइथागोरस प्रणाली (अक्षर-संख्या मानचित्र)' : 'Pythagorean System (Letter-Number Chart)'}
                  </h4>
                  <div className="grid grid-cols-3 md:grid-cols-9 gap-3 mb-4">
                    {[
                      { letters: 'A, J, S', num: 1 },
                      { letters: 'B, K, T', num: 2 },
                      { letters: 'C, L, U', num: 3 },
                      { letters: 'D, M, V', num: 4 },
                      { letters: 'E, N, W', num: 5 },
                      { letters: 'F, O, X', num: 6 },
                      { letters: 'G, P, Y', num: 7 },
                      { letters: 'H, Q, Z', num: 8 },
                      { letters: 'I, R', num: 9 }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 text-center">
                        <div className="text-xs text-slate-400 mb-1">{item.letters}</div>
                        <div className="text-2xl font-bold text-emerald-400">{item.num}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm">
                    {language === 'hi' 
                      ? 'प्रत्येक अक्षर को उसकी संख्या से बदलें, सभी संख्याओं को जोड़ें, और एक अंक में कम करें (11, 22, 33 को छोड़कर)।'
                      : 'Replace each letter with its number, add all numbers, and reduce to single digit (except 11, 22, 33).'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                    <h4 className="text-emerald-300 font-bold mb-4 flex items-center gap-2">
                      <span>📐</span>
                      {language === 'hi' ? 'संख्या कम करने की विधि' : 'Number Reduction Method'}
                    </h4>
                    <div className="space-y-3 text-sm text-slate-300">
                      <p>{language === 'hi' ? 'उदाहरण: 28' : 'Example: 28'}</p>
                      <div className="bg-slate-800/50 p-3 rounded-lg font-mono">
                        <div>28 → 2 + 8 = 10</div>
                        <div>10 → 1 + 0 = <span className="text-emerald-400 font-bold">1</span></div>
                      </div>
                      <p className="text-xs text-slate-400">
                        {language === 'hi' 
                          ? '11, 22, 33 को कम न करें - ये मास्टर संख्याएं हैं'
                          : 'Do not reduce 11, 22, 33 - these are master numbers'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                    <h4 className="text-emerald-300 font-bold mb-4 flex items-center gap-2">
                      <span>📝</span>
                      {language === 'hi' ? 'नाम गणना उदाहरण' : 'Name Calculation Example'}
                    </h4>
                    <div className="space-y-3 text-sm text-slate-300">
                      <p>{language === 'hi' ? 'नाम: "RAJ"' : 'Name: "RAJ"'}</p>
                      <div className="bg-slate-800/50 p-3 rounded-lg font-mono text-xs">
                        <div>R = 9</div>
                        <div>A = 1</div>
                        <div>J = 1</div>
                        <div className="mt-2 border-t border-slate-700 pt-2">
                          9 + 1 + 1 = 11 → <span className="text-emerald-400 font-bold">11 (Master Number)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Number Compatibility */}
          <div className="bg-slate-950/60 p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-xl">
            <button
              onClick={() => toggleSection('compatibility')}
              className="w-full flex items-center justify-between mb-6"
            >
              <h3 className="text-2xl font-serif text-rose-300 flex items-center gap-3">
                <span className="text-3xl">💑</span>
                {language === 'hi' ? 'संख्या संगतता' : 'Number Compatibility'}
              </h3>
              <svg 
                className={`w-6 h-6 text-rose-400 transition-transform duration-300 ${expandedSections.compatibility ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSections.compatibility && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 mb-6">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {language === 'hi' 
                      ? 'संख्याएं तीन परिवारों में आती हैं। एक ही परिवार की संख्याएं एक-दूसरे के साथ अच्छी तरह से मेल खाती हैं।'
                      : 'Numbers come in three families. Numbers from the same family match well with each other.'}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      family: language === 'hi' ? 'अग्नि परिवार' : 'Fire Family',
                      numbers: [1, 4, 7],
                      color: 'from-red-500/20 to-orange-500/20',
                      desc: language === 'hi' 
                        ? 'नेतृत्व, स्थिरता, आध्यात्मिकता - ये संख्याएं एक-दूसरे को मजबूत करती हैं'
                        : 'Leadership, stability, spirituality - these numbers strengthen each other'
                    },
                    {
                      family: language === 'hi' ? 'पृथ्वी परिवार' : 'Earth Family',
                      numbers: [2, 8],
                      color: 'from-green-500/20 to-emerald-500/20',
                      desc: language === 'hi' 
                        ? 'सहयोग, शक्ति, धन - ये संख्याएं एक-दूसरे के साथ सामंजस्य बनाती हैं'
                        : 'Cooperation, power, wealth - these numbers create harmony with each other'
                    },
                    {
                      family: language === 'hi' ? 'वायु परिवार' : 'Air Family',
                      numbers: [3, 6, 9],
                      color: 'from-blue-500/20 to-cyan-500/20',
                      desc: language === 'hi' 
                        ? 'रचनात्मकता, प्रेम, सेवा - ये संख्याएं एक-दूसरे को पूरक करती हैं'
                        : 'Creativity, love, service - these numbers complement each other'
                    }
                  ].map((fam, idx) => (
                    <div 
                      key={idx}
                      className={`bg-gradient-to-br ${fam.color} p-6 rounded-2xl border border-slate-800`}
                    >
                      <h4 className="text-white font-bold text-lg mb-3">{fam.family}</h4>
                      <div className="flex gap-2 mb-3">
                        {fam.numbers.map(n => (
                          <div key={n} className="w-12 h-12 rounded-full bg-slate-900/50 border border-slate-700 flex items-center justify-center text-2xl font-bold text-white">
                            {n}
                          </div>
                        ))}
                      </div>
                      <p className="text-slate-300 text-sm">{fam.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                  <h4 className="text-rose-300 font-bold mb-4">
                    {language === 'hi' ? 'संगतता नियम' : 'Compatibility Rules'}
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">✓</span>
                      <span>
                        {language === 'hi' 
                          ? 'एक ही परिवार की संख्याएं: उत्कृष्ट संगतता'
                          : 'Same family numbers: Excellent compatibility'}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-400 mt-1">○</span>
                      <span>
                        {language === 'hi' 
                          ? 'अलग परिवार की संख्याएं: सामान्य संगतता'
                          : 'Different family numbers: Normal compatibility'}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">⚠</span>
                      <span>
                        {language === 'hi' 
                          ? 'विपरीत संख्याएं: चुनौतीपूर्ण, लेकिन सीखने का अवसर'
                          : 'Opposite numbers: Challenging, but learning opportunity'}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* History & Background */}
          <div className="bg-slate-950/60 p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-xl">
            <button
              onClick={() => toggleSection('history')}
              className="w-full flex items-center justify-between mb-6"
            >
              <h3 className="text-2xl font-serif text-indigo-300 flex items-center gap-3">
                <span className="text-3xl">📜</span>
                {language === 'hi' ? 'अंक ज्योतिष का इतिहास' : 'History of Numerology'}
              </h3>
              <svg 
                className={`w-6 h-6 text-indigo-400 transition-transform duration-300 ${expandedSections.history ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSections.history && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                    <h4 className="text-indigo-300 font-bold mb-4 flex items-center gap-2">
                      <span>🏛️</span>
                      {language === 'hi' ? 'प्राचीन उत्पत्ति' : 'Ancient Origins'}
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed mb-3">
                      {language === 'hi' 
                        ? 'अंक ज्योतिष हजारों वर्ष पुराना है। यह प्राचीन सभ्यताओं जैसे बेबीलोन, मिस्र, ग्रीस और भारत में विकसित हुआ। पाइथागोरस ने ग्रीस में संख्या-अक्षर प्रणाली विकसित की, जो आज भी उपयोग में है।'
                        : 'Numerology is thousands of years old. It developed in ancient civilizations like Babylon, Egypt, Greece, and India. Pythagoras developed the number-letter system in Greece, which is still used today.'}
                    </p>
                  </div>
                  <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                    <h4 className="text-indigo-300 font-bold mb-4 flex items-center gap-2">
                      <span>🌍</span>
                      {language === 'hi' ? 'विभिन्न प्रणालियां' : 'Different Systems'}
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-400 mt-1">•</span>
                        <span><strong>Pythagorean:</strong> {language === 'hi' ? 'पश्चिमी दुनिया में सबसे लोकप्रिय' : 'Most popular in Western world'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-400 mt-1">•</span>
                        <span><strong>Chaldean:</strong> {language === 'hi' ? 'प्राचीन बेबीलोन से, नाम पर अधिक ध्यान' : 'From ancient Babylon, focuses more on names'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-400 mt-1">•</span>
                        <span><strong>Vedic:</strong> {language === 'hi' ? 'भारतीय प्रणाली, ग्रहों से जुड़ी' : 'Indian system, connected to planets'}</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                  <h4 className="text-indigo-300 font-bold mb-4 flex items-center gap-2">
                    <span>🔬</span>
                    {language === 'hi' ? 'आधुनिक अनुप्रयोग' : 'Modern Applications'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        title: language === 'hi' ? 'व्यक्तिगत विकास' : 'Personal Development',
                        items: language === 'hi' 
                          ? ['आत्म-जागरूकता', 'ताकत और कमजोरियां', 'जीवन उद्देश्य']
                          : ['Self-awareness', 'Strengths & weaknesses', 'Life purpose']
                      },
                      {
                        title: language === 'hi' ? 'रिश्ते' : 'Relationships',
                        items: language === 'hi' 
                          ? ['संगतता', 'संचार शैली', 'समझ']
                          : ['Compatibility', 'Communication style', 'Understanding']
                      },
                      {
                        title: language === 'hi' ? 'करियर' : 'Career',
                        items: language === 'hi' 
                          ? ['उपयुक्त क्षेत्र', 'व्यापार नाम', 'सफलता के अवसर']
                          : ['Suitable fields', 'Business names', 'Success opportunities']
                      }
                    ].map((app, idx) => (
                      <div key={idx} className="p-4 bg-slate-800/50 rounded-xl">
                        <h5 className="text-indigo-200 font-bold text-sm mb-2">{app.title}</h5>
                        <ul className="space-y-1">
                          {app.items.map((item, i) => (
                            <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                              <span className="text-indigo-400 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Number-Planet Association */}
          <div className="bg-slate-950/60 p-6 sm:p-8 rounded-3xl border border-teal-500/20">
            <h3 className="text-2xl sm:text-3xl font-serif text-teal-200 mb-6 sm:mb-8 flex items-center gap-4">
              <span className="text-3xl sm:text-4xl">🔢</span>
              {language === 'hi' ? 'संख्या-ग्रह संबंध' : 'Number-Planet Association'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3 sm:gap-4">
              {[
                { n: 1, p: 'Sun', icon: '☀️', desc: language === 'hi' ? 'नेतृत्व, आत्मविश्वास' : 'Leadership, confidence' },
                { n: 2, p: 'Moon', icon: '🌙', desc: language === 'hi' ? 'भावनाएं, सहजज्ञान' : 'Emotions, intuition' },
                { n: 3, p: 'Jupiter', icon: '♃', desc: language === 'hi' ? 'ज्ञान, विस्तार' : 'Wisdom, expansion' },
                { n: 4, p: 'Rahu', icon: '☊', desc: language === 'hi' ? 'विद्रोह, भ्रम' : 'Rebellion, illusion' },
                { n: 5, p: 'Mercury', icon: '☿️', desc: language === 'hi' ? 'बुद्धि, संचार' : 'Intelligence, communication' },
                { n: 6, p: 'Venus', icon: '♀️', desc: language === 'hi' ? 'प्रेम, सौंदर्य' : 'Love, beauty' },
                { n: 7, p: 'Ketu', icon: '☋', desc: language === 'hi' ? 'आध्यात्मिकता' : 'Spirituality' },
                { n: 8, p: 'Saturn', icon: '♄', desc: language === 'hi' ? 'कर्म, अनुशासन' : 'Karma, discipline' },
                { n: 9, p: 'Mars', icon: '♂️', desc: language === 'hi' ? 'ऊर्जा, साहस' : 'Energy, courage' }
              ].map(x => (
                <div key={x.n} className="bg-gradient-to-br from-slate-800/20 to-slate-900/20 border border-slate-800 p-4 sm:p-6 rounded-2xl text-center hover:border-teal-500 transition-all">
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-2">{x.n}</div>
                  <div className="text-2xl mb-2">{x.icon}</div>
                  <div className="text-[9px] sm:text-[10px] text-teal-400 font-bold uppercase mb-1">{x.p}</div>
                  <div className="text-[8px] sm:text-[9px] text-slate-500 leading-tight">{x.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-950/60 p-6 sm:p-8 rounded-3xl border border-slate-800">
            <h4 className="text-teal-200 font-serif text-lg sm:text-xl mb-4 sm:mb-6">
              {language === 'hi' ? 'भाग्यशाली संख्याएं' : 'Lucky Numbers Guide'}
            </h4>
            
            <div className="mb-6">
              <label className="block text-xs text-slate-400 mb-2">
                {language === 'hi' ? 'जन्म तिथि' : 'Birth Date'}
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => {
                  setBirthDate(e.target.value);
                  generateLuckyGuide(e.target.value);
                }}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-300 focus:outline-none focus:border-teal-500/50 transition-colors"
              />
            </div>

            {lifePathNumber && (
              <div className="mb-6 p-4 bg-gradient-to-r from-teal-900/30 to-emerald-900/30 border border-teal-500/40 rounded-xl shadow-lg">
                <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">
                  {language === 'hi' ? 'जीवन पथ संख्या' : 'Life Path Number'}
                </p>
                <p className="text-3xl font-bold text-teal-400">{lifePathNumber}</p>
              </div>
            )}

            {numberGuide.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
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
                      className={`p-4 rounded-xl text-center border transition-all ${style.bg} ${style.border} ${style.shadow}`}
                    >
                      <div className={`text-3xl font-bold mb-2 ${style.text}`}>
                        {item.number}
                      </div>
                      <div className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${style.text}`}>
                        {style.label}
                      </div>
                    </div>
                  );
                })}
                </div>

                {/* Lucky Days Section */}
                {luckyDays.length > 0 && (
                  <div className="mb-6 p-4 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/40 rounded-xl">
                    <h5 className="text-indigo-300 font-serif text-base sm:text-lg mb-3 flex items-center gap-2">
                      <span className="text-xl">📅</span>
                      {language === 'hi' ? 'शुभ दिन' : 'Lucky Days'}
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {luckyDays.map((day, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1.5 bg-indigo-800/40 border border-indigo-500/50 rounded-lg text-sm text-indigo-200 font-medium"
                        >
                          {DAY_NAMES[day]?.[language === 'hi' ? 'hi' : 'en'] || day}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lucky Colors Section */}
                {luckyColors.length > 0 && (
                  <div className="mb-6 p-4 bg-gradient-to-br from-rose-900/30 to-pink-900/30 border border-rose-500/40 rounded-xl">
                    <h5 className="text-rose-300 font-serif text-base sm:text-lg mb-3 flex items-center gap-2">
                      <span className="text-xl">🎨</span>
                      {language === 'hi' ? 'शुभ रंग' : 'Lucky Colors'}
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {luckyColors.map((colorTuple, idx) => {
                        const [colorName, colorHex] = colorTuple;
                        return (
                          <div 
                            key={idx}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/40 border border-rose-500/50 rounded-lg hover:scale-105 transition-transform"
                          >
                            <div 
                              className="w-5 h-5 rounded-full border-2 border-slate-600 shadow-lg"
                              style={{ backgroundColor: colorHex }}
                            ></div>
                            <span className="text-sm text-rose-200 font-medium">{colorName}</span>
                            <span className="text-[10px] text-rose-400/70 font-mono">{colorHex}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Lucky Gemstones Section */}
                {luckyGemstones.length > 0 && (
                  <div className="mb-6 p-4 bg-gradient-to-br from-amber-900/30 to-yellow-900/30 border border-amber-500/40 rounded-xl">
                    <h5 className="text-amber-300 font-serif text-base sm:text-lg mb-3 flex items-center gap-2">
                      <span className="text-xl">💎</span>
                      {language === 'hi' ? 'शुभ रत्न' : 'Lucky Gemstones'}
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {luckyGemstones.map((gemstone, idx) => (
                        <span 
                          key={idx}
                          className="px-4 py-2 bg-amber-800/40 border border-amber-500/50 rounded-lg text-sm text-amber-200 font-medium"
                        >
                          {gemstone}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extended Features Section */}
                <div className="mt-8 space-y-6">
                  <h4 className="text-xl font-serif text-teal-200 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🔮</span>
                    {language === 'hi' ? 'विस्तारित सुविधाएं' : 'Extended Features'}
                  </h4>

                  {/* Input Form for Extended Features */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div>
                      <label className="block text-xs text-slate-400 mb-2">
                        {language === 'hi' ? 'पूरा नाम' : 'Full Name'}
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (birthDate && lifePathNumber) {
                            setInitialsResult(luckyInitials(e.target.value, lifePathNumber));
                          }
                        }}
                        placeholder={language === 'hi' ? 'अपना पूरा नाम दर्ज करें' : 'Enter your full name'}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:border-teal-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-2">
                        {language === 'hi' ? 'लिंग' : 'Gender'}
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => {
                          setGender(e.target.value as 'M' | 'F');
                          if (birthDate) {
                            const year = parseInt(birthDate.split('-')[0]);
                            if (year) {
                              setKuaNumber(calculateKuaNumber(year, e.target.value as 'M' | 'F'));
                            }
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:border-teal-500/50"
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
                          if (birthDate && lifePathNumber) {
                            setMobileResult(checkMobileLucky(e.target.value, lifePathNumber));
                          }
                        }}
                        placeholder={language === 'hi' ? '9876543210' : '9876543210'}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:border-teal-500/50"
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
                          if (birthDate && lifePathNumber) {
                            setVehicleResult(checkVehicleLucky(e.target.value, lifePathNumber));
                          }
                        }}
                        placeholder={language === 'hi' ? 'MH04AB1234' : 'MH04AB1234'}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:border-teal-500/50"
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
                          if (birthDate && lifePathNumber) {
                            setBusinessResult(businessNameRating(e.target.value, lifePathNumber));
                          }
                        }}
                        placeholder={language === 'hi' ? 'व्यापार का नाम' : 'Business Name'}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:border-teal-500/50"
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
                          if (birthDate && lifePathNumber) {
                            setMarriageResult(marriageDateCompatibility(e.target.value, lifePathNumber));
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:border-teal-500/50"
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
                          if (birthDate && lifePathNumber) {
                            setHouseResult(houseNumberCompatibility(e.target.value, lifePathNumber));
                          }
                        }}
                        placeholder={language === 'hi' ? '902' : '902'}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:border-teal-500/50"
                      />
                    </div>
                  </div>

                  {/* Results Display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mobile Number Result */}
                    {mobileResult && (
                      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                        <h6 className="text-teal-300 font-bold text-sm mb-2 flex items-center gap-2">
                          <span>📱</span>
                          {language === 'hi' ? 'मोबाइल संगतता' : 'Mobile Compatibility'}
                        </h6>
                        <div className="space-y-1 text-xs">
                          <p className="text-slate-400">{mobileResult.mobile}</p>
                          <p className="text-slate-300">
                            {language === 'hi' ? 'अंतिम अंक' : 'Last Digit'}: <span className="font-bold text-teal-400">{mobileResult.lastDigit}</span>
                          </p>
                          <p className={`font-bold ${
                            mobileResult.compatibility === 'Excellent' ? 'text-emerald-400' :
                            mobileResult.compatibility === 'Good' ? 'text-teal-400' :
                            mobileResult.compatibility === 'Average' ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {mobileResult.compatibility}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Vehicle Number Result */}
                    {vehicleResult && (
                      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                        <h6 className="text-teal-300 font-bold text-sm mb-2 flex items-center gap-2">
                          <span>🚗</span>
                          {language === 'hi' ? 'वाहन संगतता' : 'Vehicle Compatibility'}
                        </h6>
                        <div className="space-y-1 text-xs">
                          <p className="text-slate-400">{vehicleResult.vehicleNumber}</p>
                          <p className="text-slate-300">
                            {language === 'hi' ? 'कुल योग' : 'Sum'}: <span className="font-bold text-teal-400">{vehicleResult.reducedSum}</span>
                          </p>
                          <p className={`font-bold ${
                            vehicleResult.status === 'Very Lucky' ? 'text-emerald-400' :
                            vehicleResult.status === 'Lucky' ? 'text-teal-400' :
                            vehicleResult.status === 'Neutral' ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {vehicleResult.status}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Business Name Result */}
                    {businessResult && (
                      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                        <h6 className="text-teal-300 font-bold text-sm mb-2 flex items-center gap-2">
                          <span>🏢</span>
                          {language === 'hi' ? 'व्यापार रेटिंग' : 'Business Rating'}
                        </h6>
                        <div className="space-y-1 text-xs">
                          <p className="text-slate-400">{businessResult.businessName}</p>
                          <p className="text-slate-300">
                            {language === 'hi' ? 'नाम संख्या' : 'Name Number'}: <span className="font-bold text-teal-400">{businessResult.nameNumber}</span>
                          </p>
                          <p className={`font-bold ${
                            businessResult.rating === 'Excellent' ? 'text-emerald-400' :
                            businessResult.rating === 'Good' ? 'text-teal-400' :
                            businessResult.rating === 'Average' ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {businessResult.rating}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Marriage Date Result */}
                    {marriageResult && (
                      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                        <h6 className="text-teal-300 font-bold text-sm mb-2 flex items-center gap-2">
                          <span>💍</span>
                          {language === 'hi' ? 'विवाह तिथि' : 'Marriage Date'}
                        </h6>
                        <div className="space-y-1 text-xs">
                          <p className="text-slate-400">{marriageResult.marriageDate}</p>
                          <p className="text-slate-300">
                            {language === 'hi' ? 'दिन संख्या' : 'Day Number'}: <span className="font-bold text-teal-400">{marriageResult.dayNum}</span>
                          </p>
                          <p className={`font-bold ${
                            marriageResult.status === 'Very Auspicious' ? 'text-emerald-400' :
                            marriageResult.status === 'Auspicious' ? 'text-teal-400' :
                            marriageResult.status === 'Neutral' ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {marriageResult.status}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* House Number Result */}
                    {houseResult && (
                      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                        <h6 className="text-teal-300 font-bold text-sm mb-2 flex items-center gap-2">
                          <span>🏠</span>
                          {language === 'hi' ? 'घर संगतता' : 'House Compatibility'}
                        </h6>
                        <div className="space-y-1 text-xs">
                          <p className="text-slate-400">{houseResult.houseNumber}</p>
                          <p className="text-slate-300">
                            {language === 'hi' ? 'कंपन' : 'Vibration'}: <span className="font-bold text-teal-400">{houseResult.vibration}</span>
                          </p>
                          <p className={`font-bold ${
                            houseResult.compatibility.includes('Very Lucky') ? 'text-emerald-400' :
                            houseResult.compatibility.includes('Lucky') ? 'text-teal-400' :
                            houseResult.compatibility.includes('Neutral') ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {houseResult.compatibility}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Signature Initials Result */}
                  {initialsResult && initialsResult.initials.length > 0 && (
                    <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                      <h6 className="text-teal-300 font-bold text-sm mb-3 flex items-center gap-2">
                        <span>✍️</span>
                        {language === 'hi' ? 'हस्ताक्षर प्रारंभिक' : 'Signature Initials'}
                      </h6>
                      <div className="flex flex-wrap gap-2">
                        {initialsResult.initials.map((item: any, idx: number) => (
                          <div 
                            key={idx}
                            className={`px-3 py-2 rounded-lg border text-xs ${
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
                  {lifePathNumber && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {kuaNumber && (
                        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                          <h6 className="text-teal-300 font-bold text-sm mb-2 flex items-center gap-2">
                            <span>🧭</span>
                            {language === 'hi' ? 'फेंग शुई कुआ नंबर' : 'Feng Shui Kua Number'}
                          </h6>
                          <p className="text-3xl font-bold text-teal-400">{kuaNumber}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {language === 'hi' ? 'दिशा और ऊर्जा मार्गदर्शन' : 'Direction & Energy Guidance'}
                          </p>
                        </div>
                      )}

                      {loShuMatrix && (
                        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                          <h6 className="text-teal-300 font-bold text-sm mb-3 flex items-center gap-2">
                            <span>🔢</span>
                            {language === 'hi' ? 'लो-शू मैट्रिक्स' : 'Lo-Shu Matrix'}
                          </h6>
                          <div className="grid grid-cols-3 gap-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                              <div 
                                key={num}
                                className={`p-2 rounded-lg text-center border ${
                                  loShuMatrix[num] > 0 
                                    ? 'bg-teal-900/40 border-teal-500/50 text-teal-300' 
                                    : 'bg-slate-800/40 border-slate-700/50 text-slate-600'
                                }`}
                              >
                                <div className="text-lg font-bold">{num}</div>
                                <div className="text-[10px]">{loShuMatrix[num] || 0}x</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <AdBanner variant="display" className="mt-8" />
    </div>
  );
};

export default NumerologyGuide;

