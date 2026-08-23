import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockChalFindUnique = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockChalFindMany = jest.fn<(...args: unknown[]) => Promise<unknown>>();
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    challenge: {
      findUnique: (...a: unknown[]) => mockChalFindUnique(...a),
      findMany: (...a: unknown[]) => mockChalFindMany(...a),
    },
    $disconnect: jest.fn(),
  },
}));

const mockIngest = jest.fn<(...args: unknown[]) => Promise<{ status: string }>>();
jest.mock('../../services/ai/contentIngestService', () => ({
  __esModule: true,
  ContentIngestService: jest.fn().mockImplementation(() => ({
    ingest: (...a: unknown[]) => mockIngest(...a),
  })),
}));

jest.mock('../../services/cacheService', () => ({
  __esModule: true,
  redis: { status: 'end', quit: jest.fn() },
}));

import { ChallengeIngestService } from '../../services/ai/challengeIngestService';

const svc = new ChallengeIngestService();

const challenge = {
  id: 'c1',
  title: 'Two Sum',
  description: 'Return indices of two numbers adding to target.',
  difficulty: 'easy',
  category: 'arrays',
  tags: ['hash-map', 'array'],
};

beforeEach(() => {
  mockChalFindUnique.mockReset();
  mockChalFindMany.mockReset();
  mockIngest.mockReset();
});

describe('ChallengeIngestService.buildText', () => {
  it('includes title, description, difficulty, category and tags', () => {
    const text = svc.buildText(challenge);
    expect(text).toContain('Two Sum');
    expect(text).toContain('Return indices');
    expect(text).toContain('Difficulty: easy');
    expect(text).toContain('Category: arrays');
    expect(text).toContain('hash-map, array');
  });
});

describe('ChallengeIngestService.ingestChallenge', () => {
  it('throws when the challenge does not exist', async () => {
    mockChalFindUnique.mockResolvedValue(null);
    await expect(svc.ingestChallenge('missing')).rejects.toThrow();
    expect(mockIngest).not.toHaveBeenCalled();
  });

  it('ingests the built text for an existing challenge', async () => {
    mockChalFindUnique.mockResolvedValue(challenge);
    mockIngest.mockResolvedValue({ status: 'created' });

    const result = await svc.ingestChallenge('c1');

    expect(result.status).toBe('created');
    expect(mockIngest).toHaveBeenCalledWith(
      expect.objectContaining({
        contentType: 'challenge',
        contentId: 'c1',
        text: expect.stringContaining('Two Sum'),
      })
    );
  });
});

describe('ChallengeIngestService.reindexAll', () => {
  it('aggregates created / updated / skipped counts across all active challenges', async () => {
    mockChalFindMany.mockResolvedValue([
      { ...challenge, id: 'c1' },
      { ...challenge, id: 'c2' },
      { ...challenge, id: 'c3' },
    ]);
    mockIngest
      .mockResolvedValueOnce({ status: 'created' })
      .mockResolvedValueOnce({ status: 'skipped' })
      .mockResolvedValueOnce({ status: 'updated' });

    const result = await svc.reindexAll();

    expect(result).toEqual({ total: 3, created: 1, updated: 1, skipped: 1 });
    expect(mockIngest).toHaveBeenCalledTimes(3);
  });
});
