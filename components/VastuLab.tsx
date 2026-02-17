import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { useTranslation } from '../utils/translations';
import { askRishiWithFallback } from '../services/geminiService';
import RichText from './RichText';
import AdBanner from './AdBanner';
import { canSendMessage, getRemainingMessages, incrementChatUsage } from '../utils/chatLimitService';

const VASTU_CHIPS_EN = [
  'Best direction for main entrance?',
  'Where to place kitchen as per Vastu?',
  'Bedroom Vastu tips',
  'Pooja room placement',
  'Which direction for study room?',
  'Vastu for living room',
];
const VASTU_CHIPS_HI = [
  'मुख्य द्वार के लिए सर्वोत्तम दिशा?',
  'वास्तु के अनुसार रसोई कहाँ?',
  'बेडरूम वास्तु टिप्स',
  'पूजा कक्ष का स्थान',
  'अध्ययन कक्ष के लिए कौन सी दिशा?',
  'लिविंग रूम के लिए वास्तु',
];

interface VastuLabProps {
  language: Language;
  onUseKarma?: () => boolean;
  hasKarma?: boolean;
  onOpenStore?: () => void;
  onWatchAdForChat?: () => void;
  chatRefreshTrigger?: number;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const VASTU_CONTEXT = 'User is in Vastu Shastra (Sacred Space) module. Answer only as a Vastu expert. Give practical, clear guidance on directions, room placement, entrance, kitchen, bedroom, pooja room, and remedies.';

const VastuLab: React.FC<VastuLabProps> = ({ language, onWatchAdForChat, chatRefreshTrigger = 0 }) => {
  const t = useTranslation(language);
  const chips = language === 'hi' ? VASTU_CHIPS_HI : VASTU_CHIPS_EN;
  const welcomeText = language === 'hi'
    ? 'नमस्ते! मैं वास्तु शास्त्र में आपकी मदद करूंगा। दिशा, कमरों का स्थान, मुख्य द्वार, रसोई, पूजा कक्ष या कोई भी वास्तु सवाल पूछें।'
    : 'Ask me anything about Vastu Shastra — directions, room placement, main entrance, kitchen, pooja room, or remedies.';

  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'model', text: welcomeText }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState(getRemainingMessages(false));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRemainingMessages(getRemainingMessages(false));
  }, [chatRefreshTrigger]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textOverride?: string) => {
    const userText = (textOverride || input.trim()).slice(0, 2000);
    if (!userText || loading) return;

    if (!canSendMessage(false)) {
      const limitMsg = language === 'hi'
        ? `आज के मुफ्त संदेश पूरे। विज्ञापन देखकर और प्राप्त करें।`
        : "You've used all free messages today. Watch an ad for more.";
      setMessages(prev => [...prev, { role: 'user', text: userText }, { role: 'model', text: limitMsg }]);
      if (onWatchAdForChat) onWatchAdForChat();
      setInput('');
      return;
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);
    incrementChatUsage();

    try {
      const result = await askRishiWithFallback(userText, language, VASTU_CONTEXT, 'general');
      setMessages(prev => [...prev, { role: 'model', text: result?.text || t.errorGeneric }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: t.errorGeneric }]);
    } finally {
      setLoading(false);
      setRemainingMessages(getRemainingMessages(false));
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in-up flex flex-col min-h-[70vh]">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-serif text-emerald-200">
          {t.vastuLabTitle || (language === 'hi' ? 'वास्तु शास्त्र — पवित्र स्थान' : 'Vastu Shastra — Sacred Space')}
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          {language === 'hi' ? 'चैट में अपना सवाल लिखें' : 'Chat with Rishi about Vastu'}
        </p>
        {remainingMessages >= 0 && (
          <p className="text-[10px] text-amber-500/80 mt-1 uppercase tracking-wider">
            {remainingMessages} {language === 'hi' ? 'संदेश बचे' : 'messages left'}
          </p>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-slate-800/60 border border-emerald-500/30 rounded-2xl overflow-hidden shadow-xl">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 min-h-[320px] max-h-[50vh]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-600/90 text-white rounded-br-md'
                    : 'bg-slate-900/80 text-slate-200 border border-slate-700/50 rounded-bl-md'
                }`}
              >
                {msg.role === 'model' ? <RichText text={msg.text} /> : msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-900/80 p-4 rounded-2xl rounded-bl-md border border-slate-700/50 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-slate-500 ml-1">{language === 'hi' ? 'लिख रहा है...' : 'Typing...'}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick chips */}
        {messages.length <= 1 && !loading && (
          <div className="px-4 pb-2 flex flex-wrap gap-2 justify-center">
            {chips.map((chip) => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                className="px-4 py-2 rounded-full bg-slate-700/50 border border-slate-600 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-200 text-xs transition-all"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="p-4 border-t border-slate-700/50 flex gap-3 bg-slate-900/40"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={language === 'hi' ? 'वास्तु पर सवाल पूछें...' : 'Ask about Vastu...'}
            className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all active:scale-[0.98]"
          >
            {language === 'hi' ? 'भेजें' : 'Send'}
          </button>
        </form>
      </div>

      <AdBanner variant="display" className="mt-6" />
    </div>
  );
};

export default VastuLab;
