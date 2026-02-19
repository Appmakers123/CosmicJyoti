/**
 * Per-view page meta for SEO: title and description by mode (en/hi).
 */

import type { AppViewMode } from '../types';

export interface PageMeta {
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
}

const BASE_TITLE = 'CosmicJyoti – Free Kundali, Horoscope & Vedic AI Astrology';
const BASE_DESC = 'Free Kundali, daily horoscope, marriage match, Panchang, Muhurat & AI astrology. Vedic birth chart, Numerology, Tarot in English & Hindi.';

const META: Record<AppViewMode, PageMeta> = {
  hub: { titleEn: BASE_TITLE, titleHi: 'CosmicJyoti – मुफ्त कुंडली, राशिफल और वैदिक ज्योतिष', descriptionEn: BASE_DESC, descriptionHi: 'मुफ्त कुंडली, राशिफल, गुण मिलान, पंचांग, मुहूर्त। वैदिक कुंडली, अंक ज्योतिष, टैरो। हिंदी और अंग्रेजी।' },
  daily: { titleEn: 'Daily Horoscope | CosmicJyoti', titleHi: 'राशिफल | CosmicJyoti', descriptionEn: "Today's horoscope for all zodiac signs. Free daily predictions.", descriptionHi: 'सभी राशियों के लिए आज का राशिफल। मुफ्त दैनिक भविष्य।' },
  kundali: { titleEn: 'Free Kundali / Birth Chart | CosmicJyoti', titleHi: 'मुफ्त कुंडली / जन्म कुंडली | CosmicJyoti', descriptionEn: 'Generate your free Vedic birth chart (Kundali). Accurate planetary positions.', descriptionHi: 'अपनी मुफ्त वैदिक जन्म कुंडली बनाएं। सटीक ग्रह स्थिति।' },
  panchang: { titleEn: "Today's Panchang | CosmicJyoti", titleHi: 'आज का पंचांग | CosmicJyoti', descriptionEn: 'Daily Panchang: tithi, nakshatra, muhurat, sunrise/sunset.', descriptionHi: 'दैनिक पंचांग: तिथि, नक्षत्र, मुहूर्त, सूर्योदय/अस्त।' },
  muhurat: { titleEn: 'Muhurat – Auspicious Time | CosmicJyoti', titleHi: 'मुहूर्त – शुभ समय | CosmicJyoti', descriptionEn: 'Find auspicious muhurat for important activities.', descriptionHi: 'महत्वपूर्ण कार्यों के लिए शुभ मुहूर्त जानें।' },
  matchmaking: { titleEn: 'Guna Milan / Kundali Match | CosmicJyoti', titleHi: 'गुण मिलान / कुंडली मिलान | CosmicJyoti', descriptionEn: 'Ashtakoot Guna Milan for marriage compatibility.', descriptionHi: 'विवाह मिलान के लिए अष्टकूट गुण मिलान।' },
  compatibility: { titleEn: 'Zodiac Compatibility | CosmicJyoti', titleHi: 'राशि मिलान | CosmicJyoti', descriptionEn: 'Check compatibility between zodiac signs.', descriptionHi: 'राशियों के बीच मिलान देखें।' },
  varshphal: { titleEn: 'Varshphal – Yearly Horoscope | CosmicJyoti', titleHi: 'वार्षिक फल | CosmicJyoti', descriptionEn: 'Your yearly Vedic horoscope and predictions.', descriptionHi: 'आपका वार्षिक वैदिक भविष्य।' },
  tarot: { titleEn: 'Tarot Reading | CosmicJyoti', titleHi: 'टैरो पाठ | CosmicJyoti', descriptionEn: 'Free Tarot card reading and guidance.', descriptionHi: 'मुफ्त टैरो कार्ड पाठ और मार्गदर्शन।' },
  numerology: { titleEn: 'Numerology | CosmicJyoti', titleHi: 'अंक ज्योतिष | CosmicJyoti', descriptionEn: 'Life path, destiny number, and numerology insights.', descriptionHi: 'लाइफ पाथ, भाग्य अंक और अंक ज्योतिष।' },
  'palm-reading': { titleEn: 'Palmistry / Palm Reading | CosmicJyoti', titleHi: 'हस्तरेखा | CosmicJyoti', descriptionEn: 'Palm reading and hand analysis.', descriptionHi: 'हस्तरेखा और हाथ का विश्लेषण।' },
  'face-reading': { titleEn: 'Face Reading – Samudrik Shastra | CosmicJyoti', titleHi: 'चेहरा पढ़ना – समुद्रिक शास्त्र | CosmicJyoti', descriptionEn: 'Face reading based on Vedic Samudrik Shastra.', descriptionHi: 'वैदिक समुद्रिक शास्त्र पर आधारित चेहरा पढ़ना।' },
  'cosmic-health': { titleEn: 'Cosmic Health | CosmicJyoti', titleHi: 'कॉस्मिक हेल्थ | CosmicJyoti', descriptionEn: 'Vedic astrology-based health and wellness guidance.', descriptionHi: 'वैदिक ज्योतिष पर आधारित स्वास्थ्य मार्गदर्शन।' },
  dreams: { titleEn: 'Dream Interpretation | CosmicJyoti', titleHi: 'स्वप्न शास्त्र | CosmicJyoti', descriptionEn: 'Dream meanings and interpretation.', descriptionHi: 'स्वप्न अर्थ और व्याख्या।' },
  mantra: { titleEn: 'Mantra Lab | CosmicJyoti', titleHi: 'मंत्र लैब | CosmicJyoti', descriptionEn: 'Mantras and chanting guidance.', descriptionHi: 'मंत्र और जाप मार्गदर्शन।' },
  rudraksh: { titleEn: 'Rudraksha Guide | CosmicJyoti', titleHi: 'रुद्राक्ष गाइड | CosmicJyoti', descriptionEn: 'Rudraksha beads and benefits.', descriptionHi: 'रुद्राक्ष माला और लाभ।' },
  yantra: { titleEn: 'Yantra Lab | CosmicJyoti', titleHi: 'यंत्र लैब | CosmicJyoti', descriptionEn: 'Sacred yantras and their significance.', descriptionHi: 'पवित्र यंत्र और उनका महत्व।' },
  vastu: { titleEn: 'Vastu Tips | CosmicJyoti', titleHi: 'वास्तु टिप्स | CosmicJyoti', descriptionEn: 'Vastu Shastra for home and office.', descriptionHi: 'घर और ऑफिस के लिए वास्तु।' },
  gemstones: { titleEn: 'Gemstone Guide | CosmicJyoti', titleHi: 'रत्न गाइड | CosmicJyoti', descriptionEn: 'Astrological gemstones and their effects.', descriptionHi: 'ज्योतिषीय रत्न और उनके प्रभाव।' },
  learning: { titleEn: 'Learn Vedic Astrology | CosmicJyoti', titleHi: 'वैदिक ज्योतिष सीखें | CosmicJyoti', descriptionEn: 'Learning center: Kundali, planets, Nakshatra.', descriptionHi: 'लर्निंग सेंटर: कुंडली, ग्रह, नक्षत्र।' },
  'planets-houses': { titleEn: 'Planets & Houses | CosmicJyoti', titleHi: 'ग्रह और भाव | CosmicJyoti', descriptionEn: 'Vedic astrology planets and house meanings.', descriptionHi: 'वैदिक ज्योतिष ग्रह और भाव अर्थ।' },
  'zodiac-signs': { titleEn: 'Zodiac Signs Guide | CosmicJyoti', titleHi: 'राशि गाइड | CosmicJyoti', descriptionEn: 'All 12 zodiac signs and traits.', descriptionHi: 'सभी 12 राशियाँ और विशेषताएं।' },
  'nakshatra-library': { titleEn: 'Nakshatra Library | CosmicJyoti', titleHi: 'नक्षत्र लाइब्रेरी | CosmicJyoti', descriptionEn: '27 Nakshatras in Vedic astrology.', descriptionHi: 'वैदिक ज्योतिष में 27 नक्षत्र।' },
  'kundali-basics': { titleEn: 'Kundali Basics | CosmicJyoti', titleHi: 'कुंडली की मूल बातें | CosmicJyoti', descriptionEn: 'Fundamentals of birth chart reading.', descriptionHi: 'जन्म कुंडली पढ़ने की मूल बातें।' },
  'palmistry-guide': { titleEn: 'Palmistry Guide | CosmicJyoti', titleHi: 'हस्तरेखा गाइड | CosmicJyoti', descriptionEn: 'Learn palm reading basics.', descriptionHi: 'हस्तरेखा की मूल बातें सीखें।' },
  'numerology-guide': { titleEn: 'Numerology Guide | CosmicJyoti', titleHi: 'अंक ज्योतिष गाइड | CosmicJyoti', descriptionEn: 'Numerology basics and calculations.', descriptionHi: 'अंक ज्योतिष मूल और गणना।' },
  'star-legends': { titleEn: 'Star Legends | CosmicJyoti', titleHi: 'तारा कथाएं | CosmicJyoti', descriptionEn: 'Mythology and stories of the stars.', descriptionHi: 'तारों की पौराणिक कथाएं।' },
  'ai-blog': { titleEn: 'AI Astrology Articles | CosmicJyoti', titleHi: 'AI ज्योतिष लेख | CosmicJyoti', descriptionEn: 'Daily AI-generated astrology articles.', descriptionHi: 'दैनिक AI ज्योतिष लेख।' },
  appointment: { titleEn: 'Book Astrology Consultation | CosmicJyoti', titleHi: 'ज्योतिष परामर्श बुक करें | CosmicJyoti', descriptionEn: 'Book an appointment with astrologers.', descriptionHi: 'ज्योतिषियों से अपॉइंटमेंट बुक करें।' },
  games: { titleEn: 'Astrology Games | CosmicJyoti', titleHi: 'ज्योतिष गेम्स | CosmicJyoti', descriptionEn: 'Fun astrology quizzes and games.', descriptionHi: 'मजेदार ज्योतिष क्विज और गेम्स।' },
  'name-suggestions': { titleEn: 'Baby & Business Name Suggestions | CosmicJyoti', titleHi: 'बच्चा और व्यवसाय नाम सुझाव | CosmicJyoti', descriptionEn: 'Names by Nakshatra and numerology.', descriptionHi: 'नक्षत्र और अंक ज्योतिष के अनुसार नाम।' },
  upay: { titleEn: 'Upay Remedies | CosmicJyoti', titleHi: 'उपाय और रेमेडीज | CosmicJyoti', descriptionEn: 'Vedic remedies and Upay for doshas.', descriptionHi: 'वैदिक उपाय और दोष निवारण।' },
  disha: { titleEn: 'Lucky Direction Today | CosmicJyoti', titleHi: 'आज की शुभ दिशा | CosmicJyoti', descriptionEn: "Today's auspicious direction (Disha Shool).", descriptionHi: 'आज की शुभ दिशा (दिशा शूल)।' },
  birthstone: { titleEn: 'Birthstone by Date of Birth | CosmicJyoti', titleHi: 'जन्म तिथि के अनुसार रत्न | CosmicJyoti', descriptionEn: 'Find your birthstone by DOB.', descriptionHi: 'जन्म तिथि से अपना रत्न जानें।' },
  transits: { titleEn: 'Planetary Transits | CosmicJyoti', titleHi: 'गोचर | CosmicJyoti', descriptionEn: 'Current planetary transits and their effects.', descriptionHi: 'वर्तमान ग्रह गोचर और उनके प्रभाव।' },
  'astro-lab': { titleEn: 'Astro Lab | CosmicJyoti', titleHi: 'अस्ट्रो लैब | CosmicJyoti', descriptionEn: 'Astrology tools and experiments.', descriptionHi: 'ज्योतिष उपकरण और प्रयोग।' },
};

export function getPageMeta(mode: AppViewMode, language: 'en' | 'hi'): { title: string; description: string } {
  const meta = META[mode] ?? META.hub;
  const isHi = language === 'hi';
  return { title: isHi ? meta.titleHi : meta.titleEn, description: isHi ? meta.descriptionHi : meta.descriptionEn };
}

export function getCanonicalPath(mode: AppViewMode): string {
  if (mode === 'hub') return '/';
  return `/?mode=${mode}`;
}
