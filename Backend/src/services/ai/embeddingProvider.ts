/**
 * Embeddings provider (Spine B) — the single place that touches the Gemini
 * embeddings SDK, so tests mock THIS module. Reuses the shared client + key from
 * Spine A's llmConfig. Gemini `text-embedding-004` returns 768-dim vectors.
 */

import { getGenAIClient, isAiConfigured } from './llmConfig.js';

export const EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL?.trim() || 'text-embedding-004';

// pgvector column is fixed-width; keep this in sync with the migration's vector(N).
export const EMBEDDING_DIMENSIONS = 768;

export function isEmbeddingConfigured(): boolean {
  return isAiConfigured();
}

/** Single raw embedding call. Throws the SDK error verbatim. */
export async function rawEmbed(text: string): Promise<number[]> {
  const model = getGenAIClient().getGenerativeModel({ model: EMBEDDING_MODEL });
  const result = await model.embedContent(text);
  return result.embedding.values;
}
