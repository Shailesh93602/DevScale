import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useAxiosPost } from '@/hooks/useAxios';
import { logger } from '@/lib/logger';
import { useChallengeSubmit } from '@/hooks/useChallengeSubmit';
import {
  AiKeyRequiredError,
  useCodeReview,
  type CodeReviewResult,
} from '@/hooks/useCodeReview';
import type { ITestResult } from './challengeTypes';

const BOTTOM_RIGHT = { position: 'bottom-right' } as const;

/** Review is best-effort: a missing API key gets an actionable link, anything else a soft notice. */
function notifyReviewFailure(reviewError: unknown) {
  logger.error('AI review failed:', reviewError);
  if (reviewError instanceof AiKeyRequiredError) {
    // A visible link, not an onClick on the toast body — an invisible
    // click target is not an offer, it is a secret.
    toast.info(
      <span>
        {reviewError.message}{' '}
        <Link href="/settings" className="font-medium underline">
          Open settings
        </Link>
      </span>,
      { position: 'bottom-right', autoClose: 10000 },
    );
  } else {
    toast.info('AI review is unavailable right now.', BOTTOM_RIGHT);
  }
}

interface RunnerInput {
  id: string;
  language: string;
  code: string;
  challengeTitle: string | undefined;
  onReviewStart: () => void;
}

/** Run-code, submit and AI review for a challenge. */
export function useChallengeRunner({
  id,
  language,
  code,
  challengeTitle,
  onReviewStart,
}: RunnerInput) {
  const [output, setOutput] = useState('');
  const [testResults, setTestResults] = useState<ITestResult[]>([]);
  const [activeTestTab, setActiveTestTab] = useState<string>('0');
  const [isRunning, setIsRunning] = useState(false);
  const [consoleExpanded, setConsoleExpanded] = useState(true);
  const [review, setReview] = useState<CodeReviewResult | null>(null);

  const [runCode] = useAxiosPost<ITestResult[]>('/run-code');
  const { submitChallenge, isSubmitting } = useChallengeSubmit();
  const { requestReview, isReviewing } = useCodeReview();

  const handleSubmit = async () => {
    setReview(null);
    try {
      const submission = await submitChallenge(id, code, language);
      const accepted = submission.status === 'accepted';
      toast[accepted ? 'success' : 'error'](
        accepted ? 'Accepted' : 'Submitted — some tests failed',
        BOTTOM_RIGHT,
      );
      // Surface the AI review next to the submission.
      onReviewStart();
      try {
        setReview(await requestReview(submission.id));
      } catch (reviewError) {
        notifyReviewFailure(reviewError);
      }
    } catch (error) {
      logger.error('Error submitting challenge:', error);
      toast.error(
        'Unable to submit your answer. Please try again.',
        BOTTOM_RIGHT,
      );
    }
  };

  const showResults = (results: ITestResult[] | undefined) => {
    if (Array.isArray(results) && results.length > 0) {
      setTestResults(results);
      setActiveTestTab('0');
      const allPassed = results.every((r) => r.status === 'Accepted');
      if (allPassed) toast.success('Accepted', BOTTOM_RIGHT);
      else toast.error('Wrong Answer', BOTTOM_RIGHT);
    } else {
      setOutput('Execution successful (no output)');
      toast.success('Code executed successfully');
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('');
    setTestResults([]);
    setConsoleExpanded(true);

    try {
      const response = await runCode({
        language,
        code,
        challengeId: id,
        challengeTitle,
      });

      if (response.error || !response.success) {
        const errorMsg =
          response.message || 'Could not run your code. Please try again.';
        setOutput(`Error: ${errorMsg}`);
        toast.error(errorMsg);
      } else {
        showResults(response.data);
      }
    } catch (error) {
      logger.error('Error running code:', error);
      const errorMsg = (error as { message: string }).message;
      setOutput(`Error: ${errorMsg}`);
      toast.error(`Execution failed: ${errorMsg}`);
    } finally {
      setIsRunning(false);
    }
  };

  return {
    output,
    testResults,
    activeTestTab,
    setActiveTestTab,
    isRunning,
    consoleExpanded,
    setConsoleExpanded,
    review,
    isSubmitting,
    isReviewing,
    handleSubmit,
    handleRunCode,
  };
}

export type ChallengeRunner = ReturnType<typeof useChallengeRunner>;
