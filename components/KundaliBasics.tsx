import React, { useState } from 'react';
import { Language } from '../types';
import { HOUSES_INFO, PLANETS_INFO_DETAILED, PLANETS_INFO, ZODIAC_SIGNS } from '../constants';
import { generateConjunctionAnalysis } from '../services/geminiService';
import { useTranslation } from '../utils/translations';
import RichText from './RichText';
import AdBanner from './AdBanner';
import { ModuleIntro } from './common';

interface KundaliBasicsProps {
  language: Language;
}

// House Content Component for Kundali Chart - Content on edges
const HouseContent: React.FC<{ house: typeof HOUSES_INFO[0]; language: Language; position: 'top' | 'bottom' | 'left' | 'right' }> = ({ house, language, position }) => {
  const houseName = language === 'hi' ? house.nameHi : house.name.split('(')[0].trim();
  const houseDesc = language === 'hi' ? house.descHi : house.desc;
  
  // Position content based on edge position
  if (position === 'top') {
    return (
      <div className="absolute top-1 left-0 right-0 text-center">
        <div className="text-base sm:text-lg md:text-xl mb-0.5">{house.icon}</div>
        <div className={`text-[5px] sm:text-[6px] md:text-[7px] font-serif font-bold leading-tight ${house.color || 'text-amber-200'}`}>
          {houseName}
        </div>
        <div className="text-[4px] sm:text-[5px] md:text-[6px] text-slate-300 leading-[1.2] px-0.5 sm:px-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {houseDesc}
        </div>
      </div>
    );
  } else if (position === 'bottom') {
    return (
      <div className="absolute bottom-1 left-0 right-0 text-center">
        <div className="text-base sm:text-lg md:text-xl mb-0.5">{house.icon}</div>
        <div className={`text-[5px] sm:text-[6px] md:text-[7px] font-serif font-bold leading-tight ${house.color || 'text-amber-200'}`}>
          {houseName}
        </div>
        <div className="text-[4px] sm:text-[5px] md:text-[6px] text-slate-300 leading-[1.2] px-0.5 sm:px-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {houseDesc}
        </div>
      </div>
    );
  } else if (position === 'left') {
    return (
      <div className="absolute left-1 top-1/2 transform -translate-y-1/2 text-center w-12 sm:w-14 md:w-16">
        <div className="text-base sm:text-lg md:text-xl mb-0.5">{house.icon}</div>
        <div className={`text-[5px] sm:text-[6px] md:text-[7px] font-serif font-bold leading-tight mb-0.5 ${house.color || 'text-amber-200'}`}>
          {houseName}
        </div>
        <div className="text-[4px] sm:text-[5px] md:text-[6px] text-slate-300 leading-[1.2]" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {houseDesc}
        </div>
      </div>
    );
  } else { // right
    return (
      <div className="absolute right-1 top-1/2 transform -translate-y-1/2 text-center w-12 sm:w-14 md:w-16">
        <div className="text-base sm:text-lg md:text-xl mb-0.5">{house.icon}</div>
        <div className={`text-[5px] sm:text-[6px] md:text-[7px] font-serif font-bold leading-tight mb-0.5 ${house.color || 'text-amber-200'}`}>
          {houseName}
        </div>
        <div className="text-[4px] sm:text-[5px] md:text-[6px] text-slate-300 leading-[1.2]" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {houseDesc}
        </div>
      </div>
    );
  }
};

// Astro Lab Component - Interactive Conjunction Analysis
const AstroLabSection: React.FC<{ language: Language }> = ({ language }) => {
  const t = useTranslation(language);
  const [p1, setP1] = useState(PLANETS_INFO[0].name);
  const [p2, setP2] = useState(PLANETS_INFO[1].name);
  const [house, setHouse] = useState(1);
  const [conjunctionSign, setConjunctionSign] = useState(ZODIAC_SIGNS[0].name);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis(null);
    try {
      const result = await generateConjunctionAnalysis([p1, p2], house, conjunctionSign, language);
      setAnalysis(result);
    } catch (e) {
      setAnalysis(language === 'hi' 
        ? 'आकाशीय अभिलेख अस्पष्ट हैं। कृपया पुनः प्रयास करें।'
        : 'The celestial archives are obscured. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950/60 p-6 sm:p-8 rounded-3xl border border-orange-500/20 mt-8">
      <div className="flex items-center gap-4 mb-6">
        <span className="text-4xl">🧪</span>
        <div>
          <h4 className="text-2xl font-serif text-orange-300">
            {language === 'hi' ? 'ज्योतिष प्रयोगशाला' : 'Astro Lab'}
          </h4>
          <p className="text-sm text-slate-400 mt-1">
            {t.yogaLabSubtitle || (language === 'hi' 
              ? 'ग्रहों के संयोजन का इंटरैक्टिव विश्लेषण'
              : 'Interactive conjunction analysis')}
          </p>
        </div>
      </div>

      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-xs text-orange-400 font-bold uppercase tracking-wider">
              {t.celestialBodyA || (language === 'hi' ? 'ग्रह A' : 'Planet A')}
            </label>
            <select 
              value={p1} 
              onChange={(e) => setP1(e.target.value)} 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none focus:border-orange-500/50"
            >
              {PLANETS_INFO.map(p => (
                <option key={p.name} value={p.name}>
                  {language === 'hi' ? p.hindi : p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-orange-400 font-bold uppercase tracking-wider">
              {t.celestialBodyB || (language === 'hi' ? 'ग्रह B' : 'Planet B')}
            </label>
            <select 
              value={p2} 
              onChange={(e) => setP2(e.target.value)} 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none focus:border-orange-500/50"
            >
              {PLANETS_INFO.map(p => (
                <option key={p.name} value={p.name}>
                  {language === 'hi' ? p.hindi : p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-orange-400 font-bold uppercase tracking-wider">
              {t.bhavaHouse || (language === 'hi' ? 'भाव' : 'House')}
            </label>
            <select 
              value={house} 
              onChange={(e) => setHouse(Number(e.target.value))} 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none focus:border-orange-500/50"
            >
              {HOUSES_INFO.map(h => (
                <option key={h.id} value={h.id}>
                  {language === 'hi' ? `${h.id} (${h.nameHi})` : `${h.id} (${h.name})`}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-orange-400 font-bold uppercase tracking-wider">
              {t.rashiEnvironment || (language === 'hi' ? 'राशि' : 'Rashi')}
            </label>
            <select 
              value={conjunctionSign} 
              onChange={(e) => setConjunctionSign(e.target.value)} 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none focus:border-orange-500/50"
            >
              {ZODIAC_SIGNS.map(z => (
                <option key={z.name} value={z.name}>
                  {language === 'hi' ? z.hindiName : z.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-serif font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading 
            ? (t.synthesizingData || (language === 'hi' ? 'विश्लेषण कर रहे हैं...' : 'Analyzing...'))
            : (t.revealYogaImpact || (language === 'hi' ? 'योग प्रभाव प्रकट करें' : 'Reveal Yoga Impact'))}
        </button>

        {analysis && (
          <div className="mt-6 bg-slate-800/50 border border-orange-500/30 p-6 rounded-2xl animate-fade-in-up">
            <RichText text={analysis} className="text-slate-300 leading-relaxed" />
          </div>
        )}
      </div>
    </div>
  );
};

const KundaliBasics: React.FC<KundaliBasicsProps> = ({ language }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pb-16 sm:pb-20 md:pb-24 animate-fade-in-up">
      <div className="mb-6">
        <ModuleIntro
          language={language}
          subtitleEn="Kundali basics – what is a birth chart, D1–D60 divisional charts, 12 houses and how to read them."
          subtitleHi="कुंडली बेसिक्स – जन्म चार्ट क्या है, D1–D60 विभाजन चार्ट, 12 भाव और पढ़ने का तरीका।"
          descriptionEn="Fundamentals of Vedic Kundali: types of charts (D1 Rashi, D9 Navamsha, etc.), 12 Bhavas and interactive Astro Lab for planetary combinations."
          descriptionHi="वैदिक कुंडली की मूल बातें: चार्ट प्रकार (D1 राशि, D9 नवमांश आदि), 12 भाव और ग्रह योग के लिए इंटरैक्टिव लैब।"
        />
      </div>
      <div className="text-center mb-8 sm:mb-12 md:mb-16">
        <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-[0.5em] sm:tracking-[1em] text-amber-500 mb-2 block">Kundali Learning</span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif text-amber-100 drop-shadow-lg">
          {language === 'hi' ? 'कुंडली सीखें' : 'Learn Kundali'}
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm italic tracking-[0.1em] sm:tracking-[0.2em] mt-2 sm:mt-4 uppercase px-2">
          {language === 'hi' ? 'वैदिक ज्योतिष में कुंडली की मूल बातें' : 'Fundamentals of Kundali in Vedic Astrology'}
        </p>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800 rounded-2xl sm:rounded-3xl md:rounded-[4rem] p-4 sm:p-6 md:p-12 lg:p-16 shadow-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="animate-fade-in space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <div className="bg-slate-950/60 p-6 sm:p-8 rounded-3xl border border-amber-500/20">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl">🧭</span>
                <h4 className="text-2xl font-serif text-amber-300">
                  {language === 'hi' ? 'कुंडली क्या है?' : 'What is Kundali?'}
                </h4>
              </div>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
                {language === 'hi' 
                  ? 'कुंडली एक जन्म चार्ट है जो जन्म के समय आकाश में ग्रहों की स्थिति को दर्शाता है। यह वैदिक ज्योतिष का आधार है और व्यक्ति के जीवन, व्यक्तित्व और भाग्य के बारे में जानकारी प्रदान करता है।'
                  : 'Kundali is a birth chart that shows the positions of planets in the sky at the time of birth. It is the foundation of Vedic astrology and provides insights about a person\'s life, personality, and destiny.'}
              </p>
            </div>

            <div className="bg-slate-950/60 p-6 sm:p-8 rounded-3xl border border-amber-500/20">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl">📊</span>
                <h4 className="text-xl md:text-2xl font-serif text-amber-300">
                  {language === 'hi' ? 'चार्ट के प्रकार' : 'Types of Charts'}
                </h4>
              </div>
              <p className="text-xs md:text-sm text-slate-400 mb-4 italic">
                {language === 'hi' 
                  ? 'वैदिक ज्योतिष में विभिन्न प्रकार के चार्ट होते हैं, जिन्हें विभाजन चार्ट (Divisional Charts) कहा जाता है।'
                  : 'Vedic astrology uses various types of charts called Divisional Charts (D-charts).'}
              </p>
              <div className="space-y-3">
                <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                  <h5 className="text-amber-200 font-bold text-sm mb-1">
                    {language === 'hi' ? 'D1 (जन्म कुंडली)' : 'D1 (Birth Chart)'}
                  </h5>
                  <p className="text-xs text-slate-400">
                    {language === 'hi' 
                      ? 'मुख्य जन्म चार्ट जो जीवन के सभी पहलुओं को दर्शाता है।'
                      : 'Main birth chart showing all aspects of life.'}
                  </p>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                  <h5 className="text-amber-200 font-bold text-sm mb-1">
                    {language === 'hi' ? 'D9 (नवमांश)' : 'D9 (Navamsha)'}
                  </h5>
                  <p className="text-xs text-slate-400">
                    {language === 'hi' 
                      ? 'विवाह, साझेदारी और आध्यात्मिक जीवन के लिए महत्वपूर्ण।'
                      : 'Important for marriage, partnerships, and spiritual life.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Full Width Types of Charts Section */}
          <div className="bg-slate-950/60 p-6 sm:p-8 rounded-3xl border border-amber-500/20">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">📊</span>
              <h4 className="text-2xl font-serif text-amber-300">
                {language === 'hi' ? 'सभी विभाजन चार्ट (All Divisional Charts)' : 'All Divisional Charts'}
              </h4>
            </div>
            <p className="text-sm text-slate-400 mb-6 italic">
              {language === 'hi' 
                ? 'वैदिक ज्योतिष में विभिन्न प्रकार के चार्ट होते हैं, जिन्हें विभाजन चार्ट (Divisional Charts) कहा जाता है। प्रत्येक चार्ट जीवन के विशिष्ट पहलुओं का विश्लेषण करता है।'
                : 'Vedic astrology uses various types of charts called Divisional Charts (D-charts). Each chart analyzes specific aspects of life.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* D1 - Birth Chart */}
                <div className="p-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl border-2 border-amber-500/40 hover:border-amber-400 hover:scale-105 transition-all h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🌅</span>
                    <h5 className="text-amber-200 font-bold text-base">
                      {language === 'hi' ? 'D1 - राशि चार्ट' : 'D1 - Rashi Chart'}
                    </h5>
                  </div>
                  <p className="text-[10px] text-slate-300 mb-2 font-semibold">
                    {language === 'hi' ? 'जन्म कुंडली' : 'Birth Chart'}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed flex-grow">
                    {language === 'hi' 
                      ? 'मुख्य जन्म चार्ट जो जीवन के सभी पहलुओं को दर्शाता है।'
                      : 'Main birth chart showing all aspects of life.'}
                  </p>
                </div>

                {/* D2 - Hora */}
                <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-amber-500/30 hover:scale-105 transition-all h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">💰</span>
                    <h5 className="text-amber-200 font-bold text-base">
                      {language === 'hi' ? 'D2 - होरा' : 'D2 - Hora'}
                    </h5>
                  </div>
                  <p className="text-[10px] text-slate-300 mb-2 font-semibold">
                    {language === 'hi' ? 'धन चार्ट' : 'Wealth Chart'}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed flex-grow">
                    {language === 'hi' 
                      ? 'धन, वित्तीय स्थिति, आय के स्रोत और भौतिक संपत्ति का विश्लेषण करता है।'
                      : 'Analyzes wealth, financial status, sources of income, and material possessions.'}
                  </p>
                </div>

                {/* D3 - Drekkana */}
                <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-amber-500/30 hover:scale-105 transition-all h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">👥</span>
                    <h5 className="text-amber-200 font-bold text-base">
                      {language === 'hi' ? 'D3 - द्रेष्काण' : 'D3 - Drekkana'}
                    </h5>
                  </div>
                  <p className="text-[10px] text-slate-300 mb-2 font-semibold">
                    {language === 'hi' ? 'भाई-बहन चार्ट' : 'Siblings Chart'}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed flex-grow">
                    {language === 'hi' 
                      ? 'भाई-बहन, साहस, संचार और छोटी यात्राओं के बारे में जानकारी देता है।'
                      : 'Provides information about siblings, courage, communication, and short journeys.'}
                  </p>
                </div>

                {/* D4 - Chaturthamsha */}
                <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-amber-500/30 hover:scale-105 transition-all h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🏠</span>
                    <h5 className="text-amber-200 font-bold text-base">
                      {language === 'hi' ? 'D4 - चतुर्थांश' : 'D4 - Chaturthamsha'}
                    </h5>
                  </div>
                  <p className="text-[10px] text-slate-300 mb-2 font-semibold">
                    {language === 'hi' ? 'संपत्ति चार्ट' : 'Property Chart'}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed flex-grow">
                    {language === 'hi' 
                      ? 'संपत्ति, जमीन, वाहन, घरेलू सुख और माता के बारे में बताता है।'
                      : 'Reveals information about property, land, vehicles, domestic happiness, and mother.'}
                  </p>
                </div>

                {/* D7 - Saptamsha */}
                <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-amber-500/30 hover:scale-105 transition-all h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">👶</span>
                    <h5 className="text-amber-200 font-bold text-base">
                      {language === 'hi' ? 'D7 - सप्तमांश' : 'D7 - Saptamsha'}
                    </h5>
                  </div>
                  <p className="text-[10px] text-slate-300 mb-2 font-semibold">
                    {language === 'hi' ? 'संतान चार्ट' : 'Children Chart'}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed flex-grow">
                    {language === 'hi' 
                      ? 'संतान, रचनात्मकता, बच्चों की संख्या और उनकी स्थिति का विश्लेषण करता है।'
                      : 'Analyzes children, creativity, number of children, and their status.'}
                  </p>
                </div>

                {/* D9 - Navamsha */}
                <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border-2 border-purple-500/40 hover:border-purple-400 hover:scale-105 transition-all h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">💑</span>
                    <h5 className="text-purple-200 font-bold text-base">
                      {language === 'hi' ? 'D9 - नवमांश' : 'D9 - Navamsha'}
                    </h5>
                  </div>
                  <p className="text-[10px] text-purple-300 mb-2 font-semibold">
                    {language === 'hi' ? 'विवाह चार्ट' : 'Marriage Chart'}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed flex-grow">
                    {language === 'hi' 
                      ? 'विवाह, साझेदारी, आध्यात्मिक जीवन और जीवनसाथी के बारे में सबसे महत्वपूर्ण चार्ट।'
                      : 'Most important chart for marriage, partnerships, spiritual life, and spouse details.'}
                  </p>
                </div>

                {/* D10 - Dashamsha */}
                <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-amber-500/30 hover:scale-105 transition-all h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">💼</span>
                    <h5 className="text-amber-200 font-bold text-base">
                      {language === 'hi' ? 'D10 - दशमांश' : 'D10 - Dashamsha'}
                    </h5>
                  </div>
                  <p className="text-[10px] text-slate-300 mb-2 font-semibold">
                    {language === 'hi' ? 'करियर चार्ट' : 'Career Chart'}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed flex-grow">
                    {language === 'hi' 
                      ? 'करियर, पेशेवर जीवन, सार्वजनिक प्रतिष्ठा और पिता के बारे में जानकारी देता है।'
                      : 'Provides information about career, professional life, public reputation, and father.'}
                  </p>
                </div>

                {/* D12 - Dwadashamsha */}
                <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-amber-500/30 hover:scale-105 transition-all h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">👨‍👩‍👧</span>
                    <h5 className="text-amber-200 font-bold text-base">
                      {language === 'hi' ? 'D12 - द्वादशांश' : 'D12 - Dwadashamsha'}
                    </h5>
                  </div>
                  <p className="text-[10px] text-slate-300 mb-2 font-semibold">
                    {language === 'hi' ? 'माता-पिता चार्ट' : 'Parents Chart'}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed flex-grow">
                    {language === 'hi' 
                      ? 'माता-पिता, पूर्वजों और पारिवारिक पृष्ठभूमि के बारे में जानकारी देता है।'
                      : 'Provides information about parents, ancestors, and family background.'}
                  </p>
                </div>

                {/* D16 - Shodashamsha */}
                <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-amber-500/30 hover:scale-105 transition-all h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🚗</span>
                    <h5 className="text-amber-200 font-bold text-base">
                      {language === 'hi' ? 'D16 - षोडशांश' : 'D16 - Shodashamsha'}
                    </h5>
                  </div>
                  <p className="text-[10px] text-slate-300 mb-2 font-semibold">
                    {language === 'hi' ? 'वाहन चार्ट' : 'Vehicles Chart'}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed flex-grow">
                    {language === 'hi' 
                      ? 'वाहन, सुख, आराम और भौतिक सुविधाओं के बारे में बताता है।'
                      : 'Reveals information about vehicles, happiness, comfort, and material conveniences.'}
                  </p>
                </div>

                {/* D20 - Vimshamsha */}
                <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-amber-500/30 hover:scale-105 transition-all h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🕉️</span>
                    <h5 className="text-amber-200 font-bold text-base">
                      {language === 'hi' ? 'D20 - विंशांश' : 'D20 - Vimshamsha'}
                    </h5>
                  </div>
                  <p className="text-[10px] text-slate-300 mb-2 font-semibold">
                    {language === 'hi' ? 'आध्यात्मिक चार्ट' : 'Spiritual Chart'}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed flex-grow">
                    {language === 'hi' 
                      ? 'आध्यात्मिक प्रवृत्ति, धार्मिक गतिविधियाँ और आंतरिक ज्ञान के बारे में जानकारी देता है।'
                      : 'Provides information about spiritual inclinations, religious activities, and inner wisdom.'}
                  </p>
                </div>

                {/* D24 - Chaturvimshamsha */}
                <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-amber-500/30 hover:scale-105 transition-all h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">📚</span>
                    <h5 className="text-amber-200 font-bold text-base">
                      {language === 'hi' ? 'D24 - चतुर्विंशांश' : 'D24 - Chaturvimshamsha'}
                    </h5>
                  </div>
                  <p className="text-[10px] text-slate-300 mb-2 font-semibold">
                    {language === 'hi' ? 'शिक्षा चार्ट' : 'Education Chart'}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed flex-grow">
                    {language === 'hi' 
                      ? 'शिक्षा, ज्ञान, सीखने की क्षमता और शैक्षणिक उपलब्धियों का विश्लेषण करता है।'
                      : 'Analyzes education, knowledge, learning abilities, and academic achievements.'}
                  </p>
                </div>

                {/* D60 - Shashtiamsha */}
                <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-amber-500/30 hover:scale-105 transition-all h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🌟</span>
                    <h5 className="text-amber-200 font-bold text-base">
                      {language === 'hi' ? 'D60 - षष्टियांश' : 'D60 - Shashtiamsha'}
                    </h5>
                  </div>
                  <p className="text-[10px] text-slate-300 mb-2 font-semibold">
                    {language === 'hi' ? 'सर्वांगीण चार्ट' : 'Comprehensive Chart'}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed flex-grow">
                    {language === 'hi' 
                      ? 'सबसे सूक्ष्म चार्ट जो जीवन के सभी पहलुओं का विस्तृत विश्लेषण करता है।'
                      : 'Most refined chart providing detailed analysis of all aspects of life.'}
                  </p>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mt-8 p-5 bg-slate-900/50 rounded-2xl border border-slate-800">
                <h5 className="text-amber-200 font-bold mb-3 flex items-center gap-2">
                  <span>💡</span>
                  {language === 'hi' ? 'महत्वपूर्ण जानकारी' : 'Important Information'}
                </h5>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span>
                      {language === 'hi' 
                        ? 'D1 (राशि चार्ट) सबसे महत्वपूर्ण है और सभी विश्लेषण की नींव है।'
                        : 'D1 (Rashi Chart) is most important and forms the foundation of all analysis.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span>
                      {language === 'hi' 
                        ? 'D9 (नवमांश) विवाह और साझेदारी के लिए अत्यंत महत्वपूर्ण है।'
                        : 'D9 (Navamsha) is extremely important for marriage and partnerships.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span>
                      {language === 'hi' 
                        ? 'प्रत्येक चार्ट जीवन के विशिष्ट क्षेत्र पर ध्यान केंद्रित करता है।'
                        : 'Each chart focuses on specific areas of life for detailed analysis.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span>
                      {language === 'hi' 
                        ? 'विभाजन चार्ट ग्रहों की सूक्ष्म स्थिति दिखाते हैं और अधिक सटीक भविष्यवाणी करने में मदद करते हैं।'
                        : 'Divisional charts show subtle planetary positions and help make more accurate predictions.'}
                    </span>
                  </li>
                </ul>
              </div>
          </div>

          <div className="bg-slate-950/60 p-6 sm:p-8 rounded-3xl border border-amber-500/20">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">🏠</span>
              <h4 className="text-2xl font-serif text-amber-300">
                {language === 'hi' ? '12 भाव (Houses) - कुंडली चार्ट' : '12 Bhavas (Houses) - Kundali Chart'}
              </h4>
            </div>
            
            {/* North Indian Style Kundali Chart - Traditional Layout */}
            <div className="relative w-full max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-amber-50/10 via-orange-50/5 to-amber-50/10 p-2 sm:p-4 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl border-2 border-amber-500/30 shadow-2xl">
                {/* Chart Container with Diamond Layout and Outer Border */}
                <div className="relative mx-auto border-2 sm:border-3 md:border-4 border-amber-600/50 rounded-lg overflow-hidden" style={{ width: '100%', maxWidth: '100%', aspectRatio: '1 / 1' }}>
                  {/* Background Diamond and Cross Lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
                    {/* Diamond Shape */}
                    <path d="M200 0 L400 200 L200 400 L0 200 Z" fill="none" stroke="rgba(251, 191, 36, 0.4)" strokeWidth="3"/>
                    {/* Diagonal Cross Lines */}
                    <line x1="0" y1="0" x2="400" y2="400" stroke="rgba(251, 191, 36, 0.4)" strokeWidth="3"/>
                    <line x1="400" y1="0" x2="0" y2="400" stroke="rgba(251, 191, 36, 0.4)" strokeWidth="3"/>
                  </svg>

                  {/* House 1 - Top Center (x:195, y:110) */}
                  <div className="absolute z-10" style={{ left: '48.75%', top: '27.5%', transform: 'translate(-50%, -50%)', width: '28%', maxWidth: '140px', height: '28%', maxHeight: '140px' }}>
                    {/* House Number Label - Center */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-400 font-bold text-xl sm:text-2xl md:text-3xl z-20">1</div>
                    {/* Content on Top Edge */}
                    <HouseContent house={HOUSES_INFO[0]} language={language} position="top" />
                  </div>

                  {/* House 2 - Top Left (x:100, y:60) */}
                  <div className="absolute z-10" style={{ left: '25%', top: '15%', transform: 'translate(-50%, -50%)', width: '28%', maxWidth: '140px', height: '28%', maxHeight: '140px' }}>
                    {/* House Number Label - Center */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-400 font-bold text-xl sm:text-2xl md:text-3xl z-20">2</div>
                    {/* Content on Top Edge */}
                    <HouseContent house={HOUSES_INFO[1]} language={language} position="top" />
                  </div>

                  {/* House 3 - Left Top (x:60, y:100) */}
                  <div className="absolute z-10" style={{ left: '15%', top: '25%', transform: 'translate(-50%, -50%)', width: '28%', maxWidth: '140px', height: '28%', maxHeight: '140px' }}>
                    {/* House Number Label - Center */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-400 font-bold text-xl sm:text-2xl md:text-3xl z-20">3</div>
                    {/* Content on Left Edge */}
                    <HouseContent house={HOUSES_INFO[2]} language={language} position="left" />
                  </div>

                  {/* House 4 - Left Center (x:110, y:195) */}
                  <div className="absolute z-10" style={{ left: '27.5%', top: '48.75%', transform: 'translate(-50%, -50%)', width: '28%', maxWidth: '140px', height: '28%', maxHeight: '140px' }}>
                    {/* House Number Label - Center */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-400 font-bold text-xl sm:text-2xl md:text-3xl z-20">4</div>
                    {/* Content on Left Edge */}
                    <HouseContent house={HOUSES_INFO[3]} language={language} position="left" />
                  </div>

                  {/* House 5 - Left Bottom (x:60, y:300) */}
                  <div className="absolute z-10" style={{ left: '15%', top: '75%', transform: 'translate(-50%, -50%)', width: '28%', maxWidth: '140px', height: '28%', maxHeight: '140px' }}>
                    {/* House Number Label - Center */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-400 font-bold text-xl sm:text-2xl md:text-3xl z-20">5</div>
                    {/* Content on Left Edge */}
                    <HouseContent house={HOUSES_INFO[4]} language={language} position="left" />
                  </div>

                  {/* House 6 - Bottom Left (x:100, y:340) */}
                  <div className="absolute z-10" style={{ left: '25%', top: '85%', transform: 'translate(-50%, -50%)', width: '28%', maxWidth: '140px', height: '28%', maxHeight: '140px' }}>
                    {/* House Number Label - Center */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-400 font-bold text-xl sm:text-2xl md:text-3xl z-20">6</div>
                    {/* Content on Bottom Edge */}
                    <HouseContent house={HOUSES_INFO[5]} language={language} position="bottom" />
                  </div>

                  {/* House 7 - Bottom Center (x:195, y:295) */}
                  <div className="absolute z-10" style={{ left: '48.75%', top: '73.75%', transform: 'translate(-50%, -50%)', width: '28%', maxWidth: '140px', height: '28%', maxHeight: '140px' }}>
                    {/* House Number Label - Center */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-400 font-bold text-xl sm:text-2xl md:text-3xl z-20">7</div>
                    {/* Content on Bottom Edge */}
                    <HouseContent house={HOUSES_INFO[6]} language={language} position="bottom" />
                  </div>

                  {/* House 8 - Bottom Right (x:290, y:340) */}
                  <div className="absolute z-10" style={{ left: '72.5%', top: '85%', transform: 'translate(-50%, -50%)', width: '28%', maxWidth: '140px', height: '28%', maxHeight: '140px' }}>
                    {/* House Number Label - Center */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-400 font-bold text-xl sm:text-2xl md:text-3xl z-20">8</div>
                    {/* Content on Bottom Edge */}
                    <HouseContent house={HOUSES_INFO[7]} language={language} position="bottom" />
                  </div>

                  {/* House 9 - Right Bottom (x:330, y:300) */}
                  <div className="absolute z-10" style={{ left: '82.5%', top: '75%', transform: 'translate(-50%, -50%)', width: '28%', maxWidth: '140px', height: '28%', maxHeight: '140px' }}>
                    {/* House Number Label - Center */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-400 font-bold text-xl sm:text-2xl md:text-3xl z-20">9</div>
                    {/* Content on Right Edge */}
                    <HouseContent house={HOUSES_INFO[8]} language={language} position="right" />
                  </div>

                  {/* House 10 - Right Center (x:280, y:195) */}
                  <div className="absolute z-10" style={{ left: '70%', top: '48.75%', transform: 'translate(-50%, -50%)', width: '28%', maxWidth: '140px', height: '28%', maxHeight: '140px' }}>
                    {/* House Number Label - Slightly Left */}
                    <div className="absolute top-1/2 left-[40%] transform -translate-x-1/2 -translate-y-1/2 text-amber-400 font-bold text-xl sm:text-2xl md:text-3xl z-20">10</div>
                    {/* Content on Right Edge */}
                    <HouseContent house={HOUSES_INFO[9]} language={language} position="right" />
                  </div>

                  {/* House 11 - Right Top (x:330, y:100) */}
                  <div className="absolute z-10" style={{ left: '82.5%', top: '25%', transform: 'translate(-50%, -50%)', width: '28%', maxWidth: '140px', height: '28%', maxHeight: '140px' }}>
                    {/* House Number Label - Center */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-400 font-bold text-xl sm:text-2xl md:text-3xl z-20">11</div>
                    {/* Content on Right Edge */}
                    <HouseContent house={HOUSES_INFO[10]} language={language} position="right" />
                  </div>

                  {/* House 12 - Top Right (x:290, y:60) */}
                  <div className="absolute z-10" style={{ left: '72.5%', top: '15%', transform: 'translate(-50%, -50%)', width: '28%', maxWidth: '140px', height: '28%', maxHeight: '140px' }}>
                    {/* House Number Label - Center */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-400 font-bold text-xl sm:text-2xl md:text-3xl z-20">12</div>
                    {/* Content on Top Edge */}
                    <HouseContent house={HOUSES_INFO[11]} language={language} position="top" />
                  </div>
                </div>
              </div>
              
              {/* Legend/Instructions */}
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-400 italic">
                  {language === 'hi' 
                    ? 'कुंडली चार्ट में प्रत्येक भाव अपने अर्थ और महत्व के साथ दिखाया गया है। हाउस पर होवर करें या टैप करें विवरण देखने के लिए।'
                    : 'Each house in the Kundali chart is shown with its meaning and significance. Hover or tap on a house to see details.'}
                </p>
              </div>
            </div>
          </div>

          {/* Astro Lab - Interactive Conjunction Analysis */}
          <AstroLabSection language={language} />
        </div>
      </div>
      <AdBanner variant="display" className="mt-8" />
    </div>
  );
};

export default KundaliBasics;

