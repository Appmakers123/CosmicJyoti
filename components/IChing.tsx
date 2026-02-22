import React, { useState } from 'react';
import { Language } from '../types';
import { useTranslation } from '../utils/translations';
import { ModuleIntro } from './common';

const HEXAGRAMS: { nameEn: string; nameHi: string; meaningEn: string; meaningHi: string }[] = [
  { nameEn: 'The Creative Heaven', nameHi: 'स्वर्ग', meaningEn: 'Strong creative energy. New beginnings.', meaningHi: 'रचनात्मक ऊर्जा। नई शुरुआत।' },
  { nameEn: 'The Receptive Earth', nameHi: 'पृथ्वी', meaningEn: 'Receive and nurture. Patience.', meaningHi: 'ग्रहण करें, पोषण करें। धैर्य।' },
  { nameEn: 'Difficulty at the Start', nameHi: 'शुरुआत में कठिनाई', meaningEn: 'Initial obstacles. Persevere.', meaningHi: 'प्रारंभिक बाधाएं। दृढ़ रहें।' },
  { nameEn: 'Youthful Folly', nameHi: 'युवा मूर्खता', meaningEn: 'Innocence and learning.', meaningHi: 'मासूमियत और सीख।' },
  { nameEn: 'Waiting', nameHi: 'प्रतीक्षा', meaningEn: 'Wait for the right moment.', meaningHi: 'सही समय की प्रतीक्षा।' },
  { nameEn: 'Conflict', nameHi: 'संघर्ष', meaningEn: 'Conflict ahead. Seek mediation.', meaningHi: 'संघर्ष। मध्यस्थता लें।' },
  { nameEn: 'The Army', nameHi: 'सेना', meaningEn: 'Discipline and order.', meaningHi: 'अनुशासन और व्यवस्था।' },
  { nameEn: 'Holding Together', nameHi: 'एक साथ', meaningEn: 'Alliance and unity.', meaningHi: 'गठबंधन और एकता।' },
  { nameEn: 'Small Taming', nameHi: 'छोटा नियंत्रण', meaningEn: 'Small steps. Build gradually.', meaningHi: 'छोटे कदम। धीरे बनाएं।' },
  { nameEn: 'Treading', nameHi: 'चलना', meaningEn: 'Right conduct. Tread carefully.', meaningHi: 'सही आचरण। सावधानी।' },
  { nameEn: 'Peace', nameHi: 'शांति', meaningEn: 'Harmony. Prosperity.', meaningHi: 'सामंजस्य। समृद्धि।' },
  { nameEn: 'Standstill', nameHi: 'ठहराव', meaningEn: 'Blockage. Preserve peace.', meaningHi: 'अवरोध। शांति बनाए रखें।' },
  { nameEn: 'Fellowship', nameHi: 'साझेदारी', meaningEn: 'Community. Collaborate.', meaningHi: 'समुदाय। सहयोग।' },
  { nameEn: 'Great Possession', nameHi: 'महान स्वामित्व', meaningEn: 'Abundance. Share wisely.', meaningHi: 'प्रचुरता। समझदारी से बांटें।' },
  { nameEn: 'Modesty', nameHi: 'विनम्रता', meaningEn: 'Humility brings success.', meaningHi: 'विनम्रता सफलता लाती है।' },
  { nameEn: 'Enthusiasm', nameHi: 'उत्साह', meaningEn: 'Joy. Follow your passion.', meaningHi: 'आनंद। जुनून का पालन करें।' },
  { nameEn: 'Following', nameHi: 'अनुसरण', meaningEn: 'Adapt to the flow.', meaningHi: 'प्रवाह के अनुकूल।' },
  { nameEn: 'Work on Spoiled', nameHi: 'सुधार', meaningEn: 'Fix past errors.', meaningHi: 'पुरानी गलतियाँ सुधारें।' },
  { nameEn: 'Approach', nameHi: 'निकटता', meaningEn: 'Progress approaches.', meaningHi: 'प्रगति निकट।' },
  { nameEn: 'Contemplation', nameHi: 'चिंतन', meaningEn: 'Observe and reflect.', meaningHi: 'अवलोकन और चिंतन।' },
  { nameEn: 'Bite Through', nameHi: 'काटकर निकालना', meaningEn: 'Break through obstacles.', meaningHi: 'बाधाओं को तोड़ें।' },
  { nameEn: 'Grace', nameHi: 'कृपा', meaningEn: 'Beauty and harmony.', meaningHi: 'सौंदर्य और सामंजस्य।' },
  { nameEn: 'Splitting Apart', nameHi: 'विभाजन', meaningEn: 'Hold to the center.', meaningHi: 'केंद्र को पकड़ें।' },
  { nameEn: 'Return', nameHi: 'वापसी', meaningEn: 'Return to the source.', meaningHi: 'स्रोत पर लौटें।' },
  { nameEn: 'Innocence', nameHi: 'निर्दोषता', meaningEn: 'Act from the heart.', meaningHi: 'दिल से कार्य करें।' },
  { nameEn: 'Great Taming', nameHi: 'महान नियंत्रण', meaningEn: 'Use power wisely.', meaningHi: 'शक्ति समझदारी से।' },
  { nameEn: 'Nourishment', nameHi: 'पोषण', meaningEn: 'Nourish body and mind.', meaningHi: 'शरीर और मन पोषित करें।' },
  { nameEn: 'Great Excess', nameHi: 'अतिरेक', meaningEn: 'Bold but careful.', meaningHi: 'साहसी पर सावधान।' },
  { nameEn: 'The Abysmal Water', nameHi: 'गहरा जल', meaningEn: 'Proceed with care.', meaningHi: 'सावधानी से आगे बढ़ें।' },
  { nameEn: 'The Clinging Fire', nameHi: 'अग्नि', meaningEn: 'Clarity and warmth.', meaningHi: 'स्पष्टता और गर्मी।' },
  { nameEn: 'Influence', nameHi: 'प्रभाव', meaningEn: 'Small causes, big effects.', meaningHi: 'छोटे कारण, बड़े प्रभाव।' },
  { nameEn: 'Duration', nameHi: 'अवधि', meaningEn: 'Endurance. Lasting goals.', meaningHi: 'सहनशीलता। स्थायी लक्ष्य।' },
  { nameEn: 'Retreat', nameHi: 'पीछे हटना', meaningEn: 'Strategic withdrawal.', meaningHi: 'रणनीतिक वापसी।' },
  { nameEn: 'Great Power', nameHi: 'महान शक्ति', meaningEn: 'Use power wisely.', meaningHi: 'शक्ति बुद्धिमानी से।' },
  { nameEn: 'Progress', nameHi: 'प्रगति', meaningEn: 'Success through clarity.', meaningHi: 'स्पष्टता से सफलता।' },
  { nameEn: 'Darkening of Light', nameHi: 'प्रकाश का अंधेरा', meaningEn: 'Keep your inner light.', meaningHi: 'आंतरिक रोशनी बनाए रखें।' },
  { nameEn: 'The Family', nameHi: 'परिवार', meaningEn: 'Order within.', meaningHi: 'भीतर व्यवस्था।' },
  { nameEn: 'Opposition', nameHi: 'विरोध', meaningEn: 'Find common ground.', meaningHi: 'साझा जमीन खोजें।' },
  { nameEn: 'Obstruction', nameHi: 'अवरोध', meaningEn: 'Wait and prepare.', meaningHi: 'प्रतीक्षा और तैयारी।' },
  { nameEn: 'Deliverance', nameHi: 'मुक्ति', meaningEn: 'Relief after difficulty.', meaningHi: 'कठिनाई के बाद राहत।' },
  { nameEn: 'Decrease', nameHi: 'कमी', meaningEn: 'Less is more.', meaningHi: 'कम ज्यादा है।' },
  { nameEn: 'Increase', nameHi: 'वृद्धि', meaningEn: 'Growth. Add value.', meaningHi: 'विकास। मूल्य जोड़ें।' },
  { nameEn: 'Decisiveness', nameHi: 'निर्णायकता', meaningEn: 'Decide and act.', meaningHi: 'निर्णय लें और कार्य करें।' },
  { nameEn: 'The Marrying Maiden', nameHi: 'विवाहित कन्या', meaningEn: 'Align with right people.', meaningHi: 'सही लोगों के साथ।' },
  { nameEn: 'Abundance', nameHi: 'प्रचुरता', meaningEn: 'Peak of success.', meaningHi: 'सफलता का शिखर।' },
  { nameEn: 'The Wanderer', nameHi: 'यात्री', meaningEn: 'Stay humble.', meaningHi: 'विनम्र रहें।' },
  { nameEn: 'The Gentle Wind', nameHi: 'कोमल हवा', meaningEn: 'Gentle persistence.', meaningHi: 'कोमल दृढ़ता।' },
  { nameEn: 'Joy', nameHi: 'आनंद', meaningEn: 'Share happiness.', meaningHi: 'खुशी बांटें।' },
  { nameEn: 'Dispersion', nameHi: 'फैलाव', meaningEn: 'Regroup and focus.', meaningHi: 'फिर से ध्यान केंद्रित करें।' },
  { nameEn: 'Limitation', nameHi: 'सीमा', meaningEn: 'Know your limits.', meaningHi: 'अपनी सीमाएं जानें।' },
  { nameEn: 'Inner Truth', nameHi: 'आंतरिक सत्य', meaningEn: 'Act from truth.', meaningHi: 'सत्य से कार्य करें।' },
  { nameEn: 'Small Preponderance', nameHi: 'छोटी प्रबलता', meaningEn: 'Attention to detail.', meaningHi: 'विवरण पर ध्यान।' },
  { nameEn: 'After Completion', nameHi: 'पूर्णता के बाद', meaningEn: 'Maintain order.', meaningHi: 'व्यवस्था बनाए रखें।' },
  { nameEn: 'Before Completion', nameHi: 'पूर्णता से पहले', meaningEn: 'Final care.', meaningHi: 'अंतिम सावधानी।' },
];

interface IChingProps { language: Language; }

const IChing: React.FC<IChingProps> = ({ language }) => {
  const t = useTranslation(language);
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<typeof HEXAGRAMS[0] | null>(null);
  const [drawn, setDrawn] = useState(false);
  const isHi = language === 'hi';

  const draw = () => {
    setResult(HEXAGRAMS[Math.floor(Math.random() * 64)]);
    setDrawn(true);
  };

  const name = result ? (isHi ? result.nameHi : result.nameEn) : '';
  const meaning = result ? (isHi ? result.meaningHi : result.meaningEn) : '';
  const interpretationBody = (t.ichingInterpretationBody || '')
    .replace(/\{name\}/g, name)
    .replace(/\{meaning\}/g, meaning);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 animate-fade-in-up">
      <div className="bg-slate-900/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 md:p-8 shadow-2xl">
        <ModuleIntro
          language={language}
          subtitleEn="I Ching – ancient Chinese oracle; draw a hexagram for guidance and reflection."
          subtitleHi="आई चिंग – प्राचीन चीनी ओरेकल; मार्गदर्शन के लिए हेक्साग्राम चुनें।"
          descriptionEn="Focus on a question and draw a random hexagram. Get the classic I Ching meaning and a short interpretation for reflection."
          descriptionHi="सवाल सोचें और एक यादृच्छिक हेक्साग्राम चुनें। क्लासिक अर्थ और संक्षिप्त व्याख्या।"
        />
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold block mb-2">{t.ichingTitle}</span>
          <h1 className="text-3xl md:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-br from-amber-100 to-amber-400">{t.ichingTitle}</h1>
          <p className="text-slate-400 text-sm mt-2">{t.ichingSubtitle}</p>
        </div>
        <div className="mb-6">
          <label className="block text-slate-400 text-sm font-medium mb-2">{t.ichingQuestionLabel}</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t.ichingQuestionPlaceholder}
            rows={2}
            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 text-amber-100 placeholder-slate-500 focus:border-amber-500 resize-none"
          />
          <button type="button" onClick={draw} className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold">
            {t.ichingDrawBtn}
          </button>
        </div>
        {drawn && result && (
          <div className="animate-fade-in-up space-y-4">
            <div className="p-6 rounded-xl bg-slate-800/50 border border-amber-500/20">
              <div className="text-4xl mb-4 text-center">☰ ☱ ☲ ☳ ☴ ☵</div>
              <h2 className="text-xl font-serif text-amber-200 mb-2">{name}</h2>
              <p className="text-slate-300">{meaning}</p>
              <button type="button" onClick={draw} className="mt-4 text-sm text-amber-400 hover:text-amber-300">{t.ichingDrawAgain}</button>
            </div>
            <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700">
              <h3 className="text-amber-200 font-serif text-sm mb-2">{t.ichingInterpretation}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{interpretationBody}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IChing;
