/**
 * Embedding service (Spine B) — embed text with a content-hash Redis cache so
 * identical text is never re-embedded (no second spend). Throws AppError(503)
 * when AI is not configured.
 */

import { createHash } from 'node:crypto';
import {
  EMBEDDING_DIMENSIONS,
  EMBEDDING_MODEL,
  rawEmbed,
} from './embeddingProvider.js';
import { getCache, setCache } from '../cacheService.js';
import { requireApiKey } from './resolveApiKey.js';

const CACHE_PREFIX = 'embedding';
const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

/** Stable content hash — also the dedup key for idempotent ingest. */
export function hashText(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

/**
 * Embed text, billed to `userId`'s key when they have one.
 *
 * The cache is shared across users on purpose — an embedding of identical text
 * is identical bytes, so re-embedding it under a different key would spend
 * someone's quota to recompute a value we already have. The key is still
 * resolved first, so a user without one is told to add it rather than being
 * served from a cache they never contributed to.
 */
export async function embedText(
  text: string,
  userId?: string | null,
  { skipCache = false }: { skipCache?: boolean } = {}
): Promise<number[]> {
  const { apiKey } = await requireApiKey(userId);

  // A vector is a function of the text AND the model: keyed on the text alone,
  // a model change kept serving the old model's vectors for the whole TTL.
  const key = `${EMBEDDING_MODEL}:${EMBEDDING_DIMENSIONS}:${hashText(text)}`;
  if (!skipCache) {
    const cached = await getCache<number[]>(`${CACHE_PREFIX}:${key}`);
    if (cached) return cached;
  }

  const vector = await rawEmbed(text, apiKey);
  await setCache(key, vector, { ttl: CACHE_TTL_SECONDS, prefix: CACHE_PREFIX });
  return vector;
}
