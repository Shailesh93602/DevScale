/**
 * eduscale-backend#22-03 — the public challenge endpoints returned every
 * column, including the reference `solutions`, and the list's `limit` and
 * `page` went straight into take/skip (?limit=100000 dumped the table, a
 * negative page made Prisma 500).
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { project } from '../helpers/prismaProjection';
import { runHandler } from '../helpers/runHandler';

const row = {
  id: 'c1',
  title: 'Two Sum',
  description: 'Find two numbers.',
  editorial: 'Use a hash map.',
  // Json column; a string so the projection helper treats it as a scalar.
  solutions: '{"javascript":"REFERENCE_SOLUTION"}',
};
const findManyArgs: Array<{ take?: number; skip?: number }> = [];

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    challenge: {
      count: async () => 1,
      findMany: async (args: { take?: number; skip?: number }) => {
        findManyArgs.push(args);
        return [project(row, args)];
      },
      findUnique: async (args: unknown) => project(row, args),
    },
  },
}));

import ChallengeController from '../../controllers/challengeController';

const controller = new ChallengeController();

describe('GET /challenges', () => {
  beforeEach(() => {
    findManyArgs.length = 0;
  });

  it('never returns reference solutions or the editorial in the list', async () => {
    const out = await runHandler(controller.getChallenges, { query: {} });
    const body = JSON.stringify(out.body);
    expect(body).toContain('Two Sum');
    expect(body).not.toContain('REFERENCE_SOLUTION');
    expect(body).not.toContain('Use a hash map.');
  });

  it('caps limit at 100', async () => {
    await runHandler(controller.getChallenges, { query: { limit: '100000' } });
    expect(findManyArgs[0].take).toBe(100);
  });

  it('treats a negative page as page 1 (no negative skip)', async () => {
    const out = await runHandler(controller.getChallenges, {
      query: { page: '-5' },
    });
    expect(out.error).toBeUndefined();
    expect(findManyArgs[0].skip).toBe(0);
  });
});

describe('GET /challenges/:id', () => {
  it('never returns reference solutions', async () => {
    const out = await runHandler(controller.getChallenge, {
      params: { id: 'c1' },
    });
    const body = JSON.stringify(out.body);
    expect(body).toContain('Two Sum');
    expect(body).not.toContain('REFERENCE_SOLUTION');
  });
});
