/**
 * Challenge → embedding ingest (Spine B2). Builds the embeddable text for a
 * coding challenge and ingests it (idempotent via ContentIngestService). Used by
 * the admin reindex endpoint; can later be called on challenge create/update.
 */

import prisma from '../../lib/prisma.js';
import { createAppError } from '../../utils/errorHandler.js';
import {
  ContentIngestService,
  IngestStatus,
} from './contentIngestService.js';

const CONTENT_TYPE = 'challenge';

interface ChallengeTextFields {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  tags: string[];
}

export interface ReindexResult {
  total: number;
  created: number;
  updated: number;
  skipped: number;
}

export class ChallengeIngestService {
  private readonly ingest: ContentIngestService;

  constructor(ingest: ContentIngestService = new ContentIngestService()) {
    this.ingest = ingest;
  }

  /** What we embed for a challenge — the signal a learner would search by. */
  buildText(c: ChallengeTextFields): string {
    const tags = c.tags?.length ? c.tags.join(', ') : 'none';
    return `${c.title}\n\n${c.description}\nDifficulty: ${c.difficulty}\nCategory: ${c.category}\nTags: ${tags}`;
  }

  async ingestChallenge(challengeId: string): Promise<{ status: IngestStatus }> {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        category: true,
        tags: true,
      },
    });
    if (!challenge) throw createAppError('Challenge not found', 404);

    return this.ingest.ingest({
      contentType: CONTENT_TYPE,
      contentId: challenge.id,
      text: this.buildText(challenge),
    });
  }

  /** Backfill embeddings for every active challenge. */
  async reindexAll(): Promise<ReindexResult> {
    const challenges = await prisma.challenge.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        category: true,
        tags: true,
      },
    });

    const result: ReindexResult = {
      total: challenges.length,
      created: 0,
      updated: 0,
      skipped: 0,
    };

    for (const challenge of challenges) {
      const { status } = await this.ingest.ingest({
        contentType: CONTENT_TYPE,
        contentId: challenge.id,
        text: this.buildText(challenge),
      });
      result[status] += 1;
    }

    return result;
  }
}
