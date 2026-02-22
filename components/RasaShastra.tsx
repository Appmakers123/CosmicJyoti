import React from 'react';
import { Language } from '../types';
import ModuleAskAI from './ModuleAskAI';
import { BackButton, ModuleIntro } from './common';

type CardContent = { icon: string; titleEn: string; titleHi: string; bodyEn: string; bodyHi: string };

const CARDS: CardContent[] = [
  {
    icon: '⚗️',
    titleEn: 'What is Rasa Shastra?',
    titleHi: 'रस शास्त्र क्या है?',
    bodyEn: 'Rasa Shastra (Indian Alchemy) is the ancient Vedic and Tantric science of transmutation. It blends chemistry with spirituality: practitioners sought not only metallic transformation but also longevity, rejuvenation, and liberation. The word "Rasa" means essence, mercury, or the vital fluid; "Shastra" means science or discipline. This tradition flourished in medieval India and is documented in classical Sanskrit texts.',
    bodyHi: 'रस शास्त्र प्राचीन वैदिक एवं तांत्रिक विज्ञान है जिसमें रासायनिक परिवर्तन के साथ आध्यात्मिक लक्ष्य जुड़े हैं। "रस" का अर्थ सार, पारद या जीवन रस है; "शास्त्र" विज्ञान या विधि। यह परंपरा मध्यकालीन भारत में फली-फूली और संस्कृत ग्रंथों में दर्ज है।',
  },
  {
    icon: '🩺',
    titleEn: 'Parada (Mercury)',
    titleHi: 'पारद (पारा)',
    bodyEn: 'Parada (mercury) is considered the king of metals in Rasa Shastra. Classical texts describe elaborate methods of purification (shodhana) and processing so that mercury could be used in formulations. Symbolically, Parada represents the fluid mind and consciousness; its "fixing" (stambhana) was seen as stabilising the mind for higher states. Practitioners never used raw mercury—only heavily processed and combined forms, under strict discipline.',
    bodyHi: 'रस शास्त्र में पारद को धातुओं का राजा माना गया है। ग्रंथों में शुद्धिकरण (शोधन) और संस्कार की विधियाँ वर्णित हैं। प्रतीकात्मक रूप से पारद चंचल मन और चेतना का प्रतीक है; उसका "स्थिरीकरण" मन को ऊँची अवस्थाओं के लिए स्थिर करना माना जाता था। कच्चे पारे का प्रयोग नहीं किया जाता था—केवल शोधित एवं युक्त रूप।',
  },
  {
    icon: '🟡',
    titleEn: 'Gandhaka (Sulphur)',
    titleHi: 'गंधक (सल्फर)',
    bodyEn: 'Gandhaka (sulphur) is the key partner to Parada in classical formulations. Texts describe its purification and combination with mercury to form various compounds (e.g., Kajjali, a black sulphide). Gandhaka is said to "fix" mercury and make it suitable for further processing. In symbolic terms, it represents the binding or grounding force that works with the fluid nature of mercury. Processing was always done under strict protocols and over many stages.',
    bodyHi: 'गंधक पारद का मुख्य साथी है। ग्रंथों में इसका शोधन और पारद के साथ मिश्रण (जैसे कज्जली) वर्णित है। गंधक पारद को "स्थिर" करने वाला माना गया है। प्रतीकात्मक रूप में यह बंधन या स्थिरता का प्रतीक है। प्रक्रियाएँ कड़े नियमों और कई चरणों में की जाती थीं।',
  },
  {
    icon: '🌿',
    titleEn: 'Rasayana – Longevity & Healing',
    titleHi: 'रसायन – दीर्घायु और उपचार',
    bodyEn: 'Rasayana formulations aim at longevity (ayu), rejuvenation (vayah-sthapana), and healing. They often combine minerals, metals (after processing), and herbs. Classical goals included strengthening the body, sharpening the mind, and preparing the system for spiritual practice. Many recipes are described in Rasa Ratna Samucchaya and similar texts. Modern interest often focuses on the herbal and wellness-oriented aspects rather than metallic preparations.',
    bodyHi: 'रसायन का उद्देश्य आयु बढ़ाना, काया को स्थिर रखना और रोग निवारण है। इनमें धातु (संस्कार के बाद), खनिज और जड़ी-बूटियाँ मिलाई जाती थीं। रस रत्न समुच्चय आदि ग्रंथों में अनेक विधियाँ मिलती हैं। आधुनिक रुचि अक्सर जड़ी-बूटी और स्वास्थ्य पक्ष में है।',
  },
  {
    icon: '🧘',
    titleEn: 'Sadhana – The Spiritual Foundation',
    titleHi: 'साधना – आध्यात्मिक आधार',
    bodyEn: 'Without Sadhana (spiritual discipline), alchemy was considered mere chemistry. Practitioners were expected to follow ethical codes, mantra, and meditation so that the inner transformation matched the outer. The idea was that processing metals was parallel to purifying the mind; both required patience, purity, and guidance. This link between laboratory work and spiritual practice is what distinguishes Rasa Shastra from later Western alchemy in emphasis.',
    bodyHi: 'साधना के बिना रस विद्या को केवल रसायन विज्ञान माना गया। साधक से नैतिक आचरण, मंत्र और ध्यान की अपेक्षा थी ताकि बाह्य और आंतरिक परिवर्तन साथ चलें। धातु का संस्कार मन की शुद्धि के समान्तर माना गया। यही कड़ी रस शास्त्र को पश्चिमी रसायन से अलग करती है।',
  },
  {
    icon: '📜',
    titleEn: 'Key Texts',
    titleHi: 'मुख्य ग्रंथ',
    bodyEn: 'Rasa Ratna Samucchaya (compiled around 13th–14th century) and Rasaratnakara are among the most cited texts. They describe classification of substances, equipment, processes (shodhana, marana, etc.), and formulations. Other important works include Rasa Hridaya Tantra and Rasa Prakasha Sudhakara. These texts blend material recipes with philosophical and Tantric concepts; they were meant for trained practitioners under a guru.',
    bodyHi: 'रस रत्न समुच्चय (लगभग 13–14वीं शताब्दी) और रसरत्नाकर सर्वाधिक उद्धृत ग्रंथ हैं। इनमें द्रव्यों का वर्गीकरण, उपकरण, प्रक्रियाएँ (शोधन, मारण आदि) और नुस्खे मिलते हैं। रस हृदय तंत्र, रस प्रकाश सुधाकर आदि भी महत्वपूर्ण हैं। ये ग्रंथ गुरु के मार्गदर्शन में प्रशिक्षित साधकों के लिए थे।',
  },
  {
    icon: '✨',
    titleEn: 'Modern & Philosophical View',
    titleHi: 'आधुनिक और दार्शनिक दृष्टि',
    bodyEn: 'Today, interest in Rasa Shastra is largely historical, philosophical, and wellness-oriented. Scholars study it for its place in the history of chemistry and medicine. The emphasis on mind–body harmony, discipline, and the symbolism of transformation continues to inspire. Herbal Rasayana and lifestyle practices derived from these ideas are explored in integrative health. The metallic and mineral preparations described in old texts are not used as prescription in modern medicine.',
    bodyHi: 'आज रस शास्त्र में रुचि मुख्यतः ऐतिहासिक, दार्शनिक और स्वास्थ्य केंद्रित है। मन–शरीर सामंजस्य, अनुशासन और परिवर्तन का प्रतीकवाद आज भी प्रेरणा देता है। जड़ी-बूटी आधारित रसायन और जीवनशैली इन विचारों से जुड़ी हैं। प्राचीन धात्विक नुस्खे आधुनिक चिकित्सा में नहीं अपनाए जाते।',
  },
  {
    icon: '⚠️',
    titleEn: 'A Note on Safety',
    titleHi: 'सुरक्षा पर नोट',
    bodyEn: 'Historical Rasa Shastra involved mercury, sulphur, and other substances. Raw or improperly processed metals and minerals can be harmful. This module is for education and cultural insight only. Do not attempt any classical metallic or mineral preparations at home. For health and wellness, always rely on qualified practitioners and evidence-based medicine.',
    bodyHi: 'ऐतिहासिक रस शास्त्र में पारद, गंधक आदि पदार्थ शामिल थे। कच्चे या गलत तरीके से संस्कृत धातु/खनिज हानिकारक हो सकते हैं। यह मॉड्यूल केवल शिक्षा और सांस्कृतिक ज्ञान के लिए है। घर पर किसी भी धात्विक/खनिज नुस्खे को आजमाएँ नहीं। स्वास्थ्य के लिए हमेशा योग्य चिकित्सक और विज्ञान-आधारित चिकित्सा पर निर्भर रहें।',
  },
];

/** Card layout: grid with items-stretch so every card in a row has the same height; each card is flex flex-col h-full. */
function RasaCard({ content, isHi }: { content: CardContent; isHi: boolean }) {
  const title = isHi ? content.titleHi : content.titleEn;
  const body = isHi ? content.bodyHi : content.bodyEn;
  return (
    <div className="h-full flex flex-col rounded-xl border border-slate-600/50 bg-slate-800/40 overflow-visible p-5">
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <span className="text-2xl">{content.icon}</span>
        <h3 className="font-serif font-bold text-amber-200 text-lg break-words">{title}</h3>
      </div>
      <div className="flex-1 min-h-0 text-slate-300 text-sm leading-relaxed break-words overflow-visible">
        {body}
      </div>
    </div>
  );
}

interface RasaShastraProps {
  language: Language;
  onBack?: () => void;
}

export default function RasaShastra({ language, onBack }: RasaShastraProps) {
  const isHi = language === 'hi';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-fade-in-up">
      <div className="bg-slate-900/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 md:p-8 shadow-2xl">
        {onBack && (
          <div className="mb-6">
            <BackButton onClick={onBack} label={isHi ? 'वापस' : 'Back'} />
          </div>
        )}

        <ModuleIntro
          language={language}
          subtitleEn="Rasa Shastra – Indian alchemy and Rasayana; Parada, Gandhaka, metals and spiritual practice."
          subtitleHi="रस शास्त्र – भारतीय रसायन और रसायन; पारद, गंधक, धातु और साधना।"
          descriptionEn="Ancient Vedic and Tantric science of transmutation. Read about key concepts for knowledge and insight; not for practical preparation."
          descriptionHi="वैदिक एवं तांत्रिक रसायन विज्ञान। ज्ञान के लिए मुख्य अवधारणाएं; व्यावहारिक तैयारी के लिए नहीं।"
        />
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold block mb-2">
            {isHi ? 'रस शास्त्र' : 'Rasa Shastra'}
          </span>
          <h1 className="text-3xl md:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-br from-amber-100 to-amber-400">
            {isHi ? 'भारतीय रसायन विद्या' : 'Indian Alchemy'}
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl mx-auto break-words">
            {isHi
              ? 'वैदिक एवं तांत्रिक रसायन विज्ञान — पारद, गंधक, रसायन और साधना का संगम। ज्ञान और अंतर्दृष्टि के लिए पढ़ें।'
              : 'Ancient Vedic and Tantric science of transmutation — Parada, Gandhaka, Rasayana, and Sadhana. Read for knowledge and insight.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          {CARDS.map((card, i) => (
            <RasaCard key={i} content={card} isHi={isHi} />
          ))}
        </div>

        <div className="mt-8">
          <ModuleAskAI
            language={language}
            moduleName={isHi ? 'रस शास्त्र' : 'Rasa Shastra'}
            contextStr="You are an expert in Rasa Shastra (Indian Alchemy) and related traditions. Answer about Parada (mercury), Gandhaka (sulphur), Rasayana formulations, key texts like Rasa Ratna Samucchaya and Rasaratnakara, the role of Sadhana, and the philosophical and wellness aspects. Keep answers educational and respectful. Do not encourage any practical use of metallic or mineral preparations; emphasize historical and cultural context only."
          />
        </div>
      </div>
    </div>
  );
}
