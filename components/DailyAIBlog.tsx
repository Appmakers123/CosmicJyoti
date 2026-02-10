import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { BackButton } from './common';
import AdBanner from './AdBanner';

interface DailyPost {
  id: string;
  articleId?: string;
  slug: string;
  date?: string;
  title: string;
  excerpt: string;
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

interface DailyAIBlogProps {
  language: Language;
  onBack?: () => void;
}

const DailyAIBlog: React.FC<DailyAIBlogProps> = ({ language, onBack }) => {
  const [data, setData] = useState<DailyPostsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  const serviceUrl = (post: DailyPost) => {
    const mode = post.serviceMode;
    return mode ? `/?mode=${encodeURIComponent(mode)}` : '/';
  };

  const displayDate = data.lastGenerated || data.date || (data.posts[0]?.date ?? '');

  return (
    <section className="animate-fade-in-up bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-serif font-bold text-amber-200 flex items-center gap-2">
          <span>📝</span>
          {language === 'hi' ? "AI लेख" : "AI Articles"}
        </h3>
        {onBack && <BackButton onClick={onBack} label={language === 'hi' ? 'वापस' : 'Back'} />}
      </div>
      <p className="text-slate-500 text-xs mb-4">
        {language === 'hi' ? `${data.posts.length} लेख` : `${data.posts.length} articles`}
        {displayDate && ` • ${language === 'hi' ? 'अंतिम अपडेट: ' : 'Last updated: '}${new Date(displayDate).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { dateStyle: 'long' })}`}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.posts.map((post) => (
          <div
            key={post.id}
            className="block bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 hover:border-amber-500/40 hover:bg-slate-800/60 transition-all group"
          >
            <a
              href={articleUrl(post)}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
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
            </a>
            {post.serviceMode && (
              <a
                href={serviceUrl(post)}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/20 border border-amber-500/40 rounded-lg text-amber-300 text-xs font-medium hover:bg-amber-600/30 transition-colors"
              >
                {language === 'hi' ? 'आज़माएं' : 'Try'} {post.serviceLabel || post.topic}
              </a>
            )}
          </div>
        ))}
      </div>
      <AdBanner variant="display" className="mt-8" />
    </section>
  );
};

export default DailyAIBlog;
