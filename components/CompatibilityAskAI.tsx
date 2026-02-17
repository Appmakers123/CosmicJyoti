import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { askRishiWithFallback } from '../services/geminiService';
import RichText from './RichText';
import DownloadAppForAICta from './common/DownloadAppForAICta';
import { isCapacitor } from '../utils/linkHandler';
import admobService from '../services/admobService';
interface CompatibilityResult {
  personA: { name: string; sign: string; nakshatra: string; lifePath: number; gender?: string };
  personB: { name: string; sign: string; nakshatra: string; lifePath: number; gender?: string };
  scores: { sign: number; nakshatra: number; numerology: number; overall: number };
  ashtakoota?: any;
  report: string;
}

interface CompatibilityAskAIProps {
  result: CompatibilityResult;
  language: Language;
}

interface QAMessage {
  role: 'user' | 'model';
  text: string;
  showDownloadCta?: boolean;
}

const CompatibilityAskAI: React.FC<CompatibilityAskAIProps> = ({ result, language }) => {
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const askThenShowAd = async (question: string) => {
    setMessages(prev => [...prev, { role: 'user', text: question }]);
    setIsLoading(true);
    try {
      const aiResult = await askRishiWithFallback(question, language, contextStr, 'love');
      setMessages(prev => [...prev, { role: 'model', text: aiResult.text || '' }]);
      if (isCapacitor()) admobService.showInterstitialDelayed(3500);
    } catch (error) {
      const errMsg = language === 'hi'
        ? 'यहाँ AI उपलब्ध नहीं है। पूर्ण AI सुविधाओं के लिए ऐप डाउनलोड करें।'
        : "AI isn't available here. Download the app to use full AI features.";
      setMessages(prev => [...prev, { role: 'model', text: errMsg, showDownloadCta: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const contextStr = [
    `Person A: ${result.personA.name}${result.personA.gender ? ` (${result.personA.gender})` : ''}, Sign: ${result.personA.sign}, Nakshatra: ${result.personA.nakshatra}, Life Path: ${result.personA.lifePath}`,
    `Person B: ${result.personB.name}${result.personB.gender ? ` (${result.personB.gender})` : ''}, Sign: ${result.personB.sign}, Nakshatra: ${result.personB.nakshatra}, Life Path: ${result.personB.lifePath}`,
    `Compatibility: Overall ${result.scores.overall}%, Sign ${result.scores.sign}%, Nakshatra ${result.scores.nakshatra}%, Numerology ${result.scores.numerology}%`,
    result.ashtakoota?.total ? `Ashtakoota: ${result.ashtakoota.total.obtained_points}/${result.ashtakoota.total.maximum_points}` : '',
    result.report ? `Report summary: ${result.report.substring(0, 500)}...` : '',
  ].filter(Boolean).join('. ');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAskClick = () => {
    const question = input.trim().substring(0, 2000);
    if (!question) return;
    if (isLoading) return;
    setInput('');
    askThenShowAd(question);
  };

  const askTitle = language === 'hi' ? 'संगतता पर प्रश्न पूछें' : 'Ask about your compatibility';
  const askSubtitle = language === 'hi'
    ? 'रिशि AI से अपनी संगतता के बारे में प्रश्न पूछें'
    : 'Ask Rishi AI your questions about your compatibility';
  const askPlaceholder = language === 'hi'
    ? 'प्रश्न टाइप करें (उदा: हमारे रिश्ते में क्या चुनौतियाँ आ सकती हैं?)'
    : 'Type your question (e.g. What challenges might we face in our relationship?)';
  const askButton = language === 'hi' ? 'प्रश्न पूछें' : 'Ask Question';

  return (
    <>
      <div className="bg-slate-800/60 border border-pink-500/30 rounded-2xl p-6">
        <h3 className="text-pink-400 font-serif mb-4 text-xl flex items-center gap-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {askTitle}
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          {askSubtitle}
        </p>

        {messages.length > 0 && (
          <div className="space-y-4 mb-4 max-h-[320px] overflow-y-auto custom-scrollbar pr-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
              >
                <div
                  className={`max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-pink-600 to-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-900/60 border border-slate-700/50 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <RichText text={msg.text} />
                  {msg.showDownloadCta && (
                    <DownloadAppForAICta language={language} accentColor="pink" />
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-slate-900/60 p-4 rounded-2xl rounded-bl-none border border-slate-700/50 flex gap-2 items-center">
                  <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span className="text-xs text-slate-500 ml-2">
                    {language === 'hi' ? 'रिशि विचार कर रहे हैं...' : 'Rishi is consulting...'}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskClick();
          }}
          className="flex gap-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={askPlaceholder}
            className="flex-1 bg-slate-950 border border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:border-pink-500/50 focus:outline-none focus:ring-1 focus:ring-pink-500/50 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-5 py-3 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all active:scale-95"
          >
            {askButton}
          </button>
        </form>
      </div>
    </>
  );
};

export default CompatibilityAskAI;
