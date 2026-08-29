import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock the axios layer so no network call happens; assert the hook's contract.
const { execute } = vi.hoisted(() => ({ execute: vi.fn() }));
vi.mock('./useAxios', () => ({
  useAxiosPost: () => [execute, {}],
}));

import {
  useCodeReview,
  AiKeyRequiredError,
  type CodeReviewResult,
} from './useCodeReview';

const result: CodeReviewResult = {
  id: 'cr1',
  review: {
    summary: 's',
    correctness: { verdict: 'correct', explanation: 'e' },
    complexity: { time: 'O(n)', space: 'O(1)' },
    edgeCasesMissed: [],
    improvements: [],
    score: 90,
  },
};

beforeEach(() => execute.mockReset());

describe('useCodeReview', () => {
  it('posts to the review endpoint with the submission id and returns the review', async () => {
    execute.mockResolvedValue({ success: true, data: result });
    const { result: hook } = renderHook(() => useCodeReview());

    let value: CodeReviewResult | undefined;
    await act(async () => {
      value = await hook.current.requestReview('sub-1');
    });

    expect(execute).toHaveBeenCalledWith({}, undefined, {
      submissionId: 'sub-1',
    });
    expect(value).toEqual(result);
  });

  it('throws with the API message when the response is unsuccessful', async () => {
    execute.mockResolvedValue({
      success: false,
      message: 'The AI service is temporarily unavailable.',
    });
    const { result: hook } = renderHook(() => useCodeReview());

    let err: unknown;
    await act(async () => {
      try {
        await hook.current.requestReview('sub-1');
      } catch (e) {
        err = e;
      }
    });

    expect((err as Error).message).toBe(
      'The AI service is temporarily unavailable.',
    );
    // A plain Error, so the UI shows its generic "unavailable" copy.
    expect(err).not.toBeInstanceOf(AiKeyRequiredError);
  });

  it('throws AiKeyRequiredError, with the server message intact, when the user has no key', async () => {
    // THE POINT OF THIS TEST.
    //
    // "You have not added your API key" is a ONE-CLICK fix; "the AI service is
    // down" is not. The UI branches on the type to say the right one. Before
    // this, every failure was flattened into "AI review is unavailable right
    // now" — good English telling the user the wrong thing, and no harness
    // that reads message copy can catch that.
    //
    // It branches on details.code rather than the message text, because
    // matching prose breaks the moment anyone edits the copy.
    execute.mockResolvedValue({
      success: false,
      message:
        'Add your own Google Gemini API key in Settings to use the AI features.',
      details: { code: 'AI_KEY_REQUIRED' },
    });
    const { result: hook } = renderHook(() => useCodeReview());

    let err: unknown;
    await act(async () => {
      try {
        await hook.current.requestReview('sub-1');
      } catch (e) {
        err = e;
      }
    });

    expect(err).toBeInstanceOf(AiKeyRequiredError);
    // The server's actionable wording must survive — it names the page to go to.
    expect((err as Error).message).toMatch(/Settings/);
  });
});
