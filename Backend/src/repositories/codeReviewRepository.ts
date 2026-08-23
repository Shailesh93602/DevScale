/**
 * Persistence for AI Code Review rows (source = "ai") on the CodeReview model.
 * The full structured review is stored as JSON in `feedback`; `score`/`summary`/
 * `model` are denormalized for querying. reviewer_id stays null for AI reviews.
 */

import { CodeReview } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { AiCodeReview } from '../services/ai/codeReviewService.js';

export interface ClaimInput {
  authorId: string;
  submissionId: string;
  code: string;
  language: string;
}

export interface CreateAiReviewInput {
  authorId: string;
  submissionId: string;
  code: string;
  language: string;
  review: AiCodeReview;
  model?: string | null;
}

/**
 * How long a `pending` claim may sit before another request may take it over.
 *
 * This number exists because a claim without an expiry is a deadlock waiting to
 * happen: if the process holding it dies between claiming and generating, the
 * row stays `pending` forever and that submission can never be reviewed again.
 *
 * Five minutes is comfortably longer than any Gemini call (seconds) and short
 * enough that a user who hits a crash is not stuck for long. It is wall-clock,
 * so clock skew between instances shifts it — acceptable here because the
 * consequence of taking over slightly early is one wasted generation, not
 * incorrect data.
 */
export const STALE_CLAIM_MS = 5 * 60 * 1000;

export type ClaimOutcome =
  /** We hold the claim — generate the review, then complete() or release(). */
  | { readonly kind: 'claimed'; readonly id: string }
  /** Someone already generated it. */
  | { readonly kind: 'already-complete'; readonly review: CodeReview }
  /** Someone else is generating right now. */
  | { readonly kind: 'in-progress' };

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
  /**
   * Claim the right to generate the review for this submission, BEFORE calling
   * the LLM.
   *
   * The previous ordering generated first and inserted second, so the loser of
   * a race paid for a full generation and then threw it away. Gemini calls cost
   * real money and this project has ~zero free quota, and the trigger is a
   * double-click on a slow button — not an exotic interleaving.
   *
   * The claim is an INSERT, so the unique index on (submission_id, source) is
   * what arbitrates. There is no read-then-write window to lose.
   */
  async claimForGeneration(input: ClaimInput): Promise<ClaimOutcome> {
    try {
      const claimed = await prisma.codeReview.create({
        data: {
          code: input.code,
          language: input.language,
          author_id: input.authorId,
          reviewer_id: null,
          source: 'ai',
          status: 'pending',
          feedback: '',
          submission_id: input.submissionId,
        },
      });
      return { kind: 'claimed', id: claimed.id };
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }

    // Lost the insert — someone holds the claim or already finished.
    const holder = await this.findAiReviewBySubmission(input.submissionId);
    if (!holder) {
      // Vanishingly unlikely: the row was deleted between our failed insert and
      // this read (a concurrent release). Report in-progress rather than
      // pretending to know; the client retries and wins the next insert.
      return { kind: 'in-progress' };
    }

    if (holder.status !== 'pending') {
      return { kind: 'already-complete', review: holder };
    }

    // A pending claim. If it is stale the holder almost certainly died, so take
    // it over — otherwise this submission is unreviewable forever.
    const age = Date.now() - holder.updated_at.getTime();
    if (age < STALE_CLAIM_MS) {
      return { kind: 'in-progress' };
    }

    // Take over by bumping updated_at, but ONLY if it is still the same stale
    // row. The `updated_at` predicate is inside the mutation on purpose: two
    // requests can both decide a claim is stale, and without it both would
    // proceed to generate.
    const takenOver = await prisma.codeReview.updateMany({
      where: {
        id: holder.id,
        status: 'pending',
        updated_at: holder.updated_at,
      },
      data: { updated_at: new Date() },
    });

    return takenOver.count === 1
      ? { kind: 'claimed', id: holder.id }
      : { kind: 'in-progress' };
  }

  /** Fill in a claim we hold with the finished review. */
  async completeClaim(
    id: string,
    review: AiCodeReview,
    model?: string | null
  ): Promise<CodeReview> {
    return prisma.codeReview.update({
      where: { id },
      data: {
        status: 'completed',
        feedback: JSON.stringify(review),
        score: review.score,
        summary: review.summary,
        model: model ?? null,
      },
    });
  }

  /**
   * Release a claim whose generation failed.
   *
   * Without this a failed Gemini call wedges the submission for STALE_CLAIM_MS,
   * which is a bad experience for an error the user can retry immediately. The
   * delete is scoped to `status: 'pending'` so it can never remove a review that
   * completed in the meantime.
   */
  async releaseClaim(id: string): Promise<void> {
    await prisma.codeReview.deleteMany({ where: { id, status: 'pending' } });
  }

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
