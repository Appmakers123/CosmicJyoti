import React, { useState } from 'react';
import { Language } from '../types';
import { BackButton, ModuleIntro } from './common';

// Rashi (sign) -> primary gemstone (Vedic Ratna)
const RASHI_GEMSTONE: Record<string, { en: string; hi: string; gemEn: string; gemHi: string }> = {
  aries:     { en: 'Aries', hi: 'मेष', gemEn: 'Red Coral', gemHi: 'मूंगा' },
  taurus:    { en: 'Taurus', hi: 'वृषभ', gemEn: 'Emerald', gemHi: 'पन्ना' },
  gemini:    { en: 'Gemini', hi: 'मिथुन', gemEn: 'Emerald', gemHi: 'पन्ना' },
  cancer:    { en: 'Cancer', hi: 'कर्क', gemEn: 'Pearl', gemHi: 'मोती' },
  leo:       { en: 'Leo', hi: 'सिंह', gemEn: 'Ruby', gemHi: 'माणिक' },
  virgo:     { en: 'Virgo', hi: 'कन्या', gemEn: 'Emerald', gemHi: 'पन्ना' },
  libra:     { en: 'Libra', hi: 'तुला', gemEn: 'Diamond', gemHi: 'हीरा' },
  scorpio:   { en: 'Scorpio', hi: 'वृश्चिक', gemEn: 'Red Coral', gemHi: 'मूंगा' },
  sagittarius: { en: 'Sagittarius', hi: 'धनु', gemEn: 'Yellow Sapphire', gemHi: 'पुखराज' },
  capricorn: { en: 'Capricorn', hi: 'मकर', gemEn: 'Blue Sapphire', gemHi: 'नीलम' },
  aquarius:  { en: 'Aquarius', hi: 'कुंभ', gemEn: 'Blue Sapphire', gemHi: 'नीलम' },
  pisces:    { en: 'Pisces', hi: 'मीन', gemEn: 'Yellow Sapphire', gemHi: 'पुखराज' },
};

function getSignFromDob(dateStr: string): { id: string; data: typeof RASHI_GEMSTONE[string] } | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const month = d.getMonth();
  const day = d.getDate();
  const order = ['capricorn', 'aquarius', 'pisces', 'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius'];
  const cutoffs = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22];
  let idx = month;
  if (day < cutoffs[month]) idx = month - 1;
  if (idx < 0) idx = 11;
  const id = order[idx];
  return { id, data: RASHI_GEMSTONE[id] };
}

const BirthstoneByDob: React.FC<{ language: Language; onBack?: () => void; onOpenGemstones?: () => void }> = ({ language, onBack, onOpenGemstones }) => {
  const [dob, setDob] = useState('');
  const result = getSignFromDob(dob);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-12 animate-fade-in-up">
      <div className="bg-slate-800/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-8 shadow-2xl">
        {onBack && (
          <div className="mb-6">
            <BackButton onClick={onBack} label={language === 'hi' ? 'वापस' : 'Back'} />
          </div>
        )}
        <ModuleIntro
          language={language}
          subtitleEn="Birthstone by date of birth – Sun sign gemstone (Vedic rashi ratna); ruby, pearl, emerald, etc."
          subtitleHi="जन्म तिथि से राशि रत्न – सूर्य राशि के अनुसार मुख्य रत्न (माणिक, मोती, पन्ना आदि)।"
          descriptionEn="Enter your date of birth to see your zodiac sign and its primary gemstone. For detailed advice see Gemstone Lab."
          descriptionHi="जन्म तारीख डालें – राशि और मुख्य रत्न देखें। विस्तृत सलाह के लिए रत्न लैब देखें।"
        />
        <h2 className="text-3xl font-serif text-amber-200 mb-2">
          {language === 'hi' ? 'राशि रत्न — जन्म तिथि से' : 'Birthstone by date of birth'}
        </h2>

        <div className="mb-6">
          <label className="block text-slate-400 text-xs uppercase tracking-wider mb-1">{language === 'hi' ? 'जन्म तिथि' : 'Date of birth'}</label>
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full max-w-xs bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100" />
        </div>

        {result && (
          <div className="bg-slate-900/60 border border-amber-500/20 rounded-2xl p-6 mb-6">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">{language === 'hi' ? 'राशि' : 'Sign'}</p>
            <p className="text-xl font-serif text-amber-200 mb-2">{language === 'hi' ? result.data.hi : result.data.en}</p>
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">{language === 'hi' ? 'रत्न' : 'Gemstone'}</p>
            <p className="text-2xl font-serif text-cyan-300">{language === 'hi' ? result.data.gemHi : result.data.gemEn}</p>
            {onOpenGemstones && (
              <button type="button" onClick={onOpenGemstones} className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white text-sm font-medium">
                {language === 'hi' ? 'रत्न शास्त्र में और जानें' : 'Learn more in Gemstone Lab'}
              </button>
            )}
          </div>
        )}

        <p className="text-slate-500 text-xs">
          {language === 'hi' ? 'वैदिक रत्न शास्त्र के अनुसार सूर्य राशि पर आधारित। विस्तृत सलाह के लिए रत्न लैब देखें।' : 'Based on Sun sign per Vedic gemstone tradition. See Gemstone Lab for detailed advice.'}
        </p>
      </div>
    </div>
  );
};

export default BirthstoneByDob;
