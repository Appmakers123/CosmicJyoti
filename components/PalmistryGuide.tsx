import React, { useState } from 'react';
import { Language } from '../types';
import { useTranslation } from '../utils/translations';

interface PalmistryGuideProps {
  language: Language;
}

const PalmistryGuide: React.FC<PalmistryGuideProps> = ({ language }) => {
  const t = useTranslation(language);
  const [expandedSections, setExpandedSections] = useState<{
    lines: boolean;
    mounts: boolean;
    markings: boolean;
    fingers: boolean;
    handTypes: boolean;
    advanced: boolean;
  }>({
    lines: true,
    mounts: true,
    markings: true,
    fingers: true,
    handTypes: false,
    advanced: false
  });

  const toggleSection = (section: 'lines' | 'mounts' | 'markings' | 'fingers' | 'handTypes' | 'advanced') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const palmLines = [
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
  ];

  const fingers = [
    {
      name: 'Jupiter',
      finger: language === 'hi' ? 'तर्जनी (Index)' : 'Index Finger',
      icon: '👆',
      planet: 'Jupiter',
      trait: language === 'hi' ? 'नेतृत्व और महत्वाकांक्षा' : 'Leadership & Ambition',
      color: 'from-amber-500/20 to-amber-600/20',
      borderColor: 'border-amber-500/30',
      details: language === 'hi' ? [
        'लंबी तर्जनी: प्राकृतिक नेता, आत्मविश्वासी, महत्वाकांक्षी',
        'छोटी तर्जनी: विनम्र, सहयोगी, नेतृत्व से बचने वाला',
        'झुकी हुई: दूसरों की राय पर निर्भर',
        'सीधी: स्वतंत्र सोच, मजबूत इच्छाशक्ति',
        'गांठदार: विचारशील, विश्लेषणात्मक दृष्टिकोण',
        'चिकनी: सहज निर्णय लेने वाला'
      ] : [
        'Long Index: Natural leader, confident, ambitious',
        'Short Index: Humble, cooperative, avoids leadership',
        'Bent: Depends on others\' opinions',
        'Straight: Independent thinking, strong willpower',
        'Knotted: Thoughtful, analytical approach',
        'Smooth: Intuitive decision maker'
      ]
    },
    {
      name: 'Saturn',
      finger: language === 'hi' ? 'मध्यमा (Middle)' : 'Middle Finger',
      icon: '🖕',
      planet: 'Saturn',
      trait: language === 'hi' ? 'अनुशासन और कर्म' : 'Discipline & Karma',
      color: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/30',
      details: language === 'hi' ? [
        'लंबी मध्यमा: गंभीर, जिम्मेदार, कर्म पर विश्वास',
        'छोटी मध्यमा: हल्का स्वभाव, जीवन को आसानी से लेता है',
        'झुकी हुई: कर्म से बचने की प्रवृत्ति',
        'सीधी: न्यायप्रिय, नैतिक मूल्यों पर आधारित',
        'गांठदार: गहन चिंतन, दार्शनिक दृष्टिकोण',
        'चिकनी: व्यावहारिक, कार्य-उन्मुख'
      ] : [
        'Long Middle: Serious, responsible, believes in karma',
        'Short Middle: Light-hearted, takes life easily',
        'Bent: Tendency to avoid responsibilities',
        'Straight: Just, based on moral values',
        'Knotted: Deep thinking, philosophical approach',
        'Smooth: Practical, action-oriented'
      ]
    },
    {
      name: 'Sun',
      finger: language === 'hi' ? 'अनामिका (Ring)' : 'Ring Finger',
      icon: '🖐️',
      planet: 'Sun',
      trait: language === 'hi' ? 'प्रसिद्धि और कलात्मकता' : 'Fame & Artistry',
      color: 'from-yellow-500/20 to-yellow-600/20',
      borderColor: 'border-yellow-500/30',
      details: language === 'hi' ? [
        'लंबी अनामिका: कलात्मक प्रतिभा, प्रसिद्धि की इच्छा',
        'छोटी अनामिका: निजी जीवन पसंद, प्रसिद्धि से बचता है',
        'झुकी हुई: कलात्मक संघर्ष, असुरक्षा',
        'सीधी: कला में सफलता, रचनात्मकता',
        'गांठदार: कला का गंभीर अध्ययन',
        'चिकनी: प्राकृतिक कलात्मक प्रतिभा'
      ] : [
        'Long Ring: Artistic talent, desire for fame',
        'Short Ring: Prefers private life, avoids fame',
        'Bent: Artistic struggles, insecurity',
        'Straight: Success in arts, creativity',
        'Knotted: Serious study of arts',
        'Smooth: Natural artistic talent'
      ]
    },
    {
      name: 'Mercury',
      finger: language === 'hi' ? 'कनिष्ठा (Pinky)' : 'Pinky Finger',
      icon: '🤙',
      planet: 'Mercury',
      trait: language === 'hi' ? 'व्यापार और वाणी' : 'Commerce & Speech',
      color: 'from-emerald-500/20 to-emerald-600/20',
      borderColor: 'border-emerald-500/30',
      details: language === 'hi' ? [
        'लंबी कनिष्ठा: व्यापारिक सफलता, अच्छा वक्ता',
        'छोटी कनिष्ठा: संचार में कठिनाई, शर्मीला',
        'झुकी हुई: बेईमानी की प्रवृत्ति',
        'सीधी: ईमानदार व्यापारी, स्पष्ट संचार',
        'गांठदार: व्यापार में सावधानी, विश्लेषण',
        'चिकनी: त्वरित व्यापारिक निर्णय'
      ] : [
        'Long Pinky: Business success, good speaker',
        'Short Pinky: Communication difficulty, shy',
        'Bent: Tendency towards dishonesty',
        'Straight: Honest trader, clear communication',
        'Knotted: Cautious in business, analytical',
        'Smooth: Quick business decisions'
      ]
    },
    {
      name: 'Venus/Mars',
      finger: language === 'hi' ? 'अंगूठा (Thumb)' : 'Thumb',
      icon: '👍',
      planet: 'Venus/Mars',
      trait: language === 'hi' ? 'इच्छाशक्ति और जीवन शक्ति' : 'Willpower & Vitality',
      color: 'from-pink-500/20 to-rose-600/20',
      borderColor: 'border-pink-500/30',
      details: language === 'hi' ? [
        'लंबा अंगूठा: मजबूत इच्छाशक्ति, नेतृत्व क्षमता',
        'छोटा अंगूठा: कमजोर इच्छाशक्ति, दूसरों पर निर्भर',
        'लचीला: अनुकूलनशील, लचीला स्वभाव',
        'कठोर: जिद्दी, अपने निर्णय पर अड़ा रहने वाला',
        'गोल शीर्ष: सौम्य, कलात्मक',
        'चौकोर शीर्ष: व्यावहारिक, तार्किक'
      ] : [
        'Long Thumb: Strong willpower, leadership ability',
        'Short Thumb: Weak willpower, depends on others',
        'Flexible: Adaptable, flexible nature',
        'Rigid: Stubborn, sticks to decisions',
        'Round Tip: Gentle, artistic',
        'Square Tip: Practical, logical'
      ]
    }
  ];

  // All mounts data - used for quick reference
  const mounts = [
    { name: 'Jupiter', loc: language === 'hi' ? 'तर्जनी' : 'Index', icon: '👆', trait: language === 'hi' ? 'नेतृत्व और महत्वाकांक्षा' : 'Leadership & Ambition', color: 'from-amber-500/20 to-amber-600/20' },
    { name: 'Saturn', loc: language === 'hi' ? 'मध्यमा' : 'Middle', icon: '🖕', trait: language === 'hi' ? 'अनुशासन और कर्म' : 'Discipline & Karma', color: 'from-blue-500/20 to-blue-600/20' },
    { name: 'Sun', loc: language === 'hi' ? 'अनामिका' : 'Ring', icon: '🖐️', trait: language === 'hi' ? 'प्रसिद्धि और कलात्मकता' : 'Fame & Artistry', color: 'from-yellow-500/20 to-yellow-600/20' },
    { name: 'Mercury', loc: language === 'hi' ? 'कनिष्ठा' : 'Pinky', icon: '🤙', trait: language === 'hi' ? 'व्यापार और वाणी' : 'Commerce & Speech', color: 'from-emerald-500/20 to-emerald-600/20' },
    { name: 'Venus', loc: language === 'hi' ? 'अंगूठा' : 'Thumb', icon: '👍', trait: language === 'hi' ? 'प्रेम और जीवन शक्ति' : 'Love & Vitality', color: 'from-pink-500/20 to-rose-600/20' },
    { name: 'Moon', loc: language === 'hi' ? 'चंद्र' : 'Luna', icon: '🌙', trait: language === 'hi' ? 'कल्पना और यात्रा' : 'Imagination & Travel', color: 'from-slate-400/20 to-slate-500/20' },
    { name: 'Mars (Upper)', loc: language === 'hi' ? 'ऊपरी मंगल' : 'Upper Mars', icon: '⚔️', trait: language === 'hi' ? 'साहस और धैर्य' : 'Courage & Patience', color: 'from-red-500/20 to-red-700/20' },
    { name: 'Mars (Lower)', loc: language === 'hi' ? 'निचला मंगल' : 'Lower Mars', icon: '🛡️', trait: language === 'hi' ? 'आक्रामकता और रक्षा' : 'Aggression & Defense', color: 'from-orange-500/20 to-orange-700/20' }
  ];

  const specialMarkings = [
    {
      icon: '✝️',
      name: t.mysticCross || (language === 'hi' ? 'रहस्यमय क्रॉस' : 'Mystic Cross'),
      desc: t.mysticCrossDesc || (language === 'hi' ? 'हाथ में क्रॉस का चिह्न आध्यात्मिक जागरूकता और रहस्यमय शक्तियों का संकेत देता है।' : 'A cross mark in the palm indicates spiritual awareness and mystical powers.')
    },
    {
      icon: '🐟',
      name: t.fishMark || (language === 'hi' ? 'मछली चिह्न' : 'Fish Mark'),
      desc: t.fishMarkDesc || (language === 'hi' ? 'धन और समृद्धि का शुभ संकेत।' : 'Auspicious sign of wealth and prosperity.')
    },
    {
      icon: '⭐',
      name: language === 'hi' ? 'तारा चिह्न' : 'Star Mark',
      desc: language === 'hi' ? 'सफलता और सौभाग्य का संकेत। हाथ के विभिन्न भागों में अलग-अलग अर्थ।' : 'Sign of success and fortune. Different meanings in different parts of the palm.'
    },
    {
      icon: '🔺',
      name: language === 'hi' ? 'त्रिकोण' : 'Triangle',
      desc: language === 'hi' ? 'बौद्धिक क्षमता और रक्षा का प्रतीक। स्थान के अनुसार अर्थ बदलता है।' : 'Symbol of intellectual ability and protection. Meaning changes based on location.'
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pb-16 sm:pb-20 md:pb-24 animate-fade-in-up">
      <div className="text-center mb-8 sm:mb-12 md:mb-16">
        <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-[0.5em] sm:tracking-[1em] text-amber-500 mb-2 block">Palmistry Learning</span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif text-amber-100 drop-shadow-lg">
          {language === 'hi' ? 'हस्तरेखा गाइड' : 'Palmistry Guide'}
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm italic tracking-[0.1em] sm:tracking-[0.2em] mt-2 sm:mt-4 uppercase px-2">
          {language === 'hi' ? 'हाथ की रेखाओं का अध्ययन' : 'Study the lines of fate upon your hand'}
        </p>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800 rounded-2xl sm:rounded-3xl md:rounded-[4rem] p-4 sm:p-6 md:p-12 lg:p-16 shadow-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="animate-fade-in space-y-6 sm:space-y-8">
          {/* Palm Diagram Section with Image */}
          <div className="bg-slate-950/60 p-4 sm:p-6 md:p-10 rounded-xl sm:rounded-2xl md:rounded-3xl border border-slate-800 shadow-xl">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-serif text-rose-300 mb-4 sm:mb-6 md:mb-10 flex items-center gap-2 sm:gap-4">
              <span className="p-2 sm:p-3 bg-rose-900/20 rounded-xl sm:rounded-2xl border border-rose-500/20 text-xl sm:text-2xl md:text-3xl">✋</span> 
              {language === 'hi' ? 'हाथ की रेखाएं' : 'Palm Lines Guide'}
            </h3>
            
            {/* Visual Palm Diagram */}
            <div className="relative bg-slate-900/50 rounded-xl sm:rounded-2xl p-2 sm:p-4 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8 border border-slate-700/50">
              <div className="relative mx-auto w-full max-w-4xl">
                <div className="relative w-full">
                  <img 
                    src={language === 'hi' ? '/images/palmistry-hindi.jpg' : '/images/palmistry-english.jpg'}
                    alt={language === 'hi' ? 'वैदिक हस्तरेखा शास्त्र - Palm Lines Guide' : 'Vedic Palmistry - Palm Lines Guide'}
                    className="w-full h-auto rounded-xl shadow-2xl border border-slate-700/50 object-contain"
                    loading="eager"
                    fetchPriority="high"
                    onError={(e) => {
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
              <p className="text-center text-[10px] sm:text-xs text-slate-500 mt-2 sm:mt-4 italic px-2">
                {language === 'hi' ? 'वैदिक हस्तरेखा शास्त्र - मुख्य रेखाओं का दृश्य मार्गदर्शन' : 'Vedic Palmistry - Visual guide to main palm lines'}
              </p>
            </div>

            {/* Detailed Line Information with Expand/Collapse */}
            <div className="mb-4 sm:mb-6">
              <button
                onClick={() => toggleSection('lines')}
                className="w-full flex items-center justify-between p-3 sm:p-4 bg-slate-900/50 rounded-xl sm:rounded-2xl border border-slate-800 hover:border-rose-500/50 transition-all mb-3 sm:mb-4 min-h-[44px]"
              >
                <h4 className="text-base sm:text-lg md:text-xl font-serif text-rose-200 flex items-center gap-2 sm:gap-3">
                  <span className="text-lg sm:text-xl md:text-2xl">📋</span>
                  <span className="text-xs sm:text-sm md:text-base">{language === 'hi' ? 'विस्तृत रेखा जानकारी' : 'Detailed Line Information'}</span>
                </h4>
                <svg 
                  className={`w-6 h-6 text-rose-400 transition-transform duration-300 ${expandedSections.lines ? 'rotate-180' : ''}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {expandedSections.lines && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 animate-fade-in">
                  {palmLines.map((l, idx) => (
                    <div 
                      key={l.name} 
                      className={`bg-gradient-to-br ${l.color} p-4 sm:p-6 rounded-xl sm:rounded-2xl border ${l.borderColor} group hover:scale-[1.02] transition-all`}
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                        <span className="text-2xl sm:text-3xl group-hover:scale-125 transition-transform duration-500">{l.icon}</span>
                        <h4 className="text-white font-bold text-sm sm:text-base uppercase tracking-[0.1em] sm:tracking-[0.2em]">{l.name}</h4>
                      </div>
                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">{l.body}</p>
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">
                          {language === 'hi' ? 'मुख्य बिंदु:' : 'Key Points:'}
                        </p>
                        {l.details.map((detail, detailIdx) => (
                          <div key={detailIdx} className="flex items-start gap-2 text-xs text-slate-400">
                            <span className="text-amber-400 mt-1 flex-shrink-0">•</span>
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Fingers Section - Detailed Analysis */}
          <div className="bg-slate-950/60 p-4 sm:p-6 md:p-10 rounded-xl sm:rounded-2xl md:rounded-3xl border border-slate-800 shadow-xl">
            <button
              onClick={() => toggleSection('fingers')}
              className="w-full flex items-center justify-between mb-4 sm:mb-6 md:mb-8 min-h-[44px]"
            >
              <h3 className="text-lg sm:text-xl md:text-2xl font-serif text-purple-300 flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl">✋</span>
                <span className="text-xs sm:text-sm md:text-base">{language === 'hi' ? 'उंगलियों का विस्तृत विश्लेषण' : 'Detailed Finger Analysis'}</span>
              </h3>
              <svg 
                className={`w-6 h-6 text-purple-400 transition-transform duration-300 ${expandedSections.fingers ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSections.fingers && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {fingers.map((finger, idx) => (
                  <div 
                    key={finger.name} 
                    className={`bg-gradient-to-br ${finger.color} p-4 sm:p-6 rounded-xl sm:rounded-2xl border ${finger.borderColor} group hover:scale-[1.02] transition-all`}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-4xl group-hover:scale-125 transition-transform duration-500">{finger.icon}</span>
                      <div>
                        <h4 className="text-white font-bold text-lg uppercase tracking-wider">{finger.name}</h4>
                        <p className="text-slate-400 text-xs">{finger.finger}</p>
                        <p className="text-amber-300 text-sm font-serif mt-1">{finger.trait}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      {finger.details.map((detail, detailIdx) => (
                        <div key={detailIdx} className="flex items-start gap-2 text-xs text-slate-300">
                          <span className="text-purple-400 mt-1 flex-shrink-0">•</span>
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hand Types Section */}
          <div className="bg-slate-950/60 p-4 sm:p-6 md:p-10 rounded-xl sm:rounded-2xl md:rounded-3xl border border-slate-800 shadow-xl">
            <button
              onClick={() => toggleSection('handTypes')}
              className="w-full flex items-center justify-between mb-4 sm:mb-6 md:mb-8 min-h-[44px]"
            >
              <h3 className="text-lg sm:text-xl md:text-2xl font-serif text-cyan-300 flex items-center gap-2 sm:gap-3">
                <span className="text-2xl">🤲</span>
                {language === 'hi' ? 'हाथ के प्रकार' : 'Hand Types & Shapes'}
              </h3>
              <svg 
                className={`w-6 h-6 text-cyan-400 transition-transform duration-300 ${expandedSections.handTypes ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSections.handTypes && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                {[
                  {
                    name: language === 'hi' ? 'पृथ्वी हाथ' : 'Earth Hand',
                    icon: '🌍',
                    desc: language === 'hi' ? 'चौकोर हथेली, छोटी उंगलियां - व्यावहारिक, विश्वसनीय, धैर्यवान' : 'Square palm, short fingers - Practical, reliable, patient',
                    traits: language === 'hi' ? ['व्यावहारिक सोच', 'भौतिक सुरक्षा चाहता है', 'स्थिर और विश्वसनीय', 'प्रकृति से जुड़ा'] : ['Practical thinking', 'Seeks material security', 'Stable and reliable', 'Connected to nature']
                  },
                  {
                    name: language === 'hi' ? 'वायु हाथ' : 'Air Hand',
                    icon: '💨',
                    desc: language === 'hi' ? 'चौकोर हथेली, लंबी उंगलियां - बौद्धिक, संचार कुशल, जिज्ञासु' : 'Square palm, long fingers - Intellectual, communicative, curious',
                    traits: language === 'hi' ? ['बौद्धिक रुचि', 'अच्छा संचार', 'जिज्ञासु प्रकृति', 'सामाजिक'] : ['Intellectual interests', 'Good communication', 'Curious nature', 'Social']
                  },
                  {
                    name: language === 'hi' ? 'अग्नि हाथ' : 'Fire Hand',
                    icon: '🔥',
                    desc: language === 'hi' ? 'लंबी हथेली, छोटी उंगलियां - उत्साही, आवेगी, रचनात्मक' : 'Long palm, short fingers - Enthusiastic, impulsive, creative',
                    traits: language === 'hi' ? ['उत्साही और ऊर्जावान', 'रचनात्मक', 'आवेगी', 'नेतृत्व क्षमता'] : ['Enthusiastic and energetic', 'Creative', 'Impulsive', 'Leadership ability']
                  },
                  {
                    name: language === 'hi' ? 'जल हाथ' : 'Water Hand',
                    icon: '💧',
                    desc: language === 'hi' ? 'लंबी हथेली, लंबी उंगलियां - भावनात्मक, सहज, कलात्मक' : 'Long palm, long fingers - Emotional, intuitive, artistic',
                    traits: language === 'hi' ? ['भावनात्मक', 'सहज और कलात्मक', 'संवेदनशील', 'कल्पनाशील'] : ['Emotional', 'Intuitive and artistic', 'Sensitive', 'Imaginative']
                  }
                ].map((type, idx) => (
                  <div 
                    key={idx}
                    className="bg-slate-900/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{type.icon}</span>
                      <h4 className="text-cyan-300 font-bold text-lg">{type.name}</h4>
                    </div>
                    <p className="text-slate-300 text-sm mb-4">{type.desc}</p>
                    <div className="space-y-2">
                      {type.traits.map((trait, traitIdx) => (
                        <div key={traitIdx} className="flex items-start gap-2 text-xs text-slate-400">
                          <span className="text-cyan-400 mt-1">•</span>
                          <span>{trait}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Advanced Study Material */}
          <div className="bg-slate-950/60 p-4 sm:p-6 md:p-10 rounded-xl sm:rounded-2xl md:rounded-3xl border border-slate-800 shadow-xl">
            <button
              onClick={() => toggleSection('advanced')}
              className="w-full flex items-center justify-between mb-4 sm:mb-6 md:mb-8 min-h-[44px]"
            >
              <h3 className="text-lg sm:text-xl md:text-2xl font-serif text-indigo-300 flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl">📚</span>
                {language === 'hi' ? 'उन्नत अध्ययन सामग्री' : 'Advanced Study Material'}
              </h3>
              <svg 
                className={`w-6 h-6 text-indigo-400 transition-transform duration-300 ${expandedSections.advanced ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSections.advanced && (
              <div className="space-y-6 animate-fade-in">
                {/* Nail Analysis */}
                <div className="bg-slate-900/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-800">
                  <h4 className="text-indigo-300 font-serif text-xl mb-4 flex items-center gap-2">
                    <span>💅</span>
                    {language === 'hi' ? 'नाखून विश्लेषण' : 'Nail Analysis'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { type: language === 'hi' ? 'लंबे नाखून' : 'Long Nails', meaning: language === 'hi' ? 'धैर्य, शांत स्वभाव, कलात्मक' : 'Patience, calm nature, artistic' },
                      { type: language === 'hi' ? 'छोटे नाखून' : 'Short Nails', meaning: language === 'hi' ? 'आलोचनात्मक, तार्किक, व्यावहारिक' : 'Critical, logical, practical' },
                      { type: language === 'hi' ? 'चौकोर नाखून' : 'Square Nails', meaning: language === 'hi' ? 'व्यावहारिक, संगठित, विश्वसनीय' : 'Practical, organized, reliable' },
                      { type: language === 'hi' ? 'गोल नाखून' : 'Round Nails', meaning: language === 'hi' ? 'सौम्य, शांतिप्रिय, कलात्मक' : 'Gentle, peace-loving, artistic' },
                      { type: language === 'hi' ? 'सफेद धब्बे' : 'White Spots', meaning: language === 'hi' ? 'जिंक की कमी, तनाव का संकेत' : 'Zinc deficiency, stress indicator' },
                      { type: language === 'hi' ? 'लाल नाखून' : 'Red Nails', meaning: language === 'hi' ? 'उच्च ऊर्जा, जुनून, गुस्सा' : 'High energy, passion, anger' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
                        <span className="text-indigo-400 font-bold">•</span>
                        <div>
                          <strong className="text-white text-sm">{item.type}:</strong>
                          <p className="text-slate-400 text-xs mt-1">{item.meaning}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skin Texture */}
                <div className="bg-slate-900/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-800">
                  <h4 className="text-indigo-300 font-serif text-xl mb-4 flex items-center gap-2">
                    <span>🤚</span>
                    {language === 'hi' ? 'त्वचा की बनावट' : 'Skin Texture'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { type: language === 'hi' ? 'मुलायम त्वचा' : 'Soft Skin', meaning: language === 'hi' ? 'संवेदनशील, भावनात्मक, कलात्मक' : 'Sensitive, emotional, artistic' },
                      { type: language === 'hi' ? 'कठोर त्वचा' : 'Hard Skin', meaning: language === 'hi' ? 'व्यावहारिक, शारीरिक श्रम, धैर्य' : 'Practical, physical labor, patience' },
                      { type: language === 'hi' ? 'चिकनी त्वचा' : 'Smooth Skin', meaning: language === 'hi' ? 'सुखी जीवन, आराम पसंद' : 'Comfortable life, luxury-loving' },
                      { type: language === 'hi' ? 'खुरदरी त्वचा' : 'Rough Skin', meaning: language === 'hi' ? 'शारीरिक कार्य, संघर्ष, मजबूती' : 'Physical work, struggle, strength' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
                        <span className="text-indigo-400 font-bold">•</span>
                        <div>
                          <strong className="text-white text-sm">{item.type}:</strong>
                          <p className="text-slate-400 text-xs mt-1">{item.meaning}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timing on Lines */}
                <div className="bg-slate-900/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-800">
                  <h4 className="text-indigo-300 font-serif text-xl mb-4 flex items-center gap-2">
                    <span>⏰</span>
                    {language === 'hi' ? 'रेखाओं पर समय' : 'Timing on Lines'}
                  </h4>
                  <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                    {language === 'hi' 
                      ? 'जीवन रेखा पर समय की गणना: कलाई से शुरू करके, रेखा को 70 वर्ष मानकर, प्रत्येक सेक्शन लगभग 10 वर्ष का होता है। हृदय रेखा पर समय: तर्जनी से शुरू करके, प्रत्येक उंगली के नीचे का भाग लगभग 20-25 वर्ष का होता है।'
                      : 'Timing on Life Line: Starting from wrist, assuming 70 years, each section represents approximately 10 years. Timing on Heart Line: Starting from index finger, each section under fingers represents approximately 20-25 years.'}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {[
                      { age: language === 'hi' ? '0-20 वर्ष' : '0-20 Years', location: language === 'hi' ? 'कलाई के पास' : 'Near Wrist' },
                      { age: language === 'hi' ? '20-40 वर्ष' : '20-40 Years', location: language === 'hi' ? 'बीच का भाग' : 'Middle Section' },
                      { age: language === 'hi' ? '40+ वर्ष' : '40+ Years', location: language === 'hi' ? 'उंगलियों के पास' : 'Near Fingers' }
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 bg-slate-800/50 rounded-xl text-center">
                        <div className="text-indigo-400 font-bold text-lg mb-1">{item.age}</div>
                        <div className="text-slate-400 text-xs">{item.location}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Lines */}
                <div className="bg-slate-900/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-800">
                  <h4 className="text-indigo-300 font-serif text-xl mb-4 flex items-center gap-2">
                    <span>📏</span>
                    {language === 'hi' ? 'अतिरिक्त रेखाएं' : 'Additional Lines'}
                  </h4>
                  <div className="space-y-3">
                    {[
                      { name: language === 'hi' ? 'स्वास्थ्य रेखा' : 'Health Line', desc: language === 'hi' ? 'कलाई से शुरू होकर छोटी उंगली तक - स्वास्थ्य और धन का संकेत' : 'From wrist to pinky - Indicates health and wealth' },
                      { name: language === 'hi' ? 'विवाह रेखा' : 'Marriage Line', desc: language === 'hi' ? 'छोटी उंगली के नीचे - रिश्ते और विवाह की संख्या' : 'Below pinky - Number of relationships and marriages' },
                      { name: language === 'hi' ? 'बच्चों की रेखा' : 'Children Lines', desc: language === 'hi' ? 'विवाह रेखा से ऊपर - बच्चों की संख्या और स्वास्थ्य' : 'Above marriage line - Number and health of children' },
                      { name: language === 'hi' ? 'यात्रा रेखा' : 'Travel Lines', desc: language === 'hi' ? 'कलाई के पास - यात्रा और स्थान परिवर्तन' : 'Near wrist - Travel and location changes' },
                      { name: language === 'hi' ? 'बुध रेखा' : 'Mercury Line', desc: language === 'hi' ? 'बुध पर्वत से - व्यापारिक सफलता और बुद्धि' : 'From Mercury mount - Business success and intelligence' }
                    ].map((line, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
                        <span className="text-indigo-400 font-bold">•</span>
                        <div>
                          <strong className="text-white text-sm">{line.name}:</strong>
                          <p className="text-slate-400 text-xs mt-1">{line.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mounts and Special Markings with Expand/Collapse */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Mounts Section */}
            <div className="bg-slate-950/60 p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-xl">
              <button
                onClick={() => toggleSection('mounts')}
                className="w-full flex items-center justify-between mb-6 sm:mb-8"
              >
                <h3 className="text-2xl font-serif text-amber-200 flex items-center gap-3">
                  <span className="text-2xl">⛰️</span>
                  {t.theMounts || (language === 'hi' ? 'पर्वत (ग्रहीय ऊर्जा केंद्र)' : 'The Mounts (Planetary)')}
                </h3>
                <svg 
                  className={`w-6 h-6 text-amber-400 transition-transform duration-300 ${expandedSections.mounts ? 'rotate-180' : ''}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {expandedSections.mounts && (
                <div className="space-y-6 animate-fade-in">
                  {/* Explanation of Mounts */}
                  <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 mb-6">
                    <h4 className="text-amber-300 font-serif text-lg mb-3 flex items-center gap-2">
                      <span>📖</span>
                      {language === 'hi' ? 'पर्वत क्या हैं?' : 'What are Mounts?'}
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed mb-4">
                      {language === 'hi' 
                        ? 'पर्वत हथेली पर उंगलियों के आधार पर स्थित उभरे हुए क्षेत्र हैं। ये ग्रहीय ऊर्जा के केंद्र हैं और व्यक्ति की प्रतिभा, क्षमताओं और व्यक्तित्व लक्षणों को दर्शाते हैं। प्रत्येक पर्वत एक विशिष्ट ग्रह से जुड़ा होता है।'
                        : 'Mounts are raised areas at the base of fingers on the palm. They are centers of planetary energy and reveal a person\'s talents, abilities, and personality traits. Each mount is associated with a specific planet.'}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="p-3 bg-slate-800/50 rounded-xl">
                        <div className="text-emerald-400 font-bold text-xs mb-1">{language === 'hi' ? 'विकसित पर्वत' : 'Developed Mount'}</div>
                        <p className="text-slate-400 text-xs">{language === 'hi' ? 'उभरा हुआ, मजबूत - गुण प्रबल' : 'Raised, strong - Traits are prominent'}</p>
                      </div>
                      <div className="p-3 bg-slate-800/50 rounded-xl">
                        <div className="text-yellow-400 font-bold text-xs mb-1">{language === 'hi' ? 'सामान्य पर्वत' : 'Normal Mount'}</div>
                        <p className="text-slate-400 text-xs">{language === 'hi' ? 'संतुलित - गुण मध्यम' : 'Balanced - Traits are moderate'}</p>
                      </div>
                      <div className="p-3 bg-slate-800/50 rounded-xl">
                        <div className="text-red-400 font-bold text-xs mb-1">{language === 'hi' ? 'अविकसित पर्वत' : 'Underdeveloped Mount'}</div>
                        <p className="text-slate-400 text-xs">{language === 'hi' ? 'समतल, कम - गुण कमजोर' : 'Flat, low - Traits are weak'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Mount Information - All 8 Mounts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        name: 'Jupiter',
                        icon: '👆',
                        finger: language === 'hi' ? 'तर्जनी (Index)' : 'Index Finger',
                        planet: 'Jupiter',
                        trait: language === 'hi' ? 'नेतृत्व और महत्वाकांक्षा' : 'Leadership & Ambition',
                        color: 'from-amber-500/20 to-amber-600/20',
                        borderColor: 'border-amber-500/30',
                        location: language === 'hi' ? 'तर्जनी के नीचे, हृदय रेखा के ऊपर' : 'Below index finger, above heart line',
                        developed: language === 'hi' ? 'प्राकृतिक नेता, आत्मविश्वासी, धार्मिक, महत्वाकांक्षी, दूसरों की मदद करने वाला' : 'Natural leader, confident, religious, ambitious, helpful to others',
                        normal: language === 'hi' ? 'संतुलित नेतृत्व, आत्म-सम्मान, न्यायप्रिय' : 'Balanced leadership, self-respect, just',
                        underdeveloped: language === 'hi' ? 'आत्मविश्वास की कमी, नेतृत्व से बचना, आलसी' : 'Lack of confidence, avoids leadership, lazy',
                        warnings: language === 'hi' ? 'अत्यधिक विकसित: अहंकारी, दंभी, दूसरों पर हावी होने वाला' : 'Overdeveloped: Arrogant, proud, dominating'
                      },
                      {
                        name: 'Saturn',
                        icon: '🖕',
                        finger: language === 'hi' ? 'मध्यमा (Middle)' : 'Middle Finger',
                        planet: 'Saturn',
                        trait: language === 'hi' ? 'अनुशासन और कर्म' : 'Discipline & Karma',
                        color: 'from-blue-500/20 to-blue-600/20',
                        borderColor: 'border-blue-500/30',
                        location: language === 'hi' ? 'मध्यमा उंगली के नीचे, भाग्य रेखा के पास' : 'Below middle finger, near fate line',
                        developed: language === 'hi' ? 'गंभीर, जिम्मेदार, कर्म पर विश्वास, दार्शनिक, अकेले रहना पसंद' : 'Serious, responsible, believes in karma, philosophical, prefers solitude',
                        normal: language === 'hi' ? 'संतुलित जीवन, नैतिक मूल्य, अनुशासन' : 'Balanced life, moral values, discipline',
                        underdeveloped: language === 'hi' ? 'हल्का स्वभाव, जिम्मेदारी से बचना, असंगठित' : 'Light-hearted, avoids responsibility, disorganized',
                        warnings: language === 'hi' ? 'अत्यधिक विकसित: उदास, निराशावादी, अकेलापन' : 'Overdeveloped: Depressed, pessimistic, loneliness'
                      },
                      {
                        name: 'Sun',
                        icon: '🖐️',
                        finger: language === 'hi' ? 'अनामिका (Ring)' : 'Ring Finger',
                        planet: 'Sun',
                        trait: language === 'hi' ? 'प्रसिद्धि और कलात्मकता' : 'Fame & Artistry',
                        color: 'from-yellow-500/20 to-yellow-600/20',
                        borderColor: 'border-yellow-500/30',
                        location: language === 'hi' ? 'अनामिका उंगली के नीचे, हृदय रेखा के पास' : 'Below ring finger, near heart line',
                        developed: language === 'hi' ? 'कलात्मक प्रतिभा, प्रसिद्धि की इच्छा, रचनात्मक, आकर्षक व्यक्तित्व' : 'Artistic talent, desire for fame, creative, attractive personality',
                        normal: language === 'hi' ? 'कला में रुचि, संतुलित जीवन, सुंदरता की सराहना' : 'Interest in arts, balanced life, appreciation of beauty',
                        underdeveloped: language === 'hi' ? 'कलात्मक रुचि कम, प्रसिद्धि से बचना, निजी जीवन पसंद' : 'Less artistic interest, avoids fame, prefers private life',
                        warnings: language === 'hi' ? 'अत्यधिक विकसित: घमंडी, दिखावा, अहंकार' : 'Overdeveloped: Vain, show-off, egoistic'
                      },
                      {
                        name: 'Mercury',
                        icon: '🤙',
                        finger: language === 'hi' ? 'कनिष्ठा (Pinky)' : 'Pinky Finger',
                        planet: 'Mercury',
                        trait: language === 'hi' ? 'व्यापार और वाणी' : 'Commerce & Speech',
                        color: 'from-emerald-500/20 to-emerald-600/20',
                        borderColor: 'border-emerald-500/30',
                        location: language === 'hi' ? 'कनिष्ठा उंगली के नीचे, हृदय रेखा के अंत में' : 'Below pinky finger, at end of heart line',
                        developed: language === 'hi' ? 'व्यापारिक सफलता, अच्छा वक्ता, बुद्धिमान, वैज्ञानिक दृष्टिकोण' : 'Business success, good speaker, intelligent, scientific approach',
                        normal: language === 'hi' ? 'संतुलित व्यापार, सामान्य संचार, व्यावहारिक' : 'Balanced business, normal communication, practical',
                        underdeveloped: language === 'hi' ? 'संचार में कठिनाई, शर्मीला, व्यापार में असफलता' : 'Communication difficulty, shy, business failures',
                        warnings: language === 'hi' ? 'अत्यधिक विकसित: बेईमान व्यापारी, धोखेबाज, चालाक' : 'Overdeveloped: Dishonest trader, deceitful, cunning'
                      },
                      {
                        name: 'Venus',
                        icon: '👍',
                        finger: language === 'hi' ? 'अंगूठा (Thumb)' : 'Thumb Base',
                        planet: 'Venus',
                        trait: language === 'hi' ? 'प्रेम और जीवन शक्ति' : 'Love & Vitality',
                        color: 'from-pink-500/20 to-rose-600/20',
                        borderColor: 'border-pink-500/30',
                        location: language === 'hi' ? 'अंगूठे के आधार पर, जीवन रेखा के चारों ओर' : 'At base of thumb, surrounding life line',
                        developed: language === 'hi' ? 'प्रेममय, आकर्षक, कामुक, जीवन शक्ति से भरपूर, कला प्रेमी' : 'Loving, attractive, sensual, full of vitality, art lover',
                        normal: language === 'hi' ? 'संतुलित प्रेम जीवन, सामान्य ऊर्जा, सौंदर्य की सराहना' : 'Balanced love life, normal energy, appreciation of beauty',
                        underdeveloped: language === 'hi' ? 'प्रेम में रुचि कम, कम ऊर्जा, भावनात्मक रूप से ठंडा' : 'Less interest in love, low energy, emotionally cold',
                        warnings: language === 'hi' ? 'अत्यधिक विकसित: अत्यधिक कामुक, आसक्ति, भौतिक सुखों में डूबा' : 'Overdeveloped: Overly sensual, attachment, indulgent in material pleasures'
                      },
                      {
                        name: 'Moon',
                        icon: '🌙',
                        finger: language === 'hi' ? 'चंद्र (Luna)' : 'Luna/Moon',
                        planet: 'Moon',
                        trait: language === 'hi' ? 'कल्पना और यात्रा' : 'Imagination & Travel',
                        color: 'from-slate-400/20 to-slate-500/20',
                        borderColor: 'border-slate-400/30',
                        location: language === 'hi' ? 'कलाई के पास, बुध पर्वत के नीचे' : 'Near wrist, below Mercury mount',
                        developed: language === 'hi' ? 'कल्पनाशील, रहस्यमय, यात्रा प्रेमी, सहज, कलात्मक' : 'Imaginative, mystical, travel lover, intuitive, artistic',
                        normal: language === 'hi' ? 'संतुलित कल्पना, सामान्य यात्रा, सहजता' : 'Balanced imagination, normal travel, intuition',
                        underdeveloped: language === 'hi' ? 'कल्पना की कमी, यात्रा से बचना, व्यावहारिक सोच' : 'Lack of imagination, avoids travel, practical thinking',
                        warnings: language === 'hi' ? 'अत्यधिक विकसित: भ्रमित, अस्थिर, अवास्तविक' : 'Overdeveloped: Confused, unstable, unrealistic'
                      },
                      {
                        name: 'Mars (Upper)',
                        icon: '⚔️',
                        finger: language === 'hi' ? 'ऊपरी मंगल' : 'Upper Mars',
                        planet: 'Mars',
                        trait: language === 'hi' ? 'साहस और धैर्य' : 'Courage & Patience',
                        color: 'from-red-500/20 to-red-700/20',
                        borderColor: 'border-red-500/30',
                        location: language === 'hi' ? 'तर्जनी और अंगूठे के बीच, जीवन रेखा के ऊपर' : 'Between index finger and thumb, above life line',
                        developed: language === 'hi' ? 'साहसी, धैर्यवान, निडर, मजबूत इच्छाशक्ति, नेतृत्व क्षमता' : 'Courageous, patient, fearless, strong willpower, leadership ability',
                        normal: language === 'hi' ? 'संतुलित साहस, सामान्य धैर्य, मजबूत चरित्र' : 'Balanced courage, normal patience, strong character',
                        underdeveloped: language === 'hi' ? 'डरपोक, धैर्य की कमी, कमजोर इच्छाशक्ति' : 'Cowardly, lack of patience, weak willpower',
                        warnings: language === 'hi' ? 'अत्यधिक विकसित: आक्रामक, हिंसक, अधीर' : 'Overdeveloped: Aggressive, violent, impatient'
                      },
                      {
                        name: 'Mars (Lower)',
                        icon: '🛡️',
                        finger: language === 'hi' ? 'निचला मंगल' : 'Lower Mars',
                        planet: 'Mars',
                        trait: language === 'hi' ? 'आक्रामकता और रक्षा' : 'Aggression & Defense',
                        color: 'from-orange-500/20 to-orange-700/20',
                        borderColor: 'border-orange-500/30',
                        location: language === 'hi' ? 'अंगूठे के नीचे, जीवन रेखा के नीचे' : 'Below thumb, under life line',
                        developed: language === 'hi' ? 'आत्मरक्षा में मजबूत, शारीरिक शक्ति, लड़ाकू प्रवृत्ति, सैन्य गुण' : 'Strong in self-defense, physical strength, fighting tendency, military qualities',
                        normal: language === 'hi' ? 'संतुलित आत्मरक्षा, सामान्य शारीरिक शक्ति' : 'Balanced self-defense, normal physical strength',
                        underdeveloped: language === 'hi' ? 'आत्मरक्षा में कमजोर, शारीरिक रूप से कमजोर, शांतिप्रिय' : 'Weak in self-defense, physically weak, peace-loving',
                        warnings: language === 'hi' ? 'अत्यधिक विकसित: हिंसक, क्रूर, नुकसान पहुंचाने वाला' : 'Overdeveloped: Violent, cruel, harmful'
                      }
                    ].map((m, idx) => (
                      <div 
                        key={m.name} 
                        className={`bg-gradient-to-br ${m.color} p-4 sm:p-6 rounded-xl sm:rounded-2xl border ${m.borderColor} group hover:scale-[1.02] transition-all`}
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-3xl group-hover:scale-125 transition-transform duration-500">{m.icon}</span>
                          <div>
                            <h5 className="text-amber-400 text-lg font-bold uppercase tracking-wider">{m.name}</h5>
                            <p className="text-slate-400 text-xs">{m.finger} • {m.planet}</p>
                            <p className="text-white text-sm font-serif mt-1">{m.trait}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3 mt-4">
                          <div>
                            <div className="text-emerald-300 text-xs font-bold mb-1 flex items-center gap-1">
                              <span>📍</span>
                              {language === 'hi' ? 'स्थान' : 'Location'}
                            </div>
                            <p className="text-slate-300 text-xs">{m.location}</p>
                          </div>
                          
                          <div>
                            <div className="text-green-400 text-xs font-bold mb-1 flex items-center gap-1">
                              <span>✅</span>
                              {language === 'hi' ? 'विकसित पर्वत' : 'Developed Mount'}
                            </div>
                            <p className="text-slate-300 text-xs leading-relaxed">{m.developed}</p>
                          </div>
                          
                          <div>
                            <div className="text-yellow-400 text-xs font-bold mb-1 flex items-center gap-1">
                              <span>⚖️</span>
                              {language === 'hi' ? 'सामान्य पर्वत' : 'Normal Mount'}
                            </div>
                            <p className="text-slate-300 text-xs leading-relaxed">{m.normal}</p>
                          </div>
                          
                          <div>
                            <div className="text-red-400 text-xs font-bold mb-1 flex items-center gap-1">
                              <span>❌</span>
                              {language === 'hi' ? 'अविकसित पर्वत' : 'Underdeveloped Mount'}
                            </div>
                            <p className="text-slate-300 text-xs leading-relaxed">{m.underdeveloped}</p>
                          </div>
                          
                          <div className="pt-2 border-t border-slate-700">
                            <div className="text-orange-400 text-xs font-bold mb-1 flex items-center gap-1">
                              <span>⚠️</span>
                              {language === 'hi' ? 'सावधानी' : 'Warning'}
                            </div>
                            <p className="text-slate-400 text-xs leading-relaxed italic">{m.warnings}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Special Markings Section */}
            <div className="bg-slate-950/60 p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl border border-slate-800">
              <button
                onClick={() => toggleSection('markings')}
                className="w-full flex items-center justify-between mb-3 sm:mb-4 md:mb-6 min-h-[44px]"
              >
                <h4 className="text-indigo-300 font-serif text-sm sm:text-base md:text-lg lg:text-xl uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center gap-2 sm:gap-3">
                  <span className="text-xl">🔮</span>
                  {t.specialMarkings || (language === 'hi' ? 'विशेष चिह्न' : 'Special Markings')}
                </h4>
                <svg 
                  className={`w-6 h-6 text-indigo-400 transition-transform duration-300 ${expandedSections.markings ? 'rotate-180' : ''}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {expandedSections.markings && (
                <div className="space-y-4 animate-fade-in">
                  {specialMarkings.map((marking, idx) => (
                    <div 
                      key={idx}
                      className="p-3 sm:p-4 md:p-6 bg-slate-900/50 rounded-xl sm:rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{marking.icon}</span>
                        <strong className="text-amber-300 text-sm">{marking.name}:</strong>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{marking.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PalmistryGuide;
