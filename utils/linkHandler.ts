/**
 * External Link Handler - Opens links in external system browser
 * Works on both web and mobile (Capacitor) platforms
 */

/**
 * Check if running on Capacitor (mobile app)
 */
export function isCapacitor(): boolean {
  try {
    return typeof window !== 'undefined' && 
           typeof (window as any).Capacitor !== 'undefined';
  } catch {
    return false;
  }
}

/**
 * Check if running on Android
 */
export function isAndroid(): boolean {
  try {
    if (!isCapacitor()) return false;
    const platform = (window as any).Capacitor?.getPlatform?.();
    return platform === 'android';
  } catch {
    return false;
  }
}

/**
 * Open URL in external system browser
 * Uses Capacitor App.openUrl() in mobile app to open in external browser
 * This ensures back button returns to app instead of closing it
 */
export async function openExternalLink(
  url: string,
  language: 'en' | 'hi' = 'en'
): Promise<void> {
  try {
    // Validate URL
    if (!url || typeof url !== 'string') {
      console.warn('Invalid URL provided:', url);
      return;
    }
    const trimmed = url.trim();
    // Block dangerous schemes to prevent XSS / phishing
    const lower = trimmed.toLowerCase();
    if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
      console.warn('Blocked unsafe URL scheme');
      return;
    }

    // Normalize URL
    let validUrl: string;
    try {
      // Handle relative URLs
      if (trimmed.startsWith('/')) {
        validUrl = window.location.origin + trimmed;
      } else if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        validUrl = trimmed;
      } else if (trimmed.startsWith('mailto:') || trimmed.startsWith('tel:') || trimmed.startsWith('whatsapp://')) {
        validUrl = trimmed;
      } else {
        validUrl = 'https://' + trimmed;
      }
    } catch {
      console.warn('Could not parse URL:', url);
      return;
    }

    // In Capacitor app (mobile/tablet), use App.openUrl() to open in external system browser
    // This opens in the device's default browser, and back button returns to app
    if (isCapacitor()) {
      try {
        const Capacitor = (window as any).Capacitor;
        
        // Try multiple methods to ensure it works on all Android devices/tablets
        // Method 1: Use Capacitor.Plugins.App.openUrl (preferred)
        if (Capacitor && Capacitor.Plugins && Capacitor.Plugins.App && Capacitor.Plugins.App.openUrl) {
          try {
            await Capacitor.Plugins.App.openUrl({ url: validUrl });
            return;
          } catch (e) {
            console.warn('Capacitor.Plugins.App.openUrl failed, trying alternatives:', e);
          }
        }
        
        // Method 2: Try dynamic import of @capacitor/app (now installed)
        try {
          const appModule = await import('@capacitor/app');
          if (appModule && appModule.App && appModule.App.openUrl) {
            await appModule.App.openUrl({ url: validUrl });
            return;
          }
        } catch (importError) {
          console.warn('Dynamic import of @capacitor/app failed:', importError);
        }
        
        // Method 3: For Android, try using our custom ExternalLink plugin
        if (isAndroid()) {
          try {
            if (Capacitor && Capacitor.Plugins && Capacitor.Plugins.ExternalLink) {
              await Capacitor.Plugins.ExternalLink.openUrl({ url: validUrl });
              return;
            }
          } catch (externalLinkError) {
            console.warn('ExternalLink plugin failed:', externalLinkError);
          }
        }
        
        // Method 4: Try using Intent directly via bridge (fallback)
        if (isAndroid()) {
          try {
            const bridge = (window as any).Capacitor?.getPlugin?.('App');
            if (bridge && bridge.openUrl) {
              await bridge.openUrl({ url: validUrl });
              return;
            }
          } catch (bridgeError) {
            console.warn('Bridge method failed:', bridgeError);
          }
        }
      } catch (appError) {
        console.warn('All Capacitor methods failed, falling back to web method:', appError);
        // Fall through to web fallback
      }
    }
    
    // For tablets on web, ensure links open properly
    // Check if device is tablet (screen width between 600px and 1024px)
    const isTablet = window.innerWidth >= 600 && window.innerWidth <= 1024;
    if (isTablet && !isCapacitor()) {
      // On tablets, use window.open for better compatibility
      try {
        const newWindow = window.open(validUrl, '_blank', 'noopener,noreferrer');
        if (!newWindow) {
          // Popup blocked - fall through to anchor method
        } else {
          return;
        }
      } catch (e) {
        // Fall through to anchor method
      }
    }

    // Web fallback or when Capacitor App is not available
    // Special handling for WhatsApp, mailto, and tel links
    if (validUrl.includes('wa.me') || validUrl.includes('whatsapp://') || validUrl.startsWith('mailto:') || validUrl.startsWith('tel:')) {
      // For WhatsApp: try to open in new tab/window, fallback to direct navigation
      if (validUrl.includes('wa.me') || validUrl.includes('whatsapp://')) {
        try {
          // Try to open in new tab first
          const newWindow = window.open(validUrl, '_blank', 'noopener,noreferrer');
          if (!newWindow) {
            // Popup blocked - use direct navigation
            window.location.href = validUrl;
          }
        } catch (e) {
          // Fallback to direct navigation
          window.location.href = validUrl;
        }
      } else {
        // For mailto and tel, use direct navigation
        window.location.href = validUrl;
      }
      return;
    }

    // For other external links, try to open in new tab
    try {
      // Create a temporary anchor element and click it
      // This is more reliable than window.open for avoiding popup blockers
      const link = document.createElement('a');
      link.href = validUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      // Clean up after a short delay
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 100);
    } catch (e) {
      console.error('Failed to open link with anchor method:', e);
      // Fallback: try window.open
      try {
        const newWindow = window.open(validUrl, '_blank', 'noopener,noreferrer');
        if (!newWindow) {
          // Popup blocked - try direct navigation as last resort
          window.location.href = validUrl;
        }
      } catch (fallbackError) {
        console.error('Failed to open link:', fallbackError);
        // Last resort - direct navigation
        try {
          window.location.href = validUrl;
        } catch {
          console.error('All methods to open link failed');
        }
      }
    }
  } catch (error) {
    console.error('Error in openExternalLink:', error);
    // Silently fail - don't crash the app
  }
}

/**
 * Handle link click with browser option
 */
export function handleExternalLinkClick(
  e: React.MouseEvent<HTMLAnchorElement>,
  url: string,
  language: 'en' | 'hi' = 'en'
): void {
  try {
    e.preventDefault();
    e.stopPropagation();
    openExternalLink(url, language);
  } catch (error) {
    console.error('Error handling link click:', error);
  }
}

/**
 * Create safe link props for external links
 */
export function getExternalLinkProps(
  url: string,
  language: 'en' | 'hi' = 'en'
): {
  href: string;
  target: string;
  rel: string;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
} {
  return {
    href: url,
    target: '_blank',
    rel: 'noopener noreferrer',
    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
      handleExternalLinkClick(e, url, language);
    }
  };
}

