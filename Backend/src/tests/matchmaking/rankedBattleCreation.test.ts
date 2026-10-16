/**
 * eduscale-backend#25-01 — a ranked match produced a battle nobody could play.
 *
 * The default createBattle made a 5-question battle with no questions and no
 * participants. startBattle refuses while `_count.questions < total_questions`,
 * so every /instant-battle match was unstartable, and with no seats held a
 * third user could take a matched player's place. This runs the real default
 * createBattle (only Redis and Prisma are faked) and checks what was INSERTed.
 */
import { describe, it, expect, jest } from '@jest/globals';

jest.mock('../../services/cacheService', () => ({
  __esModule: true,
  redis: { status: 'end', quit: jest.fn() },
  redlock: { acquire: jest.fn() },
  getCache: jest.fn(async () => null),
  setCache: jest.fn(async () => undefined),
}));
jest.mock('../../services/socket', () => ({
  __esModule: true,
  default: { emitToUser: jest.fn() },
}));

type Created = {
  max_participants: number;
  total_questions: number;
  current_participants?: number;
  participants?: { create: Array<{ user_id: string }> };
  questions?: { create: Array<{ order: number; options: string[] }> };
};
const battleCreates: Created[] = [];

const questionRow = (i: number) => ({
  id: `q${i}`,
  question: `Question ${i}?`,
  correct_answer: `right ${i}`,
  points: 10,
  options: [
    { id: `o${i}a`, text: `right ${i}`, is_correct: true },
    { id: `o${i}b`, text: `wrong ${i}`, is_correct: false },
  ],
});

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    question: {
      findMany: async () => Array.from({ length: 8 }, (_, i) => questionRow(i)),
    },
    battle: {
      create: async ({ data }: { data: Created & { title: string } }) => {
        battleCreates.push(data);
        return { id: 'battle-1', title: data.title };
      },
      update: async () => ({}),
    },
    userRating: { findUnique: async () => null },
  },
}));

import { MatchmakingService } from '../../services/matchmaking/matchmakingService';

function fakeRedis() {
  const z = new Map<string, number>();
  const meta = new Map<string, string>();
  return {
    zadd: async (_k: string, s: number, m: string) => (z.set(m, s), 1),
    zrem: async (_k: string, ...ms: string[]) =>
      ms.filter((m) => z.delete(m)).length,
    zscore: async (_k: string, m: string) =>
      z.has(m) ? String(z.get(m)) : null,
    zcard: async () => z.size,
    zrangebyscore: async (_k: string, min: number, max: number) =>
      [...z]
        .filter(([, s]) => s >= min && s <= max)
        .flatMap(([m, s]) => [m, String(s)]),
    hset: async (_k: string, f: string, v: string) => (meta.set(f, v), 1),
    hget: async (_k: string, f: string) => meta.get(f) ?? null,
    hdel: async (_k: string, ...fs: string[]) =>
      fs.filter((f) => meta.delete(f)).length,
  };
}

describe('ranked match battle', () => {
  it('is created with its questions and both matched players already seated', async () => {
    const service = new MatchmakingService({
      redis: fakeRedis(),
      redlock: { acquire: async () => ({ release: async () => undefined }) },
      notify: () => undefined,
      now: () => 1_000,
    });

    await service.joinQueue('waiter');
    const result = await service.joinQueue('joiner');
    expect(result.matched).toBe(true);

    const data = battleCreates[0];
    // Startable: as many questions as total_questions, in order.
    expect(data.questions?.create).toHaveLength(data.total_questions);
    expect(data.questions?.create.map((q) => q.order)).toEqual([1, 2, 3, 4, 5]);
    // Not stealable: both seats taken in the same INSERT.
    expect(data.participants?.create.map((p) => p.user_id).sort()).toEqual([
      'joiner',
      'waiter',
    ]);
    expect(data.current_participants).toBe(data.max_participants);
  });
});
