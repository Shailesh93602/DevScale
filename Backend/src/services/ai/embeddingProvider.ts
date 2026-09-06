/**
 * Embeddings provider (Spine B) — the single place that touches the Gemini
 * embeddings SDK, so tests mock THIS module. Reuses the shared client + key from
 * Spine A's llmConfig. Gemini `text-embedding-004` returns 768-dim vectors.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { isAiConfigured } from './llmConfig.js';
import { EMBEDDING_TIMEOUT_MS } from '../../utils/deadlines.js';

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
  // This is the ONLY Gemini path with no circuit breaker in front of it, which
  // makes this timeout the only bound that exists on it. Without it the call
  // inherits `fetch`'s absence of a deadline, and it is reached both
  // interactively (POST /tutor/ask blocks the whole request) and in bulk (the
  // reindex job, five at a time, once per active challenge).
  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel(
    { model: EMBEDDING_MODEL },
    { timeout: EMBEDDING_TIMEOUT_MS }
  );
  const result = await model.embedContent(text);
  return result.embedding.values;
}
