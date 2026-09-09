
import React from 'react';
import { ZodiacSignData, Language } from './types';

const IconWrapper = ({ children }: { children?: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    {children}
  </svg>
);

export const ZODIAC_SIGNS: ZodiacSignData[] = [
  {
    id: 'aries',
    name: 'Aries',
    hindiName: 'मेष',
    dateRange: 'Mar 21 - Apr 19',
    element: 'Fire',
    description: 'Brave, leader, active.',
    symbol: <IconWrapper><path d="M12 21a9 9 0 0 0 9-9h-9v9" /><path d="M12 21a9 9 0 0 1-9-9h9v9" /><path d="M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18z" opacity="0" /><path d="M12 3v9" /><path d="M6.5 6.5C8 5 10 4 12 4s4 1 5.5 2.5" /></IconWrapper>
  },
  {
    id: 'taurus',
    name: 'Taurus',
    hindiName: 'वृषभ',
    dateRange: 'Apr 20 - May 20',
    element: 'Earth',
    description: 'Patient, loyal, hardworking.',
    symbol: <IconWrapper><path d="M7 12a5 5 0 1 0 10 0A5 5 0 1 0 7 12z" /><path d="M6 6c0 4 2 6 6 6s6-2 6-6" /><path d="M12 12v9" /></IconWrapper>
  },
  {
    id: 'gemini',
    name: 'Gemini',
    hindiName: 'मिथुन',
    dateRange: 'May 21 - Jun 20',
    element: 'Air',
    description: 'Curious, friendly, smart.',
    symbol: <IconWrapper><path d="M6 3v18" /><path d="M18 3v18" /><path d="M6 7h12" /><path d="M6 17h12" /><path d="M4.5 3h15" /><path d="M4.5 21h15" /></IconWrapper>
  },
  {
    id: 'cancer',
    name: 'Cancer',
    hindiName: 'कर्क',
    dateRange: 'Jun 21 - Jul 22',
    element: 'Water',
    description: 'Caring, emotional, family-oriented.',
    symbol: <IconWrapper><path d="M6 12a3 3 0 1 0 3-3" /><path d="M18 12a3 3 0 1 1-3 3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="12" r="3" /><path d="M9 12h6" opacity="0.5" /></IconWrapper>
  },
  {
    id: 'leo',
    name: 'Leo',
    hindiName: 'सिंह',
    dateRange: 'Jul 23 - Aug 22',
    element: 'Fire',
    description: 'Confident, kind, kingly.',
    symbol: <IconWrapper><path d="M16 3.5a2.5 2.5 0 1 0-4.5 2 2.5 2.5 0 1 1-4.5 2A2.5 2.5 0 0 0 4.5 10v1a8 8 0 1 0 16 0" /><circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.2" /></IconWrapper>
  },
  {
    id: 'virgo',
    name: 'Virgo',
    hindiName: 'कन्या',
    dateRange: 'Aug 23 - Sep 22',
    element: 'Earth',
    description: 'Helpful, organized, realistic.',
    symbol: <IconWrapper><path d="M4 4v16" /><path d="M4 12c0-3 2-4 4-4s4 2 4 5v7" /><path d="M12 12c0-3 2-4 4-4s4 2 4 5v7c0 2 2 3 3 1" /></IconWrapper>
  },
  {
    id: 'libra',
    name: 'Libra',
    hindiName: 'तुला',
    dateRange: 'Sep 23 - Oct 22',
    element: 'Air',
    description: 'Fair, charming, loves beauty.',
    symbol: <IconWrapper><path d="M12 21v-8" /><path d="M5 13h14" /><path d="M5 13a4 4 0 0 1 6.5-2.5" /><path d="M12 10.5A4 4 0 0 1 19 13" /><line x1="4" y1="21" x2="20" y2="21" /></IconWrapper>
  },
  {
    id: 'scorpio',
    name: 'Scorpio',
    hindiName: 'वृश्चिक',
    dateRange: 'Oct 23 - Nov 21',
    element: 'Water',
    description: 'Strong, mysterious, honest.',
    symbol: <IconWrapper><path d="M4 4v16" /><path d="M4 12c0-3 2-4 4-4s4 2 4 5v7" /><path d="M12 12c0-3 2-4 4-4s4 2 4 5v7l2 2 2-2" /></IconWrapper>
  },
  {
    id: 'sagittarius',
    name: 'Sagittarius',
    hindiName: 'धनु',
    dateRange: 'Nov 22 - Dec 21',
    element: 'Fire',
    description: 'Cheerful, explorer, lucky.',
    symbol: <IconWrapper><path d="M12 2l10 10" /><path d="M22 2l-10 10" /><path d="M22 2v5" /><path d="M22 2h-5" /><line x1="2" y1="22" x2="15" y2="9" /></IconWrapper>
  },
  {
    id: 'capricorn',
    name: 'Capricorn',
    hindiName: 'मकर',
    dateRange: 'Dec 22 - Jan 19',
    element: 'Earth',
    description: 'Ambitious, wise, stable.',
    symbol: <IconWrapper><path d="M4 15a4 4 0 1 1 5-3" /><path d="M9 12V9c0-3 2-4 4-4s4 1 4 4v3" /><path d="M17 12c2 0 3 2 3 4s-3 5-5 5c-2 0-3-2-3-4" /></IconWrapper>
  },
  {
    id: 'aquarius',
    name: 'Aquarius',
    hindiName: 'कुंभ',
    dateRange: 'Jan 20 - Feb 18',
    element: 'Air',
    description: 'Unique, creative, helpful.',
    symbol: <IconWrapper><path d="M3 10c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><path d="M3 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /></IconWrapper>
  },
  {
    id: 'pisces',
    name: 'Pisces',
    hindiName: 'मीन',
    dateRange: 'Feb 19 - Mar 20',
    element: 'Water',
    description: 'Dreamy, artistic, kind.',
    symbol: <IconWrapper><path d="M10 4c0 8 4 10 4 16" /><path d="M14 4c0 8-4 10-4 16" /><line x1="2" y1="12" x2="22" y2="12" /></IconWrapper>
  },
];

export const PLANETS_INFO = [
  { name: 'Sun', hindi: 'सूर्य', description: 'Represents the Atman (Soul), authority, fatherhood, and kingly status. It is the source of all life and confidence.', descriptionHi: 'आत्मा, अधिकार, पिता और राजा का प्रतिनिधित्व करता है। यह जीवन और आत्मविश्वास का स्रोत है।', color: 'text-yellow-400' },
  { name: 'Moon', hindi: 'चंद्र', description: 'Controls the Manas (Mind), emotions, motherhood, and mental peace. It governs the tides and our intuition.', descriptionHi: 'मानस (मन), भावनाओं, मातृत्व और मानसिक शांति को नियंत्रित करता है। यह हमारे अंतर्ज्ञान को नियंत्रित करता है।', color: 'text-slate-200' },
  { name: 'Mars', hindi: 'मंगल', description: 'The Commander. Rules energy, brothers, courage, land, and technical ability. A strong Mars makes one a warrior.', descriptionHi: 'कमांडर। ऊर्जा, भाइयों, साहस, भूमि और तकनीकी क्षमता पर शासन करता है। मजबूत मंगल व्यक्ति को योद्धा बनाता है।', color: 'text-red-500' },
  { name: 'Mercury', hindi: 'बुध', description: 'The Prince. Rules speech, logic, business, and youthful energy. It is the messenger planet of communication.', descriptionHi: 'राजकुमार। वाणी, तर्क, व्यापार और युवा ऊर्जा पर शासन करता है। यह संचार का संदेशवाहक ग्रह है।', color: 'text-emerald-400' },
  { name: 'Jupiter', hindi: 'गुरु', description: 'The Guru. Represents wisdom, children, expansion, spiritual growth, and prosperity. The great benefic.', descriptionHi: 'गुरु। ज्ञान, संतान, विस्तार, आध्यात्मिक विकास और समृद्धि का प्रतिनिधित्व करता है। महान शुभ ग्रह।', color: 'text-yellow-200' },
  { name: 'Venus', hindi: 'शुक्र', description: 'Represents luxury, marriage, love, fine arts, and beauty. It is the master of material success and relationships.', descriptionHi: 'विलासिता, विवाह, प्रेम, ललित कला और सुंदरता का प्रतिनिधित्व करता है। यह भौतिक सफलता और संबंधों का स्वामी है।', color: 'text-pink-300' },
  { name: 'Saturn', hindi: 'शनि', description: 'The Taskmaster. Rules karma, delay, discipline, hard work, and old age. It brings justice through persistence.', descriptionHi: 'कर्म, अनुशासन, कड़ी मेहनत और बुढ़ापे पर शासन करता है। यह दृढ़ता के माध्यम से न्याय लाता है।', color: 'text-blue-400' },
  { name: 'Rahu', hindi: 'राहु', description: 'The Dragon\'s Head. Represents obsession, worldly desires, sudden gains, and foreign lands. Master of illusion.', descriptionHi: 'जुनून, सांसारिक इच्छाओं, अचानक लाभ और विदेशी भूमि का प्रतिनिधित्व करता है। भ्रम का स्वामी।', color: 'text-slate-500' },
  { name: 'Ketu', hindi: 'केतु', description: 'The Dragon\'s Tail. Represents moksha (liberation), detachment, spirituality, and past life karmas.', descriptionHi: 'मोक्ष (मुक्ति), वैराग्य, आध्यात्मिकता और पिछले जीवन के कर्मों का प्रतिनिधित्व करता है।', color: 'text-orange-900' },
];

export const HOUSES_INFO = [
  { id: 1, name: 'Tanubbhava (Self)', nameHi: 'तनु भाव', desc: 'Appearance, physical health, character, and early childhood.', descHi: 'दिखावट, शारीरिक स्वास्थ्य, चरित्र और प्रारंभिक बचपन।', icon: '👤' },
  { id: 2, name: 'Dhanabhava (Wealth)', nameHi: 'धन भाव', desc: 'Family lineage, accumulated wealth, speech, and food habits.', descHi: 'पारिवारिक वंश, संचित धन, वाणी और भोजन की आदतें।', icon: '💰' },
  { id: 3, name: 'Sahajabhava (Sibilings)', nameHi: 'सहज भाव', desc: 'Courage, younger siblings, communication, and short travels.', descHi: 'साहस, छोटे भाई-बहन, संचार और छोटी यात्राएं।', icon: '👥' },
  { id: 4, name: 'Matrubhava (Mother)', nameHi: 'मातृ भाव', desc: 'Mother, domestic peace, vehicles, land, and happiness.', descHi: 'माता, घरेलू शांति, वाहन, भूमि और सुख।', icon: '🏠' },
  { id: 5, name: 'Putrabhava (Children)', nameHi: 'पुत्र भाव', desc: 'Creativity, children, past life merit, and intelligence.', descHi: 'रचनात्मकता, संतान, पूर्व जन्म के पुण्य और बुद्धि।', icon: '👶' },
  { id: 6, name: 'Ari-bhava (Enemies)', nameHi: 'अरि भाव', desc: 'Debts, diseases, enemies, litigation, and daily service.', descHi: 'ऋण, रोग, शत्रु, मुकदमेबाजी और दैनिक सेवा।', icon: '⚔️' },
  { id: 7, name: 'Yuvatibhava (Partner)', nameHi: 'युवती भाव', desc: 'Marriage, business partners, and all legal relationships.', descHi: 'विवाह, व्यावसायिक साझेदार और सभी कानूनी संबंध।', color: 'text-pink-400', icon: '💑' },
  { id: 8, name: 'Randhrabhava (Occult)', nameHi: 'रंध्र भाव', desc: 'Longevity, sudden transformations, hidden secrets, and insurance.', descHi: 'दीर्घायु, अचानक परिवर्तन, छिपे हुए रहस्य और बीमा।', icon: '🔮' },
  { id: 9, name: 'Bhagyabhava (Luck)', nameHi: 'भाग्य भाव', desc: 'Fortune, father-figure, dharma, gurus, and long distance travel.', descHi: 'भाग्य, पिता-समान, धर्म, गुरु और लंबी दूरी की यात्रा।', icon: '🍀' },
  { id: 10, name: 'Karmabhava (Career)', nameHi: 'कर्म भाव', desc: 'Public life, status, professional career, and father\'s legacy.', descHi: 'सार्वजनिक जीवन, स्थिति, पेशेवर करियर और पिता की विरासत।', icon: '💼' },
  { id: 11, name: 'Labhabhava (Gains)', nameHi: 'लाभ भाव', desc: 'Wishes, elder siblings, income, and large social circles.', descHi: 'इच्छाएं, बड़े भाई-बहन, आय और बड़े सामाजिक दायरे।', icon: '📈' },
  { id: 12, name: 'Vyayabhava (Losses)', nameHi: 'व्यय भाव', desc: 'Expenditure, isolation, spirituality, sleep, and foreign lands.', descHi: 'व्यय, अलगाव, आध्यात्मिकता, नींद और विदेशी भूमि।', icon: '📉' },
];

export const NAKSHATRAS_INFO = [
  { name: 'Ashwini', ruler: 'Ketu', trait: 'Swiftness, Healing', symbol: '🐴', description: 'The Horsemen. Known for speed, healing abilities, and quick action. Excellent for starting new ventures.', descriptionHi: 'घोड़े। गति, उपचार क्षमता और त्वरित कार्रवाई के लिए जाना जाता है। नए उद्यम शुरू करने के लिए उत्कृष्ट।', image: 'https://images.unsplash.com/photo-1516726817505-5d48b5c8c3b3?w=400' },
  { name: 'Bharani', ruler: 'Venus', trait: 'Intensity, Creation', symbol: '🩸', description: 'The Bearer. Represents creation, intensity, and transformation. Strong willpower and determination.', descriptionHi: 'वाहक। सृजन, तीव्रता और परिवर्तन का प्रतिनिधित्व करता है। मजबूत इच्छाशक्ति और दृढ़ संकल्प।', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' },
  { name: 'Krittika', ruler: 'Sun', trait: 'Transformation, Sharpness', symbol: '🔥', description: 'The Cutter. Sharp intellect, cutting through obstacles. Excellent for purification and transformation.', descriptionHi: 'काटने वाला। तेज बुद्धि, बाधाओं को काटना। शुद्धिकरण और परिवर्तन के लिए उत्कृष्ट।', image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400' },
  { name: 'Rohini', ruler: 'Moon', trait: 'Growth, Beauty', symbol: '🌹', description: 'The Red One. Most beautiful nakshatra. Represents growth, beauty, and material prosperity.', descriptionHi: 'लाल। सबसे सुंदर नक्षत्र। विकास, सुंदरता और भौतिक समृद्धि का प्रतिनिधित्व करता है।', image: 'https://images.unsplash.com/photo-1518621012428-70188fd79e08?w=400' },
  { name: 'Mrigashira', ruler: 'Mars', trait: 'Searching, Curiosity', symbol: '🦌', description: 'The Deer\'s Head. Curiosity, searching nature, and exploration. Good for research and learning.', descriptionHi: 'हिरण का सिर। जिज्ञासा, खोज प्रकृति और अन्वेषण। अनुसंधान और सीखने के लिए अच्छा।', image: 'https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?w=400' },
  { name: 'Ardra', ruler: 'Rahu', trait: 'Intensity, Renewal', symbol: '💧', description: 'The Moist One. Represents intensity, renewal, and transformation through challenges.', descriptionHi: 'नम। तीव्रता, नवीकरण और चुनौतियों के माध्यम से परिवर्तन का प्रतिनिधित्व करता है।', image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400' },
  { name: 'Punarvasu', ruler: 'Jupiter', trait: 'Light, Return', symbol: '🔄', description: 'The Return of Light. Represents renewal, return, and restoration. Excellent for new beginnings.', descriptionHi: 'प्रकाश की वापसी। नवीकरण, वापसी और बहाली का प्रतिनिधित्व करता है। नई शुरुआत के लिए उत्कृष्ट।', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' },
  { name: 'Pushya', ruler: 'Saturn', trait: 'Nourishment, Care', symbol: '🌸', description: 'The Nourisher. Most auspicious nakshatra. Represents nourishment, care, and spiritual growth.', descriptionHi: 'पोषक। सबसे शुभ नक्षत्र। पोषण, देखभाल और आध्यात्मिक विकास का प्रतिनिधित्व करता है।', image: 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=400' },
  { name: 'Ashlesha', ruler: 'Mercury', trait: 'Clarity, Enticement', symbol: '🐍', description: 'The Entwiner. Represents clarity, enticement, and the power to influence. Sharp intellect.', descriptionHi: 'लपेटने वाला। स्पष्टता, आकर्षण और प्रभावित करने की शक्ति का प्रतिनिधित्व करता है। तेज बुद्धि।', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400' },
  { name: 'Magha', ruler: 'Ketu', trait: 'Royal, Ancestral', symbol: '👑', description: 'The Great One. Royal, ancestral power, and leadership. Strong connection to forefathers.', descriptionHi: 'महान। शाही, पैतृक शक्ति और नेतृत्व। पूर्वजों से मजबूत संबंध।', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400' },
  { name: 'Purva Phalguni', ruler: 'Venus', trait: 'Leisure, Creation', symbol: '🛋️', description: 'The Former Red One. Represents leisure, creation, and enjoyment. Good for arts and relationships.', descriptionHi: 'पूर्व लाल। आराम, सृजन और आनंद का प्रतिनिधित्व करता है। कला और रिश्तों के लिए अच्छा।', image: 'https://images.unsplash.com/photo-1518621012428-70188fd79e08?w=400' },
  { name: 'Uttara Phalguni', ruler: 'Sun', trait: 'Service, Stability', symbol: '⚖️', description: 'The Latter Red One. Represents service, stability, and balance. Excellent for partnerships.', descriptionHi: 'उत्तर लाल। सेवा, स्थिरता और संतुलन का प्रतिनिधित्व करता है। साझेदारी के लिए उत्कृष्ट।', image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400' },
  { name: 'Hasta', ruler: 'Moon', trait: 'Skill, Craftsmanship', symbol: '✋', description: 'The Hand. Represents skill, craftsmanship, and dexterity. Excellent for creative and manual work.', descriptionHi: 'हाथ। कौशल, शिल्प कौशल और निपुणता का प्रतिनिधित्व करता है। रचनात्मक और मैनुअल काम के लिए उत्कृष्ट।', image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400' },
  { name: 'Chitra', ruler: 'Mars', trait: 'Architecture, Brilliance', symbol: '✨', description: 'The Bright One. Represents architecture, brilliance, and artistic excellence. Creative and innovative.', descriptionHi: 'चमकदार। वास्तुकला, प्रतिभा और कलात्मक उत्कृष्टता का प्रतिनिधित्व करता है। रचनात्मक और नवाचार।', image: 'https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?w=400' },
  { name: 'Swati', ruler: 'Rahu', trait: 'Movement, Independence', symbol: '💨', description: 'The Independent. Represents movement, independence, and freedom. Good for travel and change.', descriptionHi: 'स्वतंत्र। गति, स्वतंत्रता और स्वतंत्रता का प्रतिनिधित्व करता है। यात्रा और परिवर्तन के लिए अच्छा।', image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400' },
  { name: 'Vishakha', ruler: 'Jupiter', trait: 'Ambition, Goals', symbol: '🎯', description: 'The Forked. Represents ambition, goals, and determination. Strong willpower and achievement.', descriptionHi: 'कांटेदार। महत्वाकांक्षा, लक्ष्य और दृढ़ संकल्प का प्रतिनिधित्व करता है। मजबूत इच्छाशक्ति और उपलब्धि।', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' },
  { name: 'Anuradha', ruler: 'Saturn', trait: 'Friendship, Devotion', symbol: '🤝', description: 'The Disciple. Represents friendship, devotion, and loyalty. Strong bonds and relationships.', descriptionHi: 'शिष्य। मित्रता, भक्ति और निष्ठा का प्रतिनिधित्व करता है। मजबूत बंधन और रिश्ते।', image: 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=400' },
  { name: 'Jyeshtha', ruler: 'Mercury', trait: 'Seniority, Courage', symbol: '🛡️', description: 'The Elder. Represents seniority, courage, and protection. Strong leadership qualities.', descriptionHi: 'बड़ा। वरिष्ठता, साहस और सुरक्षा का प्रतिनिधित्व करता है। मजबूत नेतृत्व गुण।', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400' },
  { name: 'Mula', ruler: 'Ketu', trait: 'Foundation, Deep Roots', symbol: '🌳', description: 'The Root. Represents foundation, deep roots, and core essence. Transformation through destruction.', descriptionHi: 'जड़। नींव, गहरी जड़ें और मूल सार का प्रतिनिधित्व करता है। विनाश के माध्यम से परिवर्तन।', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400' },
  { name: 'Purva Ashadha', ruler: 'Venus', trait: 'Victory, Flow', symbol: '🌊', description: 'The Former Unconquered. Represents victory, flow, and invincibility. Strong determination.', descriptionHi: 'पूर्व अजेय। विजय, प्रवाह और अजेयता का प्रतिनिधित्व करता है। मजबूत दृढ़ संकल्प।', image: 'https://images.unsplash.com/photo-1518621012428-70188fd79e08?w=400' },
  { name: 'Uttara Ashadha', ruler: 'Sun', trait: 'Endurance, Triumph', symbol: '🏆', description: 'The Latter Unconquered. Represents endurance, triumph, and ultimate victory. Unbreakable spirit.', descriptionHi: 'उत्तर अजेय। सहनशीलता, विजय और अंतिम जीत का प्रतिनिधित्व करता है। अटूट भावना।', image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400' },
  { name: 'Shravana', ruler: 'Moon', trait: 'Listening, Wisdom', symbol: '👂', description: 'The Hearing. Represents listening, wisdom, and learning. Excellent for education and knowledge.', descriptionHi: 'सुनना। सुनना, ज्ञान और सीखने का प्रतिनिधित्व करता है। शिक्षा और ज्ञान के लिए उत्कृष्ट।', image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400' },
  { name: 'Dhanishta', ruler: 'Mars', trait: 'Rhythm, Wealth', symbol: '🥁', description: 'The Wealthy. Represents rhythm, wealth, and music. Good for financial success and arts.', descriptionHi: 'धनी। लय, धन और संगीत का प्रतिनिधित्व करता है। वित्तीय सफलता और कला के लिए अच्छा।', image: 'https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?w=400' },
  { name: 'Shatabhisha', ruler: 'Rahu', trait: 'Healing, Secrets', symbol: '💊', description: 'The Hundred Healers. Represents healing, secrets, and hidden knowledge. Mystical and transformative.', descriptionHi: 'सौ उपचारक। उपचार, रहस्य और छुपे हुए ज्ञान का प्रतिनिधित्व करता है। रहस्यमय और परिवर्तनकारी।', image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400' },
  { name: 'Purva Bhadrapada', ruler: 'Jupiter', trait: 'Fire, Transformation', symbol: '🔥', description: 'The Former Blessed Feet. Represents fire, transformation, and purification. Spiritual awakening.', descriptionHi: 'पूर्व धन्य पैर। आग, परिवर्तन और शुद्धिकरण का प्रतिनिधित्व करता है। आध्यात्मिक जागृति।', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' },
  { name: 'Uttara Bhadrapada', ruler: 'Saturn', trait: 'Depths, Wisdom', symbol: '🕳️', description: 'The Latter Blessed Feet. Represents depths, wisdom, and profound understanding. Deep spirituality.', descriptionHi: 'उत्तर धन्य पैर। गहराई, ज्ञान और गहरी समझ का प्रतिनिधित्व करता है। गहरी आध्यात्मिकता।', image: 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=400' },
  { name: 'Revati', ruler: 'Mercury', trait: 'Journey, Completion', symbol: '🌊', description: 'The Wealthy. Represents journey, completion, and fulfillment. End of the cycle, new beginning.', descriptionHi: 'धनी। यात्रा, पूर्णता और पूर्ति का प्रतिनिधित्व करता है। चक्र का अंत, नई शुरुआत।', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400' },
];

// Enhanced Zodiac Signs with detailed positive traits
export const ZODIAC_SIGNS_DETAILED = [
  { 
    ...ZODIAC_SIGNS[0], 
    positiveTraits: ['Natural leadership', 'Courageous', 'Pioneering spirit', 'Energetic', 'Confident', 'Independent', 'Adventurous', 'Honest'],
    positiveTraitsHi: ['प्राकृतिक नेतृत्व', 'साहसी', 'अग्रणी भावना', 'ऊर्जावान', 'आत्मविश्वासी', 'स्वतंत्र', 'साहसिक', 'ईमानदार'],
    strengths: 'Excellent initiators, natural leaders who inspire others. Their courage and determination help them overcome any obstacle.',
    strengthsHi: 'उत्कृष्ट प्रारंभकर्ता, प्राकृतिक नेता जो दूसरों को प्रेरित करते हैं। उनका साहस और दृढ़ संकल्प किसी भी बाधा को दूर करने में मदद करता है।',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
  },
  { 
    ...ZODIAC_SIGNS[1], 
    positiveTraits: ['Reliable', 'Patient', 'Loyal', 'Practical', 'Determined', 'Stable', 'Sensual', 'Artistic'],
    positiveTraitsHi: ['विश्वसनीय', 'धैर्यवान', 'वफादार', 'व्यावहारिक', 'दृढ़', 'स्थिर', 'कामुक', 'कलात्मक'],
    strengths: 'Incredibly reliable and stable. Their patience and determination make them excellent at achieving long-term goals.',
    strengthsHi: 'अविश्वसनीय रूप से विश्वसनीय और स्थिर। उनका धैर्य और दृढ़ संकल्प उन्हें दीर्घकालिक लक्ष्यों को प्राप्त करने में उत्कृष्ट बनाता है।',
    image: 'https://images.unsplash.com/photo-1518621012428-70188fd79e08?w=400'
  },
  { 
    ...ZODIAC_SIGNS[2], 
    positiveTraits: ['Intelligent', 'Curious', 'Adaptable', 'Communicative', 'Witty', 'Versatile', 'Youthful', 'Social'],
    positiveTraitsHi: ['बुद्धिमान', 'जिज्ञासु', 'अनुकूलनीय', 'संचारी', 'मजाकिया', 'बहुमुखी', 'युवा', 'सामाजिक'],
    strengths: 'Brilliant communicators with sharp intellect. Their curiosity and adaptability make them excellent learners and problem solvers.',
    strengthsHi: 'तेज बुद्धि के साथ शानदार संचारक। उनकी जिज्ञासा और अनुकूलनशीलता उन्हें उत्कृष्ट शिक्षार्थी और समस्या समाधानकर्ता बनाती है।',
    image: 'https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?w=400'
  },
  { 
    ...ZODIAC_SIGNS[3], 
    positiveTraits: ['Nurturing', 'Intuitive', 'Emotional', 'Protective', 'Loyal', 'Caring', 'Imaginative', 'Compassionate'],
    positiveTraitsHi: ['पोषण करने वाला', 'सहजज्ञ', 'भावनात्मक', 'सुरक्षात्मक', 'वफादार', 'देखभाल करने वाला', 'कल्पनाशील', 'दयालु'],
    strengths: 'Natural nurturers with deep emotional intelligence. Their intuition and caring nature make them excellent caregivers and friends.',
    strengthsHi: 'गहरी भावनात्मक बुद्धिमत्ता के साथ प्राकृतिक पोषक। उनका अंतर्ज्ञान और देखभाल करने वाली प्रकृति उन्हें उत्कृष्ट देखभाल करने वाले और मित्र बनाती है।',
    image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400'
  },
  { 
    ...ZODIAC_SIGNS[4], 
    positiveTraits: ['Confident', 'Generous', 'Creative', 'Loyal', 'Warm-hearted', 'Charismatic', 'Dramatic', 'Protective'],
    positiveTraitsHi: ['आत्मविश्वासी', 'उदार', 'रचनात्मक', 'वफादार', 'गर्म दिल', 'आकर्षक', 'नाटकीय', 'सुरक्षात्मक'],
    strengths: 'Natural leaders with magnetic charisma. Their confidence and generosity inspire others and create strong bonds.',
    strengthsHi: 'चुंबकीय करिश्मे के साथ प्राकृतिक नेता। उनका आत्मविश्वास और उदारता दूसरों को प्रेरित करती है और मजबूत बंधन बनाती है।',
    image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400'
  },
  { 
    ...ZODIAC_SIGNS[5], 
    positiveTraits: ['Analytical', 'Practical', 'Helpful', 'Modest', 'Reliable', 'Perfectionist', 'Intelligent', 'Detail-oriented'],
    positiveTraitsHi: ['विश्लेषणात्मक', 'व्यावहारिक', 'सहायक', 'विनम्र', 'विश्वसनीय', 'पूर्णतावादी', 'बुद्धिमान', 'विवरण-उन्मुख'],
    strengths: 'Meticulous and helpful, with excellent analytical skills. Their attention to detail and reliability make them invaluable.',
    strengthsHi: 'सावधानीपूर्वक और सहायक, उत्कृष्ट विश्लेषणात्मक कौशल के साथ। विवरण और विश्वसनीयता पर उनका ध्यान उन्हें अमूल्य बनाता है।',
    image: 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=400'
  },
  { 
    ...ZODIAC_SIGNS[6], 
    positiveTraits: ['Diplomatic', 'Charming', 'Fair', 'Social', 'Cooperative', 'Artistic', 'Balanced', 'Peace-loving'],
    positiveTraitsHi: ['कूटनीतिक', 'आकर्षक', 'निष्पक्ष', 'सामाजिक', 'सहकारी', 'कलात्मक', 'संतुलित', 'शांति-प्रेमी'],
    strengths: 'Natural diplomats who seek harmony and balance. Their charm and fairness make them excellent mediators and partners.',
    strengthsHi: 'प्राकृतिक राजनयिक जो सामंजस्य और संतुलन चाहते हैं। उनका आकर्षण और निष्पक्षता उन्हें उत्कृष्ट मध्यस्थ और साथी बनाती है।',
    image: 'https://images.unsplash.com/photo-1518621012428-70188fd79e08?w=400'
  },
  { 
    ...ZODIAC_SIGNS[7], 
    positiveTraits: ['Passionate', 'Resourceful', 'Brave', 'Loyal', 'Determined', 'Intuitive', 'Mysterious', 'Transformative'],
    positiveTraitsHi: ['भावुक', 'संसाधनपूर्ण', 'बहादुर', 'वफादार', 'दृढ़', 'सहजज्ञ', 'रहस्यमय', 'परिवर्तनकारी'],
    strengths: 'Intense and transformative, with incredible depth. Their passion and resourcefulness help them overcome any challenge.',
    strengthsHi: 'तीव्र और परिवर्तनकारी, अविश्वसनीय गहराई के साथ। उनका जुनून और संसाधनशीलता किसी भी चुनौती को दूर करने में मदद करती है।',
    image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400'
  },
  { 
    ...ZODIAC_SIGNS[8], 
    positiveTraits: ['Optimistic', 'Adventurous', 'Philosophical', 'Honest', 'Generous', 'Independent', 'Lucky', 'Enthusiastic'],
    positiveTraitsHi: ['आशावादी', 'साहसिक', 'दार्शनिक', 'ईमानदार', 'उदार', 'स्वतंत्र', 'भाग्यशाली', 'उत्साही'],
    strengths: 'Optimistic explorers with philosophical minds. Their honesty and enthusiasm inspire others and bring good fortune.',
    strengthsHi: 'दार्शनिक दिमाग वाले आशावादी खोजकर्ता। उनकी ईमानदारी और उत्साह दूसरों को प्रेरित करता है और सौभाग्य लाता है।',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
  },
  { 
    ...ZODIAC_SIGNS[9], 
    positiveTraits: ['Ambitious', 'Disciplined', 'Practical', 'Patient', 'Responsible', 'Wise', 'Determined', 'Organized'],
    positiveTraitsHi: ['महत्वाकांक्षी', 'अनुशासित', 'व्यावहारिक', 'धैर्यवान', 'जिम्मेदार', 'बुद्धिमान', 'दृढ़', 'संगठित'],
    strengths: 'Ambitious and disciplined achievers. Their patience and responsibility help them build lasting success and legacy.',
    strengthsHi: 'महत्वाकांक्षी और अनुशासित उपलब्धि हासिल करने वाले। उनका धैर्य और जिम्मेदारी उन्हें स्थायी सफलता और विरासत बनाने में मदद करती है।',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400'
  },
  { 
    ...ZODIAC_SIGNS[10], 
    positiveTraits: ['Independent', 'Original', 'Humanitarian', 'Intelligent', 'Friendly', 'Progressive', 'Inventive', 'Altruistic'],
    positiveTraitsHi: ['स्वतंत्र', 'मौलिक', 'मानवतावादी', 'बुद्धिमान', 'मित्रतापूर्ण', 'प्रगतिशील', 'आविष्कारक', 'परोपकारी'],
    strengths: 'Unique visionaries who think outside the box. Their humanitarian spirit and intelligence drive positive change.',
    strengthsHi: 'अनूठे दूरदर्शी जो बॉक्स के बाहर सोचते हैं। उनकी मानवतावादी भावना और बुद्धिमत्ता सकारात्मक परिवर्तन को चलाती है।',
    image: 'https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?w=400'
  },
  { 
    ...ZODIAC_SIGNS[11], 
    positiveTraits: ['Compassionate', 'Artistic', 'Intuitive', 'Dreamy', 'Selfless', 'Imaginative', 'Empathetic', 'Spiritual'],
    positiveTraitsHi: ['दयालु', 'कलात्मक', 'सहजज्ञ', 'स्वप्निल', 'निस्वार्थ', 'कल्पनाशील', 'सहानुभूतिपूर्ण', 'आध्यात्मिक'],
    strengths: 'Deeply compassionate and artistic souls. Their intuition and empathy make them excellent healers and creative artists.',
    strengthsHi: 'गहराई से दयालु और कलात्मक आत्माएं। उनका अंतर्ज्ञान और सहानुभूति उन्हें उत्कृष्ट उपचारकर्ता और रचनात्मक कलाकार बनाती है।',
    image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400'
  },
];

// Enhanced Planets with symbols
export const PLANETS_INFO_DETAILED = PLANETS_INFO.map((planet, index) => ({
  ...planet,
  symbol: ['☀️', '🌙', '♂️', '☿️', '♃', '♀️', '♄', '☊', '☋'][index],
}));

export const translatePlanet = (planetName: string, lang: Language): string => {
  if (lang === 'en') return planetName;
  const p = PLANETS_INFO.find(p => p.name.toLowerCase() === planetName.toLowerCase());
  return p ? p.hindi : planetName;
};

export const translateSign = (signName: string, lang: Language): string => {
  if (lang === 'en') return signName;
  const s = ZODIAC_SIGNS.find(z => z.name.toLowerCase() === signName.toLowerCase());
  return s ? s.hindiName : signName;
};

/** Play Store URL for CosmicJyoti app */
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.cosmicjyoti.app';

/** Buy Me a Coffee support URL & slug */
export const BUY_ME_A_COFFEE_SLUG = 'Astroniks';
export const BUY_ME_A_COFFEE_URL = 'https://www.buymeacoffee.com/Astroniks';

/** PayPal donation handle, email & URL for supporting website growth */
export const PAYPAL_ME_HANDLE = 'NIKESHMAURYA';
export const PAYPAL_ME_URL = 'https://paypal.me/NIKESHMAURYA';
export const PAYPAL_DONATION_EMAIL = 'nikemaurya1996@gmail.com';

export const getPayPalDonateUrl = (amount?: number): string => {
  if (amount && amount > 0) {
    // PayPal.Me accepts amounts directly in the path e.g. https://paypal.me/NIKESHMAURYA/10
    return `https://paypal.me/${PAYPAL_ME_HANDLE}/${amount}`;
  }
  return PAYPAL_ME_URL;
};

export const PAYPAL_DONATE_URL = PAYPAL_ME_URL;

