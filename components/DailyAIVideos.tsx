import React, { useState, useEffect, useCallback } from 'react';
import { Language } from '../types';
import { BackButton } from './common';

const STORAGE_KEY_LIKES = 'cosmicjyoti_video_likes';
const STORAGE_KEY_VIEWS = 'cosmicjyoti_video_views';

interface DailyVideoEntry {
  id?: string;
  date: string;
  slot: string;
  title: string;
  titleHi?: string;
  titleHinglish?: string;
  descriptionHi?: string;
  descriptionHinglish?: string;
  appMode?: string | null;
  videoUrl: string;
  generatedAt?: string;
}

interface DailyVideosData {
  lastUpdated?: string;
  videos: DailyVideoEntry[];
}

interface DailyAIVideosProps {
  language: Language;
  onBack?: () => void;
  /** Navigate to a dashboard module (e.g. kundali, panchang) when user taps Try on a video */
  onTryModule?: (mode: string) => void;
}

const SLOT_LABELS: Record<string, string> = {
  '2am': '2 बजे',
  '7am': '7 बजे',
  '11am': '11 बजे',
  '2pm': '2 बजे',
  '5pm': '5 बजे',
  '7pm': '7 बजे',
  '10pm': '10 बजे',
  '12am': '12 बजे',
};

function getStoredLikes(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LIKES);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function setStoredLikes(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY_LIKES, JSON.stringify([...ids]));
  } catch (_) {}
}

function getStoredViews(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VIEWS);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return typeof obj === 'object' && obj !== null ? obj : {};
  } catch {
    return {};
  }
}

function incrementStoredView(id: string) {
  const views = getStoredViews();
  views[id] = (views[id] || 0) + 1;
  try {
    localStorage.setItem(STORAGE_KEY_VIEWS, JSON.stringify(views));
  } catch (_) {}
}

export default function DailyAIVideos({ language, onBack, onTryModule }: DailyAIVideosProps) {
  const [data, setData] = useState<DailyVideosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [likes, setLikes] = useState<Set<string>>(getStoredLikes);
  const [views, setViews] = useState<Record<string, number>>(getStoredViews);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const isHi = true; // Hindi as primary for this section

  useEffect(() => {
    fetch('/blog/daily-videos.json', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then((d) => {
        setData(d);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const handleLike = useCallback((id: string) => {
    setLikes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setStoredLikes(next);
      return next;
    });
  }, []);

  const handleShare = useCallback((v: DailyVideoEntry) => {
    const id = v.id || `${v.date}-${v.slot}`;
    const title = v.titleHinglish || v.titleHi || v.title || 'CosmicJyoti video';
    const url = typeof window !== 'undefined' ? `${window.location.origin}${v.videoUrl}` : v.videoUrl;
    const text = `${title} - CosmicJyoti\n${url}`;
    if (navigator.share) {
      navigator.share({
        title: title,
        text: v.descriptionHinglish || v.descriptionHi || title,
        url,
      }).catch(() => {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
      });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const handleVideoPlay = useCallback((id: string) => {
    incrementStoredView(id);
    setViews((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }, []);

  if (loading) {
    return (
      <section className="animate-fade-in-up bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-serif font-bold text-amber-200 flex items-center gap-2">
            <span>🎬</span>
            AI वीडियो
          </h3>
          {onBack && <BackButton onClick={onBack} label="वापस" />}
        </div>
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 border-2 border-amber-500/50 border-t-amber-400 rounded-full animate-spin" />
          <span className="text-sm">लोड हो रहा है...</span>
        </div>
      </section>
    );
  }

  if (error || !data?.videos?.length) {
    return (
      <section className="animate-fade-in-up bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 md:p-8">
        {onBack && <BackButton onClick={onBack} label="वापस" className="mb-4" />}
        <h3 className="text-xl font-serif font-bold text-amber-200 flex items-center gap-2 mb-2">
          <span>🎬</span>
          AI वीडियो
        </h3>
        <p className="text-slate-500">
          वीडियो जल्द ही उपलब्ध होंगे। ग्रह, नक्षत्र, कुंडली मिलान, शुभ मुहूर्त और अन्य विषयों पर रोज़ नए वीडियो।
        </p>
      </section>
    );
  }

  const videos = [...data.videos].sort((a, b) => {
    const d = (b.date || '').localeCompare(a.date || '');
    if (d !== 0) return d;
    const order = ['2am', '7am', '11am', '2pm', '5pm', '7pm', '10pm', '12am'];
    return order.indexOf(b.slot) - order.indexOf(a.slot);
  });

  return (
    <section className="animate-fade-in-up bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-xl font-serif font-bold text-amber-200 flex items-center gap-2">
          <span>🎬</span>
          AI वीडियो
        </h3>
        {onBack && <BackButton onClick={onBack} label="वापस" />}
      </div>
      <p className="text-slate-500 text-sm mb-6">
        ग्रह, नक्षत्र, कुंडली, गुण मिलान, शुभ मुहूर्त, पंचांग और ज्योतिष से जुड़े रोज़ नए संक्षिप्त वीडियो। पसंद करें, शेयर करें।
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map((v) => {
          const id = v.id || `${v.date}-${v.slot}`;
          const title = v.titleHinglish || v.titleHi || v.title || `${v.date} ${v.slot}`;
          const slotLabel = SLOT_LABELS[v.slot] || v.slot;
          const isLiked = likes.has(id);
          const viewCount = views[id] ?? 0;

          return (
            <div
              key={id}
              className="rounded-xl overflow-hidden bg-slate-900/60 border border-slate-700/50 hover:border-amber-500/40 transition-all flex flex-col"
            >
              <video
                src={v.videoUrl}
                controls
                controlsList="nodownload noremoteplayback"
                disablePictureInPicture
                className="w-full aspect-video object-cover bg-slate-800"
                preload="metadata"
                playsInline
                onPlay={() => handleVideoPlay(id)}
                onContextMenu={(e) => e.preventDefault()}
              />
              <div className="p-3 flex flex-col flex-1">
                <p className="text-amber-200 font-medium text-sm line-clamp-2 mb-1">{title}</p>
                <p className="text-slate-500 text-xs mb-3">
                  {v.date} • {slotLabel}
                </p>
                {expandedId === id && (v.descriptionHinglish || v.descriptionHi) && (
                  <p className="text-slate-400 text-xs mb-3 leading-relaxed">{v.descriptionHinglish || v.descriptionHi}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-auto">
                  {v.appMode && onTryModule && (
                    <button
                      type="button"
                      onClick={() => onTryModule(v.appMode!)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-600/20 border border-amber-500/40 rounded-lg text-amber-300 text-xs font-medium hover:bg-amber-600/30 transition-colors"
                    >
                      Aazmaayein →
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleLike(id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isLiked
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : 'bg-slate-700/50 text-slate-400 border border-slate-600 hover:text-amber-300'
                    }`}
                    aria-label={isLiked ? 'पसंद हटाएं' : 'पसंद करें'}
                  >
                    <svg className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {isLiked ? 'पसंद किया' : 'पसंद'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare(v)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-600 hover:text-amber-300 transition-colors"
                    aria-label="शेयर करें"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    शेयर
                  </button>
                  {(v.descriptionHinglish || v.descriptionHi) && (
                    <button
                      type="button"
                      onClick={() => setExpandedId(expandedId === id ? null : id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-600 hover:text-amber-300 transition-colors ml-auto"
                      aria-label="Info"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {expandedId === id ? 'Band karein' : 'Jankari'}
                    </button>
                  )}
                </div>
                {viewCount > 0 && (
                  <p className="text-slate-500 text-[10px] mt-2 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {viewCount} {viewCount === 1 ? 'बार देखा' : 'बार देखा गया'}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {data.lastUpdated && (
        <p className="text-slate-500 text-xs mt-4">
          अंतिम अपडेट: {new Date(data.lastUpdated).toLocaleDateString('hi-IN', { dateStyle: 'long' })}
        </p>
      )}
    </section>
  );
}
