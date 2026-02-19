import React from 'react';
import type { Language } from '../types';

interface HowItWorksProps {
  language: Language;
  onClose?: () => void;
  /** If true, show as compact inline block; if false, show as modal/card */
  compact?: boolean;
}

const HowItWorks: React.FC<HowItWorksProps> = ({ language, onClose, compact = true }) => {
  const isHi = language === 'hi';

  const title = isHi ? 'यह कैसे काम करता है' : 'How it works';
  const disclaimer = isHi
    ? 'सटीकता के लिए जन्म तारीख, समय और स्थान सही दर्ज करें। यह मनोरंजन और शैक्षिक उद्देश्य के लिए है; महत्वपूर्ण निर्णय कुशल ज्योतिषी से सलाह लें।'
    : 'Enter correct birth date, time and place for accuracy. This is for entertainment and educational purposes; consult a qualified astrologer for important decisions.';

  const points = isHi
    ? [
        'कुंडली: लाहिरी अयनांश और वैदिक गणना से ग्रह स्थिति निकाली जाती है।',
        'गुण मिलान: अष्टकूट प्रणाली से दो कुंडलियों का मिलान अंक।',
        'राशिफल: आज की तारीख और ग्रहों के आधार पर दैनिक भविष्यवाणी।',
        'पंचांग: तिथि, नक्षत्र, मुहूर्त और सूर्योदय/अस्त समय।',
      ]
    : [
        'Kundali: Planetary positions are calculated using Lahiri ayanamsa and Vedic formulas.',
        'Guna Milan: Ashtakoot system scores compatibility between two birth charts.',
        'Horoscope: Daily predictions based on today’s date and planetary positions.',
        'Panchang: Tithi, nakshatra, muhurat, and sunrise/sunset times.',
      ];

  const content = (
    <div className="space-y-3">
      <h3 className="text-lg font-serif font-semibold text-amber-200">{title}</h3>
      <ul className="list-disc list-inside text-slate-400 text-sm space-y-1.5">
        {points.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
      <p className="text-slate-500 text-xs italic">{disclaimer}</p>
    </div>
  );

  if (compact) return content;
  return (
    <div className="bg-slate-800/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-serif text-amber-200">{title}</h2>
        {onClose && (
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1" aria-label={isHi ? 'बंद करें' : 'Close'}>×</button>
        )}
      </div>
      {content}
    </div>
  );
};

export default HowItWorks;
