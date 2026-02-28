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

const BLOG_DIR = path.resolve(__dirname, '../public/blog');
const OUTPUT_PATH = path.join(BLOG_DIR, 'daily-posts.json');
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

function parseSlot() {
  const arg = (process.argv[2] || '').toLowerCase().trim();
  if (arg === 'refresh-sitemaps') return REFRESH_SITEMAPS;
  const slot = SLOT_ALIASES[arg];
  if (slot) return slot;
  if (!arg) {
    console.error('Usage: node scripts/generate-daily-blog.mjs <slot>');
    console.error('  slot = 6am | 12pm | 6pm | 9pm  (or morning | noon | evening | night)');
    console.error('  Or: node scripts/generate-daily-blog.mjs refresh-sitemaps  (regenerate feed + sitemaps from existing daily-posts.json, no API)');
    process.exit(1);
  }
  console.error(`Unknown slot: ${arg}. Use 6am, 12pm, 6pm, 9pm, or refresh-sitemaps.`);
  process.exit(1);
}

/** Write feed.xml, sitemap-blog.xml, sitemap-news.xml from allPosts. today = YYYY-MM-DD for fallbacks. */
function writeFeedAndSitemaps(allPosts, today) {
  if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true });

  const rssItems = allPosts.slice(0, 30).map((p) => {
    const id = p.articleId || p.id || (p.date && p.slug ? `${p.date}-${p.slug}` : p.slug);
    const link = `${BASE_URL}/blog/article.html?id=${encodeURIComponent(id)}`;
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
    const loc = `${BASE_URL}/blog/article.html?id=${encodeURIComponent(id)}`;
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
  fs.writeFileSync(path.join(BLOG_DIR, 'sitemap-news.xml'), sitemapNews, 'utf8');
  console.log(`[DONE] Wrote feed.xml, sitemap-blog.xml, sitemap-news.xml. News sitemap: ${newsPosts.length} articles (last 2 days).`);
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
  console.log(`[DONE] Appended 2 posts (slot: ${slot}). Total: ${allPosts.length}.`);
  console.log(`New titles: ${newPosts.map((p) => p.title).join(' | ')}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
