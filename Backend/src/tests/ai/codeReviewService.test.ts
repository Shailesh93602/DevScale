import { describe, it, expect, jest, beforeEach } from '@jest/globals';

/**
 * AI Code Review service tests — the LLM layer is mocked, so we assert the
 * prompt/schema/cache-key contract and the review schema itself, deterministically.
 */

const mockGenerate = jest.fn<(opts: unknown) => Promise<unknown>>();
jest.mock('../../services/ai/llmService', () => ({
  __esModule: true,
  generateStructured: (opts: unknown) => mockGenerate(opts),
}));

jest.mock('../../services/cacheService', () => ({
  __esModule: true,
  redis: { status: 'end', quit: jest.fn() },
}));

import {
  reviewCodeSubmission,
  buildReviewCacheKey,
  AiCodeReviewSchema,
  type AiCodeReview,
  type CodeReviewInput,
} from '../../services/ai/codeReviewService';

const baseInput: CodeReviewInput = {
  code: 'function add(a,b){return a+b}',
  language: 'javascript',
  problemTitle: 'Two Sum',
  problemStatement: 'Return indices of two numbers adding to target.',
  executionSummary: { status: 'accepted', passedCount: 5, totalCount: 5 },
};

const validReview: AiCodeReview = {
  summary: 'Clean and correct.',
  correctness: { verdict: 'correct', explanation: 'Passes all tests.' },
  complexity: { time: 'O(n)', space: 'O(n)' },
  edge_cases_missed: [],
  improvements: [
    { title: 'Naming', detail: 'Use descriptive variable names.' },
  ],
  score: 88,
};

beforeEach(() => {
  mockGenerate.mockReset();
});

describe('buildReviewCacheKey', () => {
  it('is deterministic for identical input', () => {
    expect(buildReviewCacheKey(baseInput)).toBe(buildReviewCacheKey(baseInput));
  });

  it('changes when the code changes', () => {
    const changed = { ...baseInput, code: 'different code' };
    expect(buildReviewCacheKey(changed)).not.toBe(
      buildReviewCacheKey(baseInput)
    );
  });

  it('is namespaced under code-review:', () => {
    expect(buildReviewCacheKey(baseInput)).toMatch(
      /^code-review:[a-f0-9]{64}$/
    );
  });
});

describe('AiCodeReviewSchema', () => {
  it('accepts a well-formed review', () => {
    expect(AiCodeReviewSchema.safeParse(validReview).success).toBe(true);
  });

  it('rejects an out-of-range score', () => {
    expect(
      AiCodeReviewSchema.safeParse({ ...validReview, score: 150 }).success
    ).toBe(false);
  });

  it('rejects an unknown correctness verdict', () => {
    expect(
      AiCodeReviewSchema.safeParse({
        ...validReview,
        correctness: { verdict: 'maybe', explanation: 'x' },
      }).success
    ).toBe(false);
  });
});

describe('reviewCodeSubmission', () => {
  it('returns the structured review from the LLM layer', async () => {
    mockGenerate.mockResolvedValue(validReview);
    const result = await reviewCodeSubmission(baseInput);
    expect(result).toEqual(validReview);
  });

  it('calls the LLM layer with the right schema, cache key, and a prompt that includes the code, language, and problem', async () => {
    mockGenerate.mockResolvedValue(validReview);
    await reviewCodeSubmission(baseInput);

    expect(mockGenerate).toHaveBeenCalledTimes(1);
    const opts = mockGenerate.mock.calls[0][0] as {
      schema: unknown;
      cacheKey: string;
      prompt: string;
      cachePrefix: string;
    };
    expect(opts.schema).toBe(AiCodeReviewSchema);
    expect(opts.cacheKey).toBe(buildReviewCacheKey(baseInput));
    expect(opts.cachePrefix).toBe('ai-review');
    expect(opts.prompt).toContain(baseInput.code);
    expect(opts.prompt).toContain(baseInput.language);
    expect(opts.prompt).toContain(baseInput.problemTitle);
    // execution verdict is grounded into the prompt
    expect(opts.prompt).toContain('accepted');
  });
});
