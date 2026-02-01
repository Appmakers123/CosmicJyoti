
import React, { useState } from 'react';
import { Language } from '../types';
import { generateRudrakshAdvice } from '../services/geminiService';
import { useTranslation } from '../utils/translations';
import { getExternalLinkProps } from '../utils/linkHandler';
import RichText from './RichText';

interface Mukhi {
    num: string;
    planet: string;
    benefit: string;
    beej: string;
    wearingProcess: {
        en: string[];
        hi: string[];
    };
}

const MUKHIS: Mukhi[] = [
    { 
        num: "1", 
        planet: "Sun", 
        benefit: "Spiritual realization, leadership and ultimate consciousness.", 
        beej: "Om Hreem Namah",
        wearingProcess: {
            en: [
                "Best Day: Sunday during sunrise",
                "Purify: Soak in Ganga water or milk overnight, then wash with clean water",
                "Energize: Chant the beej mantra 108 times while holding the Rudraksh",
                "Thread: Use red or golden thread, wear around neck or right arm",
                "Direction: Face should be towards East while wearing",
                "Wear: After bath, on empty stomach, facing Sun"
            ],
            hi: [
                "सर्वोत्तम दिन: रविवार सूर्योदय के समय",
                "शुद्धिकरण: गंगा जल या दूध में रात भर भिगोएं, फिर साफ पानी से धोएं",
                "ऊर्जावान करें: रुद्राक्ष को हाथ में लेकर बीज मंत्र 108 बार जपें",
                "धागा: लाल या सुनहरा धागा प्रयोग करें, गले या दाहिने हाथ में पहनें",
                "दिशा: पहनते समय मुख पूर्व दिशा की ओर हो",
                "पहनें: स्नान के बाद, खाली पेट, सूर्य की ओर मुख करके"
            ]
        }
    },
    { 
        num: "2", 
        planet: "Moon", 
        benefit: "Unity, emotional balance, and better relationships.", 
        beej: "Om Namah",
        wearingProcess: {
            en: [
                "Best Day: Monday during moonrise",
                "Purify: Soak in milk or Ganga water for 24 hours",
                "Energize: Chant 'Om Namah' 108 times on Monday night",
                "Thread: Use white or silver thread, wear around neck",
                "Direction: Face North while wearing",
                "Wear: After evening bath, during Shukla Paksha (waxing moon)"
            ],
            hi: [
                "सर्वोत्तम दिन: सोमवार चंद्रोदय के समय",
                "शुद्धिकरण: दूध या गंगा जल में 24 घंटे भिगोएं",
                "ऊर्जावान करें: सोमवार रात को 'ओम नमः' 108 बार जपें",
                "धागा: सफेद या चांदी का धागा प्रयोग करें, गले में पहनें",
                "दिशा: पहनते समय मुख उत्तर दिशा की ओर हो",
                "पहनें: शाम के स्नान के बाद, शुक्ल पक्ष में"
            ]
        }
    },
    { 
        num: "3", 
        planet: "Mars", 
        benefit: "Removes past life sins, boosts confidence and self-esteem.", 
        beej: "Om Kleem Namah",
        wearingProcess: {
            en: [
                "Best Day: Tuesday during sunrise",
                "Purify: Soak in red sandalwood water or milk for 12 hours",
                "Energize: Chant 'Om Kleem Namah' 108 times on Tuesday morning",
                "Thread: Use red thread, wear on right arm or around neck",
                "Direction: Face South-East while wearing",
                "Wear: Early morning after bath, on empty stomach"
            ],
            hi: [
                "सर्वोत्तम दिन: मंगलवार सूर्योदय के समय",
                "शुद्धिकरण: लाल चंदन के पानी या दूध में 12 घंटे भिगोएं",
                "ऊर्जावान करें: मंगलवार सुबह 'ओम क्लीं नमः' 108 बार जपें",
                "धागा: लाल धागा प्रयोग करें, दाहिने हाथ या गले में पहनें",
                "दिशा: पहनते समय मुख दक्षिण-पूर्व दिशा की ओर हो",
                "पहनें: सुबह स्नान के बाद, खाली पेट"
            ]
        }
    },
    { 
        num: "4", 
        planet: "Mercury", 
        benefit: "Intelligence, communication skills, and creative wisdom.", 
        beej: "Om Hreem Namah",
        wearingProcess: {
            en: [
                "Best Day: Wednesday during sunrise",
                "Purify: Soak in green gram water or milk overnight",
                "Energize: Chant 'Om Hreem Namah' 108 times on Wednesday",
                "Thread: Use green or yellow thread, wear around neck",
                "Direction: Face North while wearing",
                "Wear: Morning after bath, during Budh Hora (Mercury hour)"
            ],
            hi: [
                "सर्वोत्तम दिन: बुधवार सूर्योदय के समय",
                "शुद्धिकरण: हरे चने के पानी या दूध में रात भर भिगोएं",
                "ऊर्जावान करें: बुधवार को 'ओम ह्रीं नमः' 108 बार जपें",
                "धागा: हरा या पीला धागा प्रयोग करें, गले में पहनें",
                "दिशा: पहनते समय मुख उत्तर दिशा की ओर हो",
                "पहनें: सुबह स्नान के बाद, बुध होरा में"
            ]
        }
    },
    { 
        num: "5", 
        planet: "Jupiter", 
        benefit: "General health, peace of mind, and academic excellence.", 
        beej: "Om Hreem Namah",
        wearingProcess: {
            en: [
                "Best Day: Thursday during sunrise",
                "Purify: Soak in yellow sandalwood water or milk for 24 hours",
                "Energize: Chant 'Om Hreem Namah' 108 times on Thursday morning",
                "Thread: Use yellow or golden thread, wear around neck",
                "Direction: Face North-East while wearing",
                "Wear: Early morning after bath, during Guru Hora (Jupiter hour)"
            ],
            hi: [
                "सर्वोत्तम दिन: गुरुवार सूर्योदय के समय",
                "शुद्धिकरण: पीले चंदन के पानी या दूध में 24 घंटे भिगोएं",
                "ऊर्जावान करें: गुरुवार सुबह 'ओम ह्रीं नमः' 108 बार जपें",
                "धागा: पीला या सुनहरा धागा प्रयोग करें, गले में पहनें",
                "दिशा: पहनते समय मुख उत्तर-पूर्व दिशा की ओर हो",
                "पहनें: सुबह स्नान के बाद, गुरु होरा में"
            ]
        }
    },
    { 
        num: "6", 
        planet: "Venus", 
        benefit: "Success in business, creative power, and focus.", 
        beej: "Om Hreem Hum Namah",
        wearingProcess: {
            en: [
                "Best Day: Friday during sunrise",
                "Purify: Soak in white sandalwood water or milk overnight",
                "Energize: Chant 'Om Hreem Hum Namah' 108 times on Friday",
                "Thread: Use white or silver thread, wear around neck",
                "Direction: Face South-East while wearing",
                "Wear: Morning after bath, during Shukra Hora (Venus hour)"
            ],
            hi: [
                "सर्वोत्तम दिन: शुक्रवार सूर्योदय के समय",
                "शुद्धिकरण: सफेद चंदन के पानी या दूध में रात भर भिगोएं",
                "ऊर्जावान करें: शुक्रवार को 'ओम ह्रीं हूं नमः' 108 बार जपें",
                "धागा: सफेद या चांदी का धागा प्रयोग करें, गले में पहनें",
                "दिशा: पहनते समय मुख दक्षिण-पूर्व दिशा की ओर हो",
                "पहनें: सुबह स्नान के बाद, शुक्र होरा में"
            ]
        }
    },
    { 
        num: "7", 
        planet: "Saturn", 
        benefit: "Attracts wealth, removes financial misery and bad luck.", 
        beej: "Om Hum Namah",
        wearingProcess: {
            en: [
                "Best Day: Saturday during sunrise",
                "Purify: Soak in black sesame oil or milk for 24 hours",
                "Energize: Chant 'Om Hum Namah' 108 times on Saturday morning",
                "Thread: Use black or blue thread, wear on left arm or around neck",
                "Direction: Face West while wearing",
                "Wear: Early morning after bath, during Shani Hora (Saturn hour)"
            ],
            hi: [
                "सर्वोत्तम दिन: शनिवार सूर्योदय के समय",
                "शुद्धिकरण: काले तिल के तेल या दूध में 24 घंटे भिगोएं",
                "ऊर्जावान करें: शनिवार सुबह 'ओम हूं नमः' 108 बार जपें",
                "धागा: काला या नीला धागा प्रयोग करें, बाएं हाथ या गले में पहनें",
                "दिशा: पहनते समय मुख पश्चिम दिशा की ओर हो",
                "पहनें: सुबह स्नान के बाद, शनि होरा में"
            ]
        }
    },
    { 
        num: "8", 
        planet: "Rahu", 
        benefit: "Removes obstacles, victory in legal battles, and health.", 
        beej: "Om Hum Namah",
        wearingProcess: {
            en: [
                "Best Day: Saturday during Rahu Kaal",
                "Purify: Soak in coconut water or milk for 12 hours",
                "Energize: Chant 'Om Hum Namah' 108 times on Saturday",
                "Thread: Use black or blue thread, wear on left arm",
                "Direction: Face South-West while wearing",
                "Wear: After sunset, during Rahu Kaal or Rahu Hora"
            ],
            hi: [
                "सर्वोत्तम दिन: शनिवार राहु काल में",
                "शुद्धिकरण: नारियल पानी या दूध में 12 घंटे भिगोएं",
                "ऊर्जावान करें: शनिवार को 'ओम हूं नमः' 108 बार जपें",
                "धागा: काला या नीला धागा प्रयोग करें, बाएं हाथ में पहनें",
                "दिशा: पहनते समय मुख दक्षिण-पश्चिम दिशा की ओर हो",
                "पहनें: सूर्यास्त के बाद, राहु काल या राहु होरा में"
            ]
        }
    },
    { 
        num: "9", 
        planet: "Ketu", 
        benefit: "Courage, removes fear of death, and brings spiritual power.", 
        beej: "Om Hreem Hum Namah",
        wearingProcess: {
            en: [
                "Best Day: Tuesday or Thursday during Ketu Kaal",
                "Purify: Soak in Ganga water or milk for 24 hours",
                "Energize: Chant 'Om Hreem Hum Namah' 108 times",
                "Thread: Use brown or black thread, wear on right arm",
                "Direction: Face South-West while wearing",
                "Wear: After sunset, during Ketu Kaal or Ketu Hora"
            ],
            hi: [
                "सर्वोत्तम दिन: मंगलवार या गुरुवार केतु काल में",
                "शुद्धिकरण: गंगा जल या दूध में 24 घंटे भिगोएं",
                "ऊर्जावान करें: 'ओम ह्रीं हूं नमः' 108 बार जपें",
                "धागा: भूरा या काला धागा प्रयोग करें, दाहिने हाथ में पहनें",
                "दिशा: पहनते समय मुख दक्षिण-पश्चिम दिशा की ओर हो",
                "पहनें: सूर्यास्त के बाद, केतु काल या केतु होरा में"
            ]
        }
    },
    { 
        num: "10", 
        planet: "Vishnu", 
        benefit: "Protection from black magic, evil eye, and planetary debt.", 
        beej: "Om Hreem Namah Namah",
        wearingProcess: {
            en: [
                "Best Day: Thursday or any auspicious day",
                "Purify: Soak in Tulsi water or Ganga water for 24 hours",
                "Energize: Chant 'Om Hreem Namah Namah' 108 times",
                "Thread: Use yellow or golden thread, wear around neck",
                "Direction: Face East or North while wearing",
                "Wear: Morning after bath, after offering prayers to Lord Vishnu"
            ],
            hi: [
                "सर्वोत्तम दिन: गुरुवार या कोई शुभ दिन",
                "शुद्धिकरण: तुलसी जल या गंगा जल में 24 घंटे भिगोएं",
                "ऊर्जावान करें: 'ओम ह्रीं नमः नमः' 108 बार जपें",
                "धागा: पीला या सुनहरा धागा प्रयोग करें, गले में पहनें",
                "दिशा: पहनते समय मुख पूर्व या उत्तर दिशा की ओर हो",
                "पहनें: सुबह स्नान के बाद, भगवान विष्णु की पूजा के बाद"
            ]
        }
    },
    { 
        num: "11", 
        planet: "Hanuman", 
        benefit: "Strong judgment, physical strength, and successful travel.", 
        beej: "Om Hreem Hum Namah",
        wearingProcess: {
            en: [
                "Best Day: Tuesday or Saturday",
                "Purify: Soak in red sandalwood water or milk overnight",
                "Energize: Chant 'Om Hreem Hum Namah' 108 times",
                "Thread: Use red or orange thread, wear around neck or right arm",
                "Direction: Face East while wearing",
                "Wear: Early morning after bath, after offering prayers to Hanuman"
            ],
            hi: [
                "सर्वोत्तम दिन: मंगलवार या शनिवार",
                "शुद्धिकरण: लाल चंदन के पानी या दूध में रात भर भिगोएं",
                "ऊर्जावान करें: 'ओम ह्रीं हूं नमः' 108 बार जपें",
                "धागा: लाल या नारंगी धागा प्रयोग करें, गले या दाहिने हाथ में पहनें",
                "दिशा: पहनते समय मुख पूर्व दिशा की ओर हो",
                "पहनें: सुबह स्नान के बाद, हनुमान जी की पूजा के बाद"
            ]
        }
    },
    { 
        num: "12", 
        planet: "Sun", 
        benefit: "Radiance, vitality, and high-level administrative power.", 
        beej: "Om Kraum Sraum Raum Namah",
        wearingProcess: {
            en: [
                "Best Day: Sunday during sunrise",
                "Purify: Soak in Ganga water or milk for 24 hours",
                "Energize: Chant 'Om Kraum Sraum Raum Namah' 108 times",
                "Thread: Use red or golden thread, wear around neck",
                "Direction: Face East while wearing, towards rising Sun",
                "Wear: Early morning after bath, during sunrise, on empty stomach"
            ],
            hi: [
                "सर्वोत्तम दिन: रविवार सूर्योदय के समय",
                "शुद्धिकरण: गंगा जल या दूध में 24 घंटे भिगोएं",
                "ऊर्जावान करें: 'ओम क्रौं स्रौं रौं नमः' 108 बार जपें",
                "धागा: लाल या सुनहरा धागा प्रयोग करें, गले में पहनें",
                "दिशा: पहनते समय मुख पूर्व दिशा की ओर हो, उगते सूर्य की ओर",
                "पहनें: सुबह स्नान के बाद, सूर्योदय के समय, खाली पेट"
            ]
        }
    },
    { 
        num: "13", 
        planet: "Kamdev", 
        benefit: "Magnetism, charisma, and fulfilling worldly desires.", 
        beej: "Om Hreem Namah",
        wearingProcess: {
            en: [
                "Best Day: Friday or any auspicious day",
                "Purify: Soak in rose water or milk overnight",
                "Energize: Chant 'Om Hreem Namah' 108 times",
                "Thread: Use pink or red thread, wear around neck",
                "Direction: Face North-East while wearing",
                "Wear: Evening after bath, during Shukra Hora (Venus hour)"
            ],
            hi: [
                "सर्वोत्तम दिन: शुक्रवार या कोई शुभ दिन",
                "शुद्धिकरण: गुलाब जल या दूध में रात भर भिगोएं",
                "ऊर्जावान करें: 'ओम ह्रीं नमः' 108 बार जपें",
                "धागा: गुलाबी या लाल धागा प्रयोग करें, गले में पहनें",
                "दिशा: पहनते समय मुख उत्तर-पूर्व दिशा की ओर हो",
                "पहनें: शाम स्नान के बाद, शुक्र होरा में"
            ]
        }
    },
    { 
        num: "14", 
        planet: "Saturn", 
        benefit: "Intuition, Third Eye opening, and victory over destiny.", 
        beej: "Om Namah",
        wearingProcess: {
            en: [
                "Best Day: Saturday during sunrise",
                "Purify: Soak in black sesame oil or milk for 24 hours",
                "Energize: Chant 'Om Namah' 108 times on Saturday morning",
                "Thread: Use black or blue thread, wear on left arm",
                "Direction: Face West while wearing",
                "Wear: Early morning after bath, during Shani Hora (Saturn hour)"
            ],
            hi: [
                "सर्वोत्तम दिन: शनिवार सूर्योदय के समय",
                "शुद्धिकरण: काले तिल के तेल या दूध में 24 घंटे भिगोएं",
                "ऊर्जावान करें: शनिवार सुबह 'ओम नमः' 108 बार जपें",
                "धागा: काला या नीला धागा प्रयोग करें, बाएं हाथ में पहनें",
                "दिशा: पहनते समय मुख पश्चिम दिशा की ओर हो",
                "पहनें: सुबह स्नान के बाद, शनि होरा में"
            ]
        }
    },
    { 
        num: "GS", 
        planet: "Shiva-Parvati", 
        benefit: "Gauri Shankar: Perfect for marriage and household harmony.", 
        beej: "Om Gauri Shankaraye Namah",
        wearingProcess: {
            en: [
                "Best Day: Monday or any auspicious day",
                "Purify: Soak in Ganga water or milk for 24 hours",
                "Energize: Chant 'Om Gauri Shankaraye Namah' 108 times",
                "Thread: Use white or red thread, wear around neck",
                "Direction: Face North while wearing",
                "Wear: After bath, after offering prayers to Shiva-Parvati, can be worn by couples together"
            ],
            hi: [
                "सर्वोत्तम दिन: सोमवार या कोई शुभ दिन",
                "शुद्धिकरण: गंगा जल या दूध में 24 घंटे भिगोएं",
                "ऊर्जावान करें: 'ओम गौरी शंकराय नमः' 108 बार जपें",
                "धागा: सफेद या लाल धागा प्रयोग करें, गले में पहनें",
                "दिशा: पहनते समय मुख उत्तर दिशा की ओर हो",
                "पहनें: स्नान के बाद, शिव-पार्वती की पूजा के बाद, दंपति एक साथ पहन सकते हैं"
            ]
        }
    },
    { 
        num: "G", 
        planet: "Ganesh", 
        benefit: "Ganesh: Success in all exams and removing career hurdles.", 
        beej: "Om Gam Ganapataye Namah",
        wearingProcess: {
            en: [
                "Best Day: Wednesday or any auspicious day",
                "Purify: Soak in Ganga water or milk overnight",
                "Energize: Chant 'Om Gam Ganapataye Namah' 108 times",
                "Thread: Use red or orange thread, wear around neck or right arm",
                "Direction: Face East or North while wearing",
                "Wear: Morning after bath, after offering prayers to Lord Ganesh"
            ],
            hi: [
                "सर्वोत्तम दिन: बुधवार या कोई शुभ दिन",
                "शुद्धिकरण: गंगा जल या दूध में रात भर भिगोएं",
                "ऊर्जावान करें: 'ओम गं गणपतये नमः' 108 बार जपें",
                "धागा: लाल या नारंगी धागा प्रयोग करें, गले या दाहिने हाथ में पहनें",
                "दिशा: पहनते समय मुख पूर्व या उत्तर दिशा की ओर हो",
                "पहनें: सुबह स्नान के बाद, भगवान गणेश की पूजा के बाद"
            ]
        }
    }
];

const RudrakshLab: React.FC<{ language: Language }> = ({ language }) => {
  const t = useTranslation(language);
  const [activeMukhi, setActiveMukhi] = useState(MUKHIS[0]);
  const [problem, setProblem] = useState("");
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConsult = async () => {
    if (!problem.trim()) return;
    setLoading(true);
    try {
        const result = await generateRudrakshAdvice(problem, language);
        setAdvice(result);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in-up pb-12">
      <div className="bg-slate-800/80 border border-orange-500/30 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-5 text-9xl">📿</div>
        
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif text-orange-200 mb-2">{t.rudrakshAlchemist}</h2>
          <p className="text-slate-400 text-sm italic">{t.shivaTears}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
                <h3 className="text-lg font-serif text-amber-200 border-b border-slate-700 pb-2">{t.mukhiLibrary}</h3>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {MUKHIS.map(m => (
                        <button 
                            key={m.num} 
                            onClick={() => { setActiveMukhi(m); setAdvice(null); }}
                            className={`w-12 h-12 rounded-full border flex flex-col items-center justify-center transition-all ${activeMukhi.num === m.num ? 'bg-orange-600 border-orange-400 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]' : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-orange-500/50'}`}
                        >
                            <span className="text-xs font-bold leading-none">{m.num}</span>
                            <span className="text-[6px] uppercase tracking-tighter mt-0.5">{language === 'hi' ? 'मुखी' : 'Mukhi'}</span>
                        </button>
                    ))}
                </div>
                <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-700 animate-fade-in flex flex-col gap-4">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="text-orange-400 font-serif text-xl">{activeMukhi.num === 'GS' ? 'Gauri Shankar' : activeMukhi.num === 'G' ? 'Ganesh' : activeMukhi.num + ' Mukhi'} Rudraksh</h4>
                            <span className="text-[9px] bg-orange-900/40 text-orange-200 px-2 py-1 rounded-full border border-orange-500/20 uppercase tracking-widest font-bold">{language === 'hi' ? 'ग्रह' : 'Planet'}: {activeMukhi.planet}</span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed mb-4 italic">"{activeMukhi.benefit}"</p>
                    </div>
                    <div className="p-3 bg-slate-800/80 rounded-xl text-xs font-mono text-orange-200 text-center border border-slate-700">
                        <span className="text-slate-500 block text-[8px] uppercase tracking-widest mb-1 font-sans">{language === 'hi' ? 'पावर मंत्र' : 'Power Mantra'}</span>
                        {activeMukhi.beej}
                    </div>
                    
                    {/* Wearing Process */}
                    <div className="mt-4 pt-4 border-t border-slate-700">
                        <h5 className="text-amber-300 font-serif text-sm mb-3 flex items-center gap-2">
                            <span>📿</span>
                            {language === 'hi' ? 'पहनने की विधि' : 'How to Wear'}
                        </h5>
                        <ul className="space-y-2">
                            {activeMukhi.wearingProcess[language].map((step, index) => (
                                <li key={index} className="text-slate-400 text-xs leading-relaxed flex items-start gap-2">
                                    <span className="text-orange-500 font-bold mt-0.5 flex-shrink-0">{index + 1}.</span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-lg font-serif text-amber-200 border-b border-slate-700 pb-2">{t.vedicConsultation}</h3>
                <div className="space-y-4">
                    <p className="text-slate-400 text-xs leading-relaxed font-light">{language === 'hi' ? 'प्राचीन ग्रंथों के आधार पर सिफारिश के लिए अपनी चुनौतियों का वर्णन करें।' : 'Describe your life challenges for an AI-guided recommendation from the ancient texts.'}</p>
                    <textarea 
                        value={problem}
                        onChange={(e) => setProblem(e.target.value)}
                        placeholder={language === 'hi' ? "उदाहरण: मैं काम पर बहुत तनाव महसूस कर रहा हूँ और आर्थिक भाग्य में सुधार चाहता हूँ..." : "e.g. I am facing high stress at work and want to improve my financial luck..."}
                        className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder-slate-600"
                    />
                    <button 
                        onClick={handleConsult}
                        disabled={loading || !problem.trim()}
                        className="w-full py-4 bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-500 hover:to-orange-700 text-white font-serif font-bold rounded-xl shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                {t.consultingLibrary}
                            </>
                        ) : t.seekRemedy}
                    </button>
                </div>
            </div>
        </div>

        {advice && (
            <div className="mt-12 bg-slate-900/90 p-8 rounded-[2.5rem] border border-orange-500/20 shadow-inner animate-fade-in-up">
                <h3 className="text-xl font-serif text-orange-200 mb-6 flex items-center gap-3">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-900/30 text-lg">✨</span>
                    {t.remedyAlignment}
                </h3>
                <RichText text={advice} className="text-slate-300 leading-relaxed font-light" />
            </div>
        )}

        {/* Buy Rudraksh Section */}
        <div className="mt-8 bg-gradient-to-r from-orange-900/20 to-amber-900/20 p-6 rounded-2xl border border-orange-500/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                    <h4 className="text-lg font-serif text-orange-200 mb-2">
                        {language === 'hi' ? 'असली रुद्राक्ष खरीदें' : 'Buy Authentic Rudraksh'}
                    </h4>
                    <p className="text-slate-400 text-sm">
                        {language === 'hi' 
                            ? 'गुणवत्तापूर्ण और प्रमाणित रुद्राक्ष मालाएं प्राप्त करें'
                            : 'Get high-quality, certified Rudraksh beads and malas'}
                    </p>
                </div>
                <a 
                    {...getExternalLinkProps("https://gemsmantra.com/?ref=NIKESHMAURYA", language)}
                    className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-xl shadow-lg transition-all hover:shadow-orange-500/50 flex items-center gap-2 whitespace-nowrap"
                >
                    <span>{language === 'hi' ? 'अभी खरीदें' : 'Shop Now'}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RudrakshLab;
