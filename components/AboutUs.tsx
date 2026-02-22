import React from 'react';
import { Language } from '../types';
import Logo from './Logo';

interface AboutUsProps {
  language: Language;
  onBack?: () => void;
}

export default function AboutUs({ language }: AboutUsProps) {
  const isHi = language === 'hi';
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 animate-fade-in-up">
      <div className="bg-slate-900/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 md:p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Logo className="w-14 h-14 animate-spin-slow" />
          <div>
            <h1 className="text-2xl font-serif font-bold text-amber-200">CosmicJyoti</h1>
            <p className="text-slate-400 text-sm">{isHi ? 'जहाँ आकाश साधक से मिलता है' : 'Where the Heavens Meet the Seeker'}</p>
          </div>
        </div>
        <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>
            {isHi
              ? 'CosmicJyoti आपके लिए वैदिक ज्योतिष, कुंडली, राशिफल, पंचांग, गुण मिलान और अधिक लाता है। हम सटीक गणना और AI-सहायता प्रदान करते हैं।'
              : 'CosmicJyoti brings Vedic astrology, Kundali, horoscope, Panchang, Guna Milan, and more to your fingertips. We provide accurate calculations and AI-assisted insights.'}
          </p>
          <p>
            {isHi
              ? 'हमारा लक्ष्य ज्योतिष को सुलभ, शैक्षिक और मनोरंजक बनाना है। महत्वपूर्ण निर्णयों के लिए योग्य ज्योतिषी से परामर्श लें।'
              : 'Our goal is to make astrology accessible, educational, and engaging. Consult a qualified astrologer for important decisions.'}
          </p>
        </div>
      </div>
    </div>
  );
}
