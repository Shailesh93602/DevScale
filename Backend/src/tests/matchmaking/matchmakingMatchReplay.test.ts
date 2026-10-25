// A waiter whose socket missed `matchmaking:matched` learns the match from /status.
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
    failHset: false,
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
    async hset(k: string, f: string, v: string) {
      if (this.failHset && k.includes('matched')) throw new Error('redis');
      hash(k).set(f, v);
      return 1;
    },
    hget: async (k: string, f: string) => hash(k).get(f) ?? null,
    hdel: async (k: string, ...fs: string[]) =>
      fs.filter((f) => hash(k).delete(f)).length,
  };
}

function build() {
  const clock = { now: 1_000_000 };
  const redis = keyedRedis();
  const notify = jest.fn(); // the socket push, delivered to nobody
  const service = new MatchmakingService({
    redis,
    redlock: { acquire: async () => ({ release: async () => undefined }) },
    createBattle: async () => ({ battleId: 'b1', slug: 'ranked-b1' }),
    getRating: async () => 1200,
    notify,
    autoStartEnabled: () => false,
    now: () => clock.now,
  });
  return { service, redis, notify, clock };
}

const waiterMatch = {
  matched: true,
  battleId: 'b1',
  slug: 'ranked-b1',
  opponentId: 'joiner',
};

describe('matchmaking status carries a missed match', () => {
  it('a waiter matched while their socket was down sees it on the next status', async () => {
    const t = build();
    await t.service.joinQueue('waiter');
    expect((await t.service.joinQueue('joiner')).matched).toBe(true);
    expect(t.notify).toHaveBeenCalledWith(
      'waiter',
      'matchmaking:matched',
      waiterMatch
    );

    const status = await t.service.getStatus('waiter');
    expect(status.inQueue).toBe(false);
    expect(status.match).toEqual(waiterMatch);
  });

  it('the joiner, who got the match inline, is not given one', async () => {
    const t = build();
    await t.service.joinQueue('waiter');
    await t.service.joinQueue('joiner');
    expect((await t.service.getStatus('joiner')).match).toBeUndefined();
  });

  it('expires after two minutes', async () => {
    const t = build();
    await t.service.joinQueue('waiter');
    await t.service.joinQueue('joiner');
    t.clock.now += 120_001;
    expect((await t.service.getStatus('waiter')).match).toBeUndefined();
  });

  it('is cleared when the player queues again or leaves', async () => {
    const t = build();
    await t.service.joinQueue('waiter');
    await t.service.joinQueue('joiner');
    await t.service.leaveQueue('waiter');
    expect((await t.service.getStatus('waiter')).match).toBeUndefined();

    const u = build();
    await u.service.joinQueue('waiter');
    await u.service.joinQueue('joiner');
    await u.service.joinQueue('waiter'); // queues again, alone
    const status = await u.service.getStatus('waiter');
    expect(status.inQueue).toBe(true);
    expect(status.match).toBeUndefined();
  });

  it('a Redis failure storing the replay does not undo the match', async () => {
    const t = build();
    await t.service.joinQueue('waiter');
    t.redis.failHset = true;
    const result = await t.service.joinQueue('joiner');
    expect(result.matched).toBe(true);
    expect(t.notify).toHaveBeenCalled();
  });
});
