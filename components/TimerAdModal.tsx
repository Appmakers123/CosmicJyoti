import React, { useEffect, useState } from 'react';
import { Language } from '../types';
import { markAdShown } from '../utils/timerAdService';
import { useTranslation } from '../utils/translations';

interface TimerAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const TimerAdModal: React.FC<TimerAdModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  const t = useTranslation(language);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adWatched, setAdWatched] = useState(false);
  const adRef = React.useRef<HTMLDivElement>(null);
  const insRef = React.useRef<HTMLModElement>(null);
  const clientId = "ca-pub-3559865379099936";
  const slotId = "4090023827"; // Ad slot for timer-based ads

  useEffect(() => {
    if (!isOpen) {
      setAdLoaded(false);
      setAdWatched(false);
      return;
    }

    // Mark ad as loaded so the ins element renders
    setAdLoaded(true);

    // Load ad after a short delay to ensure modal and ins element are visible
    const timer = setTimeout(() => {
      try {
        // @ts-ignore
        const adsbygoogle = window.adsbygoogle || [];
        
        if (insRef.current && adsbygoogle) {
          try {
            adsbygoogle.push({});
          } catch (pushError) {
            console.warn('Timer ad push error:', pushError);
          }
        }
        
        // Minimum display time (5s) before closing - AdSense display ads have no completion callback
        const watchTimer = setTimeout(() => {
          setAdWatched(true);
          markAdShown();
          setTimeout(() => onClose(), 2000);
        }, 5000);
        
        (window as any).__timerAdWatchTimer = watchTimer;
      } catch (error) {
        console.error('Error loading timer ad:', error);
        // On error: do not mark as shown, close modal so user can retry later
        setTimeout(() => onClose(), 1000);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      if ((window as any).__timerAdWatchTimer) {
        clearTimeout((window as any).__timerAdWatchTimer);
        delete (window as any).__timerAdWatchTimer;
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-800 border border-amber-500/30 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">📺</div>
          <h2 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 mb-2">
            {language === 'en' ? 'Support CosmicJyoti' : 'CosmicJyoti का समर्थन करें'}
          </h2>
          <p className="text-slate-400 text-sm">
            {language === 'en' 
              ? 'Thank you for using our app! Please watch this short ad to support us.'
              : 'हमारे ऐप का उपयोग करने के लिए धन्यवाद! कृपया हमारा समर्थन करने के लिए यह छोटा विज्ञापन देखें।'}
          </p>
        </div>

        {!adWatched ? (
          <>
            <div 
              ref={adRef}
              className="w-full min-h-[250px] bg-slate-900/50 rounded-lg flex items-center justify-center mb-6 border border-slate-700"
            >
              {!adLoaded && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
                  <p className="text-slate-400 text-sm">
                    {language === 'en' ? 'Loading ad...' : 'विज्ञापन लोड हो रहा है...'}
                  </p>
                </div>
              )}
              {adLoaded && (
                <ins 
                  ref={insRef}
                  className="adsbygoogle"
                  style={{ display: 'block', width: '100%', minHeight: '250px' }}
                  data-ad-client={clientId}
                  data-ad-slot={slotId}
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                ></ins>
              )}
            </div>

            <div className="text-center text-xs text-slate-500 mb-4">
              {language === 'en' 
                ? 'Ad will close automatically in a few seconds'
                : 'विज्ञापन कुछ सेकंड में अपने आप बंद हो जाएगा'}
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">✅</div>
            <h3 className="text-xl font-bold text-amber-400 mb-2">
              {language === 'en' ? 'Thank You!' : 'धन्यवाद!'}
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              {language === 'en' 
                ? 'Your support helps us keep the app free for everyone.'
                : 'आपका समर्थन हमें ऐप को सभी के लिए मुफ्त रखने में मदद करता है।'}
            </p>
            <div className="text-xs text-slate-500">
              {language === 'en' ? 'Closing...' : 'बंद हो रहा है...'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimerAdModal;

