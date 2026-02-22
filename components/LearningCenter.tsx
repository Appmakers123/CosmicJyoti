
import React, { useState } from 'react';
import { useTranslation } from '../utils/translations';
import { Language } from '../types';
import { PLANETS_INFO, HOUSES_INFO, ZODIAC_SIGNS, NAKSHATRAS_INFO, ZODIAC_SIGNS_DETAILED, PLANETS_INFO_DETAILED } from '../constants';
import { generateConjunctionAnalysis } from '../services/geminiService';
import { calculateLifePath, calculateBirthday } from '../utils/numerologyUtils';
import AdBanner from './AdBanner';
import RichText from './RichText';
import { ModuleIntro } from './common';

interface LearningCenterProps {
  language: Language;
}

type Category = 'vedic' | 'zodiac' | 'nakshatra' | 'kundali' | 'palmistry' | 'numerology' | 'lab';

const LearningCenter: React.FC<LearningCenterProps> = ({ language }) => {
  const t = useTranslation(language);
  
  // Get initial tab from sessionStorage if navigating from a service
  const getInitialTab = (): Category => {
    const storedTab = sessionStorage.getItem('learningActiveTab');
    if (storedTab && ['vedic', 'zodiac', 'nakshatra', 'kundali', 'palmistry', 'numerology', 'lab'].includes(storedTab)) {
      sessionStorage.removeItem('learningActiveTab');
      return storedTab as Category;
    }
    return 'vedic';
  };
  
  const [activeTab, setActiveTab] = useState<Category>(getInitialTab());
  
  // Foundations state
  const [view, setView] = useState<'planets' | 'houses'>('planets');
  
  // Zodiac signs state
  const [selectedSign, setSelectedSign] = useState<any>(ZODIAC_SIGNS_DETAILED[0]);
  
  // Interactive states
  const [selectedNakshatra, setSelectedNakshatra] = useState<any>(NAKSHATRAS_INFO[0]);
  const [p1, setP1] = useState(PLANETS_INFO[0].name);
  const [p2, setP2] = useState(PLANETS_INFO[1].name);
  const [p3, setP3] = useState<string>('');
  const [house, setHouse] = useState(1);
  const [conjunctionSign, setConjunctionSign] = useState(ZODIAC_SIGNS[0].name);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Numerology states
  const [birthDate, setBirthDate] = useState<string>('');
  const [luckyNumbers, setLuckyNumbers] = useState<number[]>([]);
  const [lifePathNumber, setLifePathNumber] = useState<number | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis(null);
    try {
        const planets = [p1, p2, ...(p3 ? [p3] : [])];
        const result = await generateConjunctionAnalysis(planets, house, conjunctionSign, language);
        setAnalysis(result);
    } catch (e) {
        setAnalysis("The celestial archives are obscured. Try again.");
    } finally {
        setLoading(false);
    }
  };

  const calculateLuckyNumbers = () => {
    if (!birthDate) {
      setLuckyNumbers([]);
      setLifePathNumber(null);
      return;
    }

    // Calculate Life Path Number
    const lifePath = calculateLifePath(birthDate);
    setLifePathNumber(lifePath);

    // Calculate Birthday Number
    const birthdayNum = calculateBirthday(birthDate);

    // Generate lucky numbers based on numerology principles
    const lucky: number[] = [];
    
    // Primary lucky numbers
    lucky.push(lifePath); // Life Path Number
    lucky.push(birthdayNum); // Birthday Number
    
    // Derived lucky numbers
    if (lifePath <= 9) {
      lucky.push(lifePath + 1 > 9 ? lifePath + 1 - 9 : lifePath + 1);
      lucky.push(lifePath - 1 < 1 ? lifePath - 1 + 9 : lifePath - 1);
      lucky.push((lifePath * 2) > 9 ? reduceToSingle((lifePath * 2)) : lifePath * 2);
      lucky.push((lifePath + 3) > 9 ? reduceToSingle(lifePath + 3) : lifePath + 3);
      lucky.push((lifePath + 6) > 9 ? reduceToSingle(lifePath + 6) : lifePath + 6);
    } else {
      // For master numbers (11, 22, 33), use them directly and add related numbers
      lucky.push(11);
      lucky.push(22);
      lucky.push(33);
    }

    // Add birthday related numbers
    if (birthdayNum !== lifePath) {
      lucky.push(birthdayNum);
      if (birthdayNum <= 9) {
        lucky.push(birthdayNum + 1 > 9 ? birthdayNum + 1 - 9 : birthdayNum + 1);
        lucky.push(birthdayNum - 1 < 1 ? birthdayNum - 1 + 9 : birthdayNum - 1);
      }
    }

    // Remove duplicates, filter to 1-9 range (or master numbers), and sort
    const unique = [...new Set(lucky)]
      .filter(num => (num >= 1 && num <= 9) || num === 11 || num === 22 || num === 33)
      .sort((a, b) => a - b);
    
    setLuckyNumbers(unique);
  };

  const reduceToSingle = (num: number): number => {
    if (num === 11 || num === 22 || num === 33) return num;
    if (num < 10) return num;
    const sum = num.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    return reduceToSingle(sum);
  };

  // Calculate lucky numbers when birth date changes
  React.useEffect(() => {
    calculateLuckyNumbers();
  }, [birthDate]);


  const TabButton = ({ id, label, icon }: { id: Category, label: string, icon: string }) => (
    <button
      onClick={() => { setActiveTab(id); }}
      className={`flex flex-col items-center gap-2 px-4 py-4 rounded-[2rem] font-serif text-[10px] transition-all duration-500 border uppercase tracking-tighter ${
        activeTab === id 
          ? 'bg-amber-600 border-amber-400 text-white shadow-2xl scale-110' 
          : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-white hover:border-slate-600'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-24 animate-fade-in-up">
      <div className="mb-6">
        <ModuleIntro
          language={language}
          subtitleEn="Learn Vedic astrology – planets, houses, zodiac signs, nakshatras, Kundali basics, palmistry, numerology and planetary yoga."
          subtitleHi="वैदिक ज्योतिष सीखें – ग्रह, भाव, राशि, नक्षत्र, कुंडली बेसिक्स, हस्तरेखा, अंक ज्योतिष और योग।"
          descriptionEn="Cosmic Academy: explore foundations of Vedic astrology, divisional charts, Nakshatras and interactive tools. For education and self-study."
          descriptionHi="कॉस्मिक अकादमी: वैदिक ज्योतिष की नींव, विभाजन चार्ट, नक्षत्र और इंटरैक्टिव टूल। शिक्षा और स्व-अध्ययन।"
        />
      </div>
      <div className="text-center mb-16">
        <span className="text-[10px] uppercase font-bold tracking-[1em] text-amber-500 mb-2 block">Vishwa Vidya</span>
        <h2 className="text-5xl md:text-7xl font-serif text-amber-100 drop-shadow-lg">Cosmic Academy</h2>
        <p className="text-slate-500 text-sm italic tracking-[0.2em] mt-4 uppercase">Mastering the Science of the Unseen</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-12">
        <TabButton id="vedic" label={language === 'hi' ? 'ग्रह' : 'Planets'} icon="☀️" />
        <TabButton id="zodiac" label={language === 'hi' ? 'राशि' : 'Zodiac'} icon="⭐" />
        <TabButton id="nakshatra" label={language === 'hi' ? 'नक्षत्र' : 'Stars'} icon="✨" />
        <TabButton id="kundali" label={language === 'hi' ? 'कुंडली' : 'Kundali'} icon="🔯" />
        <TabButton id="palmistry" label={language === 'hi' ? 'हस्तरेखा' : 'Palmistry'} icon="✋" />
        <TabButton id="numerology" label={language === 'hi' ? 'अंक' : 'Numbers'} icon="🔢" />
        <TabButton id="lab" label={language === 'hi' ? 'योग' : 'Yoga'} icon="🧪" />
      </div>

      <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800 rounded-[4rem] p-6 md:p-16 min-h-[700px] shadow-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        {/* --- VEDIC FOUNDATIONS --- */}
        {activeTab === 'vedic' && (
            <div className="animate-fade-in space-y-12">
                <div className="flex justify-center gap-4 mb-12">
                    <button onClick={() => setView('planets')} className={`px-10 py-3 rounded-full text-xs font-bold transition-all ${view === 'planets' ? 'bg-amber-600 text-white' : 'bg-slate-950 border border-slate-800 text-slate-500'}`}>{t.the9Navagrahas}</button>
                    <button onClick={() => setView('houses')} className={`px-10 py-3 rounded-full text-xs font-bold transition-all ${view === 'houses' ? 'bg-amber-600 text-white' : 'bg-slate-950 border border-slate-800 text-slate-500'}`}>{t.the12Bhavas}</button>
                </div>

                {view === 'planets' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {PLANETS_INFO_DETAILED.map((p) => (
                            <div key={p.name} className="bg-slate-950/60 p-8 rounded-[2.5rem] border border-slate-800 group hover:border-amber-500/40 transition-all">
                                <div className={`w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center text-4xl mb-6 shadow-inner border border-slate-800 ${p.color} group-hover:scale-110 transition-transform`}>
                                    {p.symbol}
                                </div>
                                <h4 className={`text-2xl font-serif font-bold ${p.color} mb-3`}>{language === 'hi' ? p.hindi : p.name}</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">{language === 'hi' ? p.descriptionHi : p.description}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {HOUSES_INFO.map((h) => (
                            <div key={h.id} className="bg-slate-950/40 p-8 rounded-3xl border border-slate-800 hover:bg-slate-950 hover:border-amber-500/30 transition-all group">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="text-5xl font-bold text-slate-800 group-hover:text-amber-500/20 transition-colors">{h.id}</div>
                                    <div className="text-4xl group-hover:scale-110 transition-transform">{h.icon}</div>
                                </div>
                                <h5 className={`font-serif text-lg mb-2 ${h.color || 'text-amber-100'}`}>{language === 'hi' ? h.nameHi : h.name}</h5>
                                <p className="text-slate-500 text-xs leading-relaxed">{language === 'hi' ? h.descHi : h.desc}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* --- ZODIAC SIGNS DETAILED --- */}
        {activeTab === 'zodiac' && (
            <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4 space-y-6">
                    <h3 className="text-3xl font-serif text-amber-200">{language === 'hi' ? 'राशि चक्र' : 'Zodiac Signs'}</h3>
                    <p className="text-slate-500 text-sm italic">{language === 'hi' ? 'प्रत्येक राशि की शक्तियाँ और गुण' : 'Strengths and qualities of each sign'}</p>
                    <div className="grid grid-cols-2 gap-2 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar">
                        {ZODIAC_SIGNS_DETAILED.map(sign => (
                            <button 
                                key={sign.id} 
                                onClick={() => setSelectedSign(sign)}
                                className={`p-4 text-xs font-bold rounded-xl border transition-all text-left ${selectedSign?.id === sign.id ? 'bg-amber-600 border-amber-400 text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-white'}`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">{sign.element === 'Fire' ? '🔥' : sign.element === 'Earth' ? '🌍' : sign.element === 'Air' ? '💨' : '💧'}</span>
                                    <span>{language === 'hi' ? sign.hindiName : sign.name}</span>
                                </div>
                                <div className="text-[10px] opacity-70">{sign.dateRange}</div>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-8 bg-slate-950/60 p-12 rounded-[3rem] border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none"></div>
                    <div className="relative z-10 animate-fade-in-up">
                        <div className="mb-8 text-center">
                            <div className="flex items-center justify-center gap-4 mb-6">
                                <div className="text-8xl drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                                    {selectedSign.element === 'Fire' ? '🔥' : selectedSign.element === 'Earth' ? '🌍' : selectedSign.element === 'Air' ? '💨' : '💧'}
                                </div>
                            </div>
                            <div className="mb-4">
                                <h4 className="text-5xl font-serif text-amber-400 mb-2">{language === 'hi' ? selectedSign.hindiName : selectedSign.name}</h4>
                                <p className="text-slate-400 text-sm">{selectedSign.dateRange} • {selectedSign.element} {language === 'hi' ? 'तत्व' : 'Element'}</p>
                            </div>
                        </div>
                        <div className="mb-8">
                            <h5 className="text-xl font-serif text-amber-300 mb-4">{language === 'hi' ? 'मुख्य शक्तियाँ' : 'Key Strengths'}</h5>
                            <p className="text-slate-300 text-base leading-relaxed mb-6">{language === 'hi' ? selectedSign.strengthsHi : selectedSign.strengths}</p>
                        </div>
                        <div>
                            <h5 className="text-xl font-serif text-amber-300 mb-4">{language === 'hi' ? 'सकारात्मक गुण' : 'Positive Traits'}</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {(language === 'hi' ? selectedSign.positiveTraitsHi : selectedSign.positiveTraits).map((trait: string, idx: number) => (
                                    <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-center">
                                        <p className="text-sm text-amber-200 font-serif">{trait}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- KUNDALI LEARNING --- */}
        {activeTab === 'kundali' && (
            <div className="animate-fade-in space-y-8">
                <div className="text-center mb-8">
                    <h3 className="text-3xl sm:text-4xl font-serif text-amber-200 mb-4">{language === 'hi' ? 'कुंडली सीखें' : 'Learn Kundali'}</h3>
                    <p className="text-slate-400 text-sm sm:text-base">{language === 'hi' ? 'वैदिक ज्योतिष में कुंडली की मूल बातें' : 'Fundamentals of Kundali in Vedic Astrology'}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* What is Kundali */}
                    <div className="bg-slate-950/60 p-6 sm:p-8 rounded-3xl border border-amber-500/20">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-4xl">🧭</span>
                            <h4 className="text-2xl font-serif text-amber-300">{language === 'hi' ? 'कुंडली क्या है?' : 'What is Kundali?'}</h4>
                        </div>
                        <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
                            {language === 'hi' 
                                ? 'कुंडली एक जन्म चार्ट है जो जन्म के समय आकाश में ग्रहों की स्थिति को दर्शाता है। यह वैदिक ज्योतिष का आधार है और व्यक्ति के जीवन, व्यक्तित्व और भाग्य के बारे में जानकारी प्रदान करता है।'
                                : 'Kundali is a birth chart that shows the positions of planets in the sky at the time of birth. It is the foundation of Vedic astrology and provides insights about a person\'s life, personality, and destiny.'}
                        </p>
                        <div className="space-y-3 mt-6">
                            <div className="flex items-start gap-3">
                                <span className="text-amber-400 mt-1">•</span>
                                <p className="text-sm text-slate-400">
                                    {language === 'hi' ? '12 भाव (Houses) - जीवन के विभिन्न क्षेत्र' : '12 Houses (Bhavas) - Different areas of life'}
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-amber-400 mt-1">•</span>
                                <p className="text-sm text-slate-400">
                                    {language === 'hi' ? '9 ग्रह (Navagrahas) - जीवन पर प्रभाव' : '9 Planets (Navagrahas) - Influences on life'}
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-amber-400 mt-1">•</span>
                                <p className="text-sm text-slate-400">
                                    {language === 'hi' ? '12 राशियाँ - ग्रहों का स्थान' : '12 Zodiac Signs - Positions of planets'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* D1 and D9 Charts */}
                    <div className="bg-slate-950/60 p-6 sm:p-8 rounded-3xl border border-amber-500/20">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-4xl">📊</span>
                            <h4 className="text-2xl font-serif text-amber-300">{language === 'hi' ? 'चार्ट के प्रकार' : 'Types of Charts'}</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                                <h5 className="text-amber-200 font-bold mb-2">{language === 'hi' ? 'D1 (जन्म कुंडली)' : 'D1 (Birth Chart)'}</h5>
                                <p className="text-sm text-slate-400">
                                    {language === 'hi' 
                                        ? 'मुख्य जन्म चार्ट जो जीवन के सभी पहलुओं को दर्शाता है।'
                                        : 'Main birth chart showing all aspects of life.'}
                                </p>
                            </div>
                            <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                                <h5 className="text-amber-200 font-bold mb-2">{language === 'hi' ? 'D9 (नवमांश)' : 'D9 (Navamsha)'}</h5>
                                <p className="text-sm text-slate-400">
                                    {language === 'hi' 
                                        ? 'विवाह, साझेदारी और आध्यात्मिक जीवन के लिए महत्वपूर्ण।'
                                        : 'Important for marriage, partnerships, and spiritual life.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Reading a Kundali */}
                    <div className="bg-slate-950/60 p-6 sm:p-8 rounded-3xl border border-amber-500/20">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-4xl">📖</span>
                            <h4 className="text-2xl font-serif text-amber-300">{language === 'hi' ? 'कुंडली कैसे पढ़ें' : 'How to Read Kundali'}</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-900/50 rounded-2xl">
                                <h5 className="text-amber-200 font-bold text-sm mb-2">1. {language === 'hi' ? 'लग्न (Ascendant)' : 'Ascendant (Lagna)'}</h5>
                                <p className="text-xs text-slate-400">
                                    {language === 'hi' ? 'जन्म के समय पूर्वी क्षितिज पर उदय होने वाली राशि। यह व्यक्तित्व का आधार है।' : 'The rising sign at birth time. Foundation of personality.'}
                                </p>
                            </div>
                            <div className="p-4 bg-slate-900/50 rounded-2xl">
                                <h5 className="text-amber-200 font-bold text-sm mb-2">2. {language === 'hi' ? 'ग्रहों की स्थिति' : 'Planetary Positions'}</h5>
                                <p className="text-xs text-slate-400">
                                    {language === 'hi' ? 'कौन सा ग्रह किस भाव और राशि में है, यह जीवन के उस क्षेत्र को प्रभावित करता है।' : 'Which planet is in which house and sign affects that area of life.'}
                                </p>
                            </div>
                            <div className="p-4 bg-slate-900/50 rounded-2xl">
                                <h5 className="text-amber-200 font-bold text-sm mb-2">3. {language === 'hi' ? 'ग्रहों की शक्ति' : 'Planetary Strength'}</h5>
                                <p className="text-xs text-slate-400">
                                    {language === 'hi' ? 'ग्रह अपनी राशि में मजबूत होते हैं, शत्रु राशि में कमजोर।' : 'Planets are strong in their own signs, weak in enemy signs.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Important Concepts */}
                    <div className="bg-slate-950/60 p-6 sm:p-8 rounded-3xl border border-amber-500/20">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-4xl">💡</span>
                            <h4 className="text-2xl font-serif text-amber-300">{language === 'hi' ? 'महत्वपूर्ण अवधारणाएं' : 'Important Concepts'}</h4>
                        </div>
                        <div className="space-y-3">
                            {[
                                { term: language === 'hi' ? 'दशा' : 'Dasha', desc: language === 'hi' ? 'ग्रहों की अवधि जो जीवन के अलग-अलग चरणों को नियंत्रित करती है' : 'Planetary periods that control different phases of life' },
                                { term: language === 'hi' ? 'योग' : 'Yoga', desc: language === 'hi' ? 'ग्रहों का विशेष संयोजन जो विशेष परिणाम देता है' : 'Special combination of planets giving specific results' },
                                { term: language === 'hi' ? 'गोचर' : 'Transit', desc: language === 'hi' ? 'ग्रहों की वर्तमान स्थिति और उनका प्रभाव' : 'Current positions of planets and their effects' },
                                { term: language === 'hi' ? 'राहु-केतु' : 'Rahu-Ketu', desc: language === 'hi' ? 'चंद्रमा के उत्तरी और दक्षिणी नोड, कर्मिक बिंदु' : 'North and South nodes of Moon, karmic points' }
                            ].map((item, idx) => (
                                <div key={idx} className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                                    <h5 className="text-amber-300 font-bold text-sm mb-1">{item.term}</h5>
                                    <p className="text-xs text-slate-400">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 12 Bhavas (Houses) Detailed Guide */}
                    <div className="bg-slate-950/60 p-6 sm:p-8 rounded-3xl border border-amber-500/20">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-4xl">🏠</span>
                            <h4 className="text-2xl font-serif text-amber-300">{language === 'hi' ? '12 भाव (Houses) - विस्तृत मार्गदर्शन' : '12 Bhavas (Houses) - Detailed Guide'}</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {HOUSES_INFO.map((house) => (
                                <div key={house.id} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 hover:border-amber-500/30 transition-all group">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{house.icon}</span>
                                            <span className="text-3xl font-bold text-slate-700 group-hover:text-amber-500/30 transition-colors">{house.id}</span>
                                        </div>
                                    </div>
                                    <h5 className={`font-serif text-base mb-2 ${house.color || 'text-amber-200'}`}>
                                        {language === 'hi' ? house.nameHi : house.name}
                                    </h5>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        {language === 'hi' ? house.descHi : house.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- NAKSHATRA LIBRARY --- */}
        {activeTab === 'nakshatra' && (
            <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4 space-y-6">
                    <h3 className="text-3xl font-serif text-amber-200">{t.starLibrary}</h3>
                    <p className="text-slate-500 text-sm italic">{t.lunarMansions}</p>
                    <div className="grid grid-cols-3 gap-2 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar">
                        {NAKSHATRAS_INFO.map(n => (
                            <button 
                                key={n.name} 
                                onClick={() => setSelectedNakshatra(n)}
                                className={`p-3 text-[10px] font-bold rounded-xl border transition-all ${selectedNakshatra?.name === n.name ? 'bg-amber-600 border-amber-400 text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-white'}`}
                            >
                                <div className="text-lg mb-1">{n.symbol}</div>
                                {n.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-8 bg-slate-950/60 p-12 rounded-[3rem] border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                    <div className="relative z-10 animate-fade-in-up">
                        <div className="text-center mb-8">
                            <span className="text-8xl mb-4 block drop-shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse">{selectedNakshatra.symbol}</span>
                            <h4 className="text-5xl font-serif text-amber-400 mb-6">{selectedNakshatra.name}</h4>
                        </div>
                        <div className="flex justify-center gap-12 mb-10">
                            <div className="text-center">
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">{t.rulerPlanet}</p>
                                <p className="text-xl text-white font-serif">{selectedNakshatra.ruler}</p>
                            </div>
                            <div className="w-px h-12 bg-slate-800"></div>
                            <div className="text-center">
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">{t.natureTrait}</p>
                                <p className="text-xl text-white font-serif">{selectedNakshatra.trait}</p>
                            </div>
                        </div>
                        <div className="p-10 bg-slate-900/50 rounded-[2.5rem] text-slate-300 text-lg leading-relaxed max-w-xl mx-auto border border-slate-800 shadow-inner">
                            <p className="mb-4">{language === 'hi' ? selectedNakshatra.descriptionHi : selectedNakshatra.description}</p>
                            <p className="text-sm opacity-80">{t.thoseBornUnder} <strong>{selectedNakshatra.name}</strong> {t.nakshatraGifted} <em>{selectedNakshatra.trait}</em>. {t.underGuidance} <strong>{selectedNakshatra.ruler}</strong>, {t.theyEvolve}</p>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- ADVANCED PALMISTRY --- */}
        {activeTab === 'palmistry' && (
            <div className="animate-fade-in space-y-8">
                {/* Palm Diagram Section */}
                <div className="bg-slate-950/60 p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-xl">
                    <h3 className="text-2xl sm:text-3xl font-serif text-rose-300 mb-6 sm:mb-10 flex items-center gap-4">
                        <span className="p-3 bg-rose-900/20 rounded-2xl border border-rose-500/20 text-2xl sm:text-3xl">✋</span> 
                        {language === 'hi' ? 'हाथ की रेखाएं' : 'Palm Lines Guide'}
                    </h3>
                    
                    {/* Visual Palm Diagram */}
                    <div className="relative bg-slate-900/50 rounded-2xl p-4 sm:p-6 md:p-8 mb-8 border border-slate-700/50">
                        <div className="relative mx-auto w-full max-w-4xl">
                            <div className="relative w-full">
                                <img 
                                    src={language === 'hi' ? '/images/palmistry-hindi.jpg' : '/images/palmistry-english.jpg'}
                                    alt={language === 'hi' ? 'वैदिक हस्तरेखा शास्त्र - Palm Lines Guide' : 'Vedic Palmistry - Palm Lines Guide'}
                                    className="w-full h-auto rounded-xl shadow-2xl border border-slate-700/50 object-contain"
                                    onError={(e) => {
                                        // Fallback if image doesn't exist
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const fallback = target.nextElementSibling as HTMLElement;
                                        if (fallback) {
                                            fallback.style.display = 'block';
                                        }
                                    }}
                                />
                                <div className="image-fallback hidden text-center py-12 bg-slate-800/50 rounded-xl">
                                    <div className="text-6xl mb-4">✋</div>
                                    <p className="text-slate-400 text-sm mb-2">
                                        {language === 'hi' ? 'छवि लोड हो रही है...' : 'Loading palmistry chart...'}
                                    </p>
                                    <p className="text-slate-600 text-xs px-4">
                                        {language === 'hi' 
                                            ? 'कृपया सुनिश्चित करें कि छवि फ़ाइलें public/images/ में मौजूद हैं: palmistry-hindi.jpg और palmistry-english.jpg'
                                            : 'Please ensure image files exist in public/images/: palmistry-hindi.jpg and palmistry-english.jpg'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-xs text-slate-500 mt-4 italic">
                            {language === 'hi' ? 'वैदिक हस्तरेखा शास्त्र - मुख्य रेखाओं का दृश्य मार्गदर्शन' : 'Vedic Palmistry - Visual guide to main palm lines'}
                        </p>
                    </div>

                    {/* Detailed Line Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { 
                                name: t.heartLine, 
                                icon: '❤️', 
                                color: 'from-red-500/20 to-red-600/20',
                                borderColor: 'border-red-500/30',
                                body: language === 'hi' ? 'भावनात्मक परिपक्वता और रिश्ते की शैली। कई शाखाओं वाली रेखा समृद्ध सामाजिक जीवन का सुझाव देती है; एक गहरी एकल रेखा एक साथी पर गहन ध्यान का संकेत देती है।' : 'Emotional maturity and relationship style. A line with many branches suggests a rich social life; a deep single line indicates profound focus on one partner.',
                                details: language === 'hi' ? [
                                    'तर्जनी के नीचे से शुरू होती है',
                                    'हृदय रेखा की लंबाई भावनात्मक गहराई दिखाती है',
                                    'टूटी हुई रेखा भावनात्मक आघात का संकेत',
                                    'छोटी रेखा स्वतंत्र प्रकृति दिखाती है'
                                ] : [
                                    'Starts below the index finger',
                                    'Length shows emotional depth',
                                    'Broken line indicates emotional trauma',
                                    'Short line shows independent nature'
                                ]
                            },
                            { 
                                name: t.headLine, 
                                icon: '🧠', 
                                color: 'from-blue-500/20 to-blue-600/20',
                                borderColor: 'border-blue-500/30',
                                body: language === 'hi' ? 'मनोवैज्ञानिक शक्ति और बौद्धिक सहनशीलता। "चंद्र पर्वत" तक पहुंचने वाली रेखा तीव्र कल्पना और अंतर्ज्ञान का सुझाव देती है।' : 'Psychological power and intellectual stamina. A line reaching the "Moon mount" suggests intense imagination and intuition.',
                                details: language === 'hi' ? [
                                    'तर्जनी और अंगूठे के बीच से शुरू होती है',
                                    'लंबी रेखा बेहतर बौद्धिक क्षमता',
                                    'सीधी रेखा व्यावहारिक सोच',
                                    'झुकी हुई रेखा रचनात्मकता'
                                ] : [
                                    'Starts between index finger and thumb',
                                    'Long line indicates better intellectual capacity',
                                    'Straight line shows practical thinking',
                                    'Curved line indicates creativity'
                                ]
                            },
                            { 
                                name: t.lifeLine, 
                                icon: '🌱', 
                                color: 'from-green-500/20 to-green-600/20',
                                borderColor: 'border-green-500/30',
                                body: language === 'hi' ? 'शारीरिक जीवन शक्ति और प्रमुख जीवनशैली परिवर्तन। रेखा में टूटना अक्सर शहर, करियर, या मौलिक विश्वास प्रणाली में बदलाव का संकेत देता है।' : 'Physical vitality and major lifestyle shifts. A break in the line often signifies a change of city, career, or fundamental belief system.',
                                details: language === 'hi' ? [
                                    'अंगूठे के आधार से शुरू होती है',
                                    'गहरी रेखा मजबूत जीवन शक्ति',
                                    'टूटी रेखा जीवन में बड़े बदलाव',
                                    'लंबी रेखा लंबी आयु का संकेत'
                                ] : [
                                    'Starts from base of thumb',
                                    'Deep line shows strong vitality',
                                    'Broken line indicates major life changes',
                                    'Long line suggests longevity'
                                ]
                            },
                            { 
                                name: t.fateLine, 
                                icon: '⚓', 
                                color: 'from-yellow-500/20 to-yellow-600/20',
                                borderColor: 'border-yellow-500/30',
                                body: language === 'hi' ? 'करियर का रास्ता। कलाई से शुरू होने वाली रेखा स्व-निर्मित मार्ग का संकेत देती है; बीच से शुरू होना परिवार या समाज से मदद का सुझाव देता है।' : 'The career path. A line starting from the wrist indicates a self-made path; starting from the middle suggests help from family or society.',
                                details: language === 'hi' ? [
                                    'कलाई से मध्यमा उंगली तक',
                                    'सीधी रेखा स्थिर करियर',
                                    'टूटी रेखा करियर में बदलाव',
                                    'हर किसी के हाथ में नहीं होती'
                                ] : [
                                    'Runs from wrist to middle finger',
                                    'Straight line indicates stable career',
                                    'Broken line shows career changes',
                                    'Not present in everyone\'s palm'
                                ]
                            }
                        ].map(l => (
                            <div key={l.name} className={`bg-gradient-to-br ${l.color} p-6 rounded-2xl border ${l.borderColor} group hover:scale-[1.02] transition-all`}>
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="text-3xl group-hover:scale-125 transition-transform duration-500">{l.icon}</span>
                                    <h4 className="text-white font-bold text-base uppercase tracking-[0.2em]">{l.name}</h4>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed mb-4">{l.body}</p>
                                <div className="space-y-2">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">
                                        {language === 'hi' ? 'मुख्य बिंदु:' : 'Key Points:'}
                                    </p>
                                    {l.details.map((detail, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                                            <span className="text-amber-400 mt-1">•</span>
                                            <span>{detail}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mounts and Special Markings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div className="bg-slate-950/60 p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-xl">
                        <h3 className="text-2xl font-serif text-amber-200 mb-6 sm:mb-8">{t.theMounts}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { name: 'Jupiter', loc: 'Index', icon: '👆', trait: language === 'hi' ? 'नेतृत्व और महत्वाकांक्षा' : 'Leadership & Ambition', color: 'from-amber-500/20 to-amber-600/20' },
                                { name: 'Saturn', loc: 'Middle', icon: '🖕', trait: language === 'hi' ? 'अनुशासन और कर्म' : 'Discipline & Karma', color: 'from-blue-500/20 to-blue-600/20' },
                                { name: 'Sun', loc: 'Ring', icon: '🖐️', trait: language === 'hi' ? 'प्रसिद्धि और कलात्मकता' : 'Fame & Artistry', color: 'from-yellow-500/20 to-yellow-600/20' },
                                { name: 'Mercury', loc: 'Pinky', icon: '🤏', trait: language === 'hi' ? 'व्यापार और वाणी' : 'Commerce & Speech', color: 'from-emerald-500/20 to-emerald-600/20' }
                            ].map(m => (
                                <div key={m.name} className={`bg-gradient-to-br ${m.color} p-4 sm:p-6 rounded-2xl border border-slate-800 group hover:border-amber-500/30 transition-all`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">{m.icon}</span>
                                        <h5 className="text-amber-400 text-xs font-bold uppercase tracking-widest">{m.name}</h5>
                                    </div>
                                    <p className="text-slate-400 text-[9px] sm:text-[10px] mb-2">{t.finger}: {m.loc}</p>
                                    <p className="text-white text-xs font-serif leading-snug">{m.trait}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-slate-950/60 p-6 sm:p-8 rounded-3xl border border-slate-800">
                        <h4 className="text-indigo-300 font-serif text-lg sm:text-xl mb-4 sm:mb-6 uppercase tracking-[0.3em]">{t.specialMarkings}</h4>
                        <div className="space-y-4">
                            <div className="p-4 sm:p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">✝️</span>
                                    <strong className="text-amber-300 text-sm">{t.mysticCross}:</strong>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{t.mysticCrossDesc}</p>
                            </div>
                            <div className="p-4 sm:p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">🐟</span>
                                    <strong className="text-amber-300 text-sm">{t.fishMark}:</strong>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{t.fishMarkDesc}</p>
                            </div>
                            <div className="p-4 sm:p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">⭐</span>
                                    <strong className="text-amber-300 text-sm">{language === 'hi' ? 'तारा चिह्न' : 'Star Mark'}:</strong>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                                    {language === 'hi' ? 'सफलता और सौभाग्य का संकेत। हाथ के विभिन्न भागों में अलग-अलग अर्थ।' : 'Sign of success and fortune. Different meanings in different parts of the palm.'}
                                </p>
                            </div>
                            <div className="p-4 sm:p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">🔺</span>
                                    <strong className="text-amber-300 text-sm">{language === 'hi' ? 'त्रिकोण' : 'Triangle'}:</strong>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                                    {language === 'hi' ? 'बौद्धिक क्षमता और रक्षा का प्रतीक। स्थान के अनुसार अर्थ बदलता है।' : 'Symbol of intellectual ability and protection. Meaning changes based on location.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- NUMEROLOGY SECRETS --- */}
        {activeTab === 'numerology' && (
            <div className="animate-fade-in space-y-8 sm:space-y-12">
                {/* Number-Planet Association */}
                <div className="bg-slate-950/60 p-6 sm:p-8 rounded-3xl border border-teal-500/20">
                    <h3 className="text-2xl sm:text-3xl font-serif text-teal-200 mb-6 sm:mb-8 flex items-center gap-4">
                        <span className="text-3xl sm:text-4xl">🔢</span>
                        {language === 'hi' ? 'संख्या-ग्रह संबंध' : 'Number-Planet Association'}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3 sm:gap-4">
                        {[
                            { n: 1, p: 'Sun', icon: '☀️', t: language === 'hi' ? 'मूल' : 'The Original', color: 'from-yellow-500/20 to-orange-500/20', desc: language === 'hi' ? 'नेतृत्व, आत्मविश्वास, अधिकार' : 'Leadership, confidence, authority' },
                            { n: 2, p: 'Moon', icon: '🌙', t: language === 'hi' ? 'दर्पण' : 'The Mirror', color: 'from-slate-200/20 to-slate-300/20', desc: language === 'hi' ? 'भावनाएं, सहजज्ञान, मातृत्व' : 'Emotions, intuition, motherhood' },
                            { n: 3, p: 'Jupiter', icon: '♃', t: language === 'hi' ? 'कलाकार' : 'The Artist', color: 'from-yellow-200/20 to-amber-300/20', desc: language === 'hi' ? 'ज्ञान, विस्तार, भाग्य' : 'Wisdom, expansion, fortune' },
                            { n: 4, p: 'Rahu', icon: '☊', t: language === 'hi' ? 'विद्रोही' : 'The Rebel', color: 'from-slate-500/20 to-gray-600/20', desc: language === 'hi' ? 'विद्रोह, भ्रम, सांसारिक इच्छा' : 'Rebellion, illusion, worldly desire' },
                            { n: 5, p: 'Mercury', icon: '☿️', t: language === 'hi' ? 'यात्री' : 'The Traveler', color: 'from-emerald-400/20 to-green-500/20', desc: language === 'hi' ? 'बुद्धि, संचार, व्यापार' : 'Intelligence, communication, business' },
                            { n: 6, p: 'Venus', icon: '♀️', t: language === 'hi' ? 'प्रेमी' : 'The Lover', color: 'from-pink-300/20 to-rose-400/20', desc: language === 'hi' ? 'प्रेम, सौंदर्य, कला' : 'Love, beauty, arts' },
                            { n: 7, p: 'Ketu', icon: '☋', t: language === 'hi' ? 'रहस्यवादी' : 'The Mystic', color: 'from-orange-900/20 to-amber-900/20', desc: language === 'hi' ? 'आध्यात्मिकता, वैराग्य, मोक्ष' : 'Spirituality, detachment, moksha' },
                            { n: 8, p: 'Saturn', icon: '♄', t: language === 'hi' ? 'न्यायाधीश' : 'The Judge', color: 'from-blue-400/20 to-indigo-500/20', desc: language === 'hi' ? 'कर्म, अनुशासन, न्याय' : 'Karma, discipline, justice' },
                            { n: 9, p: 'Mars', icon: '♂️', t: language === 'hi' ? 'समाप्तकर्ता' : 'The Finisher', color: 'from-red-500/20 to-rose-600/20', desc: language === 'hi' ? 'ऊर्जा, साहस, संघर्ष' : 'Energy, courage, conflict' }
                        ].map(x => (
                            <div key={x.n} className={`bg-gradient-to-br ${x.color} border border-slate-800 p-4 sm:p-6 rounded-2xl text-center hover:border-teal-500 hover:shadow-[0_0_30px_rgba(20,184,166,0.1)] transition-all group`}>
                                <div className="text-3xl sm:text-4xl font-bold text-white mb-2 group-hover:scale-125 transition-transform">{x.n}</div>
                                <div className="text-2xl mb-2">{x.icon}</div>
                                <div className="text-[9px] sm:text-[10px] text-teal-400 font-bold uppercase mb-1 tracking-tighter">{x.p}</div>
                                <div className="text-[9px] sm:text-[10px] text-slate-400 italic leading-tight mb-2">{x.t}</div>
                                <div className="text-[8px] sm:text-[9px] text-slate-500 leading-tight">{x.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Master Numbers */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
                    <div className="lg:col-span-7 bg-teal-900/10 border border-teal-500/20 p-8 sm:p-12 rounded-3xl sm:rounded-[3.5rem] shadow-xl">
                        <h4 className="text-teal-200 font-serif text-2xl sm:text-3xl mb-6 sm:mb-8 flex items-center gap-4">
                            <span className="text-3xl sm:text-4xl">🔱</span> {t.masterNumbers}
                        </h4>
                        <div className="space-y-6 sm:space-y-8">
                            <div className="p-5 sm:p-6 bg-slate-950/40 rounded-2xl sm:rounded-3xl border border-slate-800">
                                <h5 className="text-white font-bold text-base sm:text-lg mb-2">{t.theVisionary}</h5>
                                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{t.visionaryDesc}</p>
                            </div>
                            <div className="p-5 sm:p-6 bg-slate-950/40 rounded-2xl sm:rounded-3xl border border-slate-800">
                                <h5 className="text-white font-bold text-base sm:text-lg mb-2">{t.theBuilder}</h5>
                                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{t.builderDesc}</p>
                            </div>
                            <div className="p-5 sm:p-6 bg-slate-950/40 rounded-2xl sm:rounded-3xl border border-slate-800">
                                <h5 className="text-white font-bold text-base sm:text-lg mb-2">{t.theTeacher}</h5>
                                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{t.teacherDesc}</p>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-slate-950/60 p-8 sm:p-10 rounded-3xl border border-slate-800">
                            <h4 className="text-white font-serif text-xl sm:text-2xl mb-4 sm:mb-6">{t.calculationEngine}</h4>
                            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8 italic">{t.vedicNumerology}</p>
                            <ul className="space-y-3 sm:space-y-4 text-xs text-slate-400">
                                <li className="flex gap-3 sm:gap-4">
                                    <strong className="text-teal-400">{t.birthNum}:</strong> 
                                    <span>{t.inherentTalent}</span>
                                </li>
                                <li className="flex gap-3 sm:gap-4">
                                    <strong className="text-teal-400">{t.pathNum}:</strong> 
                                    <span>{t.worldlyMission}</span>
                                </li>
                                <li className="flex gap-3 sm:gap-4">
                                    <strong className="text-teal-400">{t.soulNum}:</strong> 
                                    <span>{t.innerDesire}</span>
                                </li>
                            </ul>
                        </div>

                        {/* Number Compatibility */}
                        <div className="bg-slate-950/60 p-6 sm:p-8 rounded-3xl border border-slate-800">
                            <h4 className="text-teal-200 font-serif text-lg sm:text-xl mb-4 sm:mb-6">
                                {language === 'hi' ? 'संख्या अनुकूलता' : 'Number Compatibility'}
                            </h4>
                            <div className="space-y-3 text-xs sm:text-sm text-slate-400">
                                <div className="p-3 bg-slate-900/50 rounded-xl">
                                    <strong className="text-teal-300">{language === 'hi' ? 'अनुकूल:' : 'Compatible:'}</strong>
                                    <p className="mt-1">{language === 'hi' ? '1-2, 2-7, 3-6, 4-8, 5-9' : '1-2, 2-7, 3-6, 4-8, 5-9'}</p>
                                </div>
                                <div className="p-3 bg-slate-900/50 rounded-xl">
                                    <strong className="text-rose-300">{language === 'hi' ? 'अनुकूल नहीं:' : 'Incompatible:'}</strong>
                                    <p className="mt-1">{language === 'hi' ? '1-4, 2-5, 3-7, 6-8' : '1-4, 2-5, 3-7, 6-8'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Lucky Numbers Guide */}
                        <div className="bg-slate-950/60 p-6 sm:p-8 rounded-3xl border border-slate-800">
                            <h4 className="text-teal-200 font-serif text-lg sm:text-xl mb-4 sm:mb-6">
                                {language === 'hi' ? 'भाग्यशाली संख्याएं' : 'Lucky Numbers Guide'}
                            </h4>
                            
                            {/* Birth Date Input */}
                            <div className="mb-6">
                                <label className="block text-xs text-slate-400 mb-2">
                                    {language === 'hi' ? 'जन्म तिथि' : 'Birth Date'}
                                </label>
                                <input
                                    type="date"
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-300 focus:outline-none focus:border-teal-500/50 transition-colors"
                                />
                            </div>

                            {lifePathNumber && (
                                <div className="mb-4 p-3 bg-teal-900/20 border border-teal-500/30 rounded-xl">
                                    <p className="text-xs text-slate-400 mb-1">
                                        {language === 'hi' ? 'जीवन पथ संख्या' : 'Life Path Number'}
                                    </p>
                                    <p className="text-2xl font-bold text-teal-400">{lifePathNumber}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-3">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
                                    const isLucky = luckyNumbers.includes(num);
                                    return (
                                        <div 
                                            key={num} 
                                            className={`p-3 rounded-xl text-center border transition-all ${
                                                isLucky
                                                    ? 'bg-teal-900/40 border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.3)]'
                                                    : 'bg-slate-900/50 border-slate-800 opacity-40'
                                            }`}
                                        >
                                            <div className={`text-2xl font-bold mb-1 ${
                                                isLucky ? 'text-teal-400' : 'text-slate-600'
                                            }`}>
                                                {num}
                                            </div>
                                            <div className={`text-[8px] ${
                                                isLucky ? 'text-teal-400' : 'text-slate-600'
                                            }`}>
                                                {isLucky 
                                                    ? (language === 'hi' ? 'शुभ' : 'Lucky')
                                                    : (language === 'hi' ? '-' : '-')
                                                }
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {birthDate && luckyNumbers.length > 0 && (
                                <p className="text-xs text-slate-500 mt-4 italic text-center">
                                    {language === 'hi' 
                                        ? `आपकी जन्म तिथि के आधार पर: ${luckyNumbers.join(', ')}`
                                        : `Based on your birth date: ${luckyNumbers.join(', ')}`
                                    }
                                </p>
                            )}
                            
                            {!birthDate && (
                                <p className="text-xs text-slate-500 mt-4 italic text-center">
                                    {language === 'hi' 
                                        ? 'अपनी जन्म तिथि दर्ज करें'
                                        : 'Enter your birth date above'
                                    }
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Number Meanings in Detail */}
                <div className="bg-slate-950/60 p-6 sm:p-8 rounded-3xl border border-teal-500/20">
                    <h4 className="text-teal-200 font-serif text-2xl sm:text-3xl mb-6 sm:mb-8">
                        {language === 'hi' ? 'संख्या का विस्तृत अर्थ' : 'Detailed Number Meanings'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {[
                            { 
                                num: 1, 
                                planet: 'Sun', 
                                traits: language === 'hi' ? ['नेतृत्व', 'स्वतंत्रता', 'महत्वाकांक्षा', 'आत्मविश्वास'] : ['Leadership', 'Independence', 'Ambition', 'Confidence'],
                                careers: language === 'hi' ? 'CEO, राजनीतिज्ञ, उद्यमी' : 'CEO, Politician, Entrepreneur'
                            },
                            { 
                                num: 2, 
                                planet: 'Moon', 
                                traits: language === 'hi' ? ['सहयोग', 'संवेदनशीलता', 'सहजज्ञान', 'शांति'] : ['Cooperation', 'Sensitivity', 'Intuition', 'Peace'],
                                careers: language === 'hi' ? 'काउंसलर, कलाकार, देखभाल करने वाला' : 'Counselor, Artist, Caregiver'
                            },
                            { 
                                num: 3, 
                                planet: 'Jupiter', 
                                traits: language === 'hi' ? ['रचनात्मकता', 'आशावाद', 'अभिव्यक्ति', 'आनंद'] : ['Creativity', 'Optimism', 'Expression', 'Joy'],
                                careers: language === 'hi' ? 'कलाकार, लेखक, शिक्षक' : 'Artist, Writer, Teacher'
                            },
                            { 
                                num: 4, 
                                planet: 'Rahu', 
                                traits: language === 'hi' ? ['व्यावहारिकता', 'स्थिरता', 'अनुशासन', 'कठोर परिश्रम'] : ['Practicality', 'Stability', 'Discipline', 'Hard Work'],
                                careers: language === 'hi' ? 'इंजीनियर, वास्तुकार, प्रबंधक' : 'Engineer, Architect, Manager'
                            },
                            { 
                                num: 5, 
                                planet: 'Mercury', 
                                traits: language === 'hi' ? ['जिज्ञासा', 'बहुमुखी प्रतिभा', 'यात्रा', 'संचार'] : ['Curiosity', 'Versatility', 'Travel', 'Communication'],
                                careers: language === 'hi' ? 'पत्रकार, विक्रेता, यात्री' : 'Journalist, Salesperson, Traveler'
                            },
                            { 
                                num: 6, 
                                planet: 'Venus', 
                                traits: language === 'hi' ? ['प्रेम', 'सौंदर्य', 'सामंजस्य', 'जिम्मेदारी'] : ['Love', 'Beauty', 'Harmony', 'Responsibility'],
                                careers: language === 'hi' ? 'डिजाइनर, चिकित्सक, संगीतकार' : 'Designer, Doctor, Musician'
                            },
                            { 
                                num: 7, 
                                planet: 'Ketu', 
                                traits: language === 'hi' ? ['आध्यात्मिकता', 'विश्लेषण', 'रहस्य', 'अंतर्दृष्टि'] : ['Spirituality', 'Analysis', 'Mystery', 'Insight'],
                                careers: language === 'hi' ? 'वैज्ञानिक, शोधकर्ता, दार्शनिक' : 'Scientist, Researcher, Philosopher'
                            },
                            { 
                                num: 8, 
                                planet: 'Saturn', 
                                traits: language === 'hi' ? ['शक्ति', 'अधिकार', 'न्याय', 'धैर्य'] : ['Power', 'Authority', 'Justice', 'Patience'],
                                careers: language === 'hi' ? 'न्यायाधीश, नेता, वित्तीय सलाहकार' : 'Judge, Leader, Financial Advisor'
                            },
                            { 
                                num: 9, 
                                planet: 'Mars', 
                                traits: language === 'hi' ? ['उदारता', 'सेवा', 'जुनून', 'पूर्णता'] : ['Generosity', 'Service', 'Passion', 'Completion'],
                                careers: language === 'hi' ? 'सामाजिक कार्यकर्ता, सैनिक, नर्स' : 'Social Worker, Soldier, Nurse'
                            }
                        ].map(item => (
                            <div key={item.num} className="p-4 sm:p-5 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-teal-500/30 transition-all">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-3xl font-bold text-teal-400">{item.num}</span>
                                    <div>
                                        <h5 className="text-teal-300 font-bold text-sm">{item.planet}</h5>
                                        <p className="text-[9px] text-slate-500 uppercase">{language === 'hi' ? 'ग्रह' : 'Planet'}</p>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <p className="text-[9px] text-slate-500 uppercase mb-2">{language === 'hi' ? 'गुण:' : 'Traits:'}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {item.traits.map((trait, idx) => (
                                            <span key={idx} className="text-[9px] px-2 py-1 bg-slate-800 rounded text-slate-400">
                                                {trait}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[9px] text-slate-500 uppercase mb-1">{language === 'hi' ? 'उपयुक्त करियर:' : 'Suitable Careers:'}</p>
                                    <p className="text-xs text-slate-400">{item.careers}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* --- YOGA LABORATORY --- */}
        {activeTab === 'lab' && (
            <div className="animate-fade-in max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h3 className="text-4xl font-serif text-amber-200">{t.yogaLab}</h3>
                    <p className="text-slate-500 text-sm mt-4 italic">{t.yogaLabSubtitle}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-10">
                    <div className="flex flex-col min-h-[88px]">
                        <label className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mb-2 block">{t.celestialBodyA}</label>
                        <select value={p1} onChange={(e) => setP1(e.target.value)} className="flex-1 min-h-[52px] w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500">
                            {PLANETS_INFO.map(p => <option key={p.name} value={p.name}>{language === 'hi' ? p.hindi : p.name}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col min-h-[88px]">
                        <label className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mb-2 block">{t.celestialBodyB}</label>
                        <select value={p2} onChange={(e) => setP2(e.target.value)} className="flex-1 min-h-[52px] w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500">
                            {PLANETS_INFO.map(p => <option key={p.name} value={p.name}>{language === 'hi' ? p.hindi : p.name}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col min-h-[88px]">
                        <label className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mb-2 block">{language === 'hi' ? 'तीसरा ग्रह (वैकल्पिक)' : 'Third Grah (Optional)'}</label>
                        <select value={p3} onChange={(e) => setP3(e.target.value)} className="flex-1 min-h-[52px] w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500">
                            <option value="">— {language === 'hi' ? 'नहीं' : 'None'} —</option>
                            {PLANETS_INFO.map(p => <option key={p.name} value={p.name}>{language === 'hi' ? p.hindi : p.name}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col min-h-[88px]">
                        <label className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mb-2 block">{t.bhavaHouse}</label>
                        <select value={house} onChange={(e) => setHouse(Number(e.target.value))} className="flex-1 min-h-[52px] w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500">
                            {HOUSES_INFO.map(h => <option key={h.id} value={h.id}>{t.house} {h.id} ({language === 'hi' ? h.nameHi : h.name})</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col min-h-[88px]">
                        <label className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mb-2 block">{t.rashiEnvironment}</label>
                        <select value={conjunctionSign} onChange={(e) => setConjunctionSign(e.target.value)} className="flex-1 min-h-[52px] w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500">
                            {ZODIAC_SIGNS.map(z => <option key={z.name} value={z.name}>{language === 'hi' ? z.hindiName : z.name}</option>)}
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-700 text-white font-serif font-bold py-6 rounded-[2rem] shadow-2xl transition-all active:scale-95 disabled:opacity-50 text-xl"
                >
                    {loading ? t.synthesizingData : t.revealYogaImpact}
                </button>

                {analysis && (
                    <div className="mt-12 bg-slate-950/80 border border-amber-500/20 p-12 rounded-[3.5rem] shadow-3xl animate-fade-in-up">
                        <RichText text={analysis} />
                    </div>
                )}
            </div>
        )}
      </div>
      
      <AdBanner variant="in-article" className="mt-12" />
      <AdBanner variant="display" className="mt-8" />
    </div>
  );
};

export default LearningCenter;
