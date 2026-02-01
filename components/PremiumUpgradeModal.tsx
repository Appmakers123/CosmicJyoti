import React, { useState, useEffect } from 'react';
import { Language, User } from '../types';
import { useTranslation } from '../utils/translations';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (plan: 'premium' | 'annual') => void;
  onWatchAd?: () => void;
  language: Language;
  currentUser: User | null;
}

const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  onWatchAd,
  language,
  currentUser
}) => {
  const t = useTranslation(language);
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'annual'>('premium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  // Reset coming soon when modal opens
  useEffect(() => {
    if (isOpen) setShowComingSoon(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const plans = {
    premium: {
      name: language === 'en' ? 'Premium Monthly' : 'प्रीमियम मासिक',
      price: language === 'en' ? '₹299/month' : '₹299/महीना',
      originalPrice: language === 'en' ? '₹499/month' : '₹499/महीना',
      features: language === 'en' ? [
        '✨ Ad-free experience',
        '🔮 Unlimited Kundali readings',
        '📊 Advanced chart analysis',
        '💬 Priority AI support',
        '📱 All premium features',
        '🔄 Cancel anytime'
      ] : [
        '✨ विज्ञापन-मुक्त अनुभव',
        '🔮 असीमित कुंडली पढ़ना',
        '📊 उन्नत चार्ट विश्लेषण',
        '💬 प्राथमिकता AI सहायता',
        '📱 सभी प्रीमियम सुविधाएं',
        '🔄 कभी भी रद्द करें'
      ],
      popular: true
    },
    annual: {
      name: language === 'en' ? 'Annual Premium' : 'वार्षिक प्रीमियम',
      price: language === 'en' ? '₹2,999/year' : '₹2,999/वर्ष',
      originalPrice: language === 'en' ? '₹3,588/year' : '₹3,588/वर्ष',
      features: language === 'en' ? [
        '✨ Ad-free experience',
        '🔮 Unlimited everything',
        '📊 All advanced features',
        '💬 Priority AI support',
        '🎁 Exclusive content access',
        '💎 Best value - Save 17%'
      ] : [
        '✨ विज्ञापन-मुक्त अनुभव',
        '🔮 असीमित सब कुछ',
        '📊 सभी उन्नत सुविधाएं',
        '💬 प्राथमिकता AI सहायता',
        '🎁 विशेष सामग्री पहुंच',
        '💎 सर्वोत्तम मूल्य - 17% बचाएं'
      ],
      popular: false
    }
  };

  const handleUpgrade = async () => {
    setIsProcessing(true);
    // Payment coming soon - show message
    setTimeout(() => {
      setIsProcessing(false);
      // Keep modal open, show coming soon state
      setShowComingSoon(true);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-800 border border-amber-500/30 rounded-2xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 mb-2">
              {language === 'en' ? 'Upgrade to Premium' : 'प्रीमियम में अपग्रेड करें'}
            </h2>
            <p className="text-slate-400 text-sm">
              {language === 'en' 
                ? 'Unlock all features and enjoy an ad-free experience' 
                : 'सभी सुविधाएं अनलॉक करें और विज्ञापन-मुक्त अनुभव का आनंद लें'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Premium Monthly Plan */}
          <div
            className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
              selectedPlan === 'premium'
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-slate-700 hover:border-amber-500/50'
            }`}
            onClick={() => setSelectedPlan('premium')}
          >
            {plans.premium.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
                {language === 'en' ? 'POPULAR' : 'लोकप्रिय'}
              </div>
            )}
            <div className="text-center mb-4">
              <h3 className="text-xl font-serif font-bold text-white mb-2">{plans.premium.name}</h3>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-bold text-amber-400">{plans.premium.price}</span>
                <span className="text-sm text-slate-500 line-through">{plans.premium.originalPrice}</span>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              {plans.premium.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Annual Plan */}
          <div
            className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
              selectedPlan === 'annual'
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-slate-700 hover:border-amber-500/50'
            }`}
            onClick={() => setSelectedPlan('annual')}
          >
            <div className="absolute -top-3 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              {language === 'en' ? 'BEST VALUE' : 'सर्वोत्तम मूल्य'}
            </div>
            <div className="text-center mb-4">
              <h3 className="text-xl font-serif font-bold text-white mb-2">{plans.annual.name}</h3>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-bold text-amber-400">{plans.annual.price}</span>
                <span className="text-sm text-slate-500 line-through">{plans.annual.originalPrice}</span>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              {plans.annual.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Watch Ad Option - Primary free alternative */}
        {onWatchAd && (
          <div className="mb-6 p-4 bg-blue-900/30 border border-blue-500/40 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl">📺</div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white mb-1">
                  {language === 'en' ? 'Watch Ad to Unlock' : 'अनलॉक करने के लिए विज्ञापन देखें'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'en' 
                    ? 'Watch a short ad to use this feature once (5 minutes access)'
                    : 'इस सुविधा का एक बार उपयोग करने के लिए एक छोटा विज्ञापन देखें (5 मिनट की पहुंच)'}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Watch Ad button clicked, onWatchAd:', !!onWatchAd);
                if (onWatchAd) {
                  onWatchAd();
                } else {
                  console.error('onWatchAd is not defined!');
                }
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:from-blue-400 hover:to-blue-500 transition-all text-sm"
            >
              {language === 'en' ? '📺 Watch Ad (Free)' : '📺 विज्ञापन देखें (मुफ्त)'}
            </button>
          </div>
        )}

        {showComingSoon && (
          <div className="mb-6 p-4 bg-amber-900/30 border border-amber-500/40 rounded-xl text-center">
            <p className="text-amber-300 font-medium">
              {language === 'en' ? '💫 Payments coming soon! Use Watch Ad below for free access.' : '💫 भुगतान जल्द ही उपलब्ध! मुफ्त पहुंच के लिए नीचे विज्ञापन देखें।'}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleUpgrade}
            disabled={isProcessing}
            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-bold py-3 px-6 rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing
              ? (language === 'en' ? 'Processing...' : 'प्रसंस्करण...')
              : (language === 'en' ? `Upgrade to ${plans[selectedPlan].name}` : `${plans[selectedPlan].name} में अपग्रेड करें`)
            }
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:border-slate-500 hover:text-white transition-all"
          >
            {language === 'en' ? 'Cancel' : 'रद्द करें'}
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center mt-4">
          {language === 'en'
            ? 'Payments coming soon. Watch Ad for instant free access to premium features.'
            : 'भुगतान जल्द ही। प्रीमियम सुविधाओं के लिए तत्काल मुफ्त पहुंच के लिए विज्ञापन देखें।'}
        </p>
      </div>
    </div>
  );
};

export default PremiumUpgradeModal;

