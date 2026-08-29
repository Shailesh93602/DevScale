/**
 * Embeddings provider (Spine B) — the single place that touches the Gemini
 * embeddings SDK, so tests mock THIS module. Reuses the shared client + key from
 * Spine A's llmConfig. Gemini `text-embedding-004` returns 768-dim vectors.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { isAiConfigured } from './llmConfig.js';

export const EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL?.trim() || 'text-embedding-004';

// pgvector column is fixed-width; keep this in sync with the migration's vector(N).
export const EMBEDDING_DIMENSIONS = 768;

export function isEmbeddingConfigured(): boolean {
  return isAiConfigured();
}

/**
 * Single raw embedding call, billed to `apiKey`. Throws the SDK error verbatim.
 *
 * The key is passed in for the same reason it is in rawGenerate: nothing here
 * may reach for the environment and quietly spend the server's quota. A client
 * is constructed per call rather than cached — embedding is already dominated
 * by a network round trip, and one fewer cache is one fewer place a credential
 * can be held under the wrong identity.
 */
export async function rawEmbed(
  text: string,
  apiKey: string
): Promise<number[]> {
  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: EMBEDDING_MODEL,
  });
  const result = await model.embedContent(text);
  return result.embedding.values;
}
