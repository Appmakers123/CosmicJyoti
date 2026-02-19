import React, { useState } from 'react';
import type { Language } from '../types';

const FAQ_ITEMS: { qEn: string; qHi: string; aEn: string; aHi: string }[] = [
  { qEn: 'What is a Kundali or birth chart?', qHi: 'कुंडली या जन्म कुंडली क्या है?', aEn: 'A Kundali shows planet positions at your birth time and place. It is the foundation of Vedic astrology.', aHi: 'कुंडली आपके जन्म के समय और स्थान पर ग्रहों की स्थिति दिखाती है। यह वैदिक ज्योतिष की नींव है।' },
  { qEn: 'Is CosmicJyoti free?', qHi: 'क्या CosmicJyoti मुफ्त है?', aEn: 'Yes. Kundali, horoscope, Panchang, Guna Milan and many tools are free. Some readings may require an ad.', aHi: 'हाँ। कुंडली, राशिफल, पंचांग, गुण मिलान और कई टूल मुफ्त हैं। कुछ पाठ के लिए विज्ञापन हो सकता है।' },
  { qEn: 'How accurate is the Kundali?', qHi: 'कुंडली कितनी सटीक है?', aEn: 'We use Lahiri ayanamsa and Vedic calculations. Use correct birth date, time and place for best results.', aHi: 'हम लाहिरी अयनांश और वैदिक गणना उपयोग करते हैं। सर्वोत्तम परिणाम के लिए सही जन्म तारीख, समय और स्थान दर्ज करें।' },
  { qEn: 'What is Guna Milan?', qHi: 'गुण मिलान क्या है?', aEn: 'Guna Milan (Ashtakoot) scores compatibility between two birth charts for marriage.', aHi: 'गुण मिलान (अष्टकूट) विवाह के लिए दो कुंडलियों का मिलान अंक देता है।' },
  { qEn: 'Do you store my data?', qHi: 'क्या आप मेरा डेटा स्टोर करते हैं?', aEn: 'Reports can be saved on your device only. We do not store birth details on servers.', aHi: 'रिपोर्ट केवल आपके डिवाइस पर सेव हो सकती हैं। हम जन्म विवरण सर्वर पर नहीं रखते।' },
];

interface FAQSectionProps {
  language: Language;
  onClose?: () => void;
  inline?: boolean;
}

const FAQSection: React.FC<FAQSectionProps> = ({ language, onClose, inline = true }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isHi = language === 'hi';

  const block = (
    <div className="space-y-2">
      <h3 className="text-lg font-serif font-semibold text-amber-200 mb-3">{isHi ? 'अक्सर पूछे जाने वाले प्रश्न' : 'Frequently Asked Questions'}</h3>
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="border border-slate-600/50 rounded-xl overflow-hidden bg-slate-800/30">
          <button type="button" onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left text-slate-200 hover:bg-slate-700/30 transition-colors" aria-expanded={openIndex === i}>
            <span className="font-medium text-sm">{isHi ? item.qHi : item.qEn}</span>
            <span className="text-amber-400 text-lg flex-shrink-0">{openIndex === i ? '−' : '+'}</span>
          </button>
          {openIndex === i && <div className="px-4 pb-3 pt-0 text-slate-400 text-sm leading-relaxed border-t border-slate-700/50">{isHi ? item.aHi : item.aEn}</div>}
        </div>
      ))}
    </div>
  );

  if (inline) return block;
  return (
    <div className="bg-slate-800/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-serif text-amber-200">FAQ</h2>
        {onClose && <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1" aria-label={isHi ? 'बंद करें' : 'Close'}>×</button>}
      </div>
      {block}
    </div>
  );
};

export default FAQSection;
