/**
 * Embedding service (Spine B) — embed text with a content-hash Redis cache so
 * identical text is never re-embedded (no second spend). Throws AppError(503)
 * when AI is not configured.
 */

import { createHash } from 'node:crypto';
import { rawEmbed, isEmbeddingConfigured } from './embeddingProvider.js';
import { getCache, setCache } from '../cacheService.js';
import { createAppError } from '../../utils/errorHandler.js';

const CACHE_PREFIX = 'embedding';
const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

/** Stable content hash — also the dedup key for idempotent ingest. */
export function hashText(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

export async function embedText(text: string): Promise<number[]> {
  if (!isEmbeddingConfigured()) {
    throw createAppError(
      'AI features are not configured (GEMINI_API_KEY missing).',
      503
    );
  }

  const key = hashText(text);
  const cached = await getCache<number[]>(`${CACHE_PREFIX}:${key}`);
  if (cached) return cached;

  const vector = await rawEmbed(text);
  await setCache(key, vector, { ttl: CACHE_TTL_SECONDS, prefix: CACHE_PREFIX });
  return vector;
}
