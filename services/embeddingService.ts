/**
 * Gemini text embeddings for semantic search and related content.
 *
 * Uses the Gemini API (text-embedding-004 by default). For Gemini Embedding 2
 * (multimodal, 3072/1536/768 dims), set EMBEDDING_MODEL in env when the model ID
 * is available (e.g. text-embedding-005 or as documented at ai.google.dev).
 *
 * @see https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-embedding-2/
 * @see https://ai.google.dev/gemini-api/docs/embeddings
 */

import { GoogleGenAI } from '@google/genai';
import { getNextGeminiKey, hasGeminiKeys } from '../utils/geminiApiKeys';

const DEFAULT_MODEL = 'gemini-embedding-001';
const DEFAULT_DIMENSIONS = 768;

export function hasEmbeddingKeys(): boolean {
  return hasGeminiKeys();
}

/**
 * Get embedding model name (e.g. for Gemini Embedding 2 when available).
 * Uses EMBEDDING_MODEL from env in Node; default in browser.
 */
function getEmbeddingModel(): string {
  if (typeof process !== 'undefined' && process.env?.EMBEDDING_MODEL) {
    return process.env.EMBEDDING_MODEL;
  }
  return DEFAULT_MODEL;
}

/**
 * Embed a single text. Returns a vector of length outputDimensionality (default 768).
 * Uses RETRIEVAL_DOCUMENT for corpus documents; use RETRIEVAL_QUERY for search queries.
 */
export async function embedText(
  text: string,
  options?: {
    taskType?: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY' | 'SEMANTIC_SIMILARITY';
    outputDimensionality?: number;
    title?: string;
  }
): Promise<number[]> {
  const apiKey = getNextGeminiKey();
  if (!apiKey) throw new Error('GEMINI_API_KEY not set; required for embeddings.');
  const ai = new GoogleGenAI({ apiKey });
  const taskType = options?.taskType ?? 'RETRIEVAL_DOCUMENT';
  const outputDimensionality = options?.outputDimensionality ?? DEFAULT_DIMENSIONS;
  const res = await ai.models.embedContent({
    model: getEmbeddingModel(),
    contents: text,
    config: {
      taskType,
      outputDimensionality,
      ...(options?.title && { title: options.title }),
    },
  });
  const values = res.embeddings?.[0]?.values;
  if (!values || !Array.isArray(values)) throw new Error('Empty embedding response');
  return values as number[];
}

/**
 * Embed multiple texts in one request (more efficient). Returns array of vectors
 * in the same order as the input texts.
 */
export async function embedTexts(
  texts: string[],
  options?: {
    taskType?: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY';
    outputDimensionality?: number;
  }
): Promise<number[][]> {
  if (!texts.length) return [];
  const apiKey = getNextGeminiKey();
  if (!apiKey) throw new Error('GEMINI_API_KEY not set; required for embeddings.');
  const ai = new GoogleGenAI({ apiKey });
  const taskType = options?.taskType ?? 'RETRIEVAL_DOCUMENT';
  const outputDimensionality = options?.outputDimensionality ?? DEFAULT_DIMENSIONS;
  const res = await ai.models.embedContent({
    model: getEmbeddingModel(),
    contents: texts,
    config: { taskType, outputDimensionality },
  });
  const embeddings = res.embeddings ?? [];
  return embeddings.map((e) => (e.values as number[]) ?? []);
}

/**
 * Cosine similarity between two vectors (assumes same length).
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}
