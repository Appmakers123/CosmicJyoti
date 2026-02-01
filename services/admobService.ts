/**
 * AdMob Service for handling interstitial ads
 * Uses Capacitor plugin to communicate with native Android AdMob SDK
 */

// Check if we're running on Android (Capacitor)
const isAndroid = typeof window !== 'undefined' && 
  (window as any).Capacitor?.getPlatform() === 'android';

// AdMob configuration
const AD_UNIT_ID = 'ca-app-pub-3559865379099936/3237133191';
const APP_ID = 'ca-app-pub-3559865379099936~4711305500';

interface AdMobService {
  loadInterstitial(): Promise<void>;
  showInterstitial(): Promise<void>;
  showInterstitialDelayed(delayMs?: number, onShown?: () => void): void;
  isInterstitialReady(): Promise<boolean>;
  loadBanner(): Promise<void>;
  showBanner(): Promise<void>;
  hideBanner(): Promise<void>;
  removeBanner(): Promise<void>;
  loadRewarded(): Promise<void>;
  showRewarded(): Promise<{ earnedReward: boolean; amount?: number }>;
  isRewardedReady(): Promise<boolean>;
  loadNativeAd(): Promise<void>;
  showNativeAd(): Promise<void>;
  hideNativeAd(): Promise<void>;
  removeNativeAd(): Promise<void>;
}

class AdMobServiceImpl implements AdMobService {
  private adLoaded = false;
  private isLoading = false;


  /**
   * Get the AdMob plugin from Capacitor
   */
  private getAdMobPlugin() {
    const Capacitor = (window as any).Capacitor;
    if (!Capacitor) {
      return null;
    }
    return Capacitor.Plugins?.AdMob || null;
  }

  /**
   * Load an interstitial ad
   */
  async loadInterstitial(): Promise<void> {
    if (!isAndroid) {
      console.log('[AdMob] Not on Android, skipping ad load');
      return;
    }

    if (this.adLoaded || this.isLoading) {
      console.log('[AdMob] Ad already loaded or loading');
      return;
    }

    try {
      this.isLoading = true;
      const plugin = this.getAdMobPlugin();
      if (!plugin) {
        throw new Error('AdMob plugin not available. Make sure the plugin is registered in MainActivity.');
      }
      
      await plugin.loadInterstitial();
      
      this.adLoaded = true;
      this.isLoading = false;
      console.log('[AdMob] Interstitial ad loaded successfully');
    } catch (error) {
      this.isLoading = false;
      console.error('[AdMob] Failed to load interstitial ad:', error);
      throw error;
    }
  }

  /**
   * Show the loaded interstitial ad
   */
  async showInterstitial(): Promise<void> {
    if (!isAndroid) {
      console.log('[AdMob] Not on Android, skipping ad show');
      return;
    }

    if (!this.adLoaded) {
      console.log('[AdMob] Ad not loaded, loading first...');
      try {
        await this.loadInterstitial();
        // Wait a bit for ad to be ready
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('[AdMob] Failed to load ad before showing:', error);
        return;
      }
    }

    try {
      const plugin = this.getAdMobPlugin();
      if (!plugin) {
        throw new Error('AdMob plugin not available');
      }
      
      await plugin.showInterstitial();
      this.adLoaded = false; // Reset after showing
      console.log('[AdMob] Interstitial ad shown');
    } catch (error) {
      console.error('[AdMob] Failed to show interstitial ad:', error);
      this.adLoaded = false;
      throw error;
    }
  }

  /**
   * Check if interstitial ad is ready
   */
  async isInterstitialReady(): Promise<boolean> {
    if (!isAndroid) {
      return false;
    }

    try {
      const plugin = this.getAdMobPlugin();
      if (!plugin) {
        return false;
      }
      
      const result = await plugin.isInterstitialReady();
      this.adLoaded = result?.ready || false;
      return this.adLoaded;
    } catch (error) {
      console.error('[AdMob] Failed to check ad readiness:', error);
      return false;
    }
  }

  /**
   * Show interstitial after a delay (non-blocking, user sees content first)
   * Use for post-action ads: response first, then ad after delay
   * @param delayMs Delay before showing (default 4000)
   * @param onShown Optional callback when ad is shown (for cooldown tracking)
   */
  showInterstitialDelayed(delayMs = 4000, onShown?: () => void): void {
    if (!isAndroid) return;
    setTimeout(async () => {
      try {
        let ready = await this.isInterstitialReady();
        if (!ready) {
          await this.loadInterstitial();
          await new Promise(r => setTimeout(r, 800));
          ready = await this.isInterstitialReady();
        }
        if (ready) {
          await this.showInterstitial();
          onShown?.();
          this.preloadAd().catch(() => {});
        }
      } catch (e) {
        console.warn('[AdMob] Delayed interstitial failed:', e);
      }
    }, delayMs);
  }

  /**
   * Preload an ad in the background
   */
  async preloadAd(): Promise<void> {
    if (!isAndroid) {
      return;
    }

    try {
      await this.loadInterstitial();
    } catch (error) {
      // Silently fail for preloading
      console.log('[AdMob] Preload failed (non-critical):', error);
    }
  }

  /**
   * Load a banner ad
   */
  async loadBanner(): Promise<void> {
    if (!isAndroid) {
      console.log('[AdMob] Not on Android, skipping banner ad load');
      return;
    }

    try {
      const plugin = this.getAdMobPlugin();
      if (!plugin) {
        throw new Error('AdMob plugin not available');
      }
      
      await plugin.loadBanner();
      console.log('[AdMob] Banner ad loaded successfully');
    } catch (error) {
      console.error('[AdMob] Failed to load banner ad:', error);
      throw error;
    }
  }

  /**
   * Show the loaded banner ad
   */
  async showBanner(): Promise<void> {
    if (!isAndroid) {
      console.log('[AdMob] Not on Android, skipping banner ad show');
      return;
    }

    try {
      const plugin = this.getAdMobPlugin();
      if (!plugin) {
        throw new Error('AdMob plugin not available');
      }
      
      await plugin.showBanner();
      console.log('[AdMob] Banner ad shown');
    } catch (error) {
      console.error('[AdMob] Failed to show banner ad:', error);
      throw error;
    }
  }

  /**
   * Hide the banner ad (keeps it loaded)
   */
  async hideBanner(): Promise<void> {
    if (!isAndroid) {
      return;
    }

    try {
      const plugin = this.getAdMobPlugin();
      if (!plugin) {
        throw new Error('AdMob plugin not available');
      }
      
      await plugin.hideBanner();
      console.log('[AdMob] Banner ad hidden');
    } catch (error) {
      console.error('[AdMob] Failed to hide banner ad:', error);
      throw error;
    }
  }

  /**
   * Remove and destroy the banner ad
   */
  async removeBanner(): Promise<void> {
    if (!isAndroid) {
      return;
    }

    try {
      const plugin = this.getAdMobPlugin();
      if (!plugin) {
        throw new Error('AdMob plugin not available');
      }
      
      await plugin.removeBanner();
      console.log('[AdMob] Banner ad removed');
    } catch (error) {
      console.error('[AdMob] Failed to remove banner ad:', error);
      throw error;
    }
  }

  /**
   * Load a rewarded ad
   */
  async loadRewarded(): Promise<void> {
    if (!isAndroid) {
      console.log('[AdMob] Not on Android, skipping rewarded ad load');
      return;
    }

    try {
      const plugin = this.getAdMobPlugin();
      if (!plugin || typeof plugin.loadRewarded !== 'function') {
        throw new Error('AdMob rewarded ad not available');
      }
      await plugin.loadRewarded();
      console.log('[AdMob] Rewarded ad loaded');
    } catch (error) {
      console.error('[AdMob] Failed to load rewarded ad:', error);
      throw error;
    }
  }

  /**
   * Show rewarded ad. Resolves with { earnedReward: true } when user watches full ad.
   */
  async showRewarded(): Promise<{ earnedReward: boolean; amount?: number }> {
    if (!isAndroid) {
      return { earnedReward: false };
    }

    try {
      const plugin = this.getAdMobPlugin();
      if (!plugin || typeof plugin.showRewarded !== 'function') {
        throw new Error('AdMob rewarded ad not available');
      }
      const result = await plugin.showRewarded();
      return { earnedReward: result?.earnedReward ?? false, amount: result?.amount };
    } catch (error) {
      console.error('[AdMob] Failed to show rewarded ad:', error);
      return { earnedReward: false };
    }
  }

  /**
   * Check if rewarded ad is ready
   */
  async isRewardedReady(): Promise<boolean> {
    if (!isAndroid) return false;
    try {
      const plugin = this.getAdMobPlugin();
      if (!plugin || typeof plugin.isRewardedReady !== 'function') return false;
      const result = await plugin.isRewardedReady();
      return result?.ready ?? false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Load native advanced ad
   */
  async loadNativeAd(): Promise<void> {
    if (!isAndroid) return;
    try {
      const plugin = this.getAdMobPlugin();
      if (!plugin || typeof plugin.loadNativeAd !== 'function') return;
      await plugin.loadNativeAd();
    } catch (error) {
      console.error('[AdMob] Failed to load native ad:', error);
      throw error;
    }
  }

  /**
   * Show native ad (above banner at bottom)
   */
  async showNativeAd(): Promise<void> {
    if (!isAndroid) return;
    try {
      const plugin = this.getAdMobPlugin();
      if (!plugin || typeof plugin.showNativeAd !== 'function') return;
      await plugin.showNativeAd();
    } catch (error) {
      console.error('[AdMob] Failed to show native ad:', error);
      throw error;
    }
  }

  /**
   * Hide native ad
   */
  async hideNativeAd(): Promise<void> {
    if (!isAndroid) return;
    try {
      const plugin = this.getAdMobPlugin();
      if (!plugin || typeof plugin.hideNativeAd !== 'function') return;
      await plugin.hideNativeAd();
    } catch (error) {
      console.error('[AdMob] Failed to hide native ad:', error);
      throw error;
    }
  }

  /**
   * Remove native ad
   */
  async removeNativeAd(): Promise<void> {
    if (!isAndroid) return;
    try {
      const plugin = this.getAdMobPlugin();
      if (!plugin || typeof plugin.removeNativeAd !== 'function') return;
      await plugin.removeNativeAd();
    } catch (error) {
      console.error('[AdMob] Failed to remove native ad:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const admobService = new AdMobServiceImpl();

// Export for convenience
export default admobService;
