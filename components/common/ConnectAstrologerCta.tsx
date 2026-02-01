import React from 'react';
import { Language } from '../../types';

interface ConnectAstrologerCtaProps {
  language: Language;
  onConnect: () => void;
  accentColor?: 'amber' | 'pink' | 'purple' | 'indigo';
}

const ConnectAstrologerCta: React.FC<ConnectAstrologerCtaProps> = ({
  language,
  onConnect,
  accentColor = 'amber',
}) => {
  const message =
    language === 'hi'
      ? 'AI अभी उपलब्ध नहीं है। हमारे ज्योतिषी से जुड़ें (भुगतान)'
      : "AI is unable to respond. Connect with our astrologer (paid)";
  const buttonText =
    language === 'hi' ? 'अपॉइंटमेंट बुक करें' : 'Book Appointment';

  const colorClasses = {
    amber: 'from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 border-amber-500/30',
    pink: 'from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 border-pink-500/30',
    purple: 'from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-purple-500/30',
    indigo: 'from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-indigo-500/30',
  };
  const cls = colorClasses[accentColor];

  return (
    <div className="mt-3 p-3 rounded-xl bg-slate-800/60 border border-slate-600/50">
      <p className="text-slate-300 text-sm mb-3">{message}</p>
      <button
        type="button"
        onClick={onConnect}
        className={`w-full px-4 py-2.5 bg-gradient-to-r ${cls} text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2`}
      >
        <span>📅</span>
        {buttonText}
      </button>
    </div>
  );
};

export default ConnectAstrologerCta;
