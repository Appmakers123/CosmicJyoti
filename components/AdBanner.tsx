import React, { useEffect, useRef, useState } from 'react';
import { isCapacitor } from '../utils/linkHandler';
import admobService from '../services/admobService';

// AdSense slot IDs for web (cosmicjyoti.com)
const AD_SLOTS = {
  multiplex: '6705795838',   // Multiplex ad - grid/carousel
  inFeed: '6593742126',      // In-feed ad
  display: '5280660455',    // Display/responsive ad
  inArticle: '3545619331',  // In-article ad
  leaderboard: '5280660455',
  box: '6593742126',
} as const;

interface AdBannerProps {
  variant?: 'leaderboard' | 'box' | 'sticky-footer' | 'multiplex' | 'in-feed' | 'display' | 'in-article';
  className?: string;
  slotId?: string; 
}

// Global flag to ensure AdMob banner is only loaded once
let globalAdMobBannerLoaded = false;
let globalAdMobBannerShown = false;

function getSlotId(variant: string, slotId?: string): string {
  if (slotId) return slotId;
  const key = variant === 'in-feed' ? 'inFeed' : variant === 'in-article' ? 'inArticle' : variant as keyof typeof AD_SLOTS;
  return AD_SLOTS[key] ?? AD_SLOTS.display;
}

const AdBanner: React.FC<AdBannerProps> = ({ variant = 'leaderboard', className = '', slotId }) => {
  const resolvedSlotId = getSlotId(variant, slotId);
  const adRef = useRef<HTMLModElement>(null);
  const clientId = "ca-pub-3559865379099936";
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Note: AdMob banner is loaded globally in App.tsx on app start
  // This component just handles the UI placeholder for Android

  // Handle AdSense for web
  useEffect(() => {
    // Skip AdSense if we're on Android and using AdMob
    if (isCapacitor()) {
      return;
    }

    // Prevent multiple pushes for the same component instance
    if (isLoaded) return;

    let intervalId: any = null;

    const tryPushAd = () => {
        if (adRef.current) {
             // Check if element is visible and has width to prevent "No slot size for availableWidth=0"
             // This happens often in SPAs when tabs are switched or content loads dynamically
             const { offsetWidth } = adRef.current;
             
             // We generally need a non-zero width.
             if (offsetWidth > 0) {
                 try {
                    // @ts-ignore
                    const adsbygoogle = window.adsbygoogle || [];
                    adsbygoogle.push({});
                    setIsLoaded(true); // Mark as loaded
                    return true;
                 } catch (e) {
                    console.error("AdSense push failed:", e);
                 }
             }
        }
        return false;
    };

    // Try immediately
    if (!tryPushAd()) {
        // If not ready (width=0), poll every 300ms for up to 5 seconds
        intervalId = setInterval(() => {
            if (tryPushAd()) {
                clearInterval(intervalId);
            }
        }, 300);

        // Safety timeout to clear interval
        setTimeout(() => {
            if (intervalId) clearInterval(intervalId);
        }, 5000);
    }

    return () => {
        if (intervalId) clearInterval(intervalId);
    };
  }, [resolvedSlotId, isLoaded]); 

  // On Android, AdMob banner is shown natively at the bottom
  // Return null or minimal placeholder to avoid layout issues
  if (isCapacitor()) {
    // For sticky-footer variant, return a spacer to account for the banner
    if (variant === 'sticky-footer') {
      return (
        <div className="fixed bottom-0 left-0 w-full z-50 pointer-events-none min-h-[50px] md:min-h-[60px]">
          {/* AdMob banner will be shown natively at the bottom */}
        </div>
      );
    }
    // For other variants, return null since banner is shown at bottom
    return null;
  }

  if (!isVisible) return null;

  if (variant === 'sticky-footer') {
    return (
      <div 
        className="fixed bottom-0 left-0 w-full z-50 bg-slate-900/95 border-t border-slate-700 flex justify-center animate-fade-in-up shadow-[0_-5px_20px_rgba(0,0,0,0.5)] max-h-[25vh] md:max-h-[20vh] min-h-[50px] md:min-h-[60px]"
      >
           <div className="w-full max-w-[728px] relative flex items-center justify-center h-full">
             {/* Close Button - Left side to avoid overlapping with Rishi bot */}
             <button 
                onClick={() => setIsVisible(false)}
                className="absolute -top-3 left-2 bg-slate-800 text-slate-400 hover:text-white rounded-full p-1 border border-slate-600 shadow-lg z-[60] hover:scale-110 transition-transform"
                title="Close Ad"
             >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
             </button>

             <div className="w-full h-full overflow-hidden flex items-center justify-center">
                <ins 
                  ref={adRef}
                  className="adsbygoogle max-h-[25vh] md:max-h-[20vh]"
                  style={{ display: 'block', width: '100%', height: 'auto' }}
                  data-ad-client={clientId}
                  data-ad-slot={resolvedSlotId}
                  data-ad-format="horizontal"
                  data-full-width-responsive="true"
                ></ins>
             </div>
           </div>
      </div>
    );
  }

  // Shared wrapper styles for UX - generous spacing, subtle label
  const adWrapperClass = 'flex justify-center my-6 md:my-8 py-2';
  const adLabelClass = 'absolute top-1.5 right-2 text-[9px] text-slate-600 uppercase tracking-widest';

  // Multiplex ad - grid/carousel style
  if (variant === 'multiplex') {
    return (
      <div className={`${adWrapperClass} ${className}`} role="complementary" aria-label="Advertisement">
        <div className="w-full max-w-[1200px] bg-slate-800/20 rounded-xl min-h-[200px] flex items-center justify-center relative overflow-hidden border border-slate-700/30">
          <span className={adLabelClass}>Ad</span>
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block', width: '100%' }}
            data-ad-client={clientId}
            data-ad-slot={resolvedSlotId}
            data-ad-format="autorelaxed"
          />
        </div>
      </div>
    );
  }

  // In-feed ad
  if (variant === 'in-feed') {
    return (
      <div className={`${adWrapperClass} ${className}`} role="complementary" aria-label="Advertisement">
        <div className="w-full max-w-[1200px] bg-slate-800/20 rounded-xl min-h-[90px] flex items-center justify-center relative overflow-hidden border border-slate-700/30">
          <span className={adLabelClass}>Ad</span>
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block', width: '100%' }}
            data-ad-client={clientId}
            data-ad-slot={resolvedSlotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    );
  }

  // In-article ad - for content-heavy pages
  if (variant === 'in-article') {
    return (
      <div className={`${adWrapperClass} ${className}`} role="complementary" aria-label="Advertisement">
        <div className="w-full max-w-[800px] bg-slate-800/20 rounded-xl min-h-[250px] flex items-center justify-center relative overflow-hidden border border-slate-700/30" style={{ textAlign: 'center' }}>
          <span className={adLabelClass}>Ad</span>
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', textAlign: 'center' }}
            data-ad-layout="in-article"
            data-ad-format="fluid"
            data-ad-client={clientId}
            data-ad-slot={resolvedSlotId}
          />
        </div>
      </div>
    );
  }

  // Display / leaderboard / box - responsive unit
  return (
    <div className={`${adWrapperClass} ${className}`} role="complementary" aria-label="Advertisement">
      <div className="w-full max-w-[1200px] bg-slate-800/20 rounded-xl min-h-[90px] md:min-h-[100px] flex items-center justify-center text-center relative overflow-hidden border border-slate-700/30">
        <span className={adLabelClass}>Ad</span>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client={clientId}
          data-ad-slot={resolvedSlotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};

export default AdBanner;