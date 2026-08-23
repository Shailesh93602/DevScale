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

  async createAiReview(input: CreateAiReviewInput): Promise<CodeReview> {
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
