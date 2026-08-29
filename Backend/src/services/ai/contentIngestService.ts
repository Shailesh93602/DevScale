/**
 * Idempotent content ingest (Spine B). Embeds a piece of content and stores its
 * vector, skipping the (expensive) embedding call when the text is unchanged
 * since last time (matched by content hash). Powers semantic search +
 * recommendations built on top in B2.
 */

import { embedText, hashText } from './embeddingService.js';
import { EMBEDDING_MODEL } from './embeddingProvider.js';
import { ContentEmbeddingRepository } from '../../repositories/contentEmbeddingRepository.js';

export type IngestStatus = 'created' | 'updated' | 'skipped';

export interface IngestInput {
  contentType: string;
  contentId: string;
  text: string;
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
    userId?: string | null
  ): Promise<{ status: IngestStatus }> {
    const hash = hashText(input.text);
    const storedHash = await this.repo.getStoredHash(
      input.contentType,
      input.contentId
    );

    // Unchanged since last ingest — skip the embedding call entirely.
    if (storedHash === hash) {
      return { status: 'skipped' };
    }

    const embedding = await embedText(input.text, userId);
    await this.repo.upsert({
      contentType: input.contentType,
      contentId: input.contentId,
      contentHash: hash,
      embedding,
      model: EMBEDDING_MODEL,
    });

    return { status: storedHash ? 'updated' : 'created' };
  }
}
