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
  model: string;
}

export interface FindSimilarInput {
  contentType: string;
  embedding: number[];
  limit?: number;
  excludeContentId?: string;
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
        ("id", "content_type", "content_id", "content_hash", "embedding", "model", "created_at", "updated_at")
      VALUES
        (${randomUUID()}, ${input.contentType}, ${input.contentId}, ${input.contentHash}, ${vector}::vector, ${input.model}, NOW(), NOW())
      ON CONFLICT ("content_type", "content_id")
      DO UPDATE SET
        "content_hash" = EXCLUDED."content_hash",
        "embedding"    = EXCLUDED."embedding",
        "model"        = EXCLUDED."model",
        "updated_at"   = NOW();
    `;
  }

  /** The stored content hash for a pair, or null if not embedded yet. */
  async getStoredHash(
    contentType: string,
    contentId: string
  ): Promise<string | null> {
    const rows = await prisma.$queryRaw<{ content_hash: string }[]>`
      SELECT "content_hash" FROM "ContentEmbedding"
      WHERE "content_type" = ${contentType} AND "content_id" = ${contentId}
      LIMIT 1;
    `;
    return rows[0]?.content_hash ?? null;
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
}
