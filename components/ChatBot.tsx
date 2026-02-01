import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../utils/translations';
import { Language } from '../types';
import { createChatSession, askRishiWithFallback } from '../services/geminiService';
import { GenerateContentResponse, Chat } from '@google/genai';
import AdBanner from './AdBanner';
import RichText from './RichText';

interface ChatBotProps {
  language: Language;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  sources?: { title: string, uri: string }[];
}

const ChatBot: React.FC<ChatBotProps> = ({ language }) => {
  const t = useTranslation(language);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Chat Session
  useEffect(() => {
    chatSessionRef.current = createChatSession(language);
    setMessages([{ role: 'model', text: t.chatWelcome }]);
  }, [language, t]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);
    setIsSearching(false);

    try {
      // TIER 1: Standard Streamed Chat
      if (!chatSessionRef.current) throw new Error("No session");
      
      const resultStream = await chatSessionRef.current.sendMessageStream({ message: userMsg });
      let fullResponse = "";
      setMessages(prev => [...prev, { role: 'model', text: "" }]);

      for await (const chunk of resultStream) {
        const chunkText = (chunk as GenerateContentResponse).text;
        if (chunkText) {
          fullResponse += chunkText;
          setMessages(prev => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1] = { role: 'model', text: fullResponse };
            return newMsgs;
          });
        }
      }
    } catch (error) {
      console.warn("Switching to internet fallback...");
      setIsSearching(true);
      try {
        // TIER 2: Internet Retrieval Fallback
        const result = await askRishiWithFallback(userMsg, language);
        setMessages(prev => {
            const newMsgs = [...prev];
            // If the last model message was an empty stub from the failed stream, overwrite it
            if (newMsgs[newMsgs.length-1].role === 'model' && !newMsgs[newMsgs.length-1].text) {
                newMsgs[newMsgs.length-1] = { role: 'model', text: result.text, sources: result.sources };
            } else {
                newMsgs.push({ role: 'model', text: result.text, sources: result.sources });
            }
            return newMsgs;
        });
      } catch (e2) {
          // TIER 3: Complete Offline/API Outage
          setMessages(prev => [...prev, { 
              role: 'model', 
              text: language === 'hi' 
                ? "ब्रह्मांड के संकेत धुंधले हैं। क्या आप सीधे इंटरनेट पर खोजना चाहेंगे?" 
                : "The cosmic signals are faint. Would you like to search the internet directly?"
          }]);
      }
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const GoogleSearchButton = ({ query }: { query: string }) => (
    <a 
      href={`https://www.google.com/search?q=${encodeURIComponent(query + " " + (language === 'hi' ? 'ज्योतिष' : 'astrology'))}`}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-xl transition-all hover:scale-105 active:scale-95"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-2.21 5.39-7.84 5.39-4.84 0-8.79-4.01-8.79-8.96s3.95-8.96 8.79-8.96c2.75 0 4.59 1.17 5.65 2.18l2.58-2.48C19.1 1.05 16.03 0 12.48 0 5.58 0 0 5.58 0 12.48s5.58 12.48 12.48 12.48c7.2 0 11.97-5.06 11.97-12.18 0-.82-.09-1.44-.21-2.07l-11.76-.01z"/></svg>
      Search Global Wisdom
    </a>
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-12 animate-fade-in-up h-[80vh] flex flex-col">
      <div className="bg-slate-800/80 backdrop-blur-md border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden flex-1 flex flex-col relative">
        
        {/* Header */}
        <div className="bg-slate-900/90 p-4 border-b border-purple-500/30 flex items-center justify-between z-10">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-900/50 border border-purple-500/50 flex items-center justify-center text-xl">
                 🧙‍♂️
              </div>
              <div>
                 <h2 className="text-lg font-serif text-purple-200">{t.chatTitle}</h2>
                 <p className="text-xs text-slate-400">{isSearching ? (language === 'hi' ? 'इंटरनेट से खोज रहे हैं...' : 'Retrieving from internet...') : t.chatSubtitle}</p>
              </div>
           </div>
           <button 
             onClick={() => {
                chatSessionRef.current = createChatSession(language);
                setMessages([{ role: 'model', text: t.chatWelcome }]);
             }}
             className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
             title="Reset Chat"
           >
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
           </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/30">
           {messages.map((msg, idx) => (
             <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[90%] md:max-w-[70%] p-4 rounded-2xl text-sm md:text-base leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-purple-600 text-white rounded-br-none' 
                      : 'bg-slate-700/80 text-slate-200 border border-slate-600 rounded-bl-none'
                  }`}
                >
                   <RichText text={msg.text} />
                   
                   {/* Fallback Search Button */}
                   {msg.role === 'model' && msg.text.includes("directly?") && (
                      <div className="flex flex-col items-center">
                          <GoogleSearchButton query={messages[idx-1]?.text || "astrology"} />
                      </div>
                   )}

                   {/* Grounding Sources */}
                   {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-600/50">
                         <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Sources of Wisdom:</h4>
                         <div className="flex flex-col gap-2">
                           {msg.sources.map((s, si) => (
                             <a key={si} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[11px] text-amber-400 hover:text-amber-200 hover:underline transition-colors truncate">
                               <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                               {s.title}
                             </a>
                           ))}
                         </div>
                      </div>
                   )}
                </div>
             </div>
           ))}
           {isLoading && (
              <div className="flex justify-start">
                 <div className="bg-slate-700/50 p-3 rounded-2xl rounded-bl-none flex gap-2 items-center">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></span>
                 </div>
              </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="bg-slate-900 p-4 border-t border-slate-700 flex gap-2 relative z-20">
           <input 
             type="text" 
             value={input}
             onChange={(e) => setInput(e.target.value)}
             placeholder={t.chatPlaceholder}
             disabled={isLoading}
             className="flex-1 bg-slate-800 border border-slate-600 rounded-full px-6 py-3 text-slate-200 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
           />
           <button 
             type="submit" 
             disabled={!input.trim() || isLoading}
             className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
           >
             <svg className="w-6 h-6 transform rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
           </button>
        </form>

      </div>
    </div>
  );
};

export default ChatBot;