/**
 * GET /challenges/leaderboard?challengeId= attached each top user's best
 * accepted submission as the whole row, `code` included, so any signed-in
 * user could read other people's accepted solutions to a challenge.
 */
import { describe, it, expect, jest } from '@jest/globals';
import { project } from '../helpers/prismaProjection';

const submissionRow = {
  id: 's1',
  challenge_id: 'c1',
  user_id: 'u2',
  code: 'function twoSum() { /* ACCEPTED_SOLUTION */ }',
  language: 'javascript',
  status: 'accepted',
  runtime_ms: 12,
  memory_used_kb: 900,
  score: 10,
  feedback: '',
  created_at: new Date('2026-10-01'),
  updated_at: new Date('2026-10-01'),
};

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    userPoints: {
      findMany: async () => [{ user_id: 'u2', points: 10 }],
    },
    challengeSubmission: {
      findMany: async (args: unknown) => [project(submissionRow, args)],
    },
  },
}));
jest.mock('../../utils/codeExecutor', () => ({ executeCode: jest.fn() }));
jest.mock('../../services/cacheService', () => ({
  invalidateCachePattern: async () => undefined,
}));

import { ChallengeRepository } from '../../repositories/challengeRepository';

describe('challenge leaderboard', () => {
  it("never returns another user's submitted code", async () => {
    const rows = (await new ChallengeRepository().getLeaderboard(
      'c1'
    )) as Array<{
      bestSubmission?: Record<string, unknown>;
    }>;
    expect(rows[0].bestSubmission).toMatchObject({ id: 's1', runtime_ms: 12 });
    expect(rows[0].bestSubmission).not.toHaveProperty('code');
    expect(JSON.stringify(rows)).not.toContain('ACCEPTED_SOLUTION');
  });
});
