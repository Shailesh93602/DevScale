import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('../../services/cacheService', () => ({
  __esModule: true,
  redis: { status: 'end', quit: jest.fn() },
  redlock: { acquire: jest.fn() },
}));

import { MatchmakingService } from '../../services/matchmaking/matchmakingService';

const FIXED_NOW = 1_000_000_000_000;

// Minimal in-memory Redis (single queue + meta hash) so we can drive real
// multi-player flows instead of stubbing each call.
function makeFakeRedis() {
  const z = new Map<string, number>();
  const meta = new Map<string, string>();
  return {
    _z: z,
    _meta: meta,
    zadd: jest.fn(async (_k: string, score: number, member: string) => {
      z.set(member, score);
      return 1;
    }),
    zrem: jest.fn(async (_k: string, ...members: string[]) => {
      let n = 0;
      for (const m of members) if (z.delete(m)) n++;
      return n;
    }),
    zscore: jest.fn(async (_k: string, member: string) =>
      z.has(member) ? String(z.get(member)) : null
    ),
    zcard: jest.fn(async () => z.size),
    zrangebyscore: jest.fn(async (_k: string, min: number, max: number) => {
      const out: string[] = [];
      for (const [m, s] of z) if (s >= min && s <= max) out.push(m, String(s));
      return out;
    }),
    hset: jest.fn(async (_k: string, field: string, value: string) => {
      meta.set(field, value);
      return 1;
    }),
    hget: jest.fn(async (_k: string, field: string) =>
      meta.has(field) ? (meta.get(field) as string) : null
    ),
    hdel: jest.fn(async (_k: string, ...fields: string[]) => {
      let n = 0;
      for (const f of fields) if (meta.delete(f)) n++;
      return n;
    }),
  };
}

type Deps = ConstructorParameters<typeof MatchmakingService>[0];

function build(
  overrides: {
    ratings?: Record<string, number>;
    acquire?: jest.Mock;
  } = {}
) {
  const redis = makeFakeRedis();
  const release = jest.fn(async () => undefined);
  const acquire = overrides.acquire ?? jest.fn(async () => ({ release }));
  const redlock = { acquire };
  const createBattle = jest.fn(async () => ({
    battleId: 'b1',
    slug: 'ranked-b1',
  }));
  const getRating = jest.fn(
    async (userId: string) => overrides.ratings?.[userId] ?? 1200
  );
  const notify = jest.fn();
  const service = new MatchmakingService({
    redis,
    redlock,
    createBattle,
    getRating,
    notify,
    now: () => FIXED_NOW,
  } as unknown as Deps);
  return {
    service,
    redis,
    redlock,
    acquire,
    release,
    createBattle,
    getRating,
    notify,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('MatchmakingService', () => {
  it('queues a player when no opponent is in range', async () => {
    const t = build({ ratings: { u1: 1500 } });
    const result = await t.service.joinQueue('u1');
    expect(result.matched).toBe(false);
    expect(t.redis._z.get('u1')).toBe(1500); // still queued
    expect(t.createBattle).not.toHaveBeenCalled();
  });

  it('pairs two players in band: removes both, creates a battle, notifies the waiter', async () => {
    const t = build({ ratings: { joiner: 1510 } });
    // a waiter is already queued at 1500
    t.redis._z.set('waiter', 1500);
    t.redis._meta.set('waiter', String(FIXED_NOW));

    const result = await t.service.joinQueue('joiner');

    expect(result.matched).toBe(true);
    expect(result.opponentId).toBe('waiter');
    expect(result.battleId).toBe('b1');
    // both removed from the queue
    expect(t.redis._z.has('joiner')).toBe(false);
    expect(t.redis._z.has('waiter')).toBe(false);
    // battle created with the two players
    expect(t.createBattle).toHaveBeenCalledWith('joiner', 'waiter');
    // the waiting player is notified over their socket
    expect(t.notify).toHaveBeenCalledWith(
      'waiter',
      'matchmaking:matched',
      expect.objectContaining({ battleId: 'b1', opponentId: 'joiner' })
    );
    // lock taken on BOTH players in deterministic (sorted) order
    expect(t.acquire).toHaveBeenCalledWith(
      ['mm:lock:joiner', 'mm:lock:waiter'],
      expect.any(Number),
      expect.objectContaining({ retryCount: 0 })
    );
    expect(t.release).toHaveBeenCalled();
  });

  it('picks the nearest-rated opponent among several candidates', async () => {
    const t = build({ ratings: { joiner: 1500 } });
    t.redis._z.set('far', 1450);
    t.redis._meta.set('far', String(FIXED_NOW));
    t.redis._z.set('near', 1505);
    t.redis._meta.set('near', String(FIXED_NOW));

    const result = await t.service.joinQueue('joiner');
    expect(result.opponentId).toBe('near');
  });

  it('does NOT double-book: if the opponent vanishes after the lock, no match', async () => {
    const release = jest.fn(async () => undefined);
    // Simulate another matcher grabbing the waiter the instant we lock.
    const acquire = jest.fn(async () => {
      t.redis._z.delete('waiter');
      t.redis._meta.delete('waiter');
      return { release };
    }) as unknown as jest.Mock;
    const t = build({ ratings: { joiner: 1500 }, acquire });
    t.redis._z.set('waiter', 1500);
    t.redis._meta.set('waiter', String(FIXED_NOW));

    const result = await t.service.joinQueue('joiner');
    expect(result.matched).toBe(false);
    expect(t.createBattle).not.toHaveBeenCalled();
    expect(release).toHaveBeenCalled(); // lock still released
  });

  it('returns no match (does not throw) when the pair lock is contended', async () => {
    const acquire = jest.fn(async () => {
      throw new Error('LockError');
    }) as unknown as jest.Mock;
    const t = build({ ratings: { joiner: 1500 }, acquire });
    t.redis._z.set('waiter', 1500);
    t.redis._meta.set('waiter', String(FIXED_NOW));

    const result = await t.service.joinQueue('joiner');
    expect(result.matched).toBe(false);
    expect(t.createBattle).not.toHaveBeenCalled();
  });

  it('widens the band the longer a player has waited', async () => {
    const t = build();
    // joiner@1500 enqueued 20s ago → band = 100 + 20*20 = 500 → reaches 1700
    t.redis._z.set('joiner', 1500);
    t.redis._meta.set('joiner', String(FIXED_NOW - 20_000));
    t.redis._z.set('far', 1700);
    t.redis._meta.set('far', String(FIXED_NOW));

    const result = await t.service.tryMatch('joiner');
    expect(result.matched).toBe(true);
    expect(result.opponentId).toBe('far');
  });

  it('does not match a far opponent for a fresh joiner (narrow band)', async () => {
    const t = build({ ratings: { joiner: 1500 } });
    t.redis._z.set('far', 1700);
    t.redis._meta.set('far', String(FIXED_NOW));

    const result = await t.service.joinQueue('joiner');
    expect(result.matched).toBe(false);
  });

  it('leaveQueue removes the player and their metadata', async () => {
    const t = build();
    t.redis._z.set('u1', 1400);
    t.redis._meta.set('u1', String(FIXED_NOW));
    await t.service.leaveQueue('u1');
    expect(t.redis._z.has('u1')).toBe(false);
    expect(t.redis._meta.has('u1')).toBe(false);
  });

  it('getStatus reports queue membership and size', async () => {
    const t = build();
    t.redis._z.set('u1', 1400);
    t.redis._z.set('u2', 1600);
    const status = await t.service.getStatus('u1');
    expect(status).toEqual({ inQueue: true, queueSize: 2, rating: 1400 });
  });
});
