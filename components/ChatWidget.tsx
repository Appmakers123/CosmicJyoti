
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../utils/translations';
import { Language, KundaliResponse } from '../types';
import { createChatSession, askRishiWithFallback, type AstrologerPersona } from '../services/geminiService';
import { GenerateContentResponse, Chat } from '@google/genai';
import RichText from './RichText';
import DownloadAppForAICta from './common/DownloadAppForAICta';
import { canSendMessage, getRemainingMessages, incrementChatUsage, getMessageLimit } from '../utils/chatLimitService';

interface ChatWidgetProps {
  language: Language;
  context?: KundaliResponse | null;
  onUseKarma: () => boolean;
  hasKarma: boolean;
  onOpenStore: () => void;
  isPremium?: boolean;
  onUpgrade?: () => void;
  onWatchAdForChat?: () => void;
  refreshTrigger?: number; // Increment to refresh remaining messages (e.g. after watching ad)
}

interface Message {
  role: 'user' | 'model';
  text: string;
  sources?: { title: string, uri: string }[];
  isFallback?: boolean;
  showDownloadCta?: boolean;
}

const QUICK_CHIPS: Record<Language, string[]> = {
  en: ["What do the stars say about my career?", "Seek guidance on relationships", "Upaya — remedies for stress", "What is my spiritual path?"],
  hi: ["तारे मेरे करियर के बारे में क्या कहते हैं?", "संबंधों पर मार्गदर्शन चाहिए", "तनाव के उपाय — उपाय", "मेरा आध्यात्मिक पथ क्या है?"],
};

const ChatWidget: React.FC<ChatWidgetProps> = ({ language, context, isPremium = false, onUpgrade, onWatchAdForChat, refreshTrigger = 0 }) => {
  const t = useTranslation(language);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [remainingMessages, setRemainingMessages] = useState(getRemainingMessages(isPremium));
  const [needsDOB, setNeedsDOB] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [responseType, setResponseType] = useState<'general' | 'detailed' | null>(null);
  const [persona, setPersona] = useState<AstrologerPersona>('general');

  const contextStringRef = useRef("");
  const lastLanguageRef = useRef<Language | null>(null);
  const lastContextIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Only initialize when language or context actually changes
    let contextStr = "";
    const contextId = context ? `${context.basicDetails.name}-${context.basicDetails.ascendant}` : 'no-context';
    
    // Check if we need to reinitialize
    if (
      lastLanguageRef.current === language &&
      lastContextIdRef.current === contextId &&
      chatSessionRef.current
    ) {
      return; // Skip if already initialized with same language and context
    }
    
    if (context) {
        contextStr = `User: ${context.basicDetails.name}, Asc: ${context.basicDetails.ascendant}, Rashi: ${context.basicDetails.moonSign}. Current Dasha: ${context.dasha.currentMahadasha}.`;
    }
    
    contextStringRef.current = contextStr;
    chatSessionRef.current = createChatSession(language, contextStr, persona);
    
    // Get translations directly to avoid dependency on t object
    const initialMessage = context ? t.chartLoadedMessage : t.chatWelcome;

    setMessages([{ role: 'model', text: initialMessage }]);
    
    // Update refs to track current state
    lastLanguageRef.current = language;
    lastContextIdRef.current = contextId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, context, persona]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [messages, isOpen, isLoading]);

  // Update remaining messages when premium status or refresh trigger changes
  useEffect(() => {
    setRemainingMessages(getRemainingMessages(isPremium));
  }, [isPremium, refreshTrigger]);

  // Detect if question is personal and needs DOB
  const isPersonalQuestion = (question: string): boolean => {
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return false;
    }
    const personalKeywords = [
      'job', 'career', 'work', 'meri job', 'mera career', 'naukri',
      'health', 'swasthya', 'bimari', 'disease', 'illness',
      'marriage', 'shadi', 'vivah', 'spouse', 'patni', 'pati',
      'money', 'paisa', 'wealth', 'dhan', 'income', 'kamai',
      'future', 'bhavishya', 'aage', 'aane wala', 'upcoming',
      'problem', 'samasya', 'issue', 'dikkat', 'trouble'
    ];
    const lowerQuestion = question.toLowerCase().trim();
    return personalKeywords.some(keyword => lowerQuestion.includes(keyword));
  };

  // Validate DOB format (DD/MM/YYYY or DD-MM-YYYY)
  const isValidDOBFormat = (dob: string): boolean => {
    if (!dob || typeof dob !== 'string') return false;
    const trimmed = dob.trim();
    // Check for DD/MM/YYYY or DD-MM-YYYY format
    const datePattern = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
    if (!datePattern.test(trimmed)) return false;
    
    const parts = trimmed.split(/[\/\-]/);
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    // Basic validation
    if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
    if (day < 1 || day > 31) return false;
    if (month < 1 || month > 12) return false;
    if (year < 1900 || year > new Date().getFullYear()) return false;
    
    return true;
  };

  const handleSend = async (msgOverride?: string) => {
    const userMsg = (msgOverride || input.trim()).substring(0, 2000); // Limit message length
    if (!userMsg || userMsg.length === 0) {
      // Don't send empty messages
      return;
    }
    
    // Prevent sending if already loading
    if (isLoading) {
      return;
    }

    // Check if user can send message
    if (!canSendMessage(isPremium)) {
      const limitMsg = isPremium 
        ? t.chatLimitReached 
        : (language === 'hi' 
          ? `आज के ${getMessageLimit(isPremium)} मुफ्त संदेश पूरे। विज्ञापन देखकर 5 और प्राप्त करें या प्रीमियम लें।`
          : `You've used all ${getMessageLimit(isPremium)} free messages today. Watch ad for 5 more or upgrade to premium.`);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: limitMsg
      }]);
      if (!isPremium && onWatchAdForChat) {
        onWatchAdForChat();
      } else if (onUpgrade) {
        setTimeout(() => onUpgrade(), 2000);
      }
      return;
    }

    // Check if this is a personal question and DOB is needed
    if (isPersonalQuestion(userMsg) && !context && !needsDOB && !responseType) {
      setPendingQuestion(userMsg);
      setNeedsDOB(true);
      setInput('');
        setMessages(prev => [...prev, 
        { role: 'user', text: userMsg },
        { 
          role: 'model', 
          text: t.personalQuestionPrompt
        }
      ]);
      return;
    }

    // Handle DOB input
    if (needsDOB) {
      // Check if it's a date format or response type selection
      if (userMsg.toLowerCase().includes('general') || userMsg.toLowerCase().includes('सामान्य')) {
        setResponseType('general');
        setNeedsDOB(false);
        // Continue with general response
        const question = pendingQuestion || userMsg;
        setPendingQuestion(null);
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: t.generalInfo }]);
        setIsLoading(true);
        // Process with general context
        try {
          if (!chatSessionRef.current) throw new Error("No session");
          const enhancedQuestion = `${question} (${t.generalInfoPrompt})`;
          const resultStream = await chatSessionRef.current.sendMessageStream({ message: enhancedQuestion });
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
          const fallbackResult = await askRishiWithFallback(question, language, '');
          setMessages(prev => [...prev, { role: 'model', text: fallbackResult.text, isFallback: true }]);
        } finally {
          setIsLoading(false);
        }
        return;
      } else if (userMsg.toLowerCase().includes('detailed') || userMsg.toLowerCase().includes('विस्तृत')) {
        setResponseType('detailed');
        setNeedsDOB(true); // Still need DOB for detailed
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: t.detailedAnalysisPrompt
        }]);
        setInput('');
        return;
      } else {
        // Validate DOB format
        if (!isValidDOBFormat(userMsg)) {
          setMessages(prev => [...prev, 
            { role: 'user', text: userMsg },
            { 
              role: 'model', 
              text: language === 'hi' 
                ? "कृपया सही तारीख प्रारूप दर्ज करें (DD/MM/YYYY या DD-MM-YYYY)। उदाहरण: 15/08/1990"
                : "Please enter a valid date format (DD/MM/YYYY or DD-MM-YYYY). Example: 15/08/1990"
            }
          ]);
          setInput('');
          return;
        }
        
        // Assume it's valid DOB input
        setNeedsDOB(false);
        const question = pendingQuestion || userMsg;
        if (!question || question.trim().length === 0) {
          // If no pending question, just acknowledge DOB
          setMessages(prev => [...prev, 
            { role: 'user', text: `DOB: ${userMsg}` },
            { 
              role: 'model', 
              text: language === 'hi' 
                ? "धन्यवाद! अब आप अपना प्रश्न पूछ सकते हैं।"
                : "Thank you! Now you can ask your question."
            }
          ]);
          setPendingQuestion(null);
          setInput('');
          setIsLoading(false);
          return;
        }
        
        setPendingQuestion(null);
        // Continue with DOB context
        const dobContext = `User's DOB: ${userMsg}. ${question}`;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: `DOB: ${userMsg}` }]);
        setIsLoading(true);
        try {
          // Recreate session with DOB context if needed
          if (!chatSessionRef.current) {
            chatSessionRef.current = createChatSession(language, dobContext, persona);
          } else {
            // Update context for existing session
            chatSessionRef.current = createChatSession(language, dobContext, persona);
          }
          
          const enhancedQuestion = `${question} (User's DOB: ${userMsg}. Provide personalized, conversational answer)`;
          const resultStream = await chatSessionRef.current.sendMessageStream({ message: enhancedQuestion });
          let fullResponse = "";
          setMessages(prev => [...prev, { role: 'model', text: "" }]);
          
          let chunkCount = 0;
          const maxChunks = 1000; // Prevent infinite loops
          
          for await (const chunk of resultStream) {
            chunkCount++;
            if (chunkCount > maxChunks) {
              console.warn("Stream exceeded max chunks, breaking");
              break;
            }
            
            const chunkText = (chunk as GenerateContentResponse)?.text;
            if (chunkText && typeof chunkText === 'string') {
              fullResponse += chunkText;
              // Limit response length to prevent memory issues
              if (fullResponse.length > 10000) {
                fullResponse = fullResponse.substring(0, 10000) + "...";
                break;
              }
              setMessages(prev => {
                const newMsgs = [...prev];
                if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].role === 'model') {
                  newMsgs[newMsgs.length - 1] = { role: 'model', text: fullResponse };
                }
                return newMsgs;
              });
            }
          }
          
          if (!fullResponse || fullResponse.trim().length === 0) {
            throw new Error("Empty response from AI");
          }
        } catch (error) {
          console.error("Chat error:", error);
          try {
            const fallbackResult = await askRishiWithFallback(question, language, dobContext, persona);
            if (fallbackResult && fallbackResult.text) {
              setMessages(prev => [...prev, { role: 'model', text: fallbackResult.text, isFallback: true }]);
            } else {
              throw new Error("Fallback also failed");
            }
          } catch (fallbackError) {
            setMessages(prev => [...prev, { 
              role: 'model', 
              text: language === 'hi' 
                ? "ब्रह्मांड के संकेत धुंधले हैं। कृपया कुछ समय बाद पुनः प्रयास करें।"
                : "The cosmic signals are faint. Please try again in a moment."
            }]);
          }
        } finally {
          setIsLoading(false);
        }
        return;
      }
    }

    // Increment usage for free users
    if (!isPremium) {
      incrementChatUsage();
      setRemainingMessages(getRemainingMessages(isPremium));
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
        // Ensure session exists
        if (!chatSessionRef.current) {
          chatSessionRef.current = createChatSession(language, contextStringRef.current, persona);
        }
        
        if (!chatSessionRef.current) {
          throw new Error("Failed to create chat session");
        }
        
        const resultStream = await chatSessionRef.current.sendMessageStream({ message: userMsg });
        let fullResponse = "";
        setMessages(prev => [...prev, { role: 'model', text: "" }]);

        let chunkCount = 0;
        const maxChunks = 1000; // Prevent infinite loops
        
        for await (const chunk of resultStream) {
            chunkCount++;
            if (chunkCount > maxChunks) {
              console.warn("Stream exceeded max chunks, breaking");
              break;
            }
            
            const chunkText = (chunk as GenerateContentResponse)?.text;
            if (chunkText && typeof chunkText === 'string') {
              fullResponse += chunkText;
              // Limit response length to prevent memory issues
              if (fullResponse.length > 10000) {
                fullResponse = fullResponse.substring(0, 10000) + "...";
                break;
              }
              setMessages(prev => {
                const newMsgs = [...prev];
                if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].role === 'model') {
                  newMsgs[newMsgs.length - 1] = { role: 'model', text: fullResponse };
                }
                return newMsgs;
              });
            }
        }
        
        if (!fullResponse || fullResponse.trim().length === 0) {
          throw new Error("Empty response from AI");
        }
    } catch (error) {
        console.error("Chat error:", error);
        setFallbackMode(true);
        try {
            const fallbackResult = await askRishiWithFallback(userMsg, language, contextStringRef.current || '', persona);
            if (fallbackResult && fallbackResult.text && typeof fallbackResult.text === 'string') {
              setMessages(prev => [...prev, { role: 'model', text: fallbackResult.text, isFallback: true }]);
            } else {
              throw new Error("Invalid fallback response");
            }
        } catch (tier3Error) {
            console.error("Fallback also failed:", tier3Error);
            setMessages(prev => [...prev, { 
              role: 'model', 
              text: language === 'hi' 
                ? "यहाँ AI उपलब्ध नहीं है। पूर्ण AI सुविधाओं के लिए ऐप डाउनलोड करें।"
                : "AI isn't available here. Download the app to use full AI features.",
              showDownloadCta: true
            }]);
        }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[60]">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`group relative flex items-center justify-center rounded-full transition-all duration-500 shadow-2xl ${
              isOpen ? 'bg-slate-800 w-12 h-12 rotate-90' : 'bg-amber-600 w-16 h-16 hover:scale-110'
            }`}
          >
            {isOpen ? (
              <span className="text-white">✕</span>
            ) : (
              <>
                <span className="absolute inset-0 rounded-full bg-amber-500 animate-ping opacity-25"></span>
                <span className="text-3xl relative z-10">🧙‍♂️</span>
              </>
            )}
          </button>
      </div>

      <div className={`fixed bottom-24 right-6 z-[60] w-[90vw] md:w-[420px] h-[600px] max-h-[80vh] bg-slate-900 border border-slate-700/50 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col transition-all duration-500 origin-bottom-right ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'}`}>
          
          {/* Persona Selector - Multiple AI Astrologers */}
          <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700/50 flex gap-1 overflow-x-auto custom-scrollbar">
            {(['general', 'career', 'love', 'health'] as AstrologerPersona[]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPersona(p);
                  chatSessionRef.current = createChatSession(language, contextStringRef.current, p);
                  setMessages([{ role: 'model', text: context ? t.chartLoadedMessage : t.chatWelcome }]);
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  persona === p
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-700/50 text-slate-400 hover:text-amber-300'
                }`}
              >
                {p === 'general' ? (language === 'hi' ? 'सामान्य' : 'General') : null}
                {p === 'career' ? (language === 'hi' ? 'करियर' : 'Career') : null}
                {p === 'love' ? (language === 'hi' ? 'प्रेम' : 'Love') : null}
                {p === 'health' ? (language === 'hi' ? 'स्वास्थ्य' : 'Health') : null}
              </button>
            ))}
          </div>

          {/* Header */}
          <div className="p-5 bg-slate-800/80 backdrop-blur-md border-b border-white/5 flex justify-between items-center">
             <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-amber-900/30 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner">
                    ✨
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-amber-100 leading-none mb-1">Astro Rishi</h3>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {context ? (
                      <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter flex items-center gap-1">
                        <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h.01a1 1 0 100-2H10zm3 0a1 1 0 000 2h.01a1 1 0 100-2H13zM7 13a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h.01a1 1 0 100-2H10zm3 0a1 1 0 000 2h.01a1 1 0 100-2H13z" clipRule="evenodd" /></svg>
                        Chart Loaded
                      </span>
                    ) : (
                      <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Divine Guide</span>
                    )}
                    {!isPremium && remainingMessages >= 0 && (
                      <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                        {remainingMessages} {t.remainingMessages || 'left'}
                      </span>
                    )}
                    {isPremium && (
                      <span className="text-[8px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                        {t.unlimited || 'Unlimited'}
                      </span>
                    )}
                  </div>
                </div>
             </div>
             <button 
                onClick={() => {
                  setMessages([{ role: 'model', text: context ? t.chartLoadedMessage : t.chatWelcome }]);
                  setNeedsDOB(false);
                  setPendingQuestion(null);
                  setResponseType(null);
                  chatSessionRef.current = createChatSession(language, contextStringRef.current, persona);
                }}
                className="p-2 text-slate-500 hover:text-amber-400 transition-colors" title="Reset Chat"
             >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-950/20 custom-scrollbar">
             {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                   <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                     msg.role === 'user' 
                       ? 'bg-gradient-to-br from-amber-600 to-orange-700 text-white rounded-br-none' 
                       : 'bg-slate-800 text-slate-200 border border-white/5 rounded-bl-none'
                   }`}>
                      {msg.text === "" && isLoading ? (
                        <div className="flex items-center gap-2 text-amber-500/60 font-serif italic text-xs">
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                          Consulting Akasha...
                        </div>
                      ) : (
                        <>
                          <RichText text={msg.text} />
                          {msg.showDownloadCta && (
                            <DownloadAppForAICta language={language} accentColor="amber" />
                          )}
                        </>
                      )}
                   </div>
                </div>
             ))}

             {/* Suggestion Chips - Only show when chat is essentially starting */}
             {messages.length <= 1 && !isLoading && (
                <div className="pt-4 flex flex-wrap gap-2 animate-fade-in">
                  {(QUICK_CHIPS[language] || QUICK_CHIPS['en']).map(chip => (
                    <button 
                      key={chip}
                      onClick={() => handleSend(chip)}
                      className="px-4 py-2 bg-slate-800/40 border border-slate-700 hover:border-amber-500/50 hover:bg-slate-800 rounded-full text-xs text-slate-400 hover:text-amber-200 transition-all shadow-sm"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
             )}

             {isLoading && messages[messages.length-1]?.role === 'user' && (
                <div className="flex justify-start animate-fade-in">
                   <div className="bg-slate-800/50 p-4 rounded-2xl rounded-bl-none border border-white/5 flex flex-col gap-3">
                      <div className="flex gap-1.5 items-center">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Rishi is Meditating</p>
                   </div>
                </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
            className="p-5 bg-slate-900 border-t border-white/5 flex gap-3 relative z-10"
          >
             <div className="flex-1 relative">
                <input 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  placeholder={t.askYourQuestion}
                  className="w-full bg-slate-950 border border-slate-700/50 rounded-full px-5 py-3 text-sm focus:border-amber-500/50 outline-none transition-all pr-12 text-slate-200 placeholder-slate-600" 
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-700 font-bold uppercase tracking-tighter pointer-events-none">
                  AI
                </div>
             </div>
             <button 
               type="submit" 
               disabled={!input.trim() || isLoading || (!isPremium && !canSendMessage(isPremium))} 
               className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:cursor-not-allowed text-white p-3 rounded-full shadow-lg transition-all active:scale-95 group"
               title={!isPremium && !canSendMessage(isPremium) ? (t.chatLimitReachedFree || 'Daily limit reached. Upgrade for unlimited access!') : ''}
             >
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
             </button>
          </form>
      </div>
    </>
  );
};

export default ChatWidget;
