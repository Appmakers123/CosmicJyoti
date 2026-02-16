import React, { useState } from 'react';
import { Language } from '../types';
import { addKarma } from '../utils/karmaService';
import { PLAY_STORE_URL } from '../constants';

interface InviteFriendBannerProps {
  language: Language;
  karmaBalance: number;
  onKarmaUpdate: () => void;
}

const INVITE_KARMA = 2;
const STORAGE_KEY = 'cosmicjyoti_invite_share_count';
const MAX_SHARES_FOR_KARMA_PER_DAY = 3;

const InviteFriendBanner: React.FC<InviteFriendBannerProps> = ({ language, karmaBalance, onKarmaUpdate }) => {
  const [shared, setShared] = useState(false);

  const getTodayShares = (): number => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return 0;
      const data = JSON.parse(raw) as { date: string; count: number };
      const today = new Date().toISOString().split('T')[0];
      return data.date === today ? data.count : 0;
    } catch { return 0; }
  };

  const handleShare = async () => {
    const today = new Date().toISOString().split('T')[0];
    const current = getTodayShares();
    if (current >= MAX_SHARES_FOR_KARMA_PER_DAY) {
      doShare(false);
      return;
    }
    const text = language === 'hi'
      ? `CosmicJyoti – मुफ्त कुंडली, राशिफल और पंचांग। आज़माएं: ${PLAY_STORE_URL}`
      : `Try CosmicJyoti – free Kundali, horoscope & Panchang. ${PLAY_STORE_URL}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CosmicJyoti',
          text,
          url: PLAY_STORE_URL,
        });
        setShared(true);
        addKarma(INVITE_KARMA);
        onKarmaUpdate();
        const newCount = current + 1;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: newCount }));
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          doShare(current < MAX_SHARES_FOR_KARMA_PER_DAY);
        }
      }
    } else {
      doShare(current < MAX_SHARES_FOR_KARMA_PER_DAY);
    }
  };

  const doShare = (giveKarma: boolean) => {
    const url = PLAY_STORE_URL;
    const text = language === 'hi'
      ? `CosmicJyoti – मुफ्त कुंडली, राशिफल और पंचांग। आज़माएं: ${url}`
      : `Try CosmicJyoti – free Kundali, horoscope & Panchang. ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    setShared(true);
    if (giveKarma) {
      addKarma(INVITE_KARMA);
      onKarmaUpdate();
      const today = new Date().toISOString().split('T')[0];
      const current = getTodayShares();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: current + 1 }));
    }
  };

  return (
    <section className="animate-fade-in-up rounded-2xl border border-slate-600 bg-slate-800/50 p-4 md:p-5">
      <h3 className="text-sm font-serif font-bold text-amber-200 uppercase tracking-wider mb-2 flex items-center gap-2">
        <span>👋</span>
        {language === 'hi' ? 'दोस्त को बुलाएं' : 'Invite a friend'}
      </h3>
      <p className="text-slate-400 text-sm mb-3">
        {language === 'hi'
          ? 'ऐप शेयर करें और +2 कर्मा पाएं (रोज़ अधिकतम 3 बार)।'
          : 'Share the app and earn +2 karma (max 3 times per day).'}
      </p>
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-500/80 text-white font-semibold text-sm transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        {shared ? (language === 'hi' ? 'शेयर किया!' : 'Shared!') : (language === 'hi' ? 'शेयर करें' : 'Share & earn karma')}
      </button>
    </section>
  );
};

export default InviteFriendBanner;
