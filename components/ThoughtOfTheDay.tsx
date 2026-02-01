import React from 'react';
import { Language } from '../types';

interface ThoughtOfTheDayProps {
  language: Language;
}

interface GitaQuote {
  en: string;
  hi: string;
  chapter: string;
  verse: string;
}

const GITA_QUOTES: GitaQuote[] = [
  {
    en: "You have the right to perform your prescribed duty, but you are not entitled to the fruits of your actions.",
    hi: "आपको अपने निर्धारित कर्तव्य का पालन करने का अधिकार है, लेकिन आप अपने कर्मों के फल के हकदार नहीं हैं।",
    chapter: "Chapter 2",
    verse: "Verse 47"
  },
  {
    en: "The soul is neither born, and nor does it die. It is unborn, eternal, ever-existing, and primeval.",
    hi: "आत्मा न तो कभी जन्म लेती है और न ही मरती है। यह अजन्मा, शाश्वत, सदा विद्यमान और प्राचीन है।",
    chapter: "Chapter 2",
    verse: "Verse 20"
  },
  {
    en: "When meditation is mastered, the mind is unwavering like the flame of a lamp in a windless place.",
    hi: "जब ध्यान में निपुणता प्राप्त हो जाती है, तो मन बिना हवा वाली जगह पर दीपक की लौ की तरह अटल हो जाता है।",
    chapter: "Chapter 6",
    verse: "Verse 19"
  },
  {
    en: "One who sees inaction in action, and action in inaction, is intelligent among men.",
    hi: "जो व्यक्ति कर्म में अकर्म देखता है और अकर्म में कर्म देखता है, वह मनुष्यों में बुद्धिमान है।",
    chapter: "Chapter 4",
    verse: "Verse 18"
  },
  {
    en: "The mind is restless, turbulent, obstinate and very strong. To subdue it is more difficult than controlling the wind.",
    hi: "मन चंचल, अशांत, जिद्दी और बहुत मजबूत है। इसे वश में करना हवा को नियंत्रित करने से भी कठिन है।",
    chapter: "Chapter 6",
    verse: "Verse 34"
  },
  {
    en: "Whatever you do, whatever you eat, whatever you offer or give away, and whatever austerities you perform—do that as an offering to Me.",
    hi: "जो कुछ भी आप करते हैं, जो कुछ भी आप खाते हैं, जो कुछ भी आप अर्पित करते हैं या दान करते हैं, और जो भी तपस्या आप करते हैं—वह सब मुझे अर्पित करें।",
    chapter: "Chapter 9",
    verse: "Verse 27"
  },
  {
    en: "I am the source of all spiritual and material worlds. Everything emanates from Me.",
    hi: "मैं सभी आध्यात्मिक और भौतिक संसारों का स्रोत हूँ। सब कुछ मुझसे ही प्रवाहित होता है।",
    chapter: "Chapter 10",
    verse: "Verse 8"
  },
  {
    en: "The wise see knowledge and action as one; they see truly.",
    hi: "बुद्धिमान ज्ञान और कर्म को एक समान देखते हैं; वे सच्चाई से देखते हैं।",
    chapter: "Chapter 4",
    verse: "Verse 33"
  },
  {
    en: "Set your heart upon your work, but never on its reward.",
    hi: "अपना मन अपने काम पर लगाएं, लेकिन कभी भी उसके फल पर नहीं।",
    chapter: "Chapter 2",
    verse: "Verse 47"
  },
  {
    en: "The soul can never be cut to pieces by any weapon, nor burned by fire, nor moistened by water, nor withered by the wind.",
    hi: "आत्मा को कभी भी किसी हथियार से काटा नहीं जा सकता, न ही आग से जलाया जा सकता है, न ही पानी से भिगोया जा सकता है, और न ही हवा से सूखाया जा सकता है।",
    chapter: "Chapter 2",
    verse: "Verse 23"
  },
  {
    en: "Be steadfast in yoga, O Arjuna. Perform your duty and abandon all attachment to success or failure.",
    hi: "हे अर्जुन, योग में दृढ़ रहें। अपना कर्तव्य निभाएं और सफलता या असफलता से सभी लगाव त्याग दें।",
    chapter: "Chapter 2",
    verse: "Verse 48"
  },
  {
    en: "The Supreme Lord is situated in everyone's heart, O Arjuna, and is directing the wanderings of all living entities.",
    hi: "हे अर्जुन, परम भगवान सभी के हृदय में स्थित हैं और सभी जीवों की यात्रा का निर्देशन कर रहे हैं।",
    chapter: "Chapter 18",
    verse: "Verse 61"
  },
  {
    en: "For one who has conquered the mind, the mind is the best of friends; but for one who has failed to do so, the mind will be the greatest enemy.",
    hi: "जिसने मन को जीत लिया है, उसके लिए मन सबसे अच्छा मित्र है; लेकिन जो ऐसा करने में असफल रहा है, उसके लिए मन सबसे बड़ा शत्रु होगा।",
    chapter: "Chapter 6",
    verse: "Verse 6"
  },
  {
    en: "The soul is eternal, all-pervading, unmodifiable, immovable and primordial.",
    hi: "आत्मा शाश्वत, सर्वव्यापी, अपरिवर्तनीय, अचल और प्राचीन है।",
    chapter: "Chapter 2",
    verse: "Verse 24"
  },
  {
    en: "One who is not disturbed in mind even amidst the threefold miseries, who is not elated when there is happiness, and who is free from attachment, fear and anger, is called a sage of steady mind.",
    hi: "जो तीन प्रकार के दुखों के बीच भी मन में व्याकुल नहीं होता, जो सुख होने पर उत्साहित नहीं होता, और जो लगाव, भय और क्रोध से मुक्त है, उसे स्थिर मन वाला ऋषि कहा जाता है।",
    chapter: "Chapter 2",
    verse: "Verse 56"
  }
];

// Get quote of the day based on date
const getQuoteOfTheDay = (): GitaQuote => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % GITA_QUOTES.length;
  return GITA_QUOTES[index];
};

const ThoughtOfTheDay: React.FC<ThoughtOfTheDayProps> = ({ language }) => {
  const quote = getQuoteOfTheDay();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 animate-fade-in">
      <div className="bg-gradient-to-br from-amber-900/20 via-purple-900/20 to-slate-900/40 border border-amber-500/30 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center">
              <span className="text-2xl md:text-3xl">📿</span>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm md:text-base font-serif font-bold text-amber-300 uppercase tracking-wider">
                {language === 'hi' ? 'आज का विचार' : 'Thought of the Day'}
              </h3>
              <div className="h-px flex-1 bg-amber-500/30"></div>
            </div>
            <blockquote className="text-base md:text-lg lg:text-xl text-slate-200 leading-relaxed font-light italic">
              {language === 'hi' ? quote.hi : quote.en}
            </blockquote>
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs md:text-sm text-amber-400/70 font-serif">
                {language === 'hi' ? '— श्रीमद्भगवद्गीता' : '— Bhagavad Gita'}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                {quote.chapter} • {quote.verse}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThoughtOfTheDay;

