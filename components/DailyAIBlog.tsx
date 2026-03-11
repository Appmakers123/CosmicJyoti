import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Language } from '../types';
import { BackButton } from './common';
import AdBanner from './AdBanner';
import { sanitizeHtml } from '../utils/sanitize';
import { trackArticleRead } from '../utils/dataLayer';
import { isBackendConfigured, getBackendBaseUrl } from '../services/backendService';

const POSTS_PER_PAGE = 9;
const STORAGE_KEY_ARTICLE_LIKES = 'cosmicjyoti_article_likes';
const STORAGE_KEY_ARTICLE_VIEWS = 'cosmicjyoti_article_views';

function getArticleId(post: DailyPost): string {
  return post.articleId || post.id || (post.date && post.slug ? `${post.date}-${post.slug}` : post.slug);
}

function getStoredArticleLikes(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ARTICLE_LIKES);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function setStoredArticleLikes(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY_ARTICLE_LIKES, JSON.stringify([...ids]));
  } catch (_) {}
}

function getStoredArticleViews(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ARTICLE_VIEWS);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return typeof obj === 'object' && obj !== null ? obj : {};
  } catch {
    return {};
  }
}

function incrementStoredArticleView(id: string) {
  const views = getStoredArticleViews();
  views[id] = (views[id] || 0) + 1;
  try {
    localStorage.setItem(STORAGE_KEY_ARTICLE_VIEWS, JSON.stringify(views));
  } catch (_) {}
}

interface DailyPost {
  id: string;
  articleId?: string;
  slug: string;
  date?: string;
  title: string;
  excerpt: string;
  content?: string;
  readingTime?: string;
  imageUrl?: string;
  topic?: string;
  serviceMode?: string;
  serviceLabel?: string;
  /** Related article IDs (from Gemini embeddings script). */
  relatedIds?: string[];
}

interface DailyPostsData {
  lastGenerated?: string;
  date?: string;
  totalPosts?: number;
  posts: DailyPost[];
}

/** Map blog serviceMode to app route mode. Not every blog has a module; only show Try when mapped. */
const SERVICE_MODE_TO_APP: Record<string, string> = {
  matchmaking: 'matchmaking',
  compatibility: 'compatibility',
  daily: 'daily',
  horoscope: 'daily',
  kundali: 'kundali',
  'birth chart': 'kundali',
  panchang: 'panchang',
  'daily panchang': 'panchang',
  panchangam: 'panchang',
  muhurat: 'muhurat',
  tarot: 'tarot',
  'palm-reading': 'palm-reading',
  palmistry: 'palm-reading',
  'face-reading': 'face-reading',
  'face reading': 'face-reading',
  numerology: 'numerology',
  dreams: 'dreams',
  mantra: 'mantra',
  gemstones: 'gemstones',
  vastu: 'vastu',
  'cosmic-health': 'cosmic-health',
  'cosmic health': 'cosmic-health',
  'planets-houses': 'planets-houses',
  varshphal: 'varshphal',
  disha: 'disha',
  upay: 'upay',
  birthstone: 'birthstone',
  'name suggestions': 'name-suggestions',
};

/** Valid app modes that can be navigated to from blog Try button */
const VALID_TRY_MODES = new Set([
  'daily', 'kundali', 'panchang', 'muhurat', 'compatibility', 'matchmaking',
  'tarot', 'palm-reading', 'face-reading', 'numerology', 'dreams', 'mantra',
  'gemstones', 'vastu', 'cosmic-health', 'planets-houses', 'varshphal', 'disha', 'upay', 'birthstone', 'name-suggestions',
]);

function appModeFor(post: DailyPost): string | null {
  const raw = (post.serviceMode || post.serviceLabel || post.topic || '').trim();
  if (!raw) return null;
  const key = raw.toLowerCase().replace(/\s+/g, ' ').trim();
  const mode = SERVICE_MODE_TO_APP[key] || SERVICE_MODE_TO_APP[raw.toLowerCase()] || (VALID_TRY_MODES.has(key) ? key : null);
  return mode && VALID_TRY_MODES.has(mode) ? mode : null;
}

interface DailyAIBlogProps {
  language: Language;
  onBack?: () => void;
  /** When set, Try button navigates in-app to this mode without full page reload */
  onTryModule?: (mode: string) => void;
}

function relevanceScore(post: DailyPost, q: string): number {
  if (!q.trim()) return 0;
  const lower = q.toLowerCase().trim();
  const title = (post.title || '').toLowerCase();
  const excerpt = (post.excerpt || '').toLowerCase();
  const topic = (post.topic || '').toLowerCase();
  const label = (post.serviceLabel || '').toLowerCase();
  const mode = (post.serviceMode || '').toLowerCase();
  let score = 0;
  if (title.includes(lower)) score += 3;
  if (excerpt.includes(lower)) score += 2;
  if (topic.includes(lower) || label.includes(lower) || mode.includes(lower)) score += 1;
  return score;
}

/** Preload an article image so it's ready when user opens the article */
function preloadArticleImage(post: DailyPost): void {
  const articleId = post.articleId || post.id || (post.date && post.slug ? `${post.date}-${post.slug}` : post.slug);
  const src = post.imageUrl ? `/blog/images/${articleId}.png` : '/app-logo.png';
  const img = new Image();
  img.src = src;
}

const DailyAIBlog: React.FC<DailyAIBlogProps> = ({ language, onBack, onTryModule }) => {
  const [data, setData] = useState<DailyPostsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<DailyPost | null>(null);
  const [articleImageLoaded, setArticleImageLoaded] = useState(false);
  /** Semantic search result (post ids in order). Null when not using backend or not yet fetched. */
  const [semanticPostIds, setSemanticPostIds] = useState<string[] | null>(null);
  const [semanticSearchLoading, setSemanticSearchLoading] = useState(false);
  const [likes, setLikes] = useState<Set<string>>(getStoredArticleLikes);
  const [views, setViews] = useState<Record<string, number>>(getStoredArticleViews);

  useEffect(() => {
    fetch('/blog/daily-posts.json', { cache: 'no-store' })
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

  // Reset image loaded state when switching to another article
  useEffect(() => {
    setArticleImageLoaded(false);
  }, [selectedPost?.id]);

  const handleOpenArticle = useCallback((post: DailyPost) => {
    const id = getArticleId(post);
    trackArticleRead(post.articleId || post.id || '', post.title);
    incrementStoredArticleView(id);
    setViews((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setSelectedPost(post);
  }, []);

  const handleLikeArticle = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setLikes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setStoredArticleLikes(next);
      return next;
    });
  }, []);

  // Read initial search/page from URL for indexing and shareable links
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    const p = params.get('page');
    if (q) setSearchQuery(q);
    if (p) {
      const n = parseInt(p, 10);
      if (n >= 1) setCurrentPage(n);
    }
  }, []);

  // Semantic search when backend is configured and user has typed a query
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q || !isBackendConfigured() || !data?.posts?.length) {
      setSemanticPostIds(null);
      return;
    }
    const base = getBackendBaseUrl();
    if (!base) return;
    setSemanticSearchLoading(true);
    setSemanticPostIds(null);
    fetch(`${base}/api/blog-search?q=${encodeURIComponent(q)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Search failed'))))
      .then((body: { postIds?: string[] }) => {
        setSemanticPostIds(Array.isArray(body.postIds) ? body.postIds : []);
      })
      .catch(() => setSemanticPostIds(null))
      .finally(() => setSemanticSearchLoading(false));
  }, [searchQuery, data?.posts?.length]);

  const allTopics = useMemo(() => {
    if (!data?.posts?.length) return [];
    const set = new Set<string>();
    data.posts.forEach((p) => {
      const t = p.serviceLabel || p.topic || p.serviceMode || '';
      if (t) set.add(t);
    });
    return Array.from(set).sort();
  }, [data?.posts]);

  const filteredAndSorted = useMemo(() => {
    if (!data?.posts?.length) return [];
    const q = searchQuery.trim().toLowerCase();
    const useSemantic = q && semanticPostIds && semanticPostIds.length > 0;
    let list: DailyPost[];
    if (useSemantic) {
      const idSet = new Set(semanticPostIds);
      list = semanticPostIds
        .map((id) => data.posts.find((p) => (p.articleId || p.id) === id))
        .filter((p): p is DailyPost => !!p);
      // Include any posts not in semantic result (e.g. new posts) at the end
      const rest = data.posts.filter((p) => !idSet.has(p.articleId || p.id || ''));
      list = [...list, ...rest];
    } else {
      list = [...data.posts];
      if (q) {
        list = list.filter((p) => relevanceScore(p, searchQuery) > 0);
        list.sort((a, b) => relevanceScore(b, searchQuery) - relevanceScore(a, searchQuery));
      } else {
        list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      }
    }
    if (topicFilter) {
      list = list.filter((p) => {
        const t = (p.serviceLabel || p.topic || p.serviceMode || '').toLowerCase();
        return t.includes(topicFilter.toLowerCase());
      });
    }
    return list;
  }, [data?.posts, searchQuery, topicFilter, semanticPostIds]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / POSTS_PER_PAGE));
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredAndSorted.slice(start, start + POSTS_PER_PAGE);
  }, [filteredAndSorted, currentPage]);

  const updateUrl = (q: string, page: number) => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (q) params.set('q', q); else params.delete('q');
    if (page > 1) params.set('page', String(page)); else params.delete('page');
    const search = params.toString();
    const url = window.location.pathname + (search ? `?${search}` : '') + (window.location.hash || '');
    window.history.replaceState({}, '', url);
  };

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    updateUrl(value, 1);
  };

  const handleTopicChange = (value: string) => {
    setTopicFilter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrl(searchQuery, page);
  };

  if (loading) {
    return (
      <section className="animate-fade-in-up bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-serif font-bold text-amber-200 flex items-center gap-2">
            <span>📝</span>
            {language === 'hi' ? "AI लेख" : "AI Articles"}
          </h3>
          {onBack && <BackButton onClick={onBack} label={language === 'hi' ? 'वापस' : 'Back'} />}
        </div>
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 border-2 border-amber-500/50 border-t-amber-400 rounded-full animate-spin" />
          <span className="text-sm">{language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</span>
        </div>
      </section>
    );
  }

  if (error || !data?.posts?.length) {
    return (
      <section className="animate-fade-in-up bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 md:p-8">
        {onBack && <BackButton onClick={onBack} label={language === 'hi' ? 'वापस' : 'Back'} className="mb-4" />}
        <p className="text-slate-500">{language === 'hi' ? 'लेख जल्द ही उपलब्ध होंगे।' : 'Articles will be available soon.'}</p>
      </section>
    );
  }

  /** Permanent URL for each article (Google News compliant). Format: /blog/{articleId}/ */
  const articleUrl = (post: DailyPost) => {
    const id = post.articleId || post.id || (post.date ? `${post.date}-${post.slug}` : post.slug);
    return `/blog/${encodeURIComponent(id)}/`;
  };

  const fullArticleUrl = (post: DailyPost) => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${articleUrl(post)}`;
  };

  const handleShareArticle = async (e: React.MouseEvent, post: DailyPost) => {
    e.preventDefault();
    e.stopPropagation();
    const url = fullArticleUrl(post);
    const text = `${post.title} – CosmicJyoti\n${url}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.excerpt, url });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
        }
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    }
  };

  const serviceUrl = (post: DailyPost) => {
    const mode = appModeFor(post);
    return mode ? `/?mode=${encodeURIComponent(mode)}` : '/';
  };

  const handleTryClick = (e: React.MouseEvent, post: DailyPost) => {
    const mode = appModeFor(post);
    if (mode && onTryModule) {
      e.preventDefault();
      e.stopPropagation();
      onTryModule(mode);
    }
  };

  const displayDate = data.lastGenerated || data.date || (data.posts[0]?.date ?? '');

  // In-app article view (stay in dashboard, no redirect to blog.html)
  if (selectedPost) {
    const post = selectedPost;
    const tryMode = appModeFor(post);
    const tryUrl = serviceUrl(post);
    const articleId = post.articleId || post.id || (post.date && post.slug ? `${post.date}-${post.slug}` : post.slug);
    const imageSrc = post.imageUrl ? `/blog/images/${articleId}.png` : '/app-logo.png';
    return (
      <section className="animate-fade-in-up bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <BackButton onClick={() => setSelectedPost(null)} label={language === 'hi' ? 'लेख सूची' : 'Article list'} />
        </div>
        <h1 className="text-xl md:text-2xl font-serif font-bold text-amber-200 mb-2">{post.title}</h1>
        <p className="text-slate-500 text-sm mb-2">
          {post.date ? new Date(post.date).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { dateStyle: 'long' }) : ''}
          {post.readingTime && ` • ${post.readingTime}`}
        </p>
        <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-slate-700">
          <button
            type="button"
            onClick={(e) => handleLikeArticle(e, articleId)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              likes.has(articleId)
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'bg-slate-700/50 text-slate-400 border border-slate-600 hover:text-amber-300'
            }`}
            aria-label={language === 'hi' ? 'पसंद करें' : 'Like'}
          >
            <svg className="w-4 h-4" fill={likes.has(articleId) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {language === 'hi' ? (likes.has(articleId) ? 'पसंद किया' : 'पसंद') : (likes.has(articleId) ? 'Liked' : 'Like')}
          </button>
          {(views[articleId] ?? 0) > 0 && (
            <span className="inline-flex items-center gap-2 text-slate-500 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {views[articleId]} {language === 'hi' ? (views[articleId] === 1 ? 'बार देखा' : 'बार देखा गया') : (views[articleId] === 1 ? 'view' : 'views')}
            </span>
          )}
          <button
            type="button"
            onClick={(e) => handleShareArticle(e, post)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 text-sm font-medium hover:bg-slate-600/50 hover:text-slate-200 transition-colors"
            aria-label={language === 'hi' ? 'शेयर करें' : 'Share'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {language === 'hi' ? 'शेयर' : 'Share'}
          </button>
        </div>
        <figure className="my-6 relative min-h-[200px]">
          {!articleImageLoaded && (
            <div className="absolute inset-0 max-w-2xl rounded-xl bg-slate-700/40 animate-pulse" aria-hidden />
          )}
          <img
            src={imageSrc}
            alt=""
            className={`w-full max-w-2xl rounded-xl border border-slate-600 transition-opacity duration-300 ${articleImageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="eager"
            onLoad={() => setArticleImageLoaded(true)}
          />
        </figure>
        {post.content ? (
          <div
            className="article-body prose prose-invert max-w-none text-slate-300 space-y-4 [&_h2]:text-amber-200 [&_h2]:text-lg [&_h2]:mt-6 [&_h3]:text-amber-100 [&_h3]:text-base [&_h3]:mt-4 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:ml-6 [&_li]:mb-1"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
          />
        ) : (
          <p className="text-slate-400">{post.excerpt}</p>
        )}
        {tryMode && (
          <div className="mt-6 pt-6 border-t border-slate-700">
            <a
              href={tryUrl}
              onClick={(e) => handleTryClick(e, post)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl transition-colors"
            >
              {language === 'hi' ? 'आज़माएं' : 'Try'} {post.serviceLabel || post.topic}
            </a>
          </div>
        )}
        {data && (post.relatedIds?.length ?? 0) > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-700">
            <h3 className="text-lg font-serif font-bold text-amber-200 mb-3">
              {language === 'hi' ? 'संबंधित लेख' : 'Related articles'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(post.relatedIds || [])
                .slice(0, 4)
                .map((rid) => data.posts.find((p) => (p.articleId || p.id) === rid))
                .filter((p): p is DailyPost => !!p && p.id !== post.id)
                .map((related) => (
                  <button
                    key={related.id}
                    type="button"
                    onClick={() => handleOpenArticle(related)}
                    className="text-left p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 hover:border-amber-500/40 hover:bg-slate-800/60 transition-all"
                  >
                    <h4 className="font-medium text-amber-100 line-clamp-2">{related.title}</h4>
                    <p className="text-slate-500 text-xs mt-1">
                      {related.date ? new Date(related.date).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </p>
                  </button>
                ))}
            </div>
          </div>
        )}
        <div className="mt-6">
          <BackButton onClick={() => setSelectedPost(null)} label={language === 'hi' ? 'सभी लेख' : 'All articles'} />
        </div>
      </section>
    );
  }

  return (
    <section className="animate-fade-in-up bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-xl font-serif font-bold text-amber-200 flex items-center gap-2">
          <span>📝</span>
          {language === 'hi' ? "AI लेख" : "AI Articles"}
        </h3>
        {onBack && <BackButton onClick={onBack} label={language === 'hi' ? 'वापस' : 'Back'} />}
      </div>

      {/* Search and filter */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="search"
            placeholder={language === 'hi' ? 'लेख खोजें (शीर्षक, विषय)...' : 'Search articles (title, topic)...'}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1 min-w-[180px] px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-600 text-slate-200 placeholder-slate-500 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 outline-none transition"
            aria-label={language === 'hi' ? 'खोज' : 'Search'}
          />
          <select
            value={topicFilter}
            onChange={(e) => handleTopicChange(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-600 text-slate-200 focus:border-amber-500/50 outline-none transition"
            aria-label={language === 'hi' ? 'विषय फ़िल्टर' : 'Filter by topic'}
          >
            <option value="">{language === 'hi' ? 'सभी विषय' : 'All topics'}</option>
            {allTopics.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <p className="text-slate-500 text-xs flex items-center gap-2">
          {semanticSearchLoading && searchQuery.trim() && (
            <span className="inline-block w-3 h-3 border-2 border-amber-500/50 border-t-amber-400 rounded-full animate-spin" aria-hidden />
          )}
          {language === 'hi' ? `${filteredAndSorted.length} लेख मिले` : `${filteredAndSorted.length} article${filteredAndSorted.length !== 1 ? 's' : ''} found`}
          {searchQuery.trim() && semanticPostIds && !semanticSearchLoading && isBackendConfigured() && (
            <span className="text-amber-400/90">(semantic)</span>
          )}
          {displayDate && ` • ${language === 'hi' ? 'अंतिम अपडेट: ' : 'Last updated: '}${new Date(displayDate).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { dateStyle: 'long' })}`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedPosts.map((post) => {
          const articleId = getArticleId(post);
          const isLiked = likes.has(articleId);
          const viewCount = views[articleId] ?? 0;
          return (
            <div
              key={post.id}
              className="block bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 hover:border-amber-500/40 hover:bg-slate-800/60 transition-all group cursor-pointer"
              onClick={() => handleOpenArticle(post)}
              onMouseEnter={() => preloadArticleImage(post)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') handleOpenArticle(post); }}
              aria-label={post.title}
            >
              <div className="block">
                <h4 className="font-serif font-bold text-amber-100 group-hover:text-amber-200 mb-1 line-clamp-2">
                  {post.title}
                </h4>
                <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-2">
                  {post.date ? new Date(post.date).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''} • {post.readingTime || '5 min read'}
                </p>
                <p className="text-slate-400 text-sm line-clamp-2">{post.excerpt}</p>
                <span className="inline-block mt-2 text-amber-400 text-xs font-medium group-hover:underline">
                  {language === 'hi' ? 'पढ़ें →' : 'Read More →'}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={(e) => handleLikeArticle(e, articleId)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isLiked
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : 'bg-slate-700/50 text-slate-400 border border-slate-600 hover:text-amber-300'
                  }`}
                  aria-label={isLiked ? (language === 'hi' ? 'पसंद हटाएं' : 'Unlike') : (language === 'hi' ? 'पसंद करें' : 'Like')}
                >
                  <svg className="w-3.5 h-3.5" fill={isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {language === 'hi' ? (isLiked ? 'पसंद किया' : 'पसंद') : (isLiked ? 'Liked' : 'Like')}
                </button>
                {viewCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {viewCount}
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleShareArticle(e, post); }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 text-xs font-medium hover:bg-slate-600/50 hover:text-slate-200 transition-colors"
                  aria-label={language === 'hi' ? 'शेयर करें' : 'Share'}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  {language === 'hi' ? 'शेयर' : 'Share'}
                </button>
                {appModeFor(post) && (
                  <a
                    href={serviceUrl(post)}
                    onClick={(e) => handleTryClick(e, post)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/20 border border-amber-500/40 rounded-lg text-amber-300 text-xs font-medium hover:bg-amber-600/30 transition-colors ml-auto"
                  >
                    {language === 'hi' ? 'आज़माएं' : 'Try'} {post.serviceLabel || post.topic}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label={language === 'hi' ? 'पृष्ठ संचालन' : 'Pagination'}>
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600/50 hover:text-amber-200 transition"
          >
            {language === 'hi' ? 'पिछला' : 'Previous'}
          </button>
          <span className="px-3 py-2 text-slate-400 text-sm">
            {language === 'hi' ? `पृष्ठ ${currentPage} / ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
          </span>
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600/50 hover:text-amber-200 transition"
          >
            {language === 'hi' ? 'अगला' : 'Next'}
          </button>
        </nav>
      )}

      {filteredAndSorted.length === 0 && (
        <p className="mt-6 text-slate-500 text-center">
          {language === 'hi' ? 'कोई लेख नहीं मिला। खोज या फ़िल्टर बदलें।' : 'No articles found. Try changing your search or filter.'}
        </p>
      )}

      <AdBanner variant="display" className="mt-8" />
    </section>
  );
};

export default DailyAIBlog;
