// eduscale-backend#25-02 — a player who stopped polling is evicted, not matched as a ghost.
import { describe, it, expect, jest } from '@jest/globals';

jest.mock('../../services/cacheService', () => ({
  __esModule: true,
  redis: { status: 'end', quit: jest.fn() },
  redlock: { acquire: jest.fn() },
}));

import { MatchmakingService } from '../../services/matchmaking/matchmakingService';

function keyedRedis() {
  const z = new Map<string, number>();
  const h = new Map<string, Map<string, string>>();
  const hash = (k: string) => h.get(k) ?? h.set(k, new Map()).get(k)!;
  return {
    z,
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
    hset: async (k: string, f: string, v: string) => (hash(k).set(f, v), 1),
    hget: async (k: string, f: string) => hash(k).get(f) ?? null,
    hdel: async (k: string, ...fs: string[]) =>
      fs.filter((f) => hash(k).delete(f)).length,
  };
}

describe('matchmaking presence', () => {
  it('skips and evicts a waiter whose last poll is older than the staleness window', async () => {
    let now = 1_000_000;
    const redis = keyedRedis();
    const createBattle = jest.fn(async () => ({ battleId: 'b', slug: 's' }));
    const service = new MatchmakingService({
      redis,
      redlock: { acquire: async () => ({ release: async () => undefined }) },
      createBattle,
      getRating: async () => 1200,
      notify: () => undefined,
      now: () => now,
    });

    await service.joinQueue('ghost');
    now += 5 * 60_000; // the ghost closed the tab five minutes ago
    const result = await service.joinQueue('player');

    expect(result.matched).toBe(false);
    expect(createBattle).not.toHaveBeenCalled();
    expect(redis.z.has('ghost')).toBe(false);
    expect(redis.z.has('player')).toBe(true);
  });

  it('a waiter that keeps polling status stays matchable', async () => {
    let now = 1_000_000;
    const redis = keyedRedis();
    const service = new MatchmakingService({
      redis,
      redlock: { acquire: async () => ({ release: async () => undefined }) },
      createBattle: async () => ({ battleId: 'b', slug: 's' }),
      getRating: async () => 1200,
      notify: () => undefined,
      now: () => now,
    });

    await service.joinQueue('waiter');
    for (let i = 0; i < 20; i++) {
      now += 3_000;
      await service.getStatus('waiter');
    }
    expect((await service.joinQueue('player')).matched).toBe(true);
  });
});
