import { useState } from 'react';
import { useAxiosPost } from './useAxios';

/**
 * Thrown when the user has not added their own Gemini API key.
 *
 * A distinct type rather than a message string, because the caller has to
 * BRANCH: "add your key" is a one-click fix and "the AI service is down" is
 * not, and showing the second when the first is true tells the user the
 * feature is broken when it is waiting on them. Matching on prose instead
 * would break the moment anyone edits the copy.
 */
export class AiKeyRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiKeyRequiredError';
  }
}

/**
 * AI Code Review types — mirror the backend's structured review (keys arrive
 * camelCased via the backend's camelCaseResponse middleware).
 */
export interface AiCodeReview {
  summary: string;
  correctness: { verdict: string; explanation: string };
  complexity: { time: string; space: string };
  edgeCasesMissed: string[];
  improvements: { title: string; detail: string }[];
  score: number;
}

export interface CodeReviewResult {
  id: string;
  review: AiCodeReview;
}

/**
 * Request the AI review for a challenge submission.
 * POST /code-reviews/challenge/:submissionId (auth + ownership enforced server-side;
 * idempotent — repeat calls return the stored review).
 */
export const useCodeReview = () => {
  const [isReviewing, setIsReviewing] = useState(false);
  const [execute] = useAxiosPost<CodeReviewResult, Record<string, never>>(
    '/code-reviews/challenge/{{submissionId}}',
  );

  const requestReview = async (
    submissionId: string,
  ): Promise<CodeReviewResult> => {
    setIsReviewing(true);
    try {
      const response = await execute({}, undefined, { submissionId });
      if (response.success && response.data) {
        return response.data;
      }
      if (response.details?.code === 'AI_KEY_REQUIRED') {
        throw new AiKeyRequiredError(response.message);
      }
      throw new Error(
        response.message || 'The AI review could not be created.',
      );
    } finally {
      setIsReviewing(false);
    }
  };

  return { requestReview, isReviewing };
};
