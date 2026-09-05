/**
 * Idempotent content ingest (Spine B). Embeds a piece of content and stores its
 * vector, skipping the (expensive) embedding call when nothing that determines
 * the vector has changed. Powers semantic search + recommendations built on
 * top in B2.
 *
 * WHAT "UNCHANGED" HAS TO MEAN.
 *
 * The first version skipped on content-hash equality alone. That is the right
 * check for the text, and the wrong check for the vector: an embedding is a
 * function of the text AND the model that embedded it. Changing
 * `GEMINI_EMBEDDING_MODEL` (or the dimension) and re-running the reindex
 * therefore re-embedded nothing — every unchanged text still matched its hash,
 * was reported `skipped`, and kept the OLD model's vector. New content got the
 * new model's. One pgvector table, two embedding spaces, and cosine distance
 * between them is a number that means nothing. The reindex endpoint reported
 * success the whole time.
 *
 * So the fingerprint is (content hash, model, dimensions), all three stored on
 * the row and all three compared. A model change now invalidates every row on
 * the next reindex, which is the only correct outcome. `force` bypasses the
 * comparison entirely, for the case the fingerprint cannot see — a provider
 * that changes normalisation or output under the same model name.
 */

import { embedText, hashText } from './embeddingService.js';
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from './embeddingProvider.js';
import { ContentEmbeddingRepository } from '../../repositories/contentEmbeddingRepository.js';

export type IngestStatus = 'created' | 'updated' | 'skipped';

export interface IngestInput {
  contentType: string;
  contentId: string;
  text: string;
}

export interface IngestOptions {
  /** Re-embed even when the stored fingerprint matches. */
  force?: boolean;
}

export class ContentIngestService {
  private readonly repo: ContentEmbeddingRepository;

  constructor(
    repo: ContentEmbeddingRepository = new ContentEmbeddingRepository()
  ) {
    this.repo = repo;
  }

  async ingest(
    input: IngestInput,
    userId?: string | null,
    options: IngestOptions = {}
  ): Promise<{ status: IngestStatus }> {
    const hash = hashText(input.text);
    const stored = await this.repo.getStoredFingerprint(
      input.contentType,
      input.contentId
    );

    // Unchanged text, same model, same dimension — the vector we hold is the
    // vector we would compute. Skip the embedding call entirely.
    const current =
      stored !== null &&
      stored.contentHash === hash &&
      stored.model === EMBEDDING_MODEL &&
      stored.dimensions === EMBEDDING_DIMENSIONS;
    if (current && !options.force) {
      return { status: 'skipped' };
    }

    const embedding = await embedText(input.text, userId);
    await this.repo.upsert({
      contentType: input.contentType,
      contentId: input.contentId,
      contentHash: hash,
      embedding,
      model: EMBEDDING_MODEL,
      dimensions: EMBEDDING_DIMENSIONS,
    });

    return { status: stored ? 'updated' : 'created' };
  }
}
