import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockEmbed = jest.fn<(text: string) => Promise<number[]>>();
jest.mock('../../services/ai/embeddingService', () => ({
  __esModule: true,
  embedText: (t: string) => mockEmbed(t),
}));

const mockFindSimilar = jest.fn<(...args: unknown[]) => Promise<unknown>>();
jest.mock('../../repositories/contentEmbeddingRepository', () => ({
  __esModule: true,
  ContentEmbeddingRepository: jest.fn().mockImplementation(() => ({
    findSimilar: (...a: unknown[]) => mockFindSimilar(...a),
  })),
}));

const mockGenerate = jest.fn<(opts: unknown) => Promise<unknown>>();
jest.mock('../../services/ai/llmService', () => ({
  __esModule: true,
  generateStructured: (opts: unknown) => mockGenerate(opts),
}));

const mockChalFindMany = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockChalFindUnique = jest.fn<(...args: unknown[]) => Promise<unknown>>();
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    challenge: {
      findMany: (...a: unknown[]) => mockChalFindMany(...a),
      findUnique: (...a: unknown[]) => mockChalFindUnique(...a),
    },
    $disconnect: jest.fn(),
  },
}));

jest.mock('../../services/cacheService', () => ({
  __esModule: true,
  redis: { status: 'end', quit: jest.fn() },
}));

import { TutorService } from '../../services/ai/tutorService';

const svc = new TutorService();

beforeEach(() => {
  mockEmbed.mockReset().mockResolvedValue([0.1, 0.2, 0.3]);
  mockFindSimilar.mockReset();
  mockGenerate.mockReset();
  mockChalFindMany.mockReset();
  mockChalFindUnique.mockReset();
});

describe('TutorService.answerQuestion', () => {
  it('returns an honest "I don\'t know" without calling the LLM when nothing is retrieved', async () => {
    mockFindSimilar.mockResolvedValue([]);
    const result = await svc.answerQuestion('what is a monad');
    expect(result.used_context).toBe(false);
    expect(result.confidence).toBe('low');
    expect(result.citations).toEqual([]);
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it('falls back to "I don\'t know" when the best match is too far (above threshold)', async () => {
    mockFindSimilar.mockResolvedValue([{ content_id: 'c1', distance: 0.9 }]);
    mockChalFindMany.mockResolvedValue([
      { id: 'c1', title: 'Unrelated', description: 'x' },
    ]);
    const result = await svc.answerQuestion('how do I balance a tree');
    expect(result.used_context).toBe(false);
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it('grounds the answer in retrieved context and returns the LLM result', async () => {
    mockFindSimilar.mockResolvedValue([
      { content_id: 'c1', distance: 0.15 },
      { content_id: 'c2', distance: 0.8 }, // filtered out (too far)
    ]);
    mockChalFindMany.mockResolvedValue([
      { id: 'c1', title: 'Binary Search', description: 'Find an element in O(log n).' },
      { id: 'c2', title: 'Far', description: 'irrelevant' },
    ]);
    const answer = {
      answer: 'Use two pointers...',
      confidence: 'high',
      used_context: true,
      citations: [{ title: 'Binary Search', content_id: 'c1' }],
    };
    mockGenerate.mockResolvedValue(answer);

    const result = await svc.answerQuestion('how does binary search work');
    expect(result).toEqual(answer);

    const opts = mockGenerate.mock.calls[0][0] as { prompt: string; cachePrefix: string };
    expect(opts.cachePrefix).toBe('tutor');
    expect(opts.prompt).toContain('Binary Search'); // relevant context included
    expect(opts.prompt).toContain('how does binary search work');
    expect(opts.prompt).not.toContain('irrelevant'); // far match excluded
  });
});

describe('TutorService.getHint', () => {
  it('throws when the challenge does not exist', async () => {
    mockChalFindUnique.mockResolvedValue(null);
    await expect(svc.getHint('missing', 1)).rejects.toThrow();
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it('clamps the level into 1..4 and prompts the LLM', async () => {
    mockChalFindUnique.mockResolvedValue({
      id: 'c1',
      title: 'Two Sum',
      description: 'desc',
      difficulty: 'easy',
    });
    mockGenerate.mockResolvedValue({
      hint: 'Think about a hash map.',
      level: 4,
      reveals_full_solution: false,
    });

    const result = await svc.getHint('c1', 99); // clamps to 4
    expect(result.level).toBe(4);
    const opts = mockGenerate.mock.calls[0][0] as { prompt: string };
    expect(opts.prompt).toContain('hint level 4 of 4');
    expect(opts.prompt).toContain('NEVER reveal the full solution');
  });

  it('treats a non-positive level as 1', async () => {
    mockChalFindUnique.mockResolvedValue({
      id: 'c1',
      title: 'Two Sum',
      description: 'desc',
      difficulty: 'easy',
    });
    mockGenerate.mockResolvedValue({
      hint: 'A gentle nudge.',
      level: 1,
      reveals_full_solution: false,
    });
    await svc.getHint('c1', 0);
    const opts = mockGenerate.mock.calls[0][0] as { prompt: string };
    expect(opts.prompt).toContain('hint level 1 of 4');
  });
});
