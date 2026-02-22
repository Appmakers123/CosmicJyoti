import React, { useState } from 'react';
import { Language } from '../types';
import ModuleAskAI from './ModuleAskAI';
import { ModuleIntro } from './common';

/** Icons representing each Siddhi: small, vast, light, heavy, reach, will, lordship, mastery */
const SIDDHI_ICONS = ['🔬', '🌌', '🪶', '⛰️', '🌐', '✨', '👑', '🐉'];

const ASHTA_SIDDHIS_EN = [
  { name: 'Aṇima', desc: 'Ability to become infinitely small; mastery over matter at the atomic level.' },
  { name: 'Mahimā', desc: 'Ability to become infinitely large; expanding consciousness and presence.' },
  { name: 'Laghimā', desc: 'Weightlessness; levitation and freedom from gravitational pull.' },
  { name: 'Garimā', desc: 'Heaviness; the power to make oneself or objects immovably heavy.' },
  { name: 'Prāpti', desc: 'Reaching anywhere; instant access to any place or dimension.' },
  { name: 'Prākāmya', desc: 'Irresistible will; fulfillment of desires and natural law compliance.' },
  { name: 'Iśitva', desc: 'Lordship; divine supremacy and control over elements and beings.' },
  { name: 'Vaśitva', desc: 'Mastery over all; subjugation of natural forces and minds.' },
];

const ASHTA_SIDDHIS_HI = [
  { name: 'अणिमा', desc: 'अणु जैसा सूक्ष्म हो जाने की शक्ति।' },
  { name: 'महिमा', desc: 'अनंत विशाल हो जाने की शक्ति।' },
  { name: 'लघिमा', desc: 'भारहीनता; लेविटेशन।' },
  { name: 'गरिमा', desc: 'अत्यधिक भारी होने की शक्ति।' },
  { name: 'प्राप्ति', desc: 'कहीं भी पहुँचने की शक्ति।' },
  { name: 'प्राकाम्य', desc: 'इच्छा की पूर्ति; प्रकृति पर विजय।' },
  { name: 'ईशित्व', desc: 'सर्वोच्चता; तत्वों और प्राणियों पर नियंत्रण।' },
  { name: 'वशित्व', desc: 'सब पर अधिकार; प्रकृति और मन पर वश।' },
];

/** Icons representing each Nidhi: lotus, great lotus, conch, crocodile, tortoise, liberation, jasmine, joy, gem */
const NIDHI_ICONS = ['🪷', '🌸', '🐚', '🐊', '🐢', '☸️', '🌼', '😊', '💎'];

const NAV_NIDHIS_EN = [
  { name: 'Padma', desc: 'Lotus; wealth that multiplies and brings prosperity and beauty.' },
  { name: 'Mahāpadma', desc: 'Great Lotus; immense treasure and royal abundance.' },
  { name: 'Śaṅkha', desc: 'Conch; victory, fame, and divine sound; auspicious power.' },
  { name: 'Makara', desc: 'Crocodile; strength in water and hidden depths; protection.' },
  { name: 'Kacchapa', desc: 'Tortoise; stability, longevity, and foundation (like Kurma avatar).' },
  { name: 'Mukunda', desc: 'The one who bestows liberation; treasure of moksha and grace.' },
  { name: 'Kunda', desc: 'Jasmine; fragrance, purity, and subtle wealth of the senses.' },
  { name: 'Nanda', desc: 'Joy; the treasure of happiness and fulfilment.' },
  { name: 'Nīla', desc: 'Sapphire/Blue; precious gem; wealth of the earth and clarity.' },
];

const NAV_NIDHIS_HI = [
  { name: 'पद्म', desc: 'कमल; धन जो बढ़ता है, समृद्धि और सौंदर्य लाता है।' },
  { name: 'महापद्म', desc: 'महान कमल; विशाल खजाना और राजसी ऐश्वर्य।' },
  { name: 'शंख', desc: 'विजय, यश और दिव्य ध्वनि; शुभ शक्ति।' },
  { name: 'मकर', desc: 'जल में शक्ति और गहराई; सुरक्षा।' },
  { name: 'कच्छप', desc: 'स्थिरता, दीर्घायु और नींव (कूर्म अवतार जैसा)।' },
  { name: 'मुकुंद', desc: 'मोक्ष देने वाला; मुक्ति और कृपा का खजाना।' },
  { name: 'कुंद', desc: 'चमेली; सुगंध, पवित्रता और इंद्रियों का सूक्ष्म धन।' },
  { name: 'नंद', desc: 'आनंद; सुख और पूर्ति का खजाना।' },
  { name: 'नील', desc: 'नीलम; धरती का धन और स्पष्टता।' },
];

interface AshtaSiddhisProps {
  language: Language;
  onBack?: () => void;
}

export default function AshtaSiddhis({ language, onBack }: AshtaSiddhisProps) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [expandedNidhi, setExpandedNidhi] = useState<number | null>(null);
  const isHi = language === 'hi';
  const siddhis = isHi ? ASHTA_SIDDHIS_HI : ASHTA_SIDDHIS_EN;
  const nidhis = isHi ? NAV_NIDHIS_HI : NAV_NIDHIS_EN;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fade-in-up">
      <div className="bg-slate-900/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 md:p-8 shadow-2xl">
        <ModuleIntro
          language={language}
          subtitleEn="Ashta Siddhis & Nav Nidhi – eight occult powers and nine treasures from Vedic and Tantric texts."
          subtitleHi="अष्ट सिद्धि और नव निधि – वैदिक एवं तांत्रिक ग्रंथों में आठ दिव्य शक्तियाँ और नौ खजाने।"
          descriptionEn="Explore Anima, Mahima, Laghima, Garima, Prapti, Prakamya, Isitva, Vasitva and the nine Nidhis. For knowledge and insight; attained through Sadhana."
          descriptionHi="अणिमा, महिमा, लघिमा, गरिमा, प्राप्ति, प्राकाम्य, ईशित्व, वशित्व और नव निधि देखें। ज्ञान के लिए; साधना से प्राप्त।"
        />
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold block mb-2">
            {isHi ? 'अष्ट सिद्धियाँ' : 'Ashta Siddhis'}
          </span>
          <h1 className="text-3xl md:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-br from-amber-100 to-amber-400">
            {isHi ? 'अष्ट सिद्धि — आठ दिव्य शक्तियाँ' : 'Ashta Siddhis — Eight Occult Powers'}
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl mx-auto">
            {isHi
              ? 'ग्रंथों में वर्णित अष्ट सिद्धि एवं नव निधि — दिव्य शक्तियाँ और खजाने; गहन साधना से प्राप्त होते हैं।'
              : 'Ashta Siddhis (eight occult powers) and Nav Nidhi (nine treasures) — attainable through intense spiritual practice (Sadhana).'}
          </p>
        </div>

        <div className="grid gap-3 mb-6">
          {siddhis.map((s, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-600/50 bg-slate-800/40 overflow-visible"
            >
              <button
                type="button"
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-700/40 transition-colors"
              >
                <span className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-2xl sm:text-3xl w-10 h-10 flex items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0" aria-hidden>
                    {SIDDHI_ICONS[i]}
                  </span>
                  <span className="font-serif font-semibold text-amber-200 break-words text-left">{s.name}</span>
                </span>
                <span className="text-amber-400 shrink-0">{expanded === i ? '−' : '+'}</span>
              </button>
              {expanded === i && (
                <div className="px-4 pb-4 pt-0 border-t border-slate-700/50">
                  <p className="text-slate-300 text-sm leading-relaxed break-words">{s.desc}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <h2 className="text-lg font-serif font-bold text-amber-200 mb-3 flex items-center gap-2">
          <span>💰</span>
          {isHi ? 'नव निधि — नौ खजाने' : 'Nav Nidhi — Nine Treasures'}
        </h2>
        <p className="text-slate-400 text-xs mb-3 max-w-2xl">
          {isHi ? 'कुबेर से जुड़े नौ निधि; धन, शुभता और आध्यात्मिक ऐश्वर्य का प्रतीक।' : 'Nine treasures associated with Kubera; symbols of wealth, auspiciousness, and spiritual abundance.'}
        </p>
        <div className="grid gap-3 mb-8">
          {nidhis.map((n, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-600/50 bg-slate-800/40 overflow-visible"
            >
              <button
                type="button"
                onClick={() => setExpandedNidhi(expandedNidhi === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-700/40 transition-colors"
              >
                <span className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-2xl sm:text-3xl w-10 h-10 flex items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0" aria-hidden>
                    {NIDHI_ICONS[i]}
                  </span>
                  <span className="font-serif font-semibold text-amber-200 break-words text-left">{n.name}</span>
                </span>
                <span className="text-amber-400 shrink-0">{expandedNidhi === i ? '−' : '+'}</span>
              </button>
              {expandedNidhi === i && (
                <div className="px-4 pb-4 pt-0 border-t border-slate-700/50">
                  <p className="text-slate-300 text-sm leading-relaxed break-words">{n.desc}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <ModuleAskAI
          language={language}
          moduleName={isHi ? 'अष्ट सिद्धि एवं नव निधि' : 'Ashta Siddhis & Nav Nidhi'}
          contextStr="You are an expert in Yogic and Tantric traditions. Answer about: (1) Ashta Siddhis — the eight occult powers (Anima, Mahima, Laghima, Garima, Prapti, Prakamya, Isitva, Vasitva); (2) Nav Nidhi — the nine treasures (Padma, Mahapadma, Shankha, Makara, Kacchapa, Mukunda, Kunda, Nanda, Nila) associated with Kubera; and the role of Sadhana in attaining these. Keep answers educational and respectful of tradition."
        />
      </div>
    </div>
  );
}
