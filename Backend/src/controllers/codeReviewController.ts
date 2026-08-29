import { Request, Response } from 'express';
import { catchAsync } from '../utils/index.js';
import { sendResponse } from '../utils/apiResponse.js';
import { createAppError } from '../utils/errorHandler.js';
import prisma from '../lib/prisma.js';
import { CodeReviewRepository } from '../repositories/codeReviewRepository.js';
import {
  AiCodeReview,
  reviewCodeSubmission,
} from '../services/ai/codeReviewService.js';

export default class CodeReviewController {
  private readonly repo: CodeReviewRepository;

  constructor() {
    this.repo = new CodeReviewRepository();
  }

  /**
   * POST /code-reviews/challenge/:submissionId
   * Generate (or return the cached) AI review for the caller's own challenge
   * submission. Idempotent: a second call returns the stored review.
   */
  public reviewChallengeSubmission = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, 'UNAUTHORIZED');
      }

      const { submissionId } = req.params;
      const submission = await prisma.challengeSubmission.findUnique({
        where: { id: submissionId },
        include: { challenge: true },
      });

      if (!submission) {
        return sendResponse(res, 'NOT_FOUND');
      }
      // You can only review your own submission.
      if (submission.user_id !== userId) {
        return sendResponse(res, 'FORBIDDEN');
      }

      // CLAIM FIRST, THEN GENERATE.
      //
      // The obvious ordering — check, generate, insert — makes the loser of a
      // race pay for a full LLM call and then discard it. Gemini calls cost
      // real money and this project has ~zero free quota, and the trigger is a
      // double-click on a slow button.
      //
      // Claiming is an INSERT, so the unique index on (submission_id, source)
      // arbitrates and there is no read-then-write window to lose.
      const claim = await this.repo.claimForGeneration({
        authorId: userId,
        submissionId,
        code: submission.code,
        language: submission.language,
      });

      if (claim.kind === 'already-complete') {
        return sendResponse(res, 'CODE_REVIEW_FETCHED', {
          data: this.serialize(claim.review.id, claim.review.feedback),
        });
      }

      if (claim.kind === 'in-progress') {
        // Someone else is generating. Say so rather than starting a second
        // generation or blocking this request until theirs finishes.
        return sendResponse(res, 'CODE_REVIEW_IN_PROGRESS');
      }

      let review;
      try {
        review = await reviewCodeSubmission(
          {
            code: submission.code,
            language: submission.language,
            problemTitle: submission.challenge.title,
            problemStatement: submission.challenge.description,
            executionSummary: {
              status: submission.status,
              runtimeMs: submission.runtime_ms ?? undefined,
              memoryKb: submission.memory_used_kb ?? undefined,
            },
          },
          // Bill the review to the submitter's own key when they have set one.
          userId
        );
      } catch (error) {
        // Release, or this submission is unreviewable until the claim goes
        // stale — a bad outcome for an error the user could retry immediately.
        await this.repo.releaseClaim(claim.id);
        throw error;
      }

      const saved = await this.repo.completeClaim(claim.id, review);

      return sendResponse(res, 'CODE_REVIEW_CREATED', {
        data: this.serialize(saved.id, review),
      });
    }
  );

  /** Normalize the response whether `review` is the object or a JSON string. */
  private serialize(id: string, review: AiCodeReview | string) {
    let parsed: AiCodeReview | null;
    if (typeof review === 'string') {
      try {
        parsed = JSON.parse(review) as AiCodeReview;
      } catch {
        throw createAppError('Stored review is corrupt', 500);
      }
    } else {
      parsed = review;
    }
    return { id, review: parsed };
  }
}
