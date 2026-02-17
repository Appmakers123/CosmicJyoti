import React, { useState, useEffect, useMemo } from 'react';
import { Language } from '../types';
import { BackButton } from './common';
import AdBanner from './AdBanner';

const POSTS_PER_PAGE = 9;

interface DailyPost {
  id: string;
  articleId?: string;
  slug: string;
  date?: string;
  title: string;
  excerpt: string;
  content?: string;
  readingTime?: string;
  topic?: string;
  serviceMode?: string;
  serviceLabel?: string;
}

interface DailyPostsData {
  lastGenerated?: string;
  date?: string;
  totalPosts?: number;
  posts: DailyPost[];
}

/** Map blog serviceMode to app route mode (e.g. same name; add any alias here) */
const SERVICE_MODE_TO_APP: Record<string, string> = {
  matchmaking: 'matchmaking',
  compatibility: 'compatibility',
  daily: 'daily',
  kundali: 'kundali',
  panchang: 'panchang',
  muhurat: 'muhurat',
  tarot: 'tarot',
  'palm-reading': 'palm-reading',
  numerology: 'numerology',
  dreams: 'dreams',
  mantra: 'mantra',
  gemstones: 'gemstones',
  vastu: 'vastu',
  'cosmic-health': 'cosmic-health',
  'planets-houses': 'planets-houses',
};

function appModeFor(post: DailyPost): string | null {
  const mode = (post.serviceMode || '').trim();
  if (!mode) return null;
  return SERVICE_MODE_TO_APP[mode.toLowerCase()] || mode;
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

const DailyAIBlog: React.FC<DailyAIBlogProps> = ({ language, onBack, onTryModule }) => {
  const [data, setData] = useState<DailyPostsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<DailyPost | null>(null);

  useEffect(() => {
    fetch('/blog/daily-posts.json')
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
    let list = data.posts;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = data.posts.filter((p) => relevanceScore(p, searchQuery) > 0);
      list = [...list].sort((a, b) => relevanceScore(b, searchQuery) - relevanceScore(a, searchQuery));
    }
    if (topicFilter) {
      list = list.filter((p) => {
        const t = (p.serviceLabel || p.topic || p.serviceMode || '').toLowerCase();
        return t.includes(topicFilter.toLowerCase());
      });
    }
    return list;
  }, [data?.posts, searchQuery, topicFilter]);

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

  const articleUrl = (post: DailyPost) => {
    const id = post.articleId || post.id || (post.date ? `${post.date}-${post.slug}` : post.slug);
    return `/blog/article.html?id=${encodeURIComponent(id)}`;
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
    const mode = appModeFor(post) || post.serviceMode;
    return mode ? `/?mode=${encodeURIComponent(mode)}` : '/';
  };

  const handleTryClick = (e: React.MouseEvent, post: DailyPost) => {
    const mode = appModeFor(post) || post.serviceMode;
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
    const tryMode = appModeFor(post) || post.serviceMode;
    const tryUrl = serviceUrl(post);
    return (
      <section className="animate-fade-in-up bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <BackButton onClick={() => setSelectedPost(null)} label={language === 'hi' ? 'लेख सूची' : 'Article list'} />
        </div>
        <h1 className="text-xl md:text-2xl font-serif font-bold text-amber-200 mb-2">{post.title}</h1>
        <p className="text-slate-500 text-sm mb-6">
          {post.date ? new Date(post.date).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { dateStyle: 'long' }) : ''}
          {post.readingTime && ` • ${post.readingTime}`}
        </p>
        {post.content ? (
          <div
            className="article-body prose prose-invert max-w-none text-slate-300 space-y-4 [&_h2]:text-amber-200 [&_h2]:text-lg [&_h2]:mt-6 [&_h3]:text-amber-100 [&_h3]:text-base [&_h3]:mt-4 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:ml-6 [&_li]:mb-1"
            dangerouslySetInnerHTML={{ __html: post.content }}
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
        <p className="text-slate-500 text-xs">
          {language === 'hi' ? `${filteredAndSorted.length} लेख मिले` : `${filteredAndSorted.length} article${filteredAndSorted.length !== 1 ? 's' : ''} found`}
          {displayDate && ` • ${language === 'hi' ? 'अंतिम अपडेट: ' : 'Last updated: '}${new Date(displayDate).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { dateStyle: 'long' })}`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedPosts.map((post) => (
          <div
            key={post.id}
            className="block bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 hover:border-amber-500/40 hover:bg-slate-800/60 transition-all group cursor-pointer"
            onClick={() => setSelectedPost(post)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedPost(post)}
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
              {(appModeFor(post) || post.serviceMode) && (
                <a
                  href={serviceUrl(post)}
                  onClick={(e) => handleTryClick(e, post)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/20 border border-amber-500/40 rounded-lg text-amber-300 text-xs font-medium hover:bg-amber-600/30 transition-colors"
                >
                  {language === 'hi' ? 'आज़माएं' : 'Try'} {post.serviceLabel || post.topic}
                </a>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleShareArticle(e, post); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 text-xs font-medium hover:bg-slate-600/50 hover:text-slate-200 transition-colors"
                aria-label={language === 'hi' ? 'शेयर करें' : 'Share'}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {language === 'hi' ? 'शेयर' : 'Share'}
              </button>
            </div>
          </div>
        ))}
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
