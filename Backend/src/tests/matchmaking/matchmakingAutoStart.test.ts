// MATCHMAKING_AUTO_START: a match readies and arms the battle once; off by default; never breaks the match.
import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';

jest.mock('../../services/cacheService', () => ({
  __esModule: true,
  redis: { status: 'end', quit: jest.fn() },
  redlock: { acquire: jest.fn() },
}));

import { MatchmakingService } from '../../services/matchmaking/matchmakingService';

type Deps = ConstructorParameters<typeof MatchmakingService>[0];
const NOW = 1_000_000_000_000;

function fakeRedis() {
  const z = new Map<string, number>();
  const h = new Map<string, string>();
  return {
    z,
    h,
    zadd: async (_k: string, s: number, m: string) => (z.set(m, s), 1),
    zrem: async (_k: string, ...ms: string[]) =>
      ms.filter((m) => z.delete(m)).length,
    zscore: async (_k: string, m: string) =>
      z.has(m) ? String(z.get(m)) : null,
    zcard: async () => z.size,
    zrangebyscore: async (_k: string, min: number, max: number) =>
      [...z].flatMap(([m, s]) => (s >= min && s <= max ? [m, String(s)] : [])),
    hset: async (_k: string, f: string, v: string) => (h.set(f, v), 1),
    hget: async (_k: string, f: string) => h.get(f) ?? null,
    hdel: async (_k: string, ...fs: string[]) =>
      fs.filter((f) => h.delete(f)).length,
  };
}

/** Redlock that refuses a resource already held, like the real one with retryCount 0. */
function fakeRedlock() {
  const held = new Set<string>();
  return {
    acquire: async (keys: string[]) => {
      if (keys.some((k) => held.has(k))) throw new Error('ResourceLocked');
      keys.forEach((k) => held.add(k));
      await Promise.resolve();
      return { release: async () => keys.forEach((k) => held.delete(k)) };
    },
  };
}

function build(autoStart: (id: string) => Promise<boolean> = async () => true) {
  const redis = fakeRedis();
  const order: string[] = [];
  let n = 0;
  const createBattle = jest.fn(async () => ({
    battleId: `b${++n}`,
    slug: `ranked-b${n}`,
  }));
  const notify = jest.fn(() => order.push('notify'));
  const tracked = jest.fn(async (id: string) => {
    order.push('autoStart');
    return autoStart(id);
  });
  const service = new MatchmakingService({
    redis,
    redlock: fakeRedlock(),
    createBattle,
    getRating: async () => 1200,
    notify,
    autoStart: tracked,
    now: () => NOW,
  } as unknown as Deps);
  return { service, redis, createBattle, notify, autoStart: tracked, order };
}

function queue(t: ReturnType<typeof build>, userId: string) {
  t.redis.z.set(userId, 1200);
  t.redis.h.set(userId, String(NOW));
}

beforeEach(() => {
  delete process.env.MATCHMAKING_AUTO_START;
});
afterEach(() => {
  delete process.env.MATCHMAKING_AUTO_START;
});

describe('MATCHMAKING_AUTO_START off (default)', () => {
  it.each([undefined, '', 'false', '0', 'no'])(
    '%p: a match leaves the battle in the manual lobby flow',
    async (value) => {
      if (value !== undefined) process.env.MATCHMAKING_AUTO_START = value;
      const t = build();
      queue(t, 'waiter');
      const result = await t.service.joinQueue('joiner');
      expect(result).toMatchObject({ matched: true, battleId: 'b1' });
      expect(t.autoStart).not.toHaveBeenCalled();
      expect(t.notify).toHaveBeenCalledTimes(1);
    }
  );
});

describe('MATCHMAKING_AUTO_START on', () => {
  beforeEach(() => {
    process.env.MATCHMAKING_AUTO_START = '1';
  });

  it('auto-starts the new battle once, before the waiter is told', async () => {
    const t = build();
    queue(t, 'waiter');
    const result = await t.service.joinQueue('joiner');
    expect(result).toMatchObject({ matched: true, battleId: 'b1' });
    expect(t.autoStart).toHaveBeenCalledTimes(1);
    expect(t.autoStart).toHaveBeenCalledWith('b1');
    expect(t.order).toEqual(['autoStart', 'notify']);
  });

  it('no match, no auto-start', async () => {
    const t = build();
    const result = await t.service.joinQueue('alone');
    expect(result.matched).toBe(false);
    expect(t.autoStart).not.toHaveBeenCalled();
  });

  it('a failing or refused auto-start still returns and announces the match', async () => {
    for (const impl of [
      async () => {
        throw new Error('db down');
      },
      async () => false,
    ]) {
      const t = build(jest.fn(impl));
      queue(t, 'waiter');
      const result = await t.service.joinQueue('joiner');
      expect(result).toMatchObject({ matched: true, battleId: 'b1' });
      expect(t.notify).toHaveBeenCalledTimes(1);
    }
  });

  it('two joiners racing for one waiter produce one battle and one auto-start', async () => {
    const t = build();
    queue(t, 'waiter');
    const results = await Promise.all([
      t.service.joinQueue('j1'),
      t.service.joinQueue('j2'),
    ]);
    const battles = results.filter(
      (r) => r.matched && r.opponentId === 'waiter'
    );
    expect(battles).toHaveLength(1);
    expect(t.autoStart).toHaveBeenCalledTimes(t.createBattle.mock.calls.length);
    expect(new Set(t.autoStart.mock.calls.map((c) => c[0])).size).toBe(
      t.autoStart.mock.calls.length
    );
  });
});
