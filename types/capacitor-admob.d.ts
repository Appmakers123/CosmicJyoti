import { Plugin } from '@capacitor/core';

export interface AdMobPlugin extends Plugin {
  /**
   * Load an interstitial ad
   */
  loadInterstitial(): Promise<{ loaded: boolean }>;
  
  /**
   * Show the loaded interstitial ad
   */
  showInterstitial(): Promise<{ dismissed: boolean }>;
  
  /**
   * Check if interstitial ad is ready
   */
  isInterstitialReady(): Promise<{ ready: boolean }>;
  
  /**
   * Load a banner ad
   */
  loadBanner(): Promise<{ loaded: boolean }>;
  
  /**
   * Show the loaded banner ad
   */
  showBanner(): Promise<{ shown: boolean }>;
  
  /**
   * Hide the banner ad (keeps it loaded)
   */
  hideBanner(): Promise<{ hidden: boolean }>;
  
  /**
   * Remove and destroy the banner ad
   */
  removeBanner(): Promise<{ removed: boolean }>;
  
  /**
   * Load a rewarded ad
   */
  loadRewarded(): Promise<{ loaded: boolean }>;
  
  /**
   * Show the loaded rewarded ad
   * Resolves with { earnedReward: boolean, amount?: number, type?: string } when user earns reward
   */
  showRewarded(): Promise<{ earnedReward: boolean; amount?: number; type?: string; dismissed?: boolean }>;
  
  /**
   * Check if rewarded ad is ready
   */
  isRewardedReady(): Promise<{ ready: boolean }>;

  /**
   * Load a native advanced ad
   */
  loadNativeAd(): Promise<{ loaded: boolean }>;

  /**
   * Show the loaded native ad (above banner at bottom)
   */
  showNativeAd(): Promise<{ shown: boolean }>;

  /**
   * Hide the native ad
   */
  hideNativeAd(): Promise<{ hidden: boolean }>;

  /**
   * Remove and destroy the native ad
   */
  removeNativeAd(): Promise<{ removed: boolean }>;
}

declare const AdMob: AdMobPlugin;

export { AdMob };
