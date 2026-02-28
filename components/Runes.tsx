import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { useTranslation } from '../utils/translations';
import { requestScrollToMain } from '../utils/scrollToMain';
import { ModuleIntro } from './common';

const RUNES: { symbol: string; nameEn: string; nameHi: string; meaningEn: string; meaningHi: string }[] = [
  { symbol: 'ᚠ', nameEn: 'Fehu', nameHi: 'फेहू', meaningEn: 'Wealth, abundance, new beginnings', meaningHi: 'धन, प्रचुरता, नई शुरुआत' },
  { symbol: 'ᚢ', nameEn: 'Uruz', nameHi: 'उरुज़', meaningEn: 'Strength, health, raw power', meaningHi: 'शक्ति, स्वास्थ्य, कच्ची शक्ति' },
  { symbol: 'ᚦ', nameEn: 'Thurisaz', nameHi: 'थुरिसाज़', meaningEn: 'Protection, conflict, gateway', meaningHi: 'सुरक्षा, संघर्ष, द्वार' },
  { symbol: 'ᚨ', nameEn: 'Ansuz', nameHi: 'आन्सुज़', meaningEn: 'Communication, wisdom, divine message', meaningHi: 'संचार, ज्ञान, दिव्य संदेश' },
  { symbol: 'ᚱ', nameEn: 'Raidho', nameHi: 'रैधो', meaningEn: 'Journey, movement, rhythm', meaningHi: 'यात्रा, गति, लय' },
  { symbol: 'ᚲ', nameEn: 'Kenaz', nameHi: 'केनाज़', meaningEn: 'Light, knowledge, revelation', meaningHi: 'प्रकाश, ज्ञान, रहस्योद्घाटन' },
  { symbol: 'ᚷ', nameEn: 'Gebo', nameHi: 'गेबो', meaningEn: 'Gift, partnership, exchange', meaningHi: 'उपहार, साझेदारी, आदान-प्रदान' },
  { symbol: 'ᚹ', nameEn: 'Wunjo', nameHi: 'वुन्जो', meaningEn: 'Joy, harmony, success', meaningHi: 'आनंद, सामंजस्य, सफलता' },
  { symbol: 'ᚺ', nameEn: 'Hagalaz', nameHi: 'हागलाज़', meaningEn: 'Disruption, hail, trial', meaningHi: 'विघ्न, परीक्षा' },
  { symbol: 'ᚾ', nameEn: 'Nauthiz', nameHi: 'नौथिज़', meaningEn: 'Need, constraint, endurance', meaningHi: 'आवश्यकता, बाधा, सहनशीलता' },
  { symbol: 'ᛁ', nameEn: 'Isa', nameHi: 'इसा', meaningEn: 'Stillness, ice, pause', meaningHi: 'स्थिरता, बर्फ, विराम' },
  { symbol: 'ᛃ', nameEn: 'Jera', nameHi: 'जेरा', meaningEn: 'Harvest, cycle, reward', meaningHi: 'फसल, चक्र, पुरस्कार' },
  { symbol: 'ᛇ', nameEn: 'Eihwaz', nameHi: 'एइहवाज़', meaningEn: 'Defense, yew, transformation', meaningHi: 'रक्षा, रूपांतरण' },
  { symbol: 'ᛈ', nameEn: 'Perthro', nameHi: 'पर्थ्रो', meaningEn: 'Mystery, fate, secrets', meaningHi: 'रहस्य, भाग्य, रहस्य' },
  { symbol: 'ᛉ', nameEn: 'Algiz', nameHi: 'अलगिज़', meaningEn: 'Protection, sanctuary, divine shield', meaningHi: 'सुरक्षा, शरण, दिव्य ढाल' },
  { symbol: 'ᛊ', nameEn: 'Sowilo', nameHi: 'सोविलो', meaningEn: 'Sun, success, vitality', meaningHi: 'सूर्य, सफलता, जीवन शक्ति' },
  { symbol: 'ᛏ', nameEn: 'Tiwaz', nameHi: 'टिवाज़', meaningEn: 'Justice, honor, victory', meaningHi: 'न्याय, सम्मान, जीत' },
  { symbol: 'ᛒ', nameEn: 'Berkano', nameHi: 'बर्कानो', meaningEn: 'Growth, nurture, birth', meaningHi: 'विकास, पोषण, जन्म' },
  { symbol: 'ᛖ', nameEn: 'Ehwaz', nameHi: 'एहवाज़', meaningEn: 'Partnership, trust, movement', meaningHi: 'साझेदारी, विश्वास, गति' },
  { symbol: 'ᛗ', nameEn: 'Mannaz', nameHi: 'मान्नाज़', meaningEn: 'Self, community, humanity', meaningHi: 'स्व, समुदाय, मानवता' },
  { symbol: 'ᛚ', nameEn: 'Laguz', nameHi: 'लागुज़', meaningEn: 'Water, flow, intuition', meaningHi: 'जल, प्रवाह, अंतर्ज्ञान' },
  { symbol: 'ᛜ', nameEn: 'Ingwaz', nameHi: 'इंगवाज़', meaningEn: 'Fertility, potential, completion', meaningHi: 'उर्वरता, क्षमता, पूर्णता' },
  { symbol: 'ᛞ', nameEn: 'Dagaz', nameHi: 'दागाज़', meaningEn: 'Breakthrough, day, hope', meaningHi: 'सफलता, दिन, आशा' },
  { symbol: 'ᛟ', nameEn: 'Othala', nameHi: 'ओथाला', meaningEn: 'Heritage, home, legacy', meaningHi: 'विरासत, घर, विरासत' },
];

type Spread = 'one' | 'three';

interface RunesProps {
  language: Language;
}

const Runes: React.FC<RunesProps> = ({ language }) => {
  const t = useTranslation(language);
  const [spread, setSpread] = useState<Spread>('one');
  const [drawn, setDrawn] = useState<typeof RUNES[0][]>([]);
  const [shown, setShown] = useState(false);
  const isHi = language === 'hi';

  useEffect(() => {
    if (drawn.length > 0) requestScrollToMain();
  }, [drawn.length]);

  const draw = () => {
    const count = spread === 'one' ? 1 : 3;
    const shuffled = [...RUNES].sort(() => Math.random() - 0.5);
    setDrawn(shuffled.slice(0, count));
    setShown(true);
  };

  const interpretationText = drawn.length === 1
    ? (t.runesInterpretationOne || '').replace(/\{meaning\}/g, drawn[0] ? (isHi ? drawn[0].meaningHi : drawn[0].meaningEn) : '')
    : drawn.length === 3
      ? (t.runesInterpretationThree || '')
          .replace(/\{past\}/g, isHi ? drawn[0].meaningHi : drawn[0].meaningEn)
          .replace(/\{present\}/g, isHi ? drawn[1].meaningHi : drawn[1].meaningEn)
          .replace(/\{future\}/g, isHi ? drawn[2].meaningHi : drawn[2].meaningEn)
      : '';

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 animate-fade-in-up">
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-500/40 rounded-2xl p-6 md:p-8 shadow-2xl">
        <ModuleIntro
          language={language}
          subtitleEn="Runes – Norse rune casting; one or three runes for guidance and reflection."
          subtitleHi="रून्स – नॉर्स रून कास्टिंग; मार्गदर्शन के लिए एक या तीन रून।"
          descriptionEn="Choose one or three runes and draw. Each rune has a symbol and meaning. Use for daily reflection or a simple past–present–future spread."
          descriptionHi="एक या तीन रून चुनें। प्रत्येक का प्रतीक और अर्थ। दैनिक चिंतन या भूत–वर्तमान–भविष्य स्प्रेड।"
        />
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-bold block mb-2">
            {t.runesTitle}
          </span>
          <h1 className="text-3xl md:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-br from-slate-100 via-slate-200 to-slate-400">
            {t.runesTitle}
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            {t.runesSubtitle}
          </p>
        </div>

        <div className="mb-6 flex gap-3 justify-center">
          <button
            type="button"
            onClick={() => { setSpread('one'); setShown(false); }}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${spread === 'one' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
          >
            {t.runesOne}
          </button>
          <button
            type="button"
            onClick={() => { setSpread('three'); setShown(false); }}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${spread === 'three' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
          >
            {t.runesThree}
          </button>
        </div>

        <button
          type="button"
          onClick={draw}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-bold transition-all border border-slate-500"
        >
          {t.runesDraw}
        </button>

        {shown && drawn.length > 0 && (
          <div className="mt-8 space-y-6 animate-fade-in-up">
            <div className={`grid gap-4 ${drawn.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-3'}`}>
              {drawn.map((rune, idx) => (
                <div key={idx} className="bg-slate-800/60 rounded-xl p-5 border border-slate-600 text-center">
                  <div className="text-5xl mb-2 text-amber-200/90">{rune.symbol}</div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">
                    {spread === 'three' ? (idx === 0 ? t.runesPast : idx === 1 ? t.runesPresent : t.runesFuture) : ''}
                  </div>
                  <h3 className="font-serif text-amber-200 font-medium">{isHi ? rune.nameHi : rune.nameEn}</h3>
                  <p className="text-slate-400 text-sm mt-1">{isHi ? rune.meaningHi : rune.meaningEn}</p>
                </div>
              ))}
            </div>
            <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700">
              <h3 className="text-amber-200 font-serif text-sm mb-2">{t.runesInterpretation}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{interpretationText}</p>
            </div>
            <button
              type="button"
              onClick={draw}
              className="block mx-auto text-sm text-amber-400 hover:text-amber-300"
            >
              {t.runesDrawAgain}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Runes;
