import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { useTranslation } from '../utils/translations';
import { isCapacitor } from '../utils/linkHandler';
import admobService from '../services/admobService';
import AdBanner from './AdBanner';

interface AdWatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  language: Language;
  title?: string;
  description?: string;
  rewardDescription?: string;
}

/**
 * Modal that shows a rewarded ad. On success (user watches full ad), calls onSuccess.
 * Tries rewarded ad first, falls back to interstitial if rewarded fails.
 */
const WEB_AD_VIEW_SECONDS = 8;

const AdWatchModal: React.FC<AdWatchModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  language,
  title,
  description,
  rewardDescription,
}) => {
  const t = useTranslation(language);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showContinueAnyway, setShowContinueAnyway] = useState(false);
  const [webCountdown, setWebCountdown] = useState(WEB_AD_VIEW_SECONDS);
  const [webCanContinue, setWebCanContinue] = useState(false);

  const onWeb = !isCapacitor();

  useEffect(() => {
    if (isOpen && isCapacitor()) {
      admobService.loadRewarded().catch(() => {});
      setShowContinueAnyway(false);
    }
  }, [isOpen]);

  // Web: countdown timer for AdSense view
  useEffect(() => {
    if (!isOpen || !onWeb) return;
    setWebCanContinue(false);
    setWebCountdown(WEB_AD_VIEW_SECONDS);
    const id = setInterval(() => {
      setWebCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setWebCanContinue(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isOpen, onWeb]);

  const loadRewardedWithRetry = async (maxRetries = 3): Promise<boolean> => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await admobService.loadRewarded();
        const ready = await admobService.isRewardedReady();
        if (ready) return true;
      } catch (e) {
        const msg = (e as Error)?.message || '';
        if (msg.includes('not initialized') && i < maxRetries - 1) {
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        throw e;
      }
    }
    return false;
  };

  const handleWatchAd = async () => {
    setError(null);
    setShowContinueAnyway(false);
    setIsLoading(true);

    try {
      if (isCapacitor()) {
        // 1. Try rewarded ad first (rewarded ad section)
        let isReady = await admobService.isRewardedReady();
        if (!isReady) {
          try {
            await loadRewardedWithRetry();
          } catch {
            // loadRewardedWithRetry throws on final failure
          }
          await new Promise(r => setTimeout(r, 1500));
          isReady = await admobService.isRewardedReady();
        }

        if (isReady) {
          const result = await admobService.showRewarded();
          if (result.earnedReward) {
            onSuccess();
            onClose();
            admobService.loadRewarded().catch(() => {}); // Preload for next time
          } else {
            setError(language === 'hi' ? 'विज्ञापन पूरा नहीं हुआ। कृपया पूरा देखें।' : 'Ad not completed. Please watch the full ad.');
          }
          return;
        }

        // 2. Fallback: try interstitial ad when rewarded fails
        let interstitialReady = await admobService.isInterstitialReady();
        if (!interstitialReady) {
          try {
            await admobService.loadInterstitial();
            await new Promise(r => setTimeout(r, 1500));
            interstitialReady = await admobService.isInterstitialReady();
          } catch {
            // Interstitial load failed
          }
        }

        if (interstitialReady) {
          await admobService.showInterstitial();
          // User saw and dismissed interstitial - grant reward
          onSuccess();
          onClose();
          admobService.preloadAd().catch(() => {});
          return;
        }

        // 3. Both ads failed - show escape so user is not stuck
        setError(language === 'hi' 
          ? 'विज्ञापन अभी उपलब्ध नहीं है। नीचे दिए गए बटन से जारी रखें।' 
          : 'Ad not available. Use the button below to continue.');
        setShowContinueAnyway(true);
      } else {
        setError(language === 'hi' 
          ? 'विज्ञापन पुरस्कार केवल Android ऐप में उपलब्ध हैं। कृपया ऐप डाउनलोड करें।' 
          : 'Rewarded ads are only available in the Android app. Please download the app.');
      }
    } catch (err: any) {
      const msg = err?.message || '';
      setError(language === 'hi' 
        ? msg.includes('not available') || msg.includes('load') 
          ? 'विज्ञापन अभी उपलब्ध नहीं है। नीचे दिए गए बटन से जारी रखें।' 
          : 'विज्ञापन लोड नहीं हो सका। नीचे दिए गए बटन से जारी रखें।'
        : msg.includes('not available') || msg.includes('load')
          ? 'Ad not available. Use the button below to continue.'
          : 'Could not load ad. Use the button below to continue.');
      setShowContinueAnyway(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueAnyway = () => {
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  // Web: show AdSense ad with countdown, then enable Continue
  if (onWeb) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-fade-in">
        <div className="bg-slate-800 border border-amber-500/30 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl">
          <div className="text-center mb-4">
            <div className="text-5xl mb-4">📺</div>
            <h2 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 mb-2">
              {title || (language === 'hi' ? 'विज्ञापन देखें' : 'Watch Ad')}
            </h2>
            <p className="text-slate-400 text-sm">
              {description || (language === 'hi' 
                ? 'नीचे विज्ञापन देखें और पुरस्कार प्राप्त करें' 
                : 'View the ad below to receive your reward')}
            </p>
            {rewardDescription && (
              <p className="text-amber-400 text-sm mt-2 font-medium">{rewardDescription}</p>
            )}
          </div>

          <div className="my-4 min-h-[100px] rounded-xl overflow-hidden bg-slate-900/50">
            <AdBanner variant="display" className="!my-0" />
          </div>

          <p className="text-slate-500 text-xs text-center mb-4">
            {webCanContinue
              ? (language === 'hi' ? 'अब जारी रखें' : 'You can continue now')
              : (language === 'hi' 
                ? `कृपया विज्ञापन देखें... ${webCountdown} सेकंड शेष`
                : `Please view the ad... ${webCountdown} seconds remaining`)}
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => { onSuccess(); onClose(); }}
              disabled={!webCanContinue}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {language === 'hi' ? 'जारी रखें' : 'Continue'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:border-slate-500 hover:text-white transition-all"
            >
              {language === 'hi' ? 'रद्द' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Capacitor: AdMob rewarded/interstitial flow
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-800 border border-amber-500/30 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">📺</div>
          <h2 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 mb-2">
            {title || (language === 'hi' ? 'विज्ञापन देखें' : 'Watch Ad')}
          </h2>
          <p className="text-slate-400 text-sm">
            {description || (language === 'hi' 
              ? 'एक छोटा विज्ञापन देखें और पुरस्कार प्राप्त करें' 
              : 'Watch a short ad to receive your reward')}
          </p>
          {rewardDescription && (
            <p className="text-amber-400 text-sm mt-2 font-medium">{rewardDescription}</p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
            {!showContinueAnyway && (
              <p className="text-amber-400/90 text-xs mt-2">
                {language === 'hi' ? 'पुनः प्रयास करने के लिए ऊपर का बटन दबाएं।' : 'Tap the button above to try again.'}
              </p>
            )}
          </div>
        )}

        {showContinueAnyway && (
          <div className="mb-4 p-3 bg-amber-900/30 border border-amber-500/50 rounded-lg">
            <button
              onClick={handleContinueAnyway}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-bold py-3 px-4 rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all"
            >
              {language === 'hi' ? 'बिना विज्ञापन के जारी रखें' : 'Continue without ad'}
            </button>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleWatchAd}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading 
              ? (language === 'hi' ? 'लोड हो रहा है...' : 'Loading...')
              : (language === 'hi' ? '📺 विज्ञापन देखें' : '📺 Watch Ad')
            }
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:border-slate-500 hover:text-white transition-all disabled:opacity-50"
          >
            {language === 'hi' ? 'रद्द' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdWatchModal;
