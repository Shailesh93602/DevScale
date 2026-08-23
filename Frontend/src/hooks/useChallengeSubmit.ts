import { useState } from 'react';
import { useAxiosPost } from './useAxios';

export interface ChallengeSubmissionResult {
  id: string;
  status: string;
  score: number;
  runtimeMs?: number | null;
  memoryUsedKb?: number | null;
}

interface SubmitBody {
  code: string;
  language: string;
}

/**
 * Submit a challenge solution. POST /challenges/:challengeId/submit — runs the
 * code against the test cases server-side and persists a ChallengeSubmission
 * (returns its id, used to request an AI review).
 */
export const useChallengeSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [execute] = useAxiosPost<ChallengeSubmissionResult, SubmitBody>(
    '/challenges/{{challengeId}}/submit',
  );

  const submitChallenge = async (
    challengeId: string,
    code: string,
    language: string,
  ): Promise<ChallengeSubmissionResult> => {
    setIsSubmitting(true);
    try {
      const response = await execute({ code, language }, undefined, {
        challengeId,
      });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitChallenge, isSubmitting };
};
