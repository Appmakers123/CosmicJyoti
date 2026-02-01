
import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { useTranslation } from '../utils/translations';
import { generateMantraAudio } from '../services/geminiService';

interface Mantra {
  id: string;
  name: string;
  nameHi: string;
  sanskrit: string;
  transliteration: string;
  meaning: string;
  meaningHi: string;
  benefit: string;
  benefitHi: string;
  category: "Obstacles" | "Planetary" | "Wealth" | "Health" | "Universal";
  color: string;
  bgGlow: string;
}

const MANTRA_LIBRARY: Mantra[] = [
    // OBSTACLES CATEGORY
    {
        id: "ganesh-mool",
        name: "Ganesh Mool",
        nameHi: "गणेश मूल मंत्र",
        category: "Obstacles",
        sanskrit: "ॐ गम गणपतये नमः",
        transliteration: "Om Gam Ganapataye Namaha",
        meaning: "Salutations to the Remover of Obstacles.",
        meaningHi: "विघ्नहर्ता को नमस्कार।",
        benefit: "Removes all mental and physical hurdles.",
        benefitHi: "सभी मानसिक और शारीरिक बाधाओं को दूर करता है।",
        color: "text-orange-400",
        bgGlow: "from-orange-600/20"
    },
    {
        id: "ganesh-full",
        name: "Ganesh Stotram",
        nameHi: "गणेश स्तोत्र",
        category: "Obstacles",
        sanskrit: "ॐ गजाननं भूतगणादिसेवितं कपित्थजम्बूफलचारुभक्षणम् । उमासुतं शोकविनाशकारकं नमामि विघ्नेश्वरपादपङ्कजम् ॥",
        transliteration: "Om Gajananam Bhutaganadisevitam Kapitthajambuphalacharubhakshanam...",
        meaning: "I bow to the elephant-faced Lord, remover of all sorrows.",
        meaningHi: "मैं हाथी के मुख वाले भगवान को नमन करता हूं, सभी दुखों को दूर करने वाले।",
        benefit: "Destroys obstacles and brings success in all endeavors.",
        benefitHi: "बाधाओं को नष्ट करता है और सभी प्रयासों में सफलता लाता है।",
        color: "text-orange-400",
        bgGlow: "from-orange-600/20"
    },
    {
        id: "durga-beej",
        name: "Durga Beej",
        nameHi: "दुर्गा बीज मंत्र",
        category: "Obstacles",
        sanskrit: "ॐ दुं दुर्गायै नमः",
        transliteration: "Om Dum Durgayai Namaha",
        meaning: "Salutations to the Goddess who removes difficulties.",
        meaningHi: "कठिनाइयों को दूर करने वाली देवी को नमस्कार।",
        benefit: "Protection from negative energies and obstacles.",
        benefitHi: "नकारात्मक ऊर्जा और बाधाओं से सुरक्षा।",
        color: "text-red-400",
        bgGlow: "from-red-600/20"
    },
    {
        id: "hanuman-chalisa",
        name: "Hanuman Beej",
        nameHi: "हनुमान बीज मंत्र",
        category: "Obstacles",
        sanskrit: "ॐ हं हनुमते रुद्रात्मकाय हुं फट् स्वाहा",
        transliteration: "Om Ham Hanumate Rudratmakaya Hum Phat Swaha",
        meaning: "Seed mantra of Lord Hanuman, the remover of fears.",
        meaningHi: "भगवान हनुमान का बीज मंत्र, भय को दूर करने वाला।",
        benefit: "Removes fear, obstacles, and grants courage.",
        benefitHi: "भय, बाधाएं दूर करता है और साहस प्रदान करता है।",
        color: "text-orange-500",
        bgGlow: "from-orange-700/20"
    },

    // PLANETARY CATEGORY - All 9 Planets
    {
        id: "sun-beej",
        name: "Surya Beej",
        nameHi: "सूर्य बीज मंत्र",
        category: "Planetary",
        sanskrit: "ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः",
        transliteration: "Om Hram Hreem Hroum Sah Suryaya Namaha",
        meaning: "Seed sound of the Sun Deity.",
        meaningHi: "सूर्य देव की बीज ध्वनि।",
        benefit: "For health, vitality, and soul-power.",
        benefitHi: "स्वास्थ्य, जीवन शक्ति और आत्म-शक्ति के लिए।",
        color: "text-yellow-400",
        bgGlow: "from-yellow-600/20"
    },
    {
        id: "moon-beej",
        name: "Chandra Beej",
        nameHi: "चंद्र बीज मंत्र",
        category: "Planetary",
        sanskrit: "ॐ श्रां श्रीं श्रौं सः चंद्राय नमः",
        transliteration: "Om Shram Shreem Shroum Sah Chandraya Namaha",
        meaning: "Seed mantra of the Moon God.",
        meaningHi: "चंद्र देव का बीज मंत्र।",
        benefit: "For mental peace, emotional balance, and creativity.",
        benefitHi: "मानसिक शांति, भावनात्मक संतुलन और रचनात्मकता के लिए।",
        color: "text-silver-400",
        bgGlow: "from-slate-400/20"
    },
    {
        id: "mars-beej",
        name: "Mangal Beej",
        nameHi: "मंगल बीज मंत्र",
        category: "Planetary",
        sanskrit: "ॐ क्रां क्रीं क्रौं सः भौमाय नमः",
        transliteration: "Om Kram Kreem Kroum Sah Bhaumaya Namaha",
        meaning: "Seed mantra of Mars, the warrior planet.",
        meaningHi: "मंगल ग्रह का बीज मंत्र, योद्धा ग्रह।",
        benefit: "For courage, energy, and overcoming enemies.",
        benefitHi: "साहस, ऊर्जा और शत्रुओं पर विजय के लिए।",
        color: "text-red-500",
        bgGlow: "from-red-700/20"
    },
    {
        id: "mercury-beej",
        name: "Budh Beej",
        nameHi: "बुध बीज मंत्र",
        category: "Planetary",
        sanskrit: "ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः",
        transliteration: "Om Bram Breem Broum Sah Budhaya Namaha",
        meaning: "Seed mantra of Mercury, planet of intelligence.",
        meaningHi: "बुध ग्रह का बीज मंत्र, बुद्धि का ग्रह।",
        benefit: "For intelligence, communication, and business success.",
        benefitHi: "बुद्धि, संचार और व्यापारिक सफलता के लिए।",
        color: "text-green-400",
        bgGlow: "from-green-600/20"
    },
    {
        id: "jupiter-beej",
        name: "Guru Beej",
        nameHi: "गुरु बीज मंत्र",
        category: "Planetary",
        sanskrit: "ॐ ब्रां ब्रीं ब्रौं सः बृहस्पतये नमः",
        transliteration: "Om Bram Breem Broum Sah Brihaspataye Namaha",
        meaning: "Seed mantra of Jupiter, the teacher planet.",
        meaningHi: "गुरु ग्रह का बीज मंत्र, शिक्षक ग्रह।",
        benefit: "For wisdom, knowledge, and spiritual growth.",
        benefitHi: "ज्ञान, बुद्धि और आध्यात्मिक विकास के लिए।",
        color: "text-yellow-500",
        bgGlow: "from-yellow-700/20"
    },
    {
        id: "venus-beej",
        name: "Shukra Beej",
        nameHi: "शुक्र बीज मंत्र",
        category: "Planetary",
        sanskrit: "ॐ द्रां द्रीं द्रौं सः शुक्राय नमः",
        transliteration: "Om Dram Dreem Droum Sah Shukraya Namaha",
        meaning: "Seed mantra of Venus, planet of love and beauty.",
        meaningHi: "शुक्र ग्रह का बीज मंत्र, प्रेम और सुंदरता का ग्रह।",
        benefit: "For love, relationships, and material comforts.",
        benefitHi: "प्रेम, रिश्ते और भौतिक सुख के लिए।",
        color: "text-pink-400",
        bgGlow: "from-pink-600/20"
    },
    {
        id: "saturn-beej",
        name: "Shani Beej",
        nameHi: "शनि बीज मंत्र",
        category: "Planetary",
        sanskrit: "ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः",
        transliteration: "Om Pram Preem Proum Sah Shanaishcharaya Namaha",
        meaning: "Seed mantra of Saturn, the karmic planet.",
        meaningHi: "शनि ग्रह का बीज मंत्र, कर्म का ग्रह।",
        benefit: "For discipline, longevity, and karmic balance.",
        benefitHi: "अनुशासन, दीर्घायु और कर्म संतुलन के लिए।",
        color: "text-blue-400",
        bgGlow: "from-blue-600/20"
    },
    {
        id: "rahu-beej",
        name: "Rahu Beej",
        nameHi: "राहु बीज मंत्र",
        category: "Planetary",
        sanskrit: "ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः",
        transliteration: "Om Bhram Bhreem Bhroum Sah Rahave Namaha",
        meaning: "Seed mantra of Rahu, the north node.",
        meaningHi: "राहु का बीज मंत्र, उत्तर नोड।",
        benefit: "For material desires and worldly success.",
        benefitHi: "भौतिक इच्छाओं और सांसारिक सफलता के लिए।",
        color: "text-purple-400",
        bgGlow: "from-purple-600/20"
    },
    {
        id: "ketu-beej",
        name: "Ketu Beej",
        nameHi: "केतु बीज मंत्र",
        category: "Planetary",
        sanskrit: "ॐ स्रां स्रीं स्रौं सः केतवे नमः",
        transliteration: "Om Sram Sreem Sroum Sah Ketave Namaha",
        meaning: "Seed mantra of Ketu, the south node.",
        meaningHi: "केतु का बीज मंत्र, दक्षिण नोड।",
        benefit: "For spiritual liberation and moksha.",
        benefitHi: "आध्यात्मिक मुक्ति और मोक्ष के लिए।",
        color: "text-indigo-400",
        bgGlow: "from-indigo-600/20"
    },
    {
        id: "navagraha",
        name: "Navagraha Mantra",
        nameHi: "नवग्रह मंत्र",
        category: "Planetary",
        sanskrit: "ॐ नवग्रहाय नमः",
        transliteration: "Om Navagrahaya Namaha",
        meaning: "Salutations to all nine planets together.",
        meaningHi: "सभी नौ ग्रहों को एक साथ नमस्कार।",
        benefit: "Balances all planetary influences.",
        benefitHi: "सभी ग्रहीय प्रभावों को संतुलित करता है।",
        color: "text-cyan-400",
        bgGlow: "from-cyan-600/20"
    },

    // WEALTH CATEGORY
    {
        id: "lakshmi-shreem",
        name: "Lakshmi Beej",
        nameHi: "लक्ष्मी बीज मंत्र",
        category: "Wealth",
        sanskrit: "ॐ श्रीं महालक्ष्म्यै नमः",
        transliteration: "Om Shreem Mahalakshmaye Namaha",
        meaning: "Salutations to the Goddess of Abundance.",
        meaningHi: "प्रचुरता की देवी को नमस्कार।",
        benefit: "Attracts prosperity and comfort.",
        benefitHi: "समृद्धि और सुख को आकर्षित करता है।",
        color: "text-pink-500",
        bgGlow: "from-pink-600/20"
    },
    {
        id: "lakshmi-full",
        name: "Lakshmi Stotram",
        nameHi: "लक्ष्मी स्तोत्र",
        category: "Wealth",
        sanskrit: "ॐ श्रीं ह्रीं क्लीं त्रैलोक्यमोहिन्यै महालक्ष्म्यै नमः",
        transliteration: "Om Shreem Hreem Kleem Trailokyamohinyai Mahalakshmaye Namaha",
        meaning: "Complete invocation of Goddess Lakshmi.",
        meaningHi: "देवी लक्ष्मी का पूर्ण आह्वान।",
        benefit: "For wealth, prosperity, and financial stability.",
        benefitHi: "धन, समृद्धि और वित्तीय स्थिरता के लिए।",
        color: "text-pink-500",
        bgGlow: "from-pink-600/20"
    },
    {
        id: "kuber-beej",
        name: "Kuber Beej",
        nameHi: "कुबेर बीज मंत्र",
        category: "Wealth",
        sanskrit: "ॐ यक्षाय कुबेराय वैश्रवणाय धनधान्याधिपतये धनधान्यसमृद्धिं मे देहि दापय स्वाहा",
        transliteration: "Om Yakshaya Kuberaya Vaishravanaya Dhanadanyadhipataye...",
        meaning: "Mantra of Kuber, the Lord of Wealth.",
        meaningHi: "कुबेर का मंत्र, धन के स्वामी।",
        benefit: "For material wealth and treasures.",
        benefitHi: "भौतिक धन और खजाने के लिए।",
        color: "text-yellow-500",
        bgGlow: "from-yellow-700/20"
    },
    {
        id: "saraswati-beej",
        name: "Saraswati Beej",
        nameHi: "सरस्वती बीज मंत्र",
        category: "Wealth",
        sanskrit: "ॐ ऐं सरस्वत्यै नमः",
        transliteration: "Om Aim Saraswatyai Namaha",
        meaning: "Seed mantra of Goddess Saraswati.",
        meaningHi: "देवी सरस्वती का बीज मंत्र।",
        benefit: "For knowledge, wisdom, and intellectual wealth.",
        benefitHi: "ज्ञान, बुद्धि और बौद्धिक धन के लिए।",
        color: "text-white",
        bgGlow: "from-white/20"
    },
    {
        id: "vishnu-beej",
        name: "Vishnu Beej",
        nameHi: "विष्णु बीज मंत्र",
        category: "Wealth",
        sanskrit: "ॐ नमो भगवते वासुदेवाय",
        transliteration: "Om Namo Bhagavate Vasudevaya",
        meaning: "Salutations to Lord Vishnu, the preserver.",
        meaningHi: "भगवान विष्णु को नमस्कार, संरक्षक।",
        benefit: "For protection, prosperity, and divine grace.",
        benefitHi: "सुरक्षा, समृद्धि और दिव्य कृपा के लिए।",
        color: "text-blue-500",
        bgGlow: "from-blue-700/20"
    },

    // HEALTH CATEGORY
    {
        id: "mrit-full",
        name: "Maha Mrityunjaya",
        nameHi: "महा मृत्युंजय मंत्र",
        category: "Health",
        sanskrit: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात् ॥",
        transliteration: "Om Tryambakam Yajamahe Sugandhim Pushtivardhanam Urvarukamiva Bandhanan Mrityormukshiya Maamritat",
        meaning: "We worship the Three-Eyed Lord who nourishes all.",
        meaningHi: "हम तीन आंखों वाले भगवान की पूजा करते हैं जो सभी का पोषण करते हैं।",
        benefit: "Ultimate healing and fearlessness.",
        benefitHi: "परम उपचार और निर्भयता।",
        color: "text-emerald-500",
        bgGlow: "from-emerald-600/20"
    },
    {
        id: "dhanvantari",
        name: "Dhanvantari Mantra",
        nameHi: "धन्वंतरी मंत्र",
        category: "Health",
        sanskrit: "ॐ नमो भगवते महासुदर्शनाय वासुदेवाय धन्वंतरये अमृतकलशहस्ताय सर्वामयविनाशनाय त्रिलोकनाथाय श्री महाविष्णवे नमः",
        transliteration: "Om Namo Bhagavate Mahasudarshanaya Vasudevaya Dhanvantaraye...",
        meaning: "Salutations to Lord Dhanvantari, the divine physician.",
        meaningHi: "भगवान धन्वंतरी को नमस्कार, दिव्य चिकित्सक।",
        benefit: "For healing, health, and recovery from diseases.",
        benefitHi: "उपचार, स्वास्थ्य और बीमारियों से रिकवरी के लिए।",
        color: "text-emerald-400",
        bgGlow: "from-emerald-600/20"
    },
    {
        id: "shiva-health",
        name: "Shiva Health Mantra",
        nameHi: "शिव स्वास्थ्य मंत्र",
        category: "Health",
        sanskrit: "ॐ नमः शिवाय",
        transliteration: "Om Namah Shivaya",
        meaning: "Salutations to Lord Shiva, the healer.",
        meaningHi: "भगवान शिव को नमस्कार, चिकित्सक।",
        benefit: "For physical and mental well-being.",
        benefitHi: "शारीरिक और मानसिक कल्याण के लिए।",
        color: "text-blue-400",
        bgGlow: "from-blue-600/20"
    },
    {
        id: "ayushya",
        name: "Ayushya Mantra",
        nameHi: "आयुष्य मंत्र",
        category: "Health",
        sanskrit: "ॐ ह्रीं क्लीं ह्रीं स्वाहा",
        transliteration: "Om Hreem Kleem Hreem Swaha",
        meaning: "Mantra for longevity and vitality.",
        meaningHi: "दीर्घायु और जीवन शक्ति के लिए मंत्र।",
        benefit: "For long life and good health.",
        benefitHi: "दीर्घायु और अच्छे स्वास्थ्य के लिए।",
        color: "text-green-400",
        bgGlow: "from-green-600/20"
    },
    {
        id: "rudra-health",
        name: "Rudra Mantra",
        nameHi: "रुद्र मंत्र",
        category: "Health",
        sanskrit: "ॐ नमो भगवते रुद्राय",
        transliteration: "Om Namo Bhagavate Rudraya",
        meaning: "Salutations to Lord Rudra, the fierce healer.",
        meaningHi: "भगवान रुद्र को नमस्कार, उग्र चिकित्सक।",
        benefit: "For protection from diseases and ailments.",
        benefitHi: "बीमारियों और रोगों से सुरक्षा के लिए।",
        color: "text-red-400",
        bgGlow: "from-red-600/20"
    },

    // UNIVERSAL CATEGORY
    {
        id: "gayatri",
        name: "Gayatri Mantra",
        nameHi: "गायत्री मंत्र",
        category: "Universal",
        sanskrit: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात् ॥",
        transliteration: "Om Bhur Bhuvah Svah Tat Savitur Varenyam Bhargo Devasya Dheemahi Dhiyo Yo Nah Prachodayat",
        meaning: "We meditate on the glory of the divine Creator.",
        meaningHi: "हम दिव्य निर्माता की महिमा पर ध्यान करते हैं।",
        benefit: "For wisdom and spiritual enlightenment.",
        benefitHi: "ज्ञान और आध्यात्मिक ज्ञान के लिए।",
        color: "text-amber-500",
        bgGlow: "from-amber-600/20"
    },
    {
        id: "om",
        name: "Om Mantra",
        nameHi: "ॐ मंत्र",
        category: "Universal",
        sanskrit: "ॐ",
        transliteration: "Om",
        meaning: "The primordial sound, the essence of all mantras.",
        meaningHi: "आदिम ध्वनि, सभी मंत्रों का सार।",
        benefit: "For universal consciousness and peace.",
        benefitHi: "सार्वभौमिक चेतना और शांति के लिए।",
        color: "text-purple-400",
        bgGlow: "from-purple-600/20"
    },
    {
        id: "shanti",
        name: "Shanti Mantra",
        nameHi: "शांति मंत्र",
        category: "Universal",
        sanskrit: "ॐ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत् ॥",
        transliteration: "Om Sarve Bhavantu Sukhinah Sarve Santu Niraamayah Sarve Bhadrani Pashyantu Ma Kashchid Duhkhabhag Bhavet",
        meaning: "May all beings be happy and free from illness.",
        meaningHi: "सभी प्राणी सुखी हों और रोग मुक्त हों।",
        benefit: "For universal peace and well-being of all.",
        benefitHi: "सार्वभौमिक शांति और सभी के कल्याण के लिए।",
        color: "text-cyan-400",
        bgGlow: "from-cyan-600/20"
    },
    {
        id: "maha-mrityunjaya-full",
        name: "Maha Mrityunjaya (Full)",
        nameHi: "महा मृत्युंजय (पूर्ण)",
        category: "Universal",
        sanskrit: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात् ॥ ॐ स्वः भुवः भूः ॐ",
        transliteration: "Om Tryambakam Yajamahe Sugandhim Pushtivardhanam Urvarukamiva Bandhanan Mrityormukshiya Maamritat || Om Svah Bhuvah Bhuh Om",
        meaning: "Complete form of the great death-conquering mantra.",
        meaningHi: "महान मृत्यु-विजयी मंत्र का पूर्ण रूप।",
        benefit: "For protection, healing, and spiritual liberation.",
        benefitHi: "सुरक्षा, उपचार और आध्यात्मिक मुक्ति के लिए।",
        color: "text-emerald-500",
        bgGlow: "from-emerald-700/20"
    },
    {
        id: "brahma",
        name: "Brahma Mantra",
        nameHi: "ब्रह्म मंत्र",
        category: "Universal",
        sanskrit: "ॐ वेदात्मने परमात्मने नमः",
        transliteration: "Om Vedatmane Paramatmane Namaha",
        meaning: "Salutations to the Supreme Soul, the source of all knowledge.",
        meaningHi: "परमात्मा को नमस्कार, सभी ज्ञान का स्रोत।",
        benefit: "For cosmic consciousness and divine knowledge.",
        benefitHi: "ब्रह्मांडीय चेतना और दिव्य ज्ञान के लिए।",
        color: "text-indigo-400",
        bgGlow: "from-indigo-600/20"
    },
    {
        id: "shiva-universal",
        name: "Shiva Panchakshara",
        nameHi: "शिव पंचाक्षर",
        category: "Universal",
        sanskrit: "ॐ नमः शिवाय",
        transliteration: "Om Namah Shivaya",
        meaning: "The five-syllable mantra of Lord Shiva.",
        meaningHi: "भगवान शिव का पांच अक्षर का मंत्र।",
        benefit: "For universal consciousness and inner transformation.",
        benefitHi: "सार्वभौमिक चेतना और आंतरिक परिवर्तन के लिए।",
        color: "text-blue-500",
        bgGlow: "from-blue-700/20"
    }
];

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const CATEGORIES = ["Obstacles", "Planetary", "Wealth", "Health", "Universal"] as const;

const MantraLab: React.FC<{ language: Language }> = ({ language }) => {
  const t = useTranslation(language);
  const [activeCategory, setActiveCategory] = useState<typeof CATEGORIES[number]>("Obstacles");
  const [selected, setSelected] = useState<Mantra>(MANTRA_LIBRARY[0]);
  const [count, setCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioCacheRef = useRef<Map<string, AudioBuffer>>(new Map());
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const firstInCategory = MANTRA_LIBRARY.find(m => m.category === activeCategory);
    if (firstInCategory) {
        setSelected(firstInCategory);
        setCount(0);
        stopAudio();
        setErrorMsg(null);
    }
  }, [activeCategory]);

  // Load voices when component mounts
  useEffect(() => {
    if (window.speechSynthesis) {
      // Voices might not be loaded immediately
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`));
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const stopAudio = () => {
    if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch(e) {}
        sourceNodeRef.current = null;
    }
    if (speechSynthesisRef.current && window.speechSynthesis) {
        try {
            window.speechSynthesis.cancel();
        } catch(e) {}
        speechSynthesisRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleChant = () => {
    if (count < 108) {
        setCount(prev => prev + 1);
        if (navigator.vibrate) navigator.vibrate([15]);
    } else {
        setCount(0);
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    }
  };

  const playMeditation = async () => {
    if (isPlaying) {
        stopAudio();
        return;
    }

    setIsLoadingAudio(true);
    setErrorMsg(null);

    try {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') await ctx.resume();

        // Check if we should use browser TTS fallback
        const audioData = await generateMantraAudio(selected.sanskrit);
        
        if (audioData === "BROWSER_TTS_FALLBACK" || !audioData) {
            // Use browser's Web Speech API
            console.log("Using browser TTS for mantra:", selected.sanskrit);
            if (!window.speechSynthesis) {
                throw new Error("Browser TTS not supported. Please use a modern browser.");
            }
            
            const utterance = new SpeechSynthesisUtterance(selected.sanskrit);
            utterance.lang = 'hi-IN'; // Hindi/Sanskrit
            utterance.rate = 0.6; // Slower for mantras
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            // Try to find a Hindi/Sanskrit voice
            const voices = window.speechSynthesis.getVoices();
            const hindiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN')) || 
                              voices.find(v => v.name.includes('Hindi')) ||
                              voices.find(v => v.lang.includes('en')); // Fallback to English
            
            if (hindiVoice) {
                utterance.voice = hindiVoice;
                console.log("Using voice:", hindiVoice.name, hindiVoice.lang);
            }
            
            // Create a looping function that checks the ref
            const loopSpeech = () => {
                if (!speechSynthesisRef.current) {
                    setIsPlaying(false);
                    return;
                }
                
                const newUtterance = new SpeechSynthesisUtterance(selected.sanskrit);
                newUtterance.lang = 'hi-IN';
                newUtterance.rate = 0.6;
                newUtterance.pitch = 1.0;
                newUtterance.volume = 1.0;
                if (hindiVoice) newUtterance.voice = hindiVoice;
                
                newUtterance.onend = () => {
                    // Check if still playing (ref is set) before looping
                    if (speechSynthesisRef.current) {
                        setTimeout(() => {
                            if (speechSynthesisRef.current) {
                                loopSpeech();
                            }
                        }, 100);
                    } else {
                        setIsPlaying(false);
                    }
                };
                
                newUtterance.onerror = () => {
                    setIsPlaying(false);
                    speechSynthesisRef.current = null;
                };
                
                speechSynthesisRef.current = newUtterance;
                window.speechSynthesis.speak(newUtterance);
            };
            
            utterance.onend = () => {
                if (speechSynthesisRef.current) {
                    loopSpeech();
                } else {
                    setIsPlaying(false);
                }
            };
            
            utterance.onerror = (e) => {
                console.error("Speech synthesis error:", e);
                setIsPlaying(false);
                speechSynthesisRef.current = null;
            };
            
            speechSynthesisRef.current = utterance;
            window.speechSynthesis.speak(utterance);
            setIsPlaying(true);
            
            return;
        }
        
        // Try to decode Gemini audio
        let audioBuffer = audioCacheRef.current.get(selected.id);
        
        if (!audioBuffer) {
            try {
                console.log("Received audio data, length:", audioData.length, "First 100 chars:", audioData.substring(0, 100));
                
                // Try multiple decoding approaches
                let decoded = false;
                
                // Method 1: Try as standard audio file (WAV/MP3) via data URL
                try {
                    const audioUrl = `data:audio/wav;base64,${audioData}`;
                    const response = await fetch(audioUrl);
                    const arrayBuffer = await response.arrayBuffer();
                    audioBuffer = await ctx.decodeAudioData(arrayBuffer);
                    console.log("Successfully decoded as WAV audio file");
                    decoded = true;
                } catch (wavError) {
                    console.log("WAV decoding failed, trying other formats:", wavError);
                }
                
                // Method 2: Try as MP3
                if (!decoded) {
                    try {
                        const audioUrl = `data:audio/mpeg;base64,${audioData}`;
                        const response = await fetch(audioUrl);
                        const arrayBuffer = await response.arrayBuffer();
                        audioBuffer = await ctx.decodeAudioData(arrayBuffer);
                        console.log("Successfully decoded as MP3 audio file");
                        decoded = true;
                    } catch (mp3Error) {
                        console.log("MP3 decoding failed:", mp3Error);
                    }
                }
                
                // Method 3: Try as raw PCM (original expected format)
                if (!decoded) {
                    try {
                        const pcmData = decode(audioData);
                        audioBuffer = await decodeAudioData(pcmData, ctx, 24000, 1);
                        console.log("Successfully decoded as PCM audio");
                        decoded = true;
                    } catch (pcmError) {
                        console.log("PCM decoding failed:", pcmError);
                    }
                }
                
                // Method 4: Try direct ArrayBuffer conversion
                if (!decoded) {
                    try {
                        const binaryString = atob(audioData);
                        const bytes = new Uint8Array(binaryString.length);
                        for (let i = 0; i < binaryString.length; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }
                        audioBuffer = await ctx.decodeAudioData(bytes.buffer);
                        console.log("Successfully decoded via direct ArrayBuffer");
                        decoded = true;
                    } catch (directError) {
                        console.error("Direct ArrayBuffer decoding failed:", directError);
                    }
                }
                
                if (!decoded || !audioBuffer) {
                    // Fallback to browser TTS if decoding fails
                    console.warn("Audio decoding failed, falling back to browser TTS");
                    const utterance = new SpeechSynthesisUtterance(selected.sanskrit);
                    utterance.lang = 'hi-IN';
                    utterance.rate = 0.6;
                    const voices = window.speechSynthesis.getVoices();
                    const hindiVoice = voices.find(v => v.lang.includes('hi')) || voices[0];
                    if (hindiVoice) utterance.voice = hindiVoice;
                    utterance.onend = () => setIsPlaying(false);
                    speechSynthesisRef.current = utterance;
                    window.speechSynthesis.speak(utterance);
                    setIsPlaying(true);
                    return;
                }
                
                audioCacheRef.current.set(selected.id, audioBuffer);
            } catch (audioGenError: any) {
                console.error("Audio generation/decoding error, using browser TTS:", audioGenError);
                // Final fallback to browser TTS
                const utterance = new SpeechSynthesisUtterance(selected.sanskrit);
                utterance.lang = 'hi-IN';
                utterance.rate = 0.6;
                const voices = window.speechSynthesis.getVoices();
                const hindiVoice = voices.find(v => v.lang.includes('hi')) || voices[0];
                if (hindiVoice) utterance.voice = hindiVoice;
                utterance.onend = () => setIsPlaying(false);
                speechSynthesisRef.current = utterance;
                window.speechSynthesis.speak(utterance);
                setIsPlaying(true);
                return;
            }
        }

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.loop = true;
        source.connect(ctx.destination);
        source.onended = () => setIsPlaying(false);
        
        source.start(0);
        sourceNodeRef.current = source;
        setIsPlaying(true);
    } catch (e: any) {
        console.error("Audio Playback Error:", e);
        const errorMessage = e?.message || e?.toString() || "Unknown error";
        
        if (errorMessage.includes('quota') || errorMessage.includes('429') || errorMessage.includes('exceeded') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            setErrorMsg(language === 'hi' 
                ? "ब्रह्मांड तारों को संरेखित करने में व्यस्त है। कृपया कुछ समय बाद पुनः प्रयास करें।" 
                : "Cosmic is busy aligning the stars. Please try again after some time.");
        } else if (errorMessage.includes('model') || errorMessage.includes('404') || errorMessage.includes('not available')) {
            setErrorMsg(language === 'hi' 
                ? "TTS मॉडल उपलब्ध नहीं है। ऑडियो सुविधा आपके API कुंजी के साथ समर्थित नहीं हो सकती है।" 
                : "TTS model not available. Audio feature may not be supported with your current API key.");
        } else if (errorMessage.includes('500') || errorMessage.includes('INTERNAL')) {
            setErrorMsg(language === 'hi' 
                ? "सर्वर त्रुटि (500)। कृपया पुनः प्रयास करें।" 
                : "Celestial Server Error (500). The oracle is busy, please retry.");
        } else if (errorMessage.includes('No audio data')) {
            setErrorMsg(language === 'hi' 
                ? "ऑडियो डेटा प्राप्त नहीं हुआ। कृपया कंसोल में त्रुटि जांचें।" 
                : "No audio data received. Please check console for error details.");
        } else {
            setErrorMsg(language === 'hi' 
                ? `ध्वनि लोड करने में विफल: ${errorMessage.substring(0, 100)}` 
                : `Resonance failure: ${errorMessage.substring(0, 100)}`);
        }
    } finally {
        setIsLoadingAudio(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-24 animate-fade-in-up">
      <div className="bg-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-8 md:p-16 shadow-3xl flex flex-col items-center relative overflow-hidden">
        
        <div className={`absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br ${selected.bgGlow} via-transparent to-transparent blur-[150px] transition-all duration-1000 opacity-40`}></div>
        <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr ${selected.bgGlow} via-transparent to-transparent blur-[120px] transition-all duration-1000 opacity-20`}></div>

        <div className="text-center mb-12 relative z-10">
            <span className="text-[10px] uppercase font-bold tracking-[1.5em] text-orange-400 mb-4 block">{t.dhvaniSanctuary}</span>
            <h2 className="text-5xl md:text-8xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-500 drop-shadow-sm">{t.mantraLabTitle}</h2>
            <p className="text-slate-400 text-xs italic mt-6 tracking-[0.5em] uppercase">{t.mantraSubtitle}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-16 relative z-10 w-full overflow-x-auto pb-2">
            {CATEGORIES.map(cat => (
                <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-[2rem] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest border transition-all duration-700 whitespace-nowrap flex-shrink-0 ${activeCategory === cat ? 'bg-orange-500 text-white border-orange-400 shadow-[0_15px_40px_rgba(249,115,22,0.3)] scale-105' : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-white hover:border-slate-600'}`}
                >
                    {language === 'hi' ? (cat === "Obstacles" ? "बाधाएं" : cat === "Planetary" ? "ग्रह" : cat === "Wealth" ? "धन" : cat === "Health" ? "स्वास्थ्य" : "ब्रह्मांड") : cat}
                </button>
            ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 w-full relative z-10">
            
            <div className="lg:col-span-4 space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                {MANTRA_LIBRARY.filter(m => m.category === activeCategory).map(m => (
                    <button 
                        key={m.id} 
                        onClick={() => { setSelected(m); setCount(0); stopAudio(); setErrorMsg(null); }} 
                        className={`w-full p-10 rounded-[3rem] border transition-all duration-700 text-left relative group overflow-hidden ${selected.id === m.id ? 'bg-white border-white shadow-[0_20px_50px_rgba(255,255,255,0.1)]' : 'bg-slate-950/20 border-white/5 hover:border-white/20'}`}
                    >
                        <div className={`text-2xl font-serif mb-2 transition-colors ${selected.id === m.id ? 'text-slate-950' : 'text-slate-300'}`}>{language === 'hi' ? m.nameHi : m.name}</div>
                        <div className={`text-[10px] uppercase tracking-wider transition-colors ${selected.id === m.id ? 'text-slate-500' : 'text-slate-600'}`}>{m.transliteration.substring(0, 30)}...</div>
                        {selected.id === m.id && <div className="absolute right-6 top-1/2 -translate-y-1/2 text-orange-500/20 text-4xl">🕉️</div>}
                    </button>
                ))}
            </div>

            <div className="lg:col-span-8 flex flex-col lg:flex-row gap-12 items-start lg:items-center justify-between">
                
                <div className="flex-1 space-y-10 w-full lg:w-auto">
                    <div className="space-y-6 text-center md:text-left">
                        <div className="inline-block px-5 py-1.5 bg-orange-900/20 border border-orange-500/20 rounded-full text-[10px] uppercase font-bold text-orange-400 tracking-widest">{language === 'hi' ? 'मंत्र शक्ति' : selected.category + ' Ritual'}</div>
                        <h3 className={`text-5xl md:text-7xl font-serif ${selected.color} drop-shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all`}>{language === 'hi' ? selected.nameHi : selected.name}</h3>
                        
                        <div className="bg-black/40 backdrop-blur-md p-14 rounded-[4.5rem] border border-white/10 relative group shadow-2xl overflow-hidden">
                             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
                             <div className="text-4xl md:text-6xl text-white font-serif leading-relaxed mb-10 tracking-widest text-center drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{selected.sanskrit}</div>
                             <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-10 w-2/3 mx-auto"></div>
                             <div className="text-xl text-slate-500 italic leading-relaxed text-center font-light tracking-wide">{selected.transliteration}</div>
                        </div>

                        {errorMsg && (
                            <div className="p-5 bg-red-950/20 border border-red-500/20 rounded-3xl text-red-400 text-xs text-center animate-pulse tracking-wide flex flex-col gap-2">
                                <span>{errorMsg}</span>
                                <button onClick={playMeditation} className="text-[10px] uppercase font-bold underline hover:text-white">Retry Call</button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                             <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 group hover:border-white/10 transition-colors">
                                <h4 className="text-[10px] text-slate-500 uppercase font-bold mb-3 tracking-[0.3em]">{t.spiritualFocus}</h4>
                                <p className="text-base text-slate-300 leading-relaxed italic">"{language === 'hi' ? selected.meaningHi : selected.meaning}"</p>
                             </div>
                             <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 group hover:border-white/10 transition-colors">
                                <h4 className="text-[10px] text-slate-500 uppercase font-bold mb-3 tracking-[0.3em]">{t.karmicAlchemy}</h4>
                                <p className="text-base text-slate-300 leading-relaxed">{language === 'hi' ? selected.benefitHi : selected.benefit}</p>
                             </div>
                        </div>
                    </div>

                    <button 
                        onClick={playMeditation}
                        disabled={isLoadingAudio}
                        className={`w-full flex items-center justify-center gap-6 px-12 py-8 rounded-[3rem] border-2 transition-all duration-700 font-serif font-bold text-2xl ${isPlaying ? 'bg-orange-600 border-orange-400 text-white shadow-[0_20px_80px_rgba(249,115,22,0.3)]' : 'bg-slate-950 border-white/10 text-white hover:border-white hover:shadow-3xl'} group disabled:opacity-50`}
                    >
                        {isLoadingAudio ? (
                            <><div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> {language === 'hi' ? 'मंत्र का आह्वान...' : 'INVOKING MANTRA...'}</>
                        ) : isPlaying ? (
                            <><span className="text-3xl animate-pulse">⏸</span> {t.ceaseResonance}</>
                        ) : (
                            <>{language === 'hi' ? 'मंत्र चलाएं' : 'PLAY MANTRA'}</>
                        )}
                    </button>
                </div>

                <div className="flex flex-col items-center gap-14 w-full lg:w-auto flex-shrink-0">
                    <div className="relative w-64 h-64 lg:w-80 lg:h-80 flex items-center justify-center">
                        <div className={`absolute inset-[-20px] rounded-full border border-white/5 transition-all duration-[3000ms] ${isPlaying ? 'rotate-180 scale-110 opacity-100' : 'opacity-0'}`}></div>
                        <div className={`absolute inset-0 rounded-full border border-white/5 ${isPlaying ? 'animate-spin-slow' : ''}`}></div>
                        
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="50%" cy="50%" r="48%" className="fill-none stroke-slate-950 stroke-[6]" />
                            <circle 
                                cx="50%" cy="50%" r="48%" 
                                className="fill-none stroke-orange-500 stroke-[6] transition-all duration-700 ease-out"
                                strokeDasharray="301.5"
                                style={{ strokeDashoffset: `${301.5 - (count / 108) * 301.5}` }}
                            />
                        </svg>

                        <button 
                            onClick={handleChant}
                            className="relative z-10 w-48 h-48 lg:w-64 lg:h-64 bg-slate-950 rounded-full border border-white/10 flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all duration-500 shadow-4xl shadow-white/5 group overflow-hidden"
                        >
                            <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 via-transparent to-transparent transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-50'}`}></div>
                            
                            {isPlaying && <div className="absolute inset-0 bg-orange-500/5 animate-ping rounded-full pointer-events-none"></div>}

                            <span className="text-5xl lg:text-7xl mb-4 lg:mb-6 group-hover:rotate-[25deg] transition-transform duration-1000">📿</span>
                            <div className="flex flex-col items-center relative z-10">
                                <span className="text-5xl lg:text-7xl font-serif font-bold text-white tracking-tighter">{count}</span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-[0.5em] font-bold mt-2 lg:mt-3">{t.malaCycle}</span>
                            </div>
                            <span className="absolute bottom-12 text-[8px] text-white/40 font-bold uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity">{t.touchBead}</span>
                        </button>
                    </div>
                    
                    {isPlaying && (
                        <div className="flex items-end gap-2 h-20 px-8 py-4 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                            {[...Array(18)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className="w-1.5 bg-gradient-to-t from-orange-400 via-orange-500 to-amber-600 rounded-full animate-bounce" 
                                    style={{ 
                                        height: `${10 + Math.random() * 50}px`, 
                                        animationDuration: `${0.3 + Math.random() * 0.7}s`,
                                        animationDelay: `${i * 0.04}s` 
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="mt-20 pt-10 border-t border-white/5 w-full text-center">
            <p className="text-[10px] text-slate-700 uppercase tracking-[1em] leading-relaxed">
                Celestial Bio-Geometry • Waveform Alchemy
            </p>
        </div>
      </div>
    </div>
  );
};

export default MantraLab;
