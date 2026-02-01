import React, { useState } from 'react';
import { Language } from '../types';
import { useTranslation } from '../utils/translations';
import {
  grantSubscription,
  redeemPromoCode,
  TIER_PRICING,
  SubscriptionTier,
  getPreferredCurrency,
  getTierPrice,
  PricingCurrency,
} from '../utils/subscriptionService';
import { isCapacitor } from '../utils/linkHandler';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSubscribed?: () => void;
  /** Optional: specific feature that triggered the paywall */
  feature?: string;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  language,
  onSubscribed,
  feature,
}) => {
  const t = useTranslation(language);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('month');
  const [currency, setCurrency] = useState<PricingCurrency>(getPreferredCurrency);

  const handleRedeemPromo = () => {
    setPromoError('');
    setPromoSuccess(false);
    if (!promoCode.trim()) return;
    const ok = redeemPromoCode(promoCode);
    if (ok) {
      setPromoSuccess(true);
      setPromoCode('');
      setTimeout(() => {
        onSubscribed?.();
        onClose();
      }, 800);
    } else {
      setPromoError(language === 'hi' ? 'अमान्य कोड' : 'Invalid code');
    }
  };

  const handlePurchase = async (tier: SubscriptionTier) => {
    if (isCapacitor()) {
      // TODO: Integrate Google Play Billing
      // For now: simulate purchase for testing (remove in production)
      if (import.meta.env.DEV) {
        grantSubscription(tier);
        onSubscribed?.();
        onClose();
        return;
      }
      // Production: integrate Google Play Billing here (see SUBSCRIPTION_AND_PAYMENTS.md)
      // For now: open Play Store app page
      window.open('https://play.google.com/store/apps/details?id=com.cosmicjyoti.app', '_blank');
      return;
    }
    // Web: TODO integrate Stripe / Paddle
    const stripeUrl = 'https://buy.stripe.com/your-link'; // Replace with your Stripe Payment Link
    window.open(stripeUrl, '_blank');
  };

  if (!isOpen) return null;

  const tiers: SubscriptionTier[] = ['day', 'week', 'month', 'year'];
  const bestValue = 'month';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-800 border border-amber-500/30 rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
              {language === 'hi' ? 'AI प्रीमियम एक्सेस' : 'AI Premium Access'}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {language === 'hi'
                ? 'असीमित कुंडली, चैट, टैरो और सभी AI फीचर्स'
                : 'Unlimited Kundali, Chat, Tarot & all AI features'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Promo code */}
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => { setPromoCode(e.target.value); setPromoError(''); }}
            placeholder={language === 'hi' ? 'प्रोमो कोड' : 'Promo code'}
            className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
          />
          <button
            onClick={handleRedeemPromo}
            className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm font-medium transition-colors"
          >
            {language === 'hi' ? 'लागू करें' : 'Apply'}
          </button>
        </div>
        {promoError && <p className="text-red-400 text-sm mb-2">{promoError}</p>}
        {promoSuccess && <p className="text-green-400 text-sm mb-2">{language === 'hi' ? 'सक्रिय!' : 'Activated!'}</p>}

        {/* Currency selector (global coverage) */}
        <div className="flex gap-2 mb-4">
          {(['inr', 'usd', 'eur'] as PricingCurrency[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currency === c ? 'bg-amber-500/30 text-amber-300' : 'bg-slate-700/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              {c === 'inr' ? '₹ INR' : c === 'usd' ? '$ USD' : '€ EUR'}
            </button>
          ))}
        </div>

        {/* Tier cards */}
        <div className="space-y-3 mb-6">
          {tiers.map((tier) => {
            const price = getTierPrice(tier, currency);
            const tierInfo = TIER_PRICING[tier];
            const label = language === 'hi' ? tierInfo.labelHi : tierInfo.labelEn;
            const isBest = tier === bestValue;
            const isSelected = selectedTier === tier;
            return (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-amber-500 bg-amber-500' : 'border-slate-500'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">{label}</span>
                    {isBest && (
                      <span className="ml-2 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                        {language === 'hi' ? 'सर्वोत्तम मूल्य' : 'Best value'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-amber-400">{price.symbol}{price.value}</span>
                  <span className="text-slate-500 text-sm ml-1">/ {label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Subscribe button */}
        <button
          onClick={() => handlePurchase(selectedTier)}
          className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98]"
        >
          {language === 'hi' ? 'सब्सक्राइब करें' : 'Subscribe'} — {getTierPrice(selectedTier, currency).symbol}{getTierPrice(selectedTier, currency).value}
        </button>

        <p className="text-slate-500 text-xs text-center mt-4">
          {language === 'hi'
            ? 'भुगतान Google Play / Stripe के माध्यम से सुरक्षित है'
            : 'Payment secured via Google Play / Stripe'}
        </p>
        {currency !== 'inr' && (
          <p className="text-slate-500 text-xs text-center mt-1">
            {currency === 'eur' ? 'Prices in EUR (Europe)' : 'Prices in USD (International)'}
          </p>
        )}
      </div>
    </div>
  );
};

export default SubscriptionModal;
