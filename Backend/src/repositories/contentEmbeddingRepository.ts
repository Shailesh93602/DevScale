/**
 * ContentEmbedding persistence (Spine B). pgvector columns can't go through the
 * Prisma client (the field is Unsupported("vector")), so writes + similarity
 * queries use raw SQL. Cosine distance via the `<=>` operator.
 */

import { randomUUID } from 'node:crypto';
import prisma from '../lib/prisma.js';

export interface SimilarContent {
  content_id: string;
  distance: number;
}

export interface UpsertEmbeddingInput {
  contentType: string;
  contentId: string;
  contentHash: string;
  embedding: number[];
  /** The embedding model that produced `embedding` — half of the row's space. */
  model: string;
  /** Its dimension — the other half. Must match the column's vector(N). */
  dimensions: number;
}

/**
 * What decides whether a stored row is still current: the text it embeds AND
 * the space it was embedded in. A row whose hash matches but whose model or
 * dimension differs is stale — its vector is not comparable to a fresh one
 * (see contentIngestService).
 */
export interface StoredFingerprint {
  contentHash: string;
  model: string;
  dimensions: number;
}

export interface FindSimilarInput {
  contentType: string;
  embedding: number[];
  limit?: number;
  excludeContentId?: string;
}

export interface FindSimilarToContentInput {
  contentType: string;
  contentId: string;
  limit?: number;
  excludeContentIds?: string[];
}

/** pgvector accepts a textual literal like "[0.1,0.2,...]" cast to ::vector. */
function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

export class ContentEmbeddingRepository {
  /** Insert or replace the embedding for a (content_type, content_id) pair. */
  async upsert(input: UpsertEmbeddingInput): Promise<void> {
    const vector = toVectorLiteral(input.embedding);
    await prisma.$executeRaw`
      INSERT INTO "ContentEmbedding"
        ("id", "content_type", "content_id", "content_hash", "embedding", "model", "dimensions", "created_at", "updated_at")
      VALUES
        (${randomUUID()}, ${input.contentType}, ${input.contentId}, ${input.contentHash}, ${vector}::vector, ${input.model}, ${input.dimensions}, NOW(), NOW())
      ON CONFLICT ("content_type", "content_id")
      DO UPDATE SET
        "content_hash" = EXCLUDED."content_hash",
        "embedding"    = EXCLUDED."embedding",
        "model"        = EXCLUDED."model",
        "dimensions"   = EXCLUDED."dimensions",
        "updated_at"   = NOW();
    `;
  }

  /**
   * The stored fingerprint for a pair — content hash plus the embedding space
   * it was produced in — or null if not embedded yet. The ingest service
   * compares all three; a hash-only check let a model change leave every
   * unchanged text on the old model's vectors.
   */
  async getStoredFingerprint(
    contentType: string,
    contentId: string
  ): Promise<StoredFingerprint | null> {
    const rows = await prisma.$queryRaw<
      { content_hash: string; model: string; dimensions: number }[]
    >`
      SELECT "content_hash", "model", "dimensions" FROM "ContentEmbedding"
      WHERE "content_type" = ${contentType} AND "content_id" = ${contentId}
      LIMIT 1;
    `;
    const row = rows[0];
    if (!row) return null;
    return {
      contentHash: row.content_hash,
      model: row.model,
      dimensions: Number(row.dimensions),
    };
  }

  /** Nearest neighbours by cosine distance (ascending = most similar first). */
  async findSimilar(input: FindSimilarInput): Promise<SimilarContent[]> {
    const vector = toVectorLiteral(input.embedding);
    const limit = input.limit ?? 5;
    const exclude = input.excludeContentId ?? '';
    return prisma.$queryRaw<SimilarContent[]>`
      SELECT "content_id", ("embedding" <=> ${vector}::vector) AS distance
      FROM "ContentEmbedding"
      WHERE "content_type" = ${input.contentType}
        AND "content_id" <> ${exclude}
      ORDER BY "embedding" <=> ${vector}::vector ASC
      LIMIT ${limit};
    `;
  }

  /**
   * Nearest neighbours to an ALREADY-STORED item, using its own embedding as the
   * query (the seed). Keeps the vector in the DB (no round-trip through JS).
   * Returns [] when the seed isn't embedded yet.
   */
  async findSimilarToContent(
    input: FindSimilarToContentInput
  ): Promise<SimilarContent[]> {
    const limit = input.limit ?? 5;
    // Always exclude the seed itself; `<> ALL(array)` handles the rest.
    const exclude =
      input.excludeContentIds && input.excludeContentIds.length > 0
        ? Array.from(new Set([input.contentId, ...input.excludeContentIds]))
        : [input.contentId];
    return prisma.$queryRaw<SimilarContent[]>`
      WITH seed AS (
        SELECT "embedding" FROM "ContentEmbedding"
        WHERE "content_type" = ${input.contentType}
          AND "content_id" = ${input.contentId}
        LIMIT 1
      )
      SELECT ce."content_id", (ce."embedding" <=> seed."embedding") AS distance
      FROM "ContentEmbedding" ce, seed
      WHERE ce."content_type" = ${input.contentType}
        AND ce."content_id" <> ALL(${exclude})
      ORDER BY ce."embedding" <=> seed."embedding" ASC
      LIMIT ${limit};
    `;
  }
}
