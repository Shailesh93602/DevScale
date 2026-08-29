import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockSubFindMany = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockChalFindMany = jest.fn<(...args: unknown[]) => Promise<unknown>>();
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    challengeSubmission: {
      findMany: (...a: unknown[]) => mockSubFindMany(...a),
    },
    challenge: { findMany: (...a: unknown[]) => mockChalFindMany(...a) },
    $disconnect: jest.fn(),
  },
}));

const mockFindSimilarToContent =
  jest.fn<(...args: unknown[]) => Promise<unknown>>();
jest.mock('../../repositories/contentEmbeddingRepository', () => ({
  __esModule: true,
  ContentEmbeddingRepository: jest.fn().mockImplementation(() => ({
    findSimilarToContent: (...a: unknown[]) => mockFindSimilarToContent(...a),
  })),
}));

jest.mock('../../services/cacheService', () => ({
  __esModule: true,
  redis: { status: 'end', quit: jest.fn() },
}));

import { RecommendationService } from '../../services/ai/recommendationService';

const svc = new RecommendationService();

beforeEach(() => {
  mockSubFindMany.mockReset();
  mockChalFindMany.mockReset();
  mockFindSimilarToContent.mockReset();
});

describe('RecommendationService.recommendChallenges', () => {
  it('returns [] with no provider call when the learner has no submissions', async () => {
    mockSubFindMany.mockResolvedValue([]);
    const result = await svc.recommendChallenges('u1');
    expect(result).toEqual([]);
    expect(mockFindSimilarToContent).not.toHaveBeenCalled();
  });

  it('seeds on the most recent attempt, excludes all attempted, and preserves similarity order', async () => {
    mockSubFindMany.mockResolvedValue([
      { challenge_id: 'c1' }, // most recent → seed
      { challenge_id: 'c2' },
    ]);
    mockFindSimilarToContent.mockResolvedValue([
      { content_id: 'c9', distance: 0.1 },
      { content_id: 'c8', distance: 0.25 },
    ]);
    mockChalFindMany.mockResolvedValue([
      { id: 'c8', title: 'Eight', difficulty: 'medium', category: 'dp' },
      { id: 'c9', title: 'Nine', difficulty: 'easy', category: 'arrays' },
    ]);

    const result = await svc.recommendChallenges('u1', 5);

    expect(mockFindSimilarToContent).toHaveBeenCalledWith(
      expect.objectContaining({
        contentType: 'challenge',
        contentId: 'c1',
        excludeContentIds: ['c1', 'c2'],
      })
    );
    // Ordered by similarity (c9 first), with distance attached.
    expect(result).toEqual([
      {
        id: 'c9',
        title: 'Nine',
        difficulty: 'easy',
        category: 'arrays',
        distance: 0.1,
      },
      {
        id: 'c8',
        title: 'Eight',
        difficulty: 'medium',
        category: 'dp',
        distance: 0.25,
      },
    ]);
  });

  it('returns [] when no similar challenges are found', async () => {
    mockSubFindMany.mockResolvedValue([{ challenge_id: 'c1' }]);
    mockFindSimilarToContent.mockResolvedValue([]);
    const result = await svc.recommendChallenges('u1');
    expect(result).toEqual([]);
    expect(mockChalFindMany).not.toHaveBeenCalled();
  });
});
