#!/usr/bin/env node
/**
 * Generate 3 daily AI blog posts using Gemini (no backend required).
 * Each article is tied to a specific CosmicJyoti module for SEO and service awareness.
 * Appends new posts to existing ones - previous days' content is kept.
 * Run: API_KEY=xxx node scripts/generate-daily-blog.mjs
 * Used by GitHub Actions daily workflow.
 */
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, '../public/blog/daily-posts.json');
const MAX_POSTS = 100; // Keep last 100 posts to prevent unbounded growth

// All CosmicJyoti modules - rotate daily so every module gets blog coverage over time
const BLOG_MODULES = [
  { mode: 'kundali', topic: 'Birth Chart / Kundali', keywords: 'Kundali, birth chart, Vedic astrology, planetary positions', label: 'Birth Chart' },
  { mode: 'daily', topic: 'Horoscope / Daily Predictions', keywords: 'Horoscope, daily predictions, zodiac, rashi', label: 'Horoscope' },
  { mode: 'panchang', topic: 'Panchang / Muhurat', keywords: 'Panchang, muhurat, auspicious time, tithi, nakshatra', label: 'Panchang' },
  { mode: 'compatibility', topic: 'Compatibility / Match Making', keywords: 'Kundali milan, compatibility, match making, ashtakoota', label: 'Compatibility' },
  { mode: 'tarot', topic: 'Tarot Reading', keywords: 'Tarot, card reading, divination', label: 'Tarot' },
  { mode: 'palm-reading', topic: 'Palmistry', keywords: 'Palmistry, hand reading, hast rekha', label: 'Palmistry' },
  { mode: 'numerology', topic: 'Numerology', keywords: 'Numerology, life path, destiny number', label: 'Numerology' },
  { mode: 'dreams', topic: 'Dream Interpretation', keywords: 'Dream interpretation, swapna shastra', label: 'Dreams' },
  { mode: 'mantra', topic: 'Mantra', keywords: 'Mantra, chanting, planetary mantras', label: 'Mantra' },
  { mode: 'gemstones', topic: 'Gemstones', keywords: 'Gemstones, ratna, planetary remedies', label: 'Gemstones' },
  { mode: 'vastu', topic: 'Vastu', keywords: 'Vastu, vastu shastra, home energy', label: 'Vastu' },
  { mode: 'rudraksh', topic: 'Rudraksh', keywords: 'Rudraksh, rudraksha, sacred beads', label: 'Rudraksh' },
  { mode: 'yantra', topic: 'Yantra', keywords: 'Yantra, sacred geometry, Sri Yantra', label: 'Yantra' },
  { mode: 'cosmic-health', topic: 'Cosmic Health', keywords: 'Vedic wellness, health astrology', label: 'Cosmic Health' },
  { mode: 'learning', topic: 'Learning Astrology', keywords: 'Learn astrology, astrology basics', label: 'Learning Center' },
  { mode: 'kundali-basics', topic: 'Kundali Basics', keywords: 'Chart reading, houses, planets', label: 'Kundali Basics' },
  { mode: 'planets-houses', topic: 'Planets & Houses', keywords: 'Planetary houses, graha bhava', label: 'Planets & Houses' },
  { mode: 'zodiac-signs', topic: 'Zodiac Signs', keywords: 'Rashi, 12 signs, zodiac', label: 'Zodiac Signs' },
  { mode: 'nakshatra-library', topic: 'Nakshatra', keywords: 'Nakshatra, 27 lunar mansions', label: 'Nakshatra' },
  { mode: 'palmistry-guide', topic: 'Palmistry Guide', keywords: 'Palm lines, hand reading guide', label: 'Palmistry Guide' },
  { mode: 'numerology-guide', topic: 'Numerology Guide', keywords: 'Number meanings, life path guide', label: 'Numerology Guide' },
  { mode: 'star-legends', topic: 'Star Legends', keywords: 'Cosmic stories, nakshatra legends', label: 'Star Legends' },
  { mode: 'games', topic: 'Astro Games', keywords: 'Astrology games, learn through play', label: 'Astro Games' },
];

function getModulesForDate(dateStr) {
  const d = new Date(dateStr);
  const dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
  const start = dayOfYear % BLOG_MODULES.length;
  return [
    BLOG_MODULES[start % BLOG_MODULES.length],
    BLOG_MODULES[(start + 1) % BLOG_MODULES.length],
    BLOG_MODULES[(start + 2) % BLOG_MODULES.length],
  ];
}

const PROMPT_TEMPLATE = (modules) => `You are an expert Vedic astrologer and content writer for CosmicJyoti (cosmicjyoti.com).
Generate exactly 3 unique, in-depth blog articles. Each article MUST be about the specified module topic below.
This drives SEO and awareness for CosmicJyoti's tools - articles must resonate with and redirect readers to the corresponding service.

CRITICAL: Each article must be SUBSTANTIAL and INFORMATIVE. Do NOT write short or shallow content.
- 900-1400 words per article (aim for comprehensive coverage)
- At least 4-5 H2 sections and 2-3 H3 subsections per H2 where relevant
- Include detailed explanations, step-by-step guidance, or multiple examples
- Add practical tips, remedies, or actionable advice readers can use
- Cover the topic thoroughly: background, how it works, significance, practical application, common questions
- SEO-friendly with clear structure and keywords
- Written in English, warm and accessible
- Use proper HTML: <h2> for main sections, <h3> for subsections, <p> for paragraphs, <ul><li>, <ol><li>, <strong>, <em>
- Wrap each paragraph in <p> tags. Keep HTML valid and well-structured.

IMPORTANT: End each article with a clear call-to-action paragraph that invites readers to try the CosmicJyoti tool.
Example: "Ready to explore your own [topic]? Try our free [tool name] at cosmicjyoti.com – get personalized insights in minutes."

Modules to write about (one article per module, in this exact order):
1. ${modules[0].topic} (serviceMode: ${modules[0].mode}) - Keywords: ${modules[0].keywords}
2. ${modules[1].topic} (serviceMode: ${modules[1].mode}) - Keywords: ${modules[1].keywords}
3. ${modules[2].topic} (serviceMode: ${modules[2].mode}) - Keywords: ${modules[2].keywords}

Output ONLY valid JSON in this exact format, no other text:
{
  "posts": [
    {
      "id": "1",
      "title": "Article Title",
      "slug": "article-url-slug",
      "excerpt": "2-3 sentence summary for the card",
      "content": "Full HTML content with <h2>, <h3>, <p>, <ul>, <li> tags. Must end with CTA to try the tool.",
      "readingTime": "6 min",
      "topic": "Topic Name",
      "serviceMode": "${modules[0].mode}"
    },
    {
      "id": "2",
      "title": "Article Title",
      "slug": "article-url-slug",
      "excerpt": "2-3 sentence summary for the card",
      "content": "Full HTML content...",
      "readingTime": "6 min",
      "topic": "Topic Name",
      "serviceMode": "${modules[1].mode}"
    },
    {
      "id": "3",
      "title": "Article Title",
      "slug": "article-url-slug",
      "excerpt": "2-3 sentence summary for the card",
      "content": "Full HTML content...",
      "readingTime": "6 min",
      "topic": "Topic Name",
      "serviceMode": "${modules[2].mode}"
    }
  ]
}`;

async function main() {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Error: API_KEY or GEMINI_API_KEY required');
    process.exit(1);
  }

  const today = new Date().toISOString().split('T')[0];
  const modulesForToday = getModulesForDate(today);
  console.log(`Generating 3 blog posts for ${today}: ${modulesForToday.map(m => m.mode).join(', ')}`);

  // Read existing posts (if any)
  let existingPosts = [];
  try {
    const raw = fs.readFileSync(OUTPUT_PATH, 'utf8');
    const existing = JSON.parse(raw);
    existingPosts = Array.isArray(existing.posts) ? existing.posts : [];
    console.log(`Found ${existingPosts.length} existing posts`);
  } catch (e) {
    // File doesn't exist or invalid - start fresh
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = PROMPT_TEMPLATE(modulesForToday);
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: `${prompt}\n\nGenerate 3 blog posts for today (${today}). Output JSON only.`,
    config: { responseMimeType: 'application/json' },
  });

  const text = response.text;
  if (!text) {
    console.error('No response from Gemini');
    process.exit(1);
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsed = JSON.parse(cleaned);
  }

  const newPosts = (parsed.posts || []).slice(0, 3).map((p, i) => {
    const slug = p.slug || `article-${today.replace(/-/g, '')}-${i + 1}`;
    const articleId = `${today}-${slug}`;
    const moduleForPost = modulesForToday[i];
    return {
      ...p,
      id: articleId,
      slug,
      articleId,
      date: today,
      readingTime: p.readingTime || '6 min',
      serviceMode: p.serviceMode || moduleForPost?.mode,
      serviceLabel: p.serviceLabel || moduleForPost?.label || p.topic,
    };
  });

  // Prepend new posts (newest first), then existing, cap at MAX_POSTS
  const allPosts = [...newPosts, ...existingPosts].slice(0, MAX_POSTS);

  const data = {
    lastGenerated: today,
    generatedAt: new Date().toISOString(),
    totalPosts: allPosts.length,
    posts: allPosts,
  };

  const dir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2), 'utf8');

  console.log(`Done. Added 3 new posts. Total: ${allPosts.length} posts in ${OUTPUT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
