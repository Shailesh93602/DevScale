/**
 * Challenge → embedding ingest (Spine B2). Builds the embeddable text for a
 * coding challenge and ingests it (idempotent via ContentIngestService). Used by
 * the admin reindex endpoint; can later be called on challenge create/update.
 */

import prisma from '../../lib/prisma.js';
import { createAppError } from '../../utils/errorHandler.js';
import logger from '../../utils/logger.js';
import { ContentIngestService, IngestStatus } from './contentIngestService.js';

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
  /** Rows whose embedding threw. The run continues past them. */
  failed: number;
}

/**
 * How many challenges are held in memory at once, and how many embeddings are
 * in flight at once.
 *
 * PAGE_SIZE bounds memory. CONCURRENCY is the one that needs a reason: the
 * per-row cost is dominated by an embedding API call, not by the database, so
 * running a few at a time cuts wall-clock roughly linearly. It is deliberately
 * small — the ceiling here is the embedding provider's rate limit, and
 * exceeding it converts a slow backfill into a failed one.
 */
const PAGE_SIZE = 100;
const CONCURRENCY = 5;

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

  async ingestChallenge(
    challengeId: string
  ): Promise<{ status: IngestStatus }> {
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

  /**
   * Backfill embeddings for every active challenge.
   *
   * WHAT WAS WRONG WITH THE OBVIOUS VERSION.
   *
   * It loaded every active challenge into memory, then awaited one ingest per
   * row in a plain `for...of`. Each ingest is two database round trips plus an
   * embedding API call, so the request took N × (network latency) — and this
   * is a single admin HTTP request. On any hosted runtime it hits the gateway
   * timeout first, and the admin gets a 504 that says nothing about how much
   * of the backfill actually completed.
   *
   * One row throwing also lost the whole run, including the work already done.
   *
   * 🔴 WHY THAT IS SURVIVABLE RATHER THAN FATAL, AND WHY THE FIX IS SMALL.
   *
   * `ingest` hashes the text and returns `skipped` when the stored hash still
   * matches, so re-running is close to free for anything already indexed. The
   * operation is idempotent, which means it is also RESUMABLE: if this times
   * out, calling it again picks up where it stopped rather than redoing the
   * work.
   *
   * That property is what makes bounded pages and bounded concurrency
   * sufficient. It removes the need for a job queue here, which would be the
   * right answer if a re-run were expensive — and is worth stating so the next
   * person does not build one on the assumption that it is.
   *
   * So: pages of PAGE_SIZE keep memory flat, CONCURRENCY cuts wall-clock, and
   * a failure is counted rather than thrown, so a single bad row cannot
   * discard the rest of the run.
   */
  async reindexAll(): Promise<ReindexResult> {
    const result: ReindexResult = {
      total: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
    };

    let cursor: string | undefined;

    for (;;) {
      const page = await prisma.challenge.findMany({
        where: { status: 'ACTIVE' },
        select: {
          id: true,
          title: true,
          description: true,
          difficulty: true,
          category: true,
          tags: true,
        },
        // Ordered by id so the cursor is stable: without an explicit order,
        // pagination can revisit or miss rows.
        orderBy: { id: 'asc' },
        take: PAGE_SIZE,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });

      if (page.length === 0) break;
      result.total += page.length;

      for (let i = 0; i < page.length; i += CONCURRENCY) {
        await Promise.all(
          page.slice(i, i + CONCURRENCY).map(async (challenge) => {
            try {
              const { status } = await this.ingest.ingest({
                contentType: CONTENT_TYPE,
                contentId: challenge.id,
                text: this.buildText(challenge),
              });
              result[status] += 1;
            } catch (error) {
              // Counted, not thrown. A backfill that discards an hour of
              // completed work because one row has bad text is worse than one
              // that reports "3 failed" and leaves them for a re-run — which
              // is cheap, because the successes now skip.
              result.failed += 1;
              logger.error('Reindex failed for a challenge', {
                challengeId: challenge.id,
                error,
              });
            }
          })
        );
      }

      cursor = page[page.length - 1].id;
      if (page.length < PAGE_SIZE) break;
    }

    return result;
  }
}
