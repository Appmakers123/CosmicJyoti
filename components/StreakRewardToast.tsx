import React, { useEffect, useState } from 'react';
import { Language } from '../types';

const STORAGE_KEY = 'cosmicjyoti_streak_reward_shown';

interface StreakRewardToastProps {
  language: Language;
  streakCount: number;
  onClose: () => void;
}

const milestones: { days: number; messageEn: string; messageHi: string }[] = [
  { days: 3, messageEn: '3-day streak! You\'re building a habit.', messageHi: '3 दिन स्ट्रीक! आप आदत बना रहे हैं।' },
  { days: 7, messageEn: '7-day streak! Amazing consistency.', messageHi: '7 दिन स्ट्रीक! कमाल की नियमितता।' },
  { days: 30, messageEn: '30-day streak! You\'re a cosmic regular.', messageHi: '30 दिन स्ट्रीक! आप नियमित ज्योतिष प्रेमी हैं।' },
];

const StreakRewardToast: React.FC<StreakRewardToastProps> = ({ language, streakCount, onClose }) => {
  const [visible, setVisible] = useState(false);
  const milestone = milestones.find((m) => m.days === streakCount);

  useEffect(() => {
    if (!milestone || !streakCount) return;
    const shown = localStorage.getItem(`${STORAGE_KEY}_${milestone.days}`);
    if (!shown) {
      setVisible(true);
      localStorage.setItem(`${STORAGE_KEY}_${milestone.days}`, '1');
      const t = setTimeout(() => {
        setVisible(false);
        onClose();
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [milestone, streakCount, onClose]);

  if (!visible || !milestone) return null;

  return (
    <div className="animate-fade-in-up fixed bottom-24 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[54] p-4 rounded-xl bg-amber-500/20 border border-amber-400/50 shadow-xl backdrop-blur-md flex items-center gap-3">
      <span className="text-2xl">🔥</span>
      <p className="text-sm text-amber-100 flex-1">
        {language === 'hi' ? milestone.messageHi : milestone.messageEn}
      </p>
      <button
        onClick={() => { setVisible(false); onClose(); }}
        className="p-1 rounded text-slate-400 hover:text-amber-200"
        aria-label={language === 'hi' ? 'बंद करें' : 'Close'}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
};

export default StreakRewardToast;
