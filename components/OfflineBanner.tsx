import React from 'react';
import { Language } from '../types';

interface OfflineBannerProps {
  isOnline: boolean;
  language: Language;
}

/**
 * Shows a banner when the user is offline.
 * Some features (API calls, ads) won't work without connectivity.
 */
const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOnline, language }) => {
  if (isOnline) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[200] bg-amber-900/95 border-b border-amber-500/50 px-4 py-2 text-center text-amber-200 text-sm font-medium"
      style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
      role="alert"
    >
      {language === 'hi'
        ? '📡 इंटरनेट कनेक्शन नहीं है। कुछ सुविधाएं उपलब्ध नहीं होंगी।'
        : '📡 No internet connection. Some features may not be available.'}
    </div>
  );
};

export default OfflineBanner;
