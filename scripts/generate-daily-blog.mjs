#!/usr/bin/env node
/**
 * Generate 2 daily AI blog posts per time slot.
 * Uses Perplexity API first; if Perplexity fails, falls back to Gemini.
 *
 * Time slots (run script with slot argument; schedule via cron or GitHub Actions):
 * - 6am  (morning): Horoscope + Compatibility
 * - 12pm (noon):    All dashboard modules rotating (Kundali, Panchang, Muhurat, Guna Milan, Tarot, Numerology, etc. – 2 per day)
 * - 6pm  (evening): Planetary position and its effect (2 articles)
 * - 9pm  (night):   Events and muhurat for the next day (2 articles)
 *
 * Usage:
 *   node scripts/generate-daily-blog.mjs [slot]
 *   slot = 6am | 12pm | 6pm | 9pm  (or morning | noon | evening | night)
 *
 * Requires at least one of:
 *   PERPLEXITY_API_KEY (or PERPLEXITY_API_KEYS) in .env or .env.local
 *   GEMINI_API_KEY or API_KEY for fallback
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

function loadEnvFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eq = trimmed.indexOf('=');
        if (eq > 0) {
          const key = trimmed.slice(0, eq).trim();
          let value = trimmed.slice(eq + 1).trim();
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
            value = value.slice(1, -1);
          else {
            const hashIdx = value.indexOf(' #');
            if (hashIdx !== -1) value = value.slice(0, hashIdx).trim();
          }
          if (!process.env[key]) process.env[key] = value;
        }
      }
    });
  } catch (_) {}
}

loadEnvFile(path.join(ROOT_DIR, '.env'));
loadEnvFile(path.join(ROOT_DIR, '.env.local'));

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

function getPerplexityKeys() {
  const keys = process.env.PERPLEXITY_API_KEYS || process.env.PERPLEXITY_API_KEY || '';
  const list = keys.split(',').map((k) => k.trim()).filter(Boolean);
  return list;
}

let perplexityKeyIndex = 0;

function getNextPerplexityKey() {
  const list = getPerplexityKeys();
  if (!list.length) return null;
  const key = list[perplexityKeyIndex % list.length];
  perplexityKeyIndex += 1;
  return key;
}

async function generateWithPerplexity(prompt, contextDate, postCount = 2) {
  const keys = getPerplexityKeys();
  if (!keys.length) return null;
  const systemContent = `You are an expert Vedic astrologer and content writer. Output ONLY valid JSON, no other text or markdown.`;
  const userContent = `${prompt}\n\nOutput a single JSON object with a "posts" array of exactly ${postCount} articles. No code fences, no explanation.`;
  const body = JSON.stringify({
    model: 'sonar',
    messages: [
      { role: 'system', content: systemContent },
      { role: 'user', content: userContent },
    ],
    max_tokens: 8192,
    temperature: 0.4,
  });
  const startIndex = perplexityKeyIndex % keys.length;
  perplexityKeyIndex += 1;
  let lastError = null;
  for (let j = 0; j < keys.length; j++) {
    const key = keys[(startIndex + j) % keys.length];
    try {
      const res = await fetch(PERPLEXITY_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body,
      });
      if (!res.ok) {
        const err = await res.text();
        const isRetryable = res.status === 429 || res.status >= 500;
        if (res.status === 401) {
          lastError = new Error(`Perplexity API 401: ${err}`);
          // 401 = invalid/expired key or auth rejected (e.g. by Cloudflare). Don't retry same key.
          if (j < keys.length - 1) {
            console.warn(`Perplexity key failed: ${lastError.message}. Trying next key...`);
            continue;
          }
          throw lastError;
        }
        if (isRetryable && j < keys.length - 1) {
          console.warn(`Perplexity key returned ${res.status}, trying next key...`);
          lastError = new Error(`Perplexity API ${res.status}: ${err}`);
          continue;
        }
        throw new Error(`Perplexity API ${res.status}: ${err}`);
      }
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content?.trim() || '';
      if (!text) throw new Error('Empty response from Perplexity');
      return text;
    } catch (e) {
      lastError = e;
      if (j < keys.length - 1) {
        console.warn(`Perplexity key failed: ${e?.message || e}. Trying next key...`);
        continue;
      }
      throw lastError;
    }
  }
  throw lastError || new Error('No Perplexity keys available');
}

function getGeminiKey() {
  const key = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  const k = key.trim();
  return k || null;
}

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODELS = ['gemini-3-flash-preview', 'gemini-2.0-flash', 'gemini-1.5-flash'];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithGeminiOne(prompt, postCount, apiKey, model) {
  const systemContent = `You are an expert Vedic astrologer and content writer. Output ONLY valid JSON, no other text or markdown.`;
  const userContent = `${prompt}\n\nOutput a single JSON object with a "posts" array of exactly ${postCount} articles. No code fences, no explanation.`;
  const fullPrompt = `${systemContent}\n\n${userContent}`;
  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.4,
        responseMimeType: 'application/json',
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API ${res.status}: ${err}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}

async function generateWithGemini(prompt, contextDate, postCount = 2) {
  const apiKey = getGeminiKey();
  if (!apiKey) return null;
  const maxRetries = 3;
  const retryDelayMs = 12000;

  for (const model of GEMINI_MODELS) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) console.warn(`Gemini retry ${attempt}/${maxRetries} (${model}) after 429...`);
        return await generateWithGeminiOne(prompt, postCount, apiKey, model);
      } catch (e) {
        const msg = e?.message || String(e);
        const is429 = msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED');
        if (is429 && attempt < maxRetries) {
          console.warn(`Gemini ${model} rate limited (429). Waiting ${retryDelayMs / 1000}s before retry...`);
          await sleep(retryDelayMs);
          continue;
        }
        if (is429 && attempt === maxRetries && GEMINI_MODELS.indexOf(model) < GEMINI_MODELS.length - 1) {
          console.warn(`Gemini ${model} still rate limited. Trying next model...`);
          break;
        }
        throw e;
      }
    }
  }
  throw new Error('Gemini failed (all models and retries exhausted).');
}

/** Call Gemini with one prompt; expect JSON back. Used for translation. */
async function callGeminiJson(prompt, apiKey, model = 'gemini-2.0-flash') {
  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API ${res.status}: ${err}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error('Empty response from Gemini');
  return JSON.parse(text);
}

/** Translate one post to Hindi. Returns { titleHi, excerptHi, contentHi } or null on failure. */
async function translatePostToHindi(post) {
  const apiKey = getGeminiKey();
  if (!apiKey) return null;
  const title = post.title || '';
  const excerpt = (post.excerpt || post.title || '').slice(0, 500);
  const content = (post.content || '').slice(0, 28000);
  const prompt = `You are a professional translator. Translate the following English Vedic astrology blog content into Hindi (Devanagari). Keep the same tone and preserve any HTML tags and structure in the content exactly (only translate the text between tags, not attribute values or tag names).

Return a single JSON object with exactly these three string fields:
- "titleHi": Hindi translation of the title
- "excerptHi": Hindi translation of the excerpt/summary
- "contentHi": Hindi translation of the article body (preserve all HTML tags and structure)

English title:
${title}

English excerpt:
${excerpt}

English content (HTML):
${content}`;

  for (const model of GEMINI_MODELS) {
    try {
      const out = await callGeminiJson(prompt, apiKey, model);
      if (out && typeof out.titleHi === 'string' && typeof out.contentHi === 'string') {
        return {
          titleHi: out.titleHi,
          excerptHi: typeof out.excerptHi === 'string' ? out.excerptHi : out.titleHi,
          contentHi: out.contentHi,
        };
      }
    } catch (e) {
      console.warn(`Gemini ${model} translation failed: ${e?.message || e}. Trying next...`);
    }
  }
  return null;
}

const BLOG_DIR = path.resolve(__dirname, '../public/blog');
const HI_BLOG_DIR = path.resolve(__dirname, '../public/hi/blog');
const OUTPUT_PATH = path.join(BLOG_DIR, 'daily-posts.json');
const TRANSLATIONS_HI_PATH = path.join(BLOG_DIR, 'daily-posts-hi.json');
const MAX_POSTS = 100;
const BASE_URL = 'https://www.cosmicjyoti.com';

// All dashboard modules for 12pm slot – rotate daily so every module gets blog coverage
const NOON_MODULES = [
  { mode: 'kundali', topic: 'Birth Chart / Kundali', keywords: 'Kundali, birth chart, Vedic astrology', label: 'Birth Chart' },
  { mode: 'panchang', topic: 'Panchang', keywords: 'Panchang, tithi, nakshatra, celestial almanac', label: 'Panchang' },
  { mode: 'muhurat', topic: 'Muhurat / Auspicious Timing', keywords: 'Muhurat, auspicious time, shubh muhurat', label: 'Muhurat' },
  { mode: 'matchmaking', topic: 'Guna Milan / Ashtakoot', keywords: 'Guna Milan, Ashtakoota, Kundali milan, marriage compatibility', label: 'Guna Milan' },
  { mode: 'compatibility', topic: 'Compatibility / Love Match', keywords: 'Compatibility, relationship, love match, Kundali milan', label: 'Compatibility' },
  { mode: 'varshphal', topic: 'Varshphal / Yearly Horoscope', keywords: 'Varshphal, yearly horoscope, annual prediction', label: 'Varshphal' },
  { mode: 'disha', topic: 'Disha Shool / Lucky Direction', keywords: 'Disha shool, lucky direction, today direction', label: 'Disha' },
  { mode: 'tarot', topic: 'Tarot Reading', keywords: 'Tarot, card reading, divination', label: 'Tarot' },
  { mode: 'numerology', topic: 'Numerology', keywords: 'Numerology, life path, destiny number', label: 'Numerology' },
  { mode: 'palm-reading', topic: 'Palmistry', keywords: 'Palmistry, hand reading, hast rekha', label: 'Palmistry' },
  { mode: 'face-reading', topic: 'Face Reading / Samudrik', keywords: 'Face reading, Samudrik Shastra, face astrology', label: 'Face Reading' },
  { mode: 'dreams', topic: 'Dream Interpretation', keywords: 'Dream interpretation, swapna shastra', label: 'Dreams' },
  { mode: 'loshu', topic: 'Lo Shu Grid', keywords: 'Lo Shu Grid, magic square, numerology grid', label: 'Lo Shu Grid' },
  { mode: 'mantra', topic: 'Mantra', keywords: 'Mantra, chanting, planetary mantras', label: 'Mantra' },
  { mode: 'gemstones', topic: 'Gemstones', keywords: 'Gemstones, ratna, planetary remedies', label: 'Gemstones' },
  { mode: 'birthstone', topic: 'Birthstone by Rashi', keywords: 'Birthstone, rashi ratna, zodiac gem', label: 'Birthstone' },
  { mode: 'vastu', topic: 'Vastu', keywords: 'Vastu, vastu shastra, home energy', label: 'Vastu' },
  { mode: 'rudraksh', topic: 'Rudraksh', keywords: 'Rudraksh, sacred beads, mala', label: 'Rudraksh' },
  { mode: 'yantra', topic: 'Yantra', keywords: 'Yantra, sacred geometry, Sri Yantra', label: 'Yantra' },
  { mode: 'cosmic-health', topic: 'Cosmic Health', keywords: 'Vedic wellness, health astrology', label: 'Cosmic Health' },
  { mode: 'upay', topic: 'Upay / Vedic Remedies', keywords: 'Upay, Vedic remedies, astrological remedies', label: 'Upay' },
];

function getNoonModulesForDate(dateStr) {
  const d = new Date(dateStr);
  const dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
  const start = dayOfYear % NOON_MODULES.length;
  return [
    NOON_MODULES[start % NOON_MODULES.length],
    NOON_MODULES[(start + 1) % NOON_MODULES.length],
  ];
}

const BASE_INSTRUCTIONS = `
RESEARCH (use web search): Use the internet to find current, authoritative Vedic astrology content on the topic. Then write entirely in your own words—no plagiarism. Output must be 100% original.

Each article: 700–1200 words, 4–5 H2 sections, H3 subsections where relevant. Use HTML: <h2>, <h3>, <p>, <ul><li>, <ol><li>, <strong>, <em>. End with a CTA inviting readers to try the relevant tool at cosmicjyoti.com.
`;

function buildPrompt6am(today) {
  return `You are an expert Vedic astrologer and content writer for CosmicJyoti (cosmicjyoti.com).
${BASE_INSTRUCTIONS}
Generate exactly 2 blog articles for today (${today}):

1. Horoscope / Daily Predictions (serviceMode: "daily") – Daily horoscope insights, zodiac-wise predictions for the day, what each rashi can expect. Keywords: Horoscope, daily predictions, zodiac, rashi.

2. Compatibility / Match Making (serviceMode: "compatibility") – Relationship compatibility, Kundali Milan, Ashtakoota, or love/couple guidance. Keywords: Kundali milan, compatibility, match making, ashtakoota.

Output ONLY valid JSON in this exact format:
{
  "posts": [
    { "id": "1", "title": "...", "slug": "url-slug", "excerpt": "2-3 sentence summary", "content": "Full HTML content...", "readingTime": "6 min", "topic": "Horoscope / Daily Predictions", "serviceMode": "daily" },
    { "id": "2", "title": "...", "slug": "url-slug", "excerpt": "2-3 sentence summary", "content": "Full HTML content...", "readingTime": "6 min", "topic": "Compatibility / Match Making", "serviceMode": "compatibility" }
  ]
}`;
}

function buildPrompt12pm(today, modules) {
  return `You are an expert Vedic astrologer and content writer for CosmicJyoti (cosmicjyoti.com).
${BASE_INSTRUCTIONS}
Generate exactly 2 blog articles for today (${today}) about these CosmicJyoti dashboard modules:

1. ${modules[0].topic} (serviceMode: "${modules[0].mode}") – Keywords: ${modules[0].keywords}
2. ${modules[1].topic} (serviceMode: "${modules[1].mode}") – Keywords: ${modules[1].keywords}

Output ONLY valid JSON:
{
  "posts": [
    { "id": "1", "title": "...", "slug": "url-slug", "excerpt": "...", "content": "Full HTML...", "readingTime": "6 min", "topic": "${modules[0].topic}", "serviceMode": "${modules[0].mode}" },
    { "id": "2", "title": "...", "slug": "url-slug", "excerpt": "...", "content": "Full HTML...", "readingTime": "6 min", "topic": "${modules[1].topic}", "serviceMode": "${modules[1].mode}" }
  ]
}`;
}

function buildPrompt6pm(today) {
  return `You are an expert Vedic astrologer and content writer for CosmicJyoti (cosmicjyoti.com).
${BASE_INSTRUCTIONS}
Generate exactly 2 blog articles for today (${today}) about planetary positions and their effects:

1. Today's planetary positions and transits – Current positions of key planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu), major transits, and what they mean in Vedic terms. serviceMode: "planets-houses".

2. Planetary effects on you today – How today's planetary positions affect the 12 zodiac signs / rashis; remedies and tips to align with favorable energies. serviceMode: "daily".

Output ONLY valid JSON:
{
  "posts": [
    { "id": "1", "title": "...", "slug": "url-slug", "excerpt": "...", "content": "Full HTML...", "readingTime": "6 min", "topic": "Planetary Positions Today", "serviceMode": "planets-houses" },
    { "id": "2", "title": "...", "slug": "url-slug", "excerpt": "...", "content": "Full HTML...", "readingTime": "6 min", "topic": "Planetary Effects Today", "serviceMode": "daily" }
  ]
}`;
}

function formatDateLabel(isoDate) {
  const d = new Date(isoDate + 'T12:00:00Z');
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function buildPrompt9pm(today, tomorrow) {
  const dateLabel = formatDateLabel(tomorrow);
  return `You are an expert Vedic astrologer and content writer for CosmicJyoti (cosmicjyoti.com).
${BASE_INSTRUCTIONS}
Generate exactly 2 blog articles about the NEXT day (${tomorrow}, i.e. ${dateLabel}):

1. Auspicious events and muhurat for ${dateLabel} – Best times for important activities on ${dateLabel}, muhurat, tithi, nakshatra, and what to do or avoid. serviceMode: "panchang". Use the exact date "${dateLabel}" in titles and topic, NOT the word "tomorrow".

2. Key astrological events on ${dateLabel} – Festivals, eclipses, special yogas, or notable planetary events on ${dateLabel}; what to expect and how to make the most of the day. serviceMode: "panchang". Use the exact date "${dateLabel}" in titles and topic, NOT the word "tomorrow".

Output ONLY valid JSON:
{
  "posts": [
    { "id": "1", "title": "...", "slug": "url-slug", "excerpt": "...", "content": "Full HTML...", "readingTime": "6 min", "topic": "Auspicious Events ${dateLabel}", "serviceMode": "panchang" },
    { "id": "2", "title": "...", "slug": "url-slug", "excerpt": "...", "content": "Full HTML...", "readingTime": "6 min", "topic": "Astrological Events ${dateLabel}", "serviceMode": "panchang" }
  ]
}`;
}

const SLOT_ALIASES = {
  '6am': '6am', morning: '6am',
  '12pm': '12pm', noon: '12pm',
  '6pm': '6pm', evening: '6pm',
  '9pm': '9pm', night: '9pm',
};

const REFRESH_SITEMAPS = 'refresh-sitemaps';
const TRANSLATE_HINDI = 'translate-hindi';

function loadHiTranslations() {
  try {
    const data = JSON.parse(fs.readFileSync(TRANSLATIONS_HI_PATH, 'utf8'));
    return data.byArticleId || {};
  } catch (_) {
    return {};
  }
}

function saveHiTranslations(byArticleId) {
  if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true });
  fs.writeFileSync(
    TRANSLATIONS_HI_PATH,
    JSON.stringify({ lastUpdated: new Date().toISOString(), byArticleId }, null, 2),
    'utf8'
  );
}

/** Permanent URL for an article (English): /blog/YYYY-MM-DD-slug/ */
function articlePermalink(id) {
  return `${BASE_URL}/blog/${encodeURIComponent(id)}/`;
}

/** Permanent URL for Hindi version: /hi/blog/YYYY-MM-DD-slug/ — one language per URL. */
function articlePermalinkHi(id) {
  return `${BASE_URL}/hi/blog/${encodeURIComponent(id)}/`;
}

function parseSlot() {
  const arg = (process.argv[2] || '').toLowerCase().trim();
  if (arg === 'refresh-sitemaps') return REFRESH_SITEMAPS;
  if (arg === 'translate-hindi') return TRANSLATE_HINDI;
  const slot = SLOT_ALIASES[arg];
  if (slot) return slot;
  if (!arg) {
    console.error('Usage: node scripts/generate-daily-blog.mjs <slot>');
    console.error('  slot = 6am | 12pm | 6pm | 9pm  (or morning | noon | evening | night)');
    console.error('  Or: node scripts/generate-daily-blog.mjs refresh-sitemaps  (regenerate feed + sitemaps from existing daily-posts.json, no API)');
    console.error('  Or: node scripts/generate-daily-blog.mjs translate-hindi  (translate missing articles to Hindi via Gemini, then write full Hindi pages)');
    process.exit(1);
  }
  console.error(`Unknown slot: ${arg}. Use 6am, 12pm, 6pm, 9pm, refresh-sitemaps, or translate-hindi.`);
  process.exit(1);
}

/** Write feed.xml, sitemap-blog.xml, sitemap-news.xml from allPosts. today = YYYY-MM-DD for fallbacks. */
function writeFeedAndSitemaps(allPosts, today) {
  if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true });

  const rssItems = allPosts.slice(0, 30).map((p) => {
    const id = p.articleId || p.id || (p.date && p.slug ? `${p.date}-${p.slug}` : p.slug);
    const link = articlePermalink(id);
    const pubDateStr = p.date || today;
    const pubDate = new Date(pubDateStr + 'T00:30:00.000Z').toUTCString();
    const title = (p.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const desc = (p.excerpt || p.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `    <item><title>${title}</title><link>${link}</link><guid isPermaLink="true">${link}</guid><pubDate>${pubDate}</pubDate><description><![CDATA[${desc}]]></description></item>`;
  }).join('\n');
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CosmicJyoti Blog</title>
    <link>${BASE_URL}/blog.html</link>
    <description>Daily Vedic astrology articles – Kundali, Horoscope, Panchang, and more.</description>
    <language>en-in</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/blog/feed.xml" rel="self" type="application/rss+xml"/>
${rssItems}
  </channel>
</rss>`;
  fs.writeFileSync(path.join(BLOG_DIR, 'feed.xml'), rss, 'utf8');

  const blogUrls = allPosts.slice(0, 50).map((p) => {
    const id = p.articleId || p.id || (p.date && p.slug ? `${p.date}-${p.slug}` : p.slug);
    const loc = articlePermalink(id);
    const lastmod = p.date || today;
    return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`;
  }).join('\n');
  const sitemapBlog = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${blogUrls}
</urlset>`;
  fs.writeFileSync(path.join(BLOG_DIR, 'sitemap-blog.xml'), sitemapBlog, 'utf8');

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const cutoff = twoDaysAgo.toISOString().split('T')[0];
  const newsPosts = allPosts.filter((p) => {
    const d = p.date || p.articleId?.slice(0, 10) || '';
    return d >= cutoff;
  }).slice(0, 100);
  const newsUrls = newsPosts.map((p) => {
    const id = p.articleId || p.id || (p.date && p.slug ? `${p.date}-${p.slug}` : p.slug);
    const loc = articlePermalink(id);
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
  fs.writeFileSync(path.join(BLOG_DIR, 'sitemap-news.xml'), sitemapNews, 'utf8');
  console.log(`[DONE] Wrote feed.xml, sitemap-blog.xml, sitemap-news.xml. News sitemap: ${newsPosts.length} articles (last 2 days).`);

  if (!fs.existsSync(HI_BLOG_DIR)) fs.mkdirSync(HI_BLOG_DIR, { recursive: true });
  const hiRssItems = allPosts.slice(0, 30).map((p) => {
    const id = p.articleId || p.id || (p.date && p.slug ? `${p.date}-${p.slug}` : p.slug);
    const link = articlePermalinkHi(id);
    const pubDateStr = p.date || today;
    const pubDate = new Date(pubDateStr + 'T00:30:00.000Z').toUTCString();
    const title = (p.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const desc = (p.excerpt || p.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `    <item><title>${title}</title><link>${link}</link><guid isPermaLink="true">${link}</guid><pubDate>${pubDate}</pubDate><description><![CDATA[${desc}]]></description></item>`;
  }).join('\n');
  const rssHi = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CosmicJyoti Blog (हिंदी)</title>
    <link>${BASE_URL}/hi/blog/</link>
    <description>Daily Vedic astrology – Hindi. Kundali, Horoscope, Panchang.</description>
    <language>hi-in</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/hi/blog/feed.xml" rel="self" type="application/rss+xml"/>
${hiRssItems}
  </channel>
</rss>`;
  fs.writeFileSync(path.join(HI_BLOG_DIR, 'feed.xml'), rssHi, 'utf8');
  const hiBlogUrls = allPosts.slice(0, 50).map((p) => {
    const id = p.articleId || p.id || (p.date && p.slug ? `${p.date}-${p.slug}` : p.slug);
    const loc = articlePermalinkHi(id);
    const lastmod = p.date || today;
    return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`;
  }).join('\n');
  const sitemapBlogHi = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${hiBlogUrls}
</urlset>`;
  fs.writeFileSync(path.join(HI_BLOG_DIR, 'sitemap-blog.xml'), sitemapBlogHi, 'utf8');
  console.log(`[DONE] Wrote hi/blog/feed.xml, hi/blog/sitemap-blog.xml (one language per article).`);
}

function escapeHtml(s) {
  if (s == null || s === '') return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Generate static HTML at public/blog/{articleId}/index.html for each post. */
function writeStaticArticlePages(allPosts) {
  if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true });
  const templatePath = path.join(BLOG_DIR, 'article.html');
  let navFragment = '';
  try {
    const template = fs.readFileSync(templatePath, 'utf8');
    const navMatch = template.match(/<nav[\s\S]*?<\/nav>/);
    if (navMatch) {
      navFragment = navMatch[0]
        .replace(/href="\.\.\//g, 'href="../../')
        .replace(/href="\.\.\/blog\.html/g, 'href="../../blog.html');
    }
  } catch (_) {}
  if (!navFragment) {
    navFragment = `<nav class="fixed top-0 w-full z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/50 py-2 sm:py-2.5 px-3 sm:px-4">
        <div class="container mx-auto flex items-center justify-between max-w-7xl">
            <a href="../../landing.html" class="flex items-center gap-1.5 sm:gap-2"><span class="text-2xl sm:text-3xl">☀</span><span class="text-lg sm:text-xl md:text-2xl font-serif font-bold gradient-text">CosmicJyoti</span></a>
            <div class="hidden lg:flex items-center gap-3 xl:gap-4">
                <a href="../../landing.html" class="text-slate-300 hover:text-amber-300 px-2 py-1.5 rounded transition-all duration-200 text-sm xl:text-base">Home</a>
                <a href="../../tools.html" class="text-slate-300 hover:text-amber-300 px-2 py-1.5 rounded transition-all duration-200 text-sm xl:text-base">Tools</a>
                <a href="../../blog.html#todays-horoscope" class="text-slate-300 hover:text-amber-300 px-2 py-1.5 rounded transition-all duration-200 text-sm xl:text-base">Horoscope</a>
                <a href="../../blog.html" class="text-slate-300 hover:text-amber-300 px-2 py-1.5 rounded transition-all duration-200 text-sm xl:text-base">Blog</a>
                <a href="../../about.html" class="text-slate-300 hover:text-amber-300 px-2 py-1.5 rounded transition-all duration-200 text-sm xl:text-base">About</a>
                <a href="../../contact.html" class="text-slate-300 hover:text-amber-300 px-2 py-1.5 rounded transition-all duration-200 text-sm xl:text-base">Contact</a>
            </div>
            <button id="mobile-menu-btn" class="lg:hidden text-amber-400 text-xl p-2 rounded hover:bg-slate-800 transition" aria-label="Menu">☰</button>
        </div>
        <div id="mobile-menu" class="lg:hidden hidden bg-slate-900/95 border-t border-slate-800 px-4 py-3 space-y-1">
            <a href="../../landing.html" class="block py-3 px-3 text-slate-300 hover:text-amber-300 rounded transition">Home</a>
            <a href="../../tools.html" class="block py-3 px-3 text-slate-300 hover:text-amber-300 rounded transition">Tools</a>
            <a href="../../blog.html#todays-horoscope" class="block py-3 px-3 text-slate-300 hover:text-amber-300 rounded transition">Horoscope</a>
            <a href="../../blog.html" class="block py-3 px-3 text-slate-300 hover:text-amber-300 rounded transition">Blog</a>
            <a href="../../about.html" class="block py-3 px-3 text-slate-300 hover:text-amber-300 rounded transition">About</a>
            <a href="../../contact.html" class="block py-3 px-3 text-slate-300 hover:text-amber-300 rounded transition">Contact</a>
        </div>
    </nav>`;
  }
  const styles = `* { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Lato', sans-serif; background: linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%); color: #e2e8f0; line-height: 1.6; }
        h1, h2, h3, h4 { font-family: 'Cinzel', serif; }
        .gradient-text { background: linear-gradient(135deg, #fbbf24 0%, #ffffff 50%, #fbbf24 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .navbar-space { padding-top: 80px; }
        .article-content { max-width: 800px; margin: 0 auto; padding: 2rem; }
        .article-body { line-height: 1.75; }
        .article-body h2 { font-size: 1.5rem; margin-top: 2rem; margin-bottom: 1rem; color: #fbbf24; font-weight: 700; }
        .article-body h2:first-child { margin-top: 0; }
        .article-body h3 { font-size: 1.25rem; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #fcd34d; font-weight: 600; }
        .article-body h4 { font-size: 1.1rem; margin-top: 1.25rem; margin-bottom: 0.5rem; color: #e2e8f0; }
        .article-body p { margin-bottom: 1.25rem; color: #cbd5e1; }
        .article-body ul, .article-body ol { margin: 1rem 0 1rem 2rem; color: #cbd5e1; }
        .article-body li { margin-bottom: 0.5rem; }
        .article-body ul { list-style-type: disc; }
        .article-body ol { list-style-type: decimal; }
        .article-body strong { color: #fbbf24; font-weight: 600; }
        .article-body em { color: #e2e8f0; font-style: italic; }
        .article-body a { color: #f59e0b; text-decoration: underline; }
        .article-body a:hover { color: #fcd34d; }
        .article-body blockquote { margin: 1.5rem 0; padding-left: 1.5rem; border-left: 4px solid #f59e0b; color: #94a3b8; font-style: italic; }`;
  let count = 0;
  for (const post of allPosts) {
    const articleId = post.articleId || post.id || (post.date && post.slug ? `${post.date}-${post.slug}` : post.slug);
    if (!articleId) continue;
    const permalink = articlePermalink(articleId);
    const pubDate = post.date || '';
    const datePublishedISO = pubDate ? `${pubDate}T06:00:00+05:30` : null;
    const title = post.title || 'Article';
    const desc = (post.excerpt || post.title || '').slice(0, 160);
    const serviceLabel = post.serviceLabel || post.topic || 'Try this tool';
    const serviceMode = post.serviceMode;
    let ctaHtml = '';
    if (serviceMode) {
      const tryHref = `${BASE_URL}/?mode=${encodeURIComponent(serviceMode)}`;
      ctaHtml = `<div class="mt-8 p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl"><p class="text-amber-200 font-semibold mb-3">Ready to explore?</p><a href="${escapeHtml(tryHref)}" class="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-all">Try ${escapeHtml(serviceLabel)} →</a></div>`;
    }
    const related = allPosts
      .filter((p) => (p.articleId || p.id || (p.date && p.slug ? `${p.date}-${p.slug}` : p.slug)) !== articleId)
      .slice(0, 2);
    let relatedHtml = '';
    if (related.length > 0) {
      relatedHtml = '<div class="mt-10 pt-8 border-t border-slate-700"><h3 class="text-amber-200 font-serif text-lg mb-4">More to read</h3><ul class="space-y-2">';
      for (const p of related) {
        const aid = p.articleId || p.id || (p.date && p.slug ? `${p.date}-${p.slug}` : p.slug);
        relatedHtml += `<li><a href="../${encodeURIComponent(aid)}/" class="text-amber-400 hover:text-amber-300 underline">${escapeHtml(p.title)}</a></li>`;
      }
      relatedHtml += '</ul></div>';
    }
    const visibleDateStr = pubDate ? new Date(pubDate + 'T06:00:00+05:30').toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Kolkata' }) : '';
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: title,
      description: desc,
      datePublished: datePublishedISO,
      dateModified: datePublishedISO,
      author: { '@type': 'Person', name: 'Nikesh Maurya', url: `${BASE_URL}/about.html` },
      publisher: { '@type': 'Organization', name: 'CosmicJyoti', logo: { '@type': 'ImageObject', url: `${BASE_URL}/app-logo.png` } },
      mainEntityOfPage: { '@type': 'WebPage', '@id': permalink },
      image: `${BASE_URL}/app-logo.png`,
    };
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)} – CosmicJyoti | Vedic Astrology</title>
    <meta name="description" content="${escapeHtml(desc)}">
    <link rel="canonical" href="${permalink}">
    <link rel="alternate" hreflang="en" href="${permalink}">
    <link rel="alternate" hreflang="hi" href="${articlePermalinkHi(articleId)}">
    <link rel="alternate" hreflang="x-default" href="${permalink}">
    <meta property="og:title" content="${escapeHtml(title)} – CosmicJyoti">
    <meta property="og:description" content="${escapeHtml(desc)}">
    <meta property="og:url" content="${permalink}">
    <meta property="og:image" content="${BASE_URL}/app-logo.png">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3559865379099936" crossorigin="anonymous"></script>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>${styles}</style>
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body class="navbar-space">
    ${navFragment}
    <article class="article-content" id="article-body">
        <h1 class="gradient-text text-2xl sm:text-3xl mb-4">${escapeHtml(title)}</h1>
        <p class="text-slate-400 text-sm mb-6"><time datetime="${escapeHtml(datePublishedISO || '')}">Published: ${escapeHtml(visibleDateStr)}</time> | By Nikesh Maurya | ${escapeHtml(post.readingTime || '5 min read')}</p>
        <div class="article-body">${post.content || ''}</div>
        ${ctaHtml}
        ${relatedHtml}
        <p class="mt-8"><a href="${BASE_URL}/" class="text-amber-400 hover:text-amber-300">← Back to Dashboard</a></p>
    </article>
    <script>
    document.getElementById('mobile-menu-btn')?.addEventListener('click', function() {
        var m = document.getElementById('mobile-menu');
        if (m) m.classList.toggle('hidden');
    });
    </script>
</body>
</html>`;
    const dir = path.join(BLOG_DIR, articleId);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
    count += 1;
  }
  console.log(`[DONE] Wrote ${count} static article pages under blog/{articleId}/index.html.`);
}

/** Write Hindi article pages: full content when hiTranslations[articleId] exists, else stub. One language per URL, fast load. */
function writeStaticArticlePagesHi(allPosts, hiTranslations = {}) {
  if (!fs.existsSync(HI_BLOG_DIR)) fs.mkdirSync(HI_BLOG_DIR, { recursive: true });
  const enPermalink = (id) => `${BASE_URL}/blog/${encodeURIComponent(id)}/`;
  const hiPermalink = (id) => `${BASE_URL}/hi/blog/${encodeURIComponent(id)}/`;
  const navHi = `<nav class="fixed top-0 w-full z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/50 py-2 sm:py-2.5 px-3 sm:px-4">
        <div class="container mx-auto flex items-center justify-between max-w-7xl">
            <a href="../../../landing.html" class="flex items-center gap-1.5 sm:gap-2"><span class="text-2xl sm:text-3xl">☀</span><span class="text-lg sm:text-xl md:text-2xl font-serif font-bold gradient-text">CosmicJyoti</span></a>
            <div class="hidden lg:flex items-center gap-3 xl:gap-4">
                <a href="../../../landing.html" class="text-slate-300 hover:text-amber-300 px-2 py-1.5 rounded text-sm xl:text-base">होम</a>
                <a href="../../../blog.html" class="text-slate-300 hover:text-amber-300 px-2 py-1.5 rounded text-sm xl:text-base">ब्लॉग</a>
                <a href="../../../about.html" class="text-slate-300 hover:text-amber-300 px-2 py-1.5 rounded text-sm xl:text-base">हमारे बारे में</a>
                <a href="../../../contact.html" class="text-slate-300 hover:text-amber-300 px-2 py-1.5 rounded text-sm xl:text-base">संपर्क</a>
            </div>
            <button id="mobile-menu-btn" class="lg:hidden text-amber-400 text-xl p-2 rounded hover:bg-slate-800 transition" aria-label="मेन्यू">☰</button>
        </div>
        <div id="mobile-menu" class="lg:hidden hidden bg-slate-900/95 border-t border-slate-800 px-4 py-3 space-y-1">
            <a href="../../../landing.html" class="block py-3 px-3 text-slate-300 hover:text-amber-300 rounded">होम</a>
            <a href="../../../blog.html" class="block py-3 px-3 text-slate-300 hover:text-amber-300 rounded">ब्लॉग</a>
            <a href="../../../about.html" class="block py-3 px-3 text-slate-300 hover:text-amber-300 rounded">हमारे बारे में</a>
            <a href="../../../contact.html" class="block py-3 px-3 text-slate-300 hover:text-amber-300 rounded">संपर्क</a>
        </div>
    </nav>`;
  const stylesBase = `* { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Lato', sans-serif; background: linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%); color: #e2e8f0; line-height: 1.6; }
        .gradient-text { background: linear-gradient(135deg, #fbbf24 0%, #ffffff 50%, #fbbf24 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .navbar-space { padding-top: 80px; }
        .article-content { max-width: 800px; margin: 0 auto; padding: 2rem; }`;
  const stylesFull = stylesBase + `
        .article-body { line-height: 1.75; }
        .article-body h2 { font-size: 1.5rem; margin-top: 2rem; margin-bottom: 1rem; color: #fbbf24; font-weight: 700; }
        .article-body h2:first-child { margin-top: 0; }
        .article-body h3 { font-size: 1.25rem; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #fcd34d; font-weight: 600; }
        .article-body h4 { font-size: 1.1rem; margin-top: 1.25rem; margin-bottom: 0.5rem; color: #e2e8f0; }
        .article-body p { margin-bottom: 1.25rem; color: #cbd5e1; }
        .article-body ul, .article-body ol { margin: 1rem 0 1rem 2rem; color: #cbd5e1; }
        .article-body li { margin-bottom: 0.5rem; }
        .article-body ul { list-style-type: disc; }
        .article-body ol { list-style-type: decimal; }
        .article-body strong { color: #fbbf24; font-weight: 600; }
        .article-body em { color: #e2e8f0; font-style: italic; }
        .article-body a { color: #f59e0b; text-decoration: underline; }
        .article-body a:hover { color: #fcd34d; }
        .article-body blockquote { margin: 1.5rem 0; padding-left: 1.5rem; border-left: 4px solid #f59e0b; color: #94a3b8; font-style: italic; }`;
  let countFull = 0;
  let countStub = 0;
  for (const post of allPosts) {
    const articleId = post.articleId || post.id || (post.date && post.slug ? `${post.date}-${post.slug}` : post.slug);
    if (!articleId) continue;
    const permalinkEn = enPermalink(articleId);
    const permalinkHi = hiPermalink(articleId);
    const hi = hiTranslations[articleId];
    const hasFull = hi && typeof hi.titleHi === 'string' && typeof hi.contentHi === 'string';
    const titleHi = hasFull ? hi.titleHi : (post.title || 'Article');
    const descHi = hasFull ? (hi.excerptHi || hi.titleHi).slice(0, 160) : 'यह लेख अंग्रेज़ी में उपलब्ध है। CosmicJyoti ब्लॉग।';
    const contentHi = hasFull ? hi.contentHi : '';
    const readingTimeHi = post.readingTime ? `${post.readingTime} पढ़ने का समय` : '5 मिनट पढ़ें';
    const pubDate = post.date || '';
    const datePublishedISO = pubDate ? `${pubDate}T06:00:00+05:30` : null;
    const visibleDateStr = pubDate ? new Date(pubDate + 'T06:00:00+05:30').toLocaleString('hi-IN', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Kolkata' }) : '';
    const related = allPosts
      .filter((p) => (p.articleId || p.id || (p.date && p.slug ? `${p.date}-${p.slug}` : p.slug)) !== articleId)
      .slice(0, 2);
    let relatedHtml = '';
    if (related.length > 0) {
      relatedHtml = '<div class="mt-10 pt-8 border-t border-slate-700"><h3 class="text-amber-200 font-serif text-lg mb-4">और पढ़ें</h3><ul class="space-y-2">';
      for (const p of related) {
        const aid = p.articleId || p.id || (p.date && p.slug ? `${p.date}-${p.slug}` : p.slug);
        const relTitle = (hiTranslations[aid] && hiTranslations[aid].titleHi) ? hiTranslations[aid].titleHi : (p.title || '');
        relatedHtml += `<li><a href="../${encodeURIComponent(aid)}/" class="text-amber-400 hover:text-amber-300 underline">${escapeHtml(relTitle)}</a></li>`;
      }
      relatedHtml += '</ul></div>';
    }
    const serviceMode = post.serviceMode;
    const serviceLabel = post.serviceLabel || post.topic || 'इस टूल को आज़माएं';
    let ctaHtml = '';
    if (serviceMode && hasFull) {
      const tryHref = `${BASE_URL}/?mode=${encodeURIComponent(serviceMode)}`;
      ctaHtml = `<div class="mt-8 p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl"><p class="text-amber-200 font-semibold mb-3">आगे बढ़ें?</p><a href="${escapeHtml(tryHref)}" class="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-all">${escapeHtml(serviceLabel)} आज़माएं →</a></div>`;
    }
    let bodyBlock;
    if (hasFull) {
      bodyBlock = `<h1 class="gradient-text text-2xl sm:text-3xl mb-4">${escapeHtml(titleHi)}</h1>
        <p class="text-slate-400 text-sm mb-6"><time datetime="${escapeHtml(datePublishedISO || '')}">प्रकाशित: ${escapeHtml(visibleDateStr)}</time> | निकेश मौर्य द्वारा | ${escapeHtml(readingTimeHi)}</p>
        <div class="article-body">${contentHi}</div>
        ${ctaHtml}
        ${relatedHtml}
        <p class="mt-8"><a href="${BASE_URL}/" class="text-amber-400 hover:text-amber-300">← होम पर वापस</a></p>`;
    } else {
      bodyBlock = `<h1 class="gradient-text text-2xl sm:text-3xl mb-4">${escapeHtml(post.title || 'Article')}</h1>
        <p class="text-slate-300 mb-6">यह लेख अंग्रेज़ी में उपलब्ध है।</p>
        <p><a href="${permalinkEn}" class="text-amber-400 hover:text-amber-300 font-semibold">अंग्रेज़ी में पढ़ें →</a></p>
        <p class="mt-8"><a href="${BASE_URL}/" class="text-amber-400 hover:text-amber-300">← होम पर वापस</a></p>`;
    }
    const schema = hasFull ? {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: titleHi,
      description: descHi,
      datePublished: datePublishedISO,
      dateModified: datePublishedISO,
      author: { '@type': 'Person', name: 'Nikesh Maurya', url: `${BASE_URL}/about.html` },
      publisher: { '@type': 'Organization', name: 'CosmicJyoti', logo: { '@type': 'ImageObject', url: `${BASE_URL}/app-logo.png` } },
      mainEntityOfPage: { '@type': 'WebPage', '@id': permalinkHi },
      image: `${BASE_URL}/app-logo.png`,
    } : null;
    const html = `<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(titleHi)} – CosmicJyoti | ज्योतिष</title>
    <meta name="description" content="${escapeHtml(descHi)}">
    <link rel="canonical" href="${permalinkHi}">
    <link rel="alternate" hreflang="en" href="${permalinkEn}">
    <link rel="alternate" hreflang="hi" href="${permalinkHi}">
    <link rel="alternate" hreflang="x-default" href="${permalinkEn}">
    <meta property="og:title" content="${escapeHtml(titleHi)} – CosmicJyoti">
    <meta property="og:description" content="${escapeHtml(descHi)}">
    <meta property="og:url" content="${permalinkHi}">
    <meta property="og:image" content="${BASE_URL}/app-logo.png">
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>${hasFull ? stylesFull : stylesBase}</style>
    ${schema ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>` : ''}
</head>
<body class="navbar-space">
    ${navHi}
    <article class="article-content">
        ${bodyBlock}
    </article>
    <script>document.getElementById('mobile-menu-btn')?.addEventListener('click', function() { var m = document.getElementById('mobile-menu'); if (m) m.classList.toggle('hidden'); });</script>
</body>
</html>`;
    const dir = path.join(HI_BLOG_DIR, articleId);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
    if (hasFull) countFull += 1;
    else countStub += 1;
  }
  console.log(`[DONE] Wrote ${countFull + countStub} Hindi pages: ${countFull} full, ${countStub} stubs (hi/blog/{articleId}/index.html).`);
}

async function main() {
  const slot = parseSlot();
  const today = new Date().toISOString().split('T')[0];

  if (slot === REFRESH_SITEMAPS) {
    let allPosts = [];
    try {
      const raw = fs.readFileSync(OUTPUT_PATH, 'utf8');
      const data = JSON.parse(raw);
      allPosts = Array.isArray(data.posts) ? data.posts : [];
    } catch (e) {
      console.error('No public/blog/daily-posts.json found. Run the blog script with a slot (e.g. 12pm) first to generate posts.');
      process.exit(1);
    }
    if (allPosts.length === 0) {
      console.error('daily-posts.json has no posts. Run the blog script with a slot first.');
      process.exit(1);
    }
    console.log(`Refreshing feed and sitemaps from ${allPosts.length} existing posts...`);
    writeFeedAndSitemaps(allPosts, today);
    writeStaticArticlePages(allPosts);
    writeStaticArticlePagesHi(allPosts, loadHiTranslations());
    return;
  }

  if (slot === TRANSLATE_HINDI) {
    let allPosts = [];
    try {
      const raw = fs.readFileSync(OUTPUT_PATH, 'utf8');
      const data = JSON.parse(raw);
      allPosts = Array.isArray(data.posts) ? data.posts : [];
    } catch (e) {
      console.error('No public/blog/daily-posts.json found. Run the blog script with a slot or refresh-sitemaps first.');
      process.exit(1);
    }
    if (allPosts.length === 0) {
      console.error('daily-posts.json has no posts.');
      process.exit(1);
    }
    const apiKey = getGeminiKey();
    if (!apiKey) {
      console.error('Set GEMINI_API_KEY or API_KEY in .env for translation.');
      process.exit(1);
    }
    const hi = loadHiTranslations();
    const toTranslate = allPosts.filter((p) => {
      const id = p.articleId || p.id || (p.date && p.slug ? `${p.date}-${p.slug}` : p.slug);
      return id && !hi[id];
    });
    console.log(`Translating ${toTranslate.length} articles to Hindi (${Object.keys(hi).length} already done)...`);
    for (let i = 0; i < toTranslate.length; i++) {
      const post = toTranslate[i];
      const articleId = post.articleId || post.id || (post.date && post.slug ? `${post.date}-${post.slug}` : post.slug);
      process.stdout.write(`  [${i + 1}/${toTranslate.length}] ${articleId?.slice(0, 40)}... `);
      const result = await translatePostToHindi(post);
      if (result) {
        hi[articleId] = result;
        saveHiTranslations(hi);
        console.log('OK');
      } else {
        console.log('SKIP (translation failed)');
      }
      if (i < toTranslate.length - 1) await sleep(1500);
    }
    writeStaticArticlePagesHi(allPosts, hi);
    console.log('[DONE] translate-hindi finished.');
    return;
  }

  const hasPerplexity = getPerplexityKeys().length > 0;
  const hasGemini = !!getGeminiKey();
  if (!hasPerplexity && !hasGemini) {
    console.error('Error: Set PERPLEXITY_API_KEY (or PERPLEXITY_API_KEYS) and/or GEMINI_API_KEY (or API_KEY) in .env or .env.local');
    process.exit(1);
  }
  if (hasPerplexity && getPerplexityKeys().length > 1) console.log(`Using ${getPerplexityKeys().length} Perplexity API key(s) in rotation.`);

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split('T')[0];

  let prompt;
  if (slot === '6am') prompt = buildPrompt6am(today);
  else if (slot === '12pm') prompt = buildPrompt12pm(today, getNoonModulesForDate(today));
  else if (slot === '6pm') prompt = buildPrompt6pm(today);
  else prompt = buildPrompt9pm(today, tomorrow);

  console.log(`Generating 2 blog posts for slot ${slot} (${today})...`);

  let text;
  let usedGemini = false;
  try {
    if (hasPerplexity) {
      text = await generateWithPerplexity(prompt, today, 2);
      if (!text) throw new Error('Empty response from Perplexity');
    } else {
      throw new Error('No Perplexity keys');
    }
  } catch (err) {
    console.warn('Perplexity failed:', err?.message || err);
    if (hasGemini) {
      console.log('Trying Gemini fallback...');
      try {
        text = await generateWithGemini(prompt, today, 2);
        if (!text) throw new Error('Empty response from Gemini');
        usedGemini = true;
      } catch (geminiErr) {
        const geminiMsg = geminiErr?.message || String(geminiErr);
        console.error('Gemini fallback failed:', geminiMsg);
        if (geminiMsg.includes('429') || geminiMsg.includes('RESOURCE_EXHAUSTED')) {
          console.error('');
          console.error('--- Gemini 429 (quota / rate limit) ---');
          console.error('Gemini quota or rate limit hit. Script retried with backoff and alternate model.');
          console.error('Check Google AI Studio quota: https://aistudio.google.com/ or try again later.');
        }
        if (String(err?.message || '').includes('401')) {
          console.error('');
          console.error('--- 401 Authorization Required ---');
          console.error('Perplexity rejected all API keys. Do this:');
          console.error('1. Open https://www.perplexity.ai/settings/api and check/create API keys.');
          console.error('2. In GitHub: repo Settings → Secrets and variables → Actions.');
          console.error('3. Set PERPLEXITY_API_KEY or PERPLEXITY_API_KEYS.');
          console.error('4. For fallback, set GEMINI_API_KEY or API_KEY.');
        }
        process.exit(1);
      }
    } else {
      if (String(err?.message || '').includes('401')) {
        console.error('');
        console.error('--- 401 Authorization Required ---');
        console.error('Perplexity rejected all API keys. Set PERPLEXITY_API_KEY (or PERPLEXITY_API_KEYS), or add GEMINI_API_KEY for fallback.');
      }
      process.exit(1);
    }
  }
  if (usedGemini) console.log('Generated with Gemini.');

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsed = JSON.parse(cleaned);
  }

  const rawPosts = (parsed.posts || []).slice(0, 2);
  const dateForSlot = slot === '9pm' ? tomorrow : today;

  const newPosts = rawPosts.map((p, i) => {
    const slug = p.slug || `article-${dateForSlot.replace(/-/g, '')}-${slot}-${i + 1}`;
    const articleId = `${dateForSlot}-${slug}`;
    return {
      ...p,
      id: articleId,
      slug,
      articleId,
      date: dateForSlot,
      timeSlot: slot,
      readingTime: p.readingTime || '6 min',
      serviceMode: p.serviceMode,
      serviceLabel: p.serviceLabel || p.topic,
    };
  });

  let existingPosts = [];
  try {
    const raw = fs.readFileSync(OUTPUT_PATH, 'utf8');
    const existing = JSON.parse(raw);
    existingPosts = Array.isArray(existing.posts) ? existing.posts : [];
    console.log(`Found ${existingPosts.length} existing posts (appending 2, max ${MAX_POSTS})`);
  } catch (e) {
    console.log('No existing daily-posts.json; starting fresh.');
  }

  const allPosts = [...newPosts, ...existingPosts].slice(0, MAX_POSTS);

  const data = {
    lastGenerated: today,
    generatedAt: new Date().toISOString(),
    totalPosts: allPosts.length,
    posts: allPosts,
  };

  if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2), 'utf8');

  writeFeedAndSitemaps(allPosts, today);
  writeStaticArticlePages(allPosts);
  writeStaticArticlePagesHi(allPosts, loadHiTranslations());
  console.log(`[DONE] Appended 2 posts (slot: ${slot}). Total: ${allPosts.length}.`);
  console.log(`New titles: ${newPosts.map((p) => p.title).join(' | ')}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
