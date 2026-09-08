import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { PAYPAL_ME_HANDLE, PAYPAL_ME_URL, PAYPAL_DONATION_EMAIL, getPayPalDonateUrl } from '../constants';
import { openExternalLink, getExternalLinkProps } from '../utils/linkHandler';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const PRESET_AMOUNTS = [
  { amount: 3, labelEn: '$3', labelHi: '$3', tierEn: 'Chai / Coffee', tierHi: 'चाय / कॉफी', icon: '☕' },
  { amount: 5, labelEn: '$5', labelHi: '$5', tierEn: 'Blessings', tierHi: 'शुभ आशीर्वाद', icon: '🌟' },
  { amount: 10, labelEn: '$10', labelHi: '$10', tierEn: 'Devotion', tierHi: 'श्रद्धा भाव', icon: '✨' },
  { amount: 25, labelEn: '$25', labelHi: '$25', tierEn: 'Patron', tierHi: 'संरक्षक', icon: '👑' },
  { amount: 50, labelEn: '$50', labelHi: '$50', tierEn: 'Cosmic Pillar', tierHi: 'महादान', icon: '🌌' },
];

export const DonateModal: React.FC<DonateModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(10);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [copiedHandle, setCopiedHandle] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isHindi = language === 'hi';

  const effectiveAmount = customAmount.trim() !== '' 
    ? parseFloat(customAmount) || undefined 
    : (selectedAmount || undefined);

  const paypalUrl = getPayPalDonateUrl(effectiveAmount);

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      return true;
    } catch (err) {
      console.warn('Failed to copy to clipboard:', err);
      return false;
    }
  };

  const handleCopyHandle = async () => {
    const success = await copyToClipboard(PAYPAL_ME_URL);
    if (success) {
      setCopiedHandle(true);
      setTimeout(() => setCopiedHandle(false), 3000);
    }
  };

  const handleCopyEmail = async () => {
    const success = await copyToClipboard(PAYPAL_DONATION_EMAIL);
    if (success) {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 3000);
    }
  };

  const handleDonateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openExternalLink(paypalUrl, language);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="donate-modal-title"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div 
        className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.25)] p-5 sm:p-7 z-10 my-auto text-slate-100 overflow-hidden"
      >
        {/* Decorative Golden Ambient Aura */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-500/10 blur-2xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-800/60 hover:bg-slate-700/80 text-slate-400 hover:text-white transition-colors border border-slate-700/50"
          aria-label={isHindi ? 'बंद करें' : 'Close'}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6 pt-1">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-amber-600/30 border border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.35)] mb-3">
            <span className="text-3xl animate-pulse">💖</span>
          </div>
          <h2 
            id="donate-modal-title"
            className="text-xl sm:text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 tracking-wide"
          >
            {isHindi ? 'CosmicJyoti के विकास में सहयोग करें' : 'Support CosmicJyoti’s Growth'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-sm mx-auto leading-relaxed">
            {isHindi 
              ? 'आपका दान इस वैदिक ज्योतिष प्लेटफॉर्म को मुफ्त, सटीक और निरंतर समृद्ध बनाए रखने में सीधे मदद करता है।'
              : 'Your contribution directly funds server ephemeris computations, keeps astrology free, and helps us build new celestial features.'}
          </p>
        </div>

        {/* Value Points */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-2.5 text-center">
            <span className="text-base sm:text-lg block mb-0.5">🔭</span>
            <p className="text-[11px] font-bold text-amber-200">{isHindi ? 'सटीक गणना' : 'NASA Ephemeris'}</p>
            <p className="text-[9px] text-slate-400 leading-tight mt-0.5">{isHindi ? 'उच्च परिशुद्धता' : 'Real-time Math'}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-2.5 text-center">
            <span className="text-base sm:text-lg block mb-0.5">🕊️</span>
            <p className="text-[11px] font-bold text-amber-200">{isHindi ? 'मुफ्त ज्योतिष' : 'Free Access'}</p>
            <p className="text-[9px] text-slate-400 leading-tight mt-0.5">{isHindi ? 'सभी साधकों के लिए' : 'For all seekers'}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-2.5 text-center">
            <span className="text-base sm:text-lg block mb-0.5">⚡</span>
            <p className="text-[11px] font-bold text-amber-200">{isHindi ? 'तेज़ सर्वर' : 'Fast Servers'}</p>
            <p className="text-[9px] text-slate-400 leading-tight mt-0.5">{isHindi ? '24/7 उपलब्धता' : 'Zero Downtime'}</p>
          </div>
        </div>

        {/* Preset Amounts */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">
            {isHindi ? 'सहयोग राशि चुनें (USD)' : 'Select Contribution (USD)'}
          </label>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {PRESET_AMOUNTS.map((preset) => {
              const isSelected = selectedAmount === preset.amount && customAmount === '';
              return (
                <button
                  key={preset.amount}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(preset.amount);
                    setCustomAmount('');
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'bg-amber-500/25 border-amber-400 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.35)] scale-105'
                      : 'bg-slate-800/40 border-slate-700/70 hover:border-amber-500/40 text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="text-sm">{preset.icon}</span>
                  <span className="text-xs sm:text-sm font-bold mt-0.5">{preset.labelEn}</span>
                  <span className="text-[9px] text-amber-300/80 truncate w-full hidden sm:block">
                    {isHindi ? preset.tierHi : preset.tierEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Amount */}
        <div className="mb-5">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
            <input
              type="number"
              min="1"
              step="any"
              placeholder={isHindi ? 'या कोई अन्य राशि दर्ज करें...' : 'Or enter custom amount ($)...'}
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                if (e.target.value) {
                  setSelectedAmount(null);
                }
              }}
              className="w-full pl-8 pr-4 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-xs sm:text-sm text-amber-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* PayPal Main Action Button */}
        <div className="mb-5">
          <a
            {...getExternalLinkProps(paypalUrl, language)}
            onClick={handleDonateClick}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#0079C1] via-[#00457C] to-[#0079C1] hover:from-[#0089DC] hover:to-[#005599] text-white font-bold text-sm sm:text-base tracking-wide shadow-[0_4px_25px_rgba(0,121,193,0.4)] hover:shadow-[0_4px_30px_rgba(0,121,193,0.6)] flex items-center justify-center gap-3 transition-all active:scale-[0.98] border border-sky-400/40 cursor-pointer"
          >
            {/* PayPal Icon */}
            <svg className="w-5 h-5 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.82.875 4.966-.03.153-.067.31-.11.472-.647 3.018-2.679 4.707-6.04 4.707H11.02a.794.794 0 0 0-.785.67l-.872 5.534-.287 1.823a.64.64 0 0 1-.633.541h-1.367zm12.35-14.776c-.035.176-.076.357-.123.543-.807 3.766-3.344 5.875-7.543 5.875h-2.316a.992.992 0 0 0-.98.837l-1.34 8.508-.38 2.41a.534.534 0 0 0 .528.618h3.838a.992.992 0 0 0 .98-.838l.812-5.15.052-.28a.992.992 0 0 1 .98-.837h.615c4.202 0 7.49-1.708 8.45-6.183.4-1.872.2-3.435-.793-4.604a5.01 5.01 0 0 0-2.8-1.554z"/>
            </svg>
            <span>
              {effectiveAmount 
                ? (isHindi ? `PayPal से $${effectiveAmount} दान दें` : `Donate $${effectiveAmount} with PayPal`)
                : (isHindi ? 'PayPal से दान दें' : 'Donate with PayPal')}
            </span>
            <svg className="w-4 h-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>

        {/* Direct PayPal.Me & Email Box */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 sm:p-4 space-y-2.5">
          {/* PayPal.Me Link */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>⚡</span>
                <span>{isHindi ? 'PayPal.Me डायरेक्ट लिंक' : 'PayPal.Me Direct Link'}</span>
              </span>
              {copiedHandle && (
                <span className="text-[10px] text-emerald-400 font-bold animate-fade-in flex items-center gap-1">
                  <span>✓</span> {isHindi ? 'लिंक कॉपी हुआ!' : 'Link copied!'}
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between gap-2 bg-slate-900/90 rounded-xl px-3 py-2 border border-amber-500/30">
              <a 
                {...getExternalLinkProps(PAYPAL_ME_URL, language)}
                className="text-xs sm:text-sm font-mono text-amber-200 hover:text-amber-100 font-semibold truncate hover:underline"
              >
                paypal.me/{PAYPAL_ME_HANDLE}
              </a>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyHandle}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 transition-colors flex items-center gap-1 active:scale-95"
                  title="Copy PayPal.Me link"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>{copiedHandle ? (isHindi ? 'कॉपी हुआ' : 'Copied') : (isHindi ? 'कॉपी' : 'Copy')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* PayPal Email */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {isHindi ? 'वैकल्पिक: PayPal ईमेल' : 'Alternative: PayPal Email'}
              </span>
              {copiedEmail && (
                <span className="text-[10px] text-emerald-400 font-bold animate-fade-in flex items-center gap-1">
                  <span>✓</span> {isHindi ? 'ईमेल कॉपी हुआ!' : 'Email copied!'}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 bg-slate-900/60 rounded-xl px-3 py-1.5 border border-slate-800">
              <span className="text-[11px] sm:text-xs font-mono text-slate-300 truncate select-all">
                {PAYPAL_DONATION_EMAIL}
              </span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors shrink-0 active:scale-95"
                title="Copy email to clipboard"
              >
                {copiedEmail ? (isHindi ? 'कॉपी हुआ' : 'Copied') : (isHindi ? 'कॉपी' : 'Copy')}
              </button>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 pt-1 text-center leading-relaxed">
            {isHindi 
              ? 'PayPal ऐप या ब्राउज़र में paypal.me/NIKESHMAURYA खोलकर तुरंत भुगतान करें।' 
              : 'Open paypal.me/NIKESHMAURYA in your PayPal app or web browser to donate instantly.'}
          </p>
        </div>

        {/* Spiritual Gratitude Quote */}
        <p className="text-[11px] text-center text-amber-300/70 italic mt-4">
          {isHindi ? '“दानात् सर्वं सुखं लभ्यते” — दान से सभी सुख और शांति की प्राप्ति होती है।' : '“Every small contribution helps cosmic wisdom reach every soul seeking guidance.”'}
        </p>
      </div>
    </div>
  );
};

export default DonateModal;
