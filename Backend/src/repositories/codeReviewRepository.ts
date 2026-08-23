/**
 * Persistence for AI Code Review rows (source = "ai") on the CodeReview model.
 * The full structured review is stored as JSON in `feedback`; `score`/`summary`/
 * `model` are denormalized for querying. reviewer_id stays null for AI reviews.
 */

import { CodeReview } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { AiCodeReview } from '../services/ai/codeReviewService.js';

export interface CreateAiReviewInput {
  authorId: string;
  submissionId: string;
  code: string;
  language: string;
  review: AiCodeReview;
  model?: string | null;
}

export class CodeReviewRepository {
  /** Idempotency: an existing AI review for this submission, if any. */
  async findAiReviewBySubmission(
    submissionId: string
  ): Promise<CodeReview | null> {
    return prisma.codeReview.findFirst({
      where: { submission_id: submissionId, source: 'ai' },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Create the AI review, or converge on the one a concurrent request created.
   *
   * The caller checks `findAiReviewBySubmission` first, but that is a
   * check-then-act: two requests for the same submission can both miss it and
   * both arrive here. The unique index on (submission_id, source) is what
   * actually guarantees a single row; this catch is how the loser of that race
   * returns the winner's review instead of a 500.
   *
   * Without the recovery the loser surfaces an unhandled Prisma error to a user
   * who did nothing wrong except double-click.
   */
  async createAiReview(input: CreateAiReviewInput): Promise<CodeReview> {
    try {
      return await this.insert(input);
    } catch (error) {
      if (isUniqueViolation(error)) {
        const winner = await this.findAiReviewBySubmission(input.submissionId);
        if (winner) return winner;
      }
      throw error;
    }
  }

  private async insert(input: CreateAiReviewInput): Promise<CodeReview> {
    return prisma.codeReview.create({
      data: {
        code: input.code,
        language: input.language,
        author_id: input.authorId,
        reviewer_id: null,
        source: 'ai',
        status: 'completed',
        feedback: JSON.stringify(input.review),
        score: input.review.score,
        summary: input.review.summary,
        model: input.model ?? null,
        submission_id: input.submissionId,
      },
    });
  }
}

/** Prisma P2002 — unique constraint violation. */
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: string }).code === 'P2002'
  );
}
