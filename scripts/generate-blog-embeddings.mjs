#!/usr/bin/env node
/**
 * Generate embeddings for blog posts and add relatedIds to each post using Gemini
 * Embedding API (default: gemini-embedding-001; or gemini-embedding-2-preview / EMBEDDING_MODEL).
 *
 * Reads public/blog/daily-posts.json, embeds title+excerpt for each post, computes
 * top 4 related articles by cosine similarity, and writes relatedIds back to each post.
 *
 * Requires GEMINI_API_KEY (or GEMINI_API_KEYS) in .env or .env.local.
 *
 * Usage: node scripts/generate-blog-embeddings.mjs
 *
 * @see https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-embedding-2/
 * @see https://ai.google.dev/gemini-api/docs/embeddings
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

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'gemini-embedding-001';
const OUTPUT_DIMENSIONS = parseInt(process.env.EMBEDDING_DIMENSIONS || '768', 10);
const BATCH_SIZE = 10;
const RELATED_TOP_K = 4;

function getGeminiKey() {
  const raw = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  const keys = raw.split(',').map((k) => k.trim()).filter(Boolean);
  return keys[0] || '';
}

function cosineSimilarity(a, b) {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Call Gemini batchEmbedContents for a batch of texts. Returns array of embedding vectors.
 * API expects requests[].content (and optional taskType, outputDimensionality) directly, no "request" wrapper.
 */
async function embedBatch(texts, apiKey) {
  const modelId = EMBEDDING_MODEL.startsWith('models/') ? EMBEDDING_MODEL : `models/${EMBEDDING_MODEL}`;
  const url = `https://generativelanguage.googleapis.com/v1beta/${modelId}:batchEmbedContents?key=${encodeURIComponent(apiKey)}`;
  const requests = texts.map((text) => ({
    model: modelId,
    content: { parts: [{ text: text.slice(0, 8192) }] },
    taskType: 'RETRIEVAL_DOCUMENT',
    outputDimensionality: OUTPUT_DIMENSIONS,
  }));
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini embed API ${res.status}: ${err}`);
  }
  const data = await res.json();
  const embeddings = (data.embeddings || []).map((e) => e.values || []);
  return embeddings;
}

async function main() {
  const apiKey = getGeminiKey();
  if (!apiKey) {
    console.error('Set GEMINI_API_KEY or GEMINI_API_KEYS in .env or .env.local');
    process.exit(1);
  }

  const postsPath = path.join(ROOT_DIR, 'public', 'blog', 'daily-posts.json');
  let data;
  try {
    data = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
  } catch (e) {
    console.error('Could not read public/blog/daily-posts.json:', e.message);
    process.exit(1);
  }

  const posts = data.posts || [];
  if (!posts.length) {
    console.log('No posts to embed.');
    return;
  }

  console.log(`Using ${EMBEDDING_MODEL} (${OUTPUT_DIMENSIONS}d) for ${posts.length} posts...`);

  const texts = posts.map((p) => {
    const title = (p.title || '').trim();
    const excerpt = (p.excerpt || '').trim();
    return `${title}\n${excerpt}`.trim() || title || excerpt || '(no text)';
  });

  const allEmbeddings = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(texts.length / BATCH_SIZE);
    process.stdout.write(`  Embedding batch ${batchNum}/${totalBatches}... `);
    const vecs = await embedBatch(batch, apiKey);
    allEmbeddings.push(...vecs);
    console.log('OK');
    if (i + BATCH_SIZE < texts.length) await new Promise((r) => setTimeout(r, 300));
  }

  const ids = posts.map((p) => p.articleId || p.id || p.slug);
  const relatedIdsMap = {};
  for (let i = 0; i < posts.length; i++) {
    const vec = allEmbeddings[i];
    const sims = posts.map((_, j) => (i === j ? -1 : cosineSimilarity(vec, allEmbeddings[j])));
    const indices = sims
      .map((s, idx) => ({ s, idx }))
      .sort((a, b) => b.s - a.s)
      .slice(0, RELATED_TOP_K)
      .map((x) => x.idx);
    relatedIdsMap[ids[i]] = indices.map((j) => ids[j]).filter(Boolean);
  }

  for (const post of posts) {
    const id = post.articleId || post.id || post.slug;
    post.relatedIds = relatedIdsMap[id] || [];
  }

  data.embeddingModel = EMBEDDING_MODEL;
  data.embeddingDimensions = OUTPUT_DIMENSIONS;
  data.relatedGeneratedAt = new Date().toISOString();

  fs.writeFileSync(postsPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Done. Wrote relatedIds (top ${RELATED_TOP_K}) to public/blog/daily-posts.json`);

  // Save embeddings for semantic search (backend /api/blog-search)
  const embeddingsPath = path.join(ROOT_DIR, 'public', 'blog', 'daily-posts-embeddings.json');
  const embeddingsData = {
    model: EMBEDDING_MODEL,
    dimensions: OUTPUT_DIMENSIONS,
    generatedAt: new Date().toISOString(),
    embeddings: ids.map((id, i) => ({ id, embedding: allEmbeddings[i] })),
  };
  fs.writeFileSync(embeddingsPath, JSON.stringify(embeddingsData), 'utf8');
  console.log(`Wrote ${ids.length} embeddings to public/blog/daily-posts-embeddings.json (for semantic search).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
