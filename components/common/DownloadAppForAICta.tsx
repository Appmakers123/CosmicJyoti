import React from 'react';
import { Language } from '../../types';
import { PLAY_STORE_URL } from '../../constants';
import { getExternalLinkProps, isCapacitor } from '../../utils/linkHandler';

interface DownloadAppForAICtaProps {
  language: Language;
  accentColor?: 'amber' | 'pink' | 'purple' | 'indigo';
}

/**
 * Shown when AI is unable to respond (e.g. CORS on web).
 * Frames it as a feature: "Download the app to use full AI features."
 * Only shown on web (not in native app).
 */
const DownloadAppForAICta: React.FC<DownloadAppForAICtaProps> = ({
  language,
  accentColor = 'amber',
}) => {
  if (isCapacitor()) return null;

  const message =
    language === 'hi'
      ? 'यहाँ AI उपलब्ध नहीं है। पूर्ण AI सुविधाओं के लिए ऐप डाउनलोड करें।'
      : "AI isn't available here. Download the app to use full AI features.";
  const buttonText =
    language === 'hi' ? 'ऐप डाउनलोड करें' : 'Download App';

  const colorClasses = {
    amber: 'from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500',
    pink: 'from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500',
    purple: 'from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500',
    indigo: 'from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500',
  };
  const cls = colorClasses[accentColor];

  return (
    <div className="mt-3 p-3 rounded-xl bg-slate-800/60 border border-slate-600/50">
      <p className="text-slate-300 text-sm mb-3">{message}</p>
      <a
        {...getExternalLinkProps(PLAY_STORE_URL, language)}
        className={`w-full px-4 py-2.5 bg-gradient-to-r ${cls} text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 block text-center`}
      >
        <span>📱</span>
        {buttonText}
      </a>
    </div>
  );
};

export default DownloadAppForAICta;
