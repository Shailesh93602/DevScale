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

      // Idempotency — return the existing AI review if one was already generated.
      const existing = await this.repo.findAiReviewBySubmission(submissionId);
      if (existing) {
        return sendResponse(res, 'CODE_REVIEW_FETCHED', {
          data: this.serialize(existing.id, existing.feedback),
        });
      }

      const review = await reviewCodeSubmission({
        code: submission.code,
        language: submission.language,
        problemTitle: submission.challenge.title,
        problemStatement: submission.challenge.description,
        executionSummary: {
          status: submission.status,
          runtimeMs: submission.runtime_ms ?? undefined,
          memoryKb: submission.memory_used_kb ?? undefined,
        },
      });

      const saved = await this.repo.createAiReview({
        authorId: userId,
        submissionId,
        code: submission.code,
        language: submission.language,
        review,
      });

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
