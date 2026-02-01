import React, { useState } from 'react';
import { Language } from '../types';
import { useTranslation } from '../utils/translations';
import { generateAstroStory } from '../services/geminiService';
import { ZODIAC_SIGNS, PLANETS_INFO, PLANETS_INFO_DETAILED, NAKSHATRAS_INFO } from '../constants';
import RichText from './RichText';

interface StarLegendsProps {
  language: Language;
}

const LEGEND_CATEGORIES = [
  { id: 'sign', icon: '♈', label: { en: 'Zodiac Legends', hi: 'राशि कथाएं' }, color: 'from-yellow-500/20 to-amber-500/20' },
  { id: 'planet', icon: '🪐', label: { en: 'Planetary Myths', hi: 'ग्रह पौराणिक कथाएं' }, color: 'from-orange-500/20 to-red-500/20' },
  { id: 'nakshatra', icon: '🌌', label: { en: 'Star Constellations', hi: 'नक्षत्र कथाएं' }, color: 'from-purple-500/20 to-indigo-500/20' },
  { id: 'puranas', icon: '📖', label: { en: 'Puranic Tales', hi: 'पौराणिक कथाएं' }, color: 'from-amber-500/20 to-yellow-500/20' }
];

const StarLegends: React.FC<StarLegendsProps> = ({ language }) => {
  const t = useTranslation(language);
  const [activeCategory, setActiveCategory] = useState<'sign' | 'planet' | 'nakshatra' | 'puranas'>('sign');
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [legend, setLegend] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReadLegend = async (item: string) => {
    setSelectedItem(item);
    setLoading(true);
    setLegend(null);
    try {
      if (activeCategory === 'puranas') {
        // Special handling for Puranic tales
        const result = await generateAstroStory(`Puranic legend of ${item}`, 'planet', language);
        setLegend(result);
      } else {
        const result = await generateAstroStory(item, activeCategory, language);
        setLegend(result);
      }
    } catch (e) {
      console.error(e);
      setLegend(language === 'hi' ? 'कहानी लोड करने में त्रुटि। कृपया पुनः प्रयास करें।' : 'Error loading story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getItemsForCategory = () => {
    switch (activeCategory) {
      case 'sign':
        return ZODIAC_SIGNS;
      case 'planet':
        // Use PLANETS_INFO_DETAILED which includes correct planet symbols
        return PLANETS_INFO_DETAILED.map(planet => ({
          ...planet,
          id: planet.name.toLowerCase(),
          icon: planet.symbol || '⭐'
        }));
      case 'nakshatra':
        return NAKSHATRAS_INFO;
      case 'puranas':
        return [
          { name: language === 'hi' ? 'सूर्य की कथा' : 'Legend of Surya', icon: '☀️', id: 'surya' },
          { name: language === 'hi' ? 'चंद्र की कथा' : 'Legend of Chandra', icon: '🌙', id: 'chandra' },
          { name: language === 'hi' ? 'मंगल की कथा' : 'Legend of Mangal', icon: '♂️', id: 'mangal' },
          { name: language === 'hi' ? 'बुध की कथा' : 'Legend of Budh', icon: '☿️', id: 'budh' },
          { name: language === 'hi' ? 'गुरु की कथा' : 'Legend of Guru', icon: '♃', id: 'guru' },
          { name: language === 'hi' ? 'शुक्र की कथा' : 'Legend of Shukra', icon: '♀️', id: 'shukra' },
          { name: language === 'hi' ? 'शनि की कथा' : 'Legend of Shani', icon: '♄', id: 'shani' },
          { name: language === 'hi' ? 'राहु की कथा' : 'Legend of Rahu', icon: '☊', id: 'rahu' },
          { name: language === 'hi' ? 'केतु की कथा' : 'Legend of Ketu', icon: '☋', id: 'ketu' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-24 animate-fade-in-up">
      {/* Hero Section with Creative Design */}
      <div className="text-center mb-16 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-96 h-96 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <div className="relative z-10">
          <span className="text-[10px] uppercase font-bold tracking-[1em] text-amber-500 mb-2 block animate-fade-in">
            {language === 'hi' ? 'पौराणिक कथाएं' : 'Puranic Legends'}
          </span>
          <h2 className="text-5xl md:text-7xl font-serif text-amber-100 drop-shadow-lg mb-4 animate-fade-in-up">
            {language === 'hi' ? 'तारा कथाएं' : 'Star Legends'}
          </h2>
          <p className="text-slate-400 text-sm italic tracking-[0.2em] mt-4 uppercase max-w-2xl mx-auto">
            {language === 'hi' 
              ? 'प्राचीन पौराणिक कथाओं और तारों की कहानियों का खजाना' 
              : 'Treasure trove of ancient Puranic tales and star stories'}
          </p>
        </div>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800 rounded-[4rem] p-6 md:p-16 shadow-3xl relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Category Tabs with Creative Design */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {LEGEND_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id as any);
                setLegend(null);
                setSelectedItem("");
              }}
              className={`group relative px-6 py-4 rounded-2xl font-serif text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-[0_0_30px_rgba(245,158,11,0.5)] scale-105'
                  : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-white hover:border-amber-500/50'
              }`}
            >
              <span className="text-2xl mr-2 inline-block group-hover:rotate-12 transition-transform">{cat.icon}</span>
              <span>{cat.label[language]}</span>
              {activeCategory === cat.id && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-amber-400 rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        {!legend && !loading && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-serif text-amber-200 mb-2">
                {language === 'hi' ? 'एक कथा चुनें' : 'Choose a Legend'}
              </h3>
              <p className="text-slate-400 text-sm">
                {language === 'hi' 
                  ? 'प्राचीन ज्ञान और पौराणिक कथाओं का अन्वेषण करें' 
                  : 'Explore ancient wisdom and Puranic tales'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {getItemsForCategory().map((item: any) => {
                // For planets, use symbol from PLANETS_INFO_DETAILED
                const displayIcon = activeCategory === 'planet' 
                  ? (item.symbol || item.icon || '⭐')
                  : (item.icon || item.symbol || '⭐');
                
                return (
                  <button
                    key={item.id || item.name}
                    onClick={() => handleReadLegend(item.name || item.id)}
                    className="group relative p-6 bg-gradient-to-br from-slate-950/80 to-slate-900/80 border border-slate-800 rounded-2xl hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all duration-300 hover:scale-105 text-center overflow-hidden"
                  >
                    {/* Animated Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/10 group-hover:to-orange-500/10 transition-all duration-300"></div>
                    
                    <div className="relative z-10">
                      <div className="text-4xl mb-3 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300">
                        {displayIcon}
                      </div>
                      <div className="text-xs font-bold text-slate-300 group-hover:text-amber-300 transition-colors line-clamp-2">
                        {language === 'hi' 
                          ? (item.hindiName || item.hindi || item.name)
                          : item.name}
                      </div>
                    </div>
                    
                    {/* Shine Effect on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 border-4 border-amber-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-amber-300 font-serif text-lg">
              {language === 'hi' ? 'कथा लोड हो रही है...' : 'Loading legend...'}
            </p>
            <p className="text-slate-400 text-sm mt-2">
              {language === 'hi' ? 'प्राचीन ज्ञान एकत्रित कर रहे हैं' : 'Gathering ancient wisdom'}
            </p>
          </div>
        )}

        {/* Legend Display */}
        {legend && !loading && (
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-3xl font-serif text-amber-200 mb-2">
                  {language === 'hi' ? `${selectedItem} की कथा` : `Legend of ${selectedItem}`}
                </h3>
                <p className="text-slate-400 text-sm">
                  {language === 'hi' ? 'प्राचीन पौराणिक कथा' : 'Ancient Puranic Tale'}
                </p>
              </div>
              <button
                onClick={() => {
                  setLegend(null);
                  setSelectedItem("");
                }}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-amber-500/50 transition-all"
              >
                {language === 'hi' ? 'वापस' : 'Back'}
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-slate-950/90 to-slate-900/90 border border-amber-500/20 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="prose prose-invert max-w-none">
                  <RichText text={legend} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StarLegends;

