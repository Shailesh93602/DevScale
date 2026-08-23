import { useState } from 'react';
import { useAxiosPost } from './useAxios';

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
      throw new Error(response.message || 'Failed to generate AI review');
    } finally {
      setIsReviewing(false);
    }
  };

  return { requestReview, isReviewing };
};
