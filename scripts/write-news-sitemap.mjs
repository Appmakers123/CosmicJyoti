#!/usr/bin/env node
/** One-off: write public/blog/sitemap-news.xml from public/blog/daily-posts.json */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.resolve(__dirname, '../public/blog');
const BASE_URL = 'https://www.cosmicjyoti.com';

const raw = fs.readFileSync(path.join(BLOG_DIR, 'daily-posts.json'), 'utf8');
const data = JSON.parse(raw);
const allPosts = Array.isArray(data.posts) ? data.posts : [];
const today = new Date().toISOString().split('T')[0];
const twoDaysAgo = new Date();
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const cutoff = twoDaysAgo.toISOString().split('T')[0];
const newsPosts = allPosts.filter((p) => {
  const d = p.date || p.articleId?.slice(0, 10) || '';
  return d >= cutoff;
}).slice(0, 100);

const newsUrls = newsPosts.map((p) => {
  const id = p.articleId || p.id || (p.date && p.slug ? `${p.date}-${p.slug}` : p.slug);
  const loc = `${BASE_URL}/blog/article.html?id=${encodeURIComponent(id)}`;
  const pubDate = p.date || today;
  const isoDate = `${pubDate}T06:00:00+05:30`;
  const title = (p.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  return `  <url>
    <loc>${loc}</loc>
    <news:news xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
      <news:publication>
        <news:name>CosmicJyoti</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${isoDate}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>`;
}).join('\n');

const sitemapNews = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${newsUrls}
</urlset>`;

const outPath = path.join(BLOG_DIR, 'sitemap-news.xml');
fs.writeFileSync(outPath, sitemapNews, 'utf8');
console.log('Wrote', outPath, '(', newsPosts.length, 'articles)');
