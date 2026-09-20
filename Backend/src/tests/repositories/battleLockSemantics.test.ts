/**
 * What the distributed lock around the battle state machine actually promises.
 *
 * The public claim this suite exists to keep true is:
 *
 *   "redlock acquires a distributed lock … around the battle start,
 *    submit-answer and complete handlers, so two instances can't both drive
 *    the same transition."
 *
 * Three separate things had to be asserted before that sentence was true, and
 * each one is a test below.
 *
 * 1. THE GUARD HAS TO BE INSIDE THE LOCK. `startBattle` read the battle,
 *    checked `status !== 'LOBBY'`, checked participants and questions, and
 *    THEN took the lock around nothing but `prisma.battle.update`. That is a
 *    read-then-write with the lock around only the write: two callers both read
 *    LOBBY, both pass every guard, then queue politely for the lock and both
 *    perform the transition. The lock made the double-start orderly, not
 *    impossible.
 *
 * 2. SERIALIZING IS NOT DEDUPLICATING. `completeBattle` took the lock and then
 *    unconditionally wrote COMPLETED, a fresh `ended_at` and the whole final
 *    leaderboard — with no check that it had already run. `endBattle` calls it
 *    and then applies Elo, and `applyBattleResult` is built on
 *    `games_played: { increment: 1 }`. Two calls therefore did not just repeat
 *    work, they corrupted every player's record.
 *
 * 3. A LOST RACE AND A DEAD DEPENDENCY ARE NOT THE SAME EVENT. Redlock reports
 *    both as `ExecutionError`, and the handler answered 409 to both. With Redis
 *    unreachable — which is what `/api/v1/health` reports in production today —
 *    every start and every answer submission was rejected with "Another action
 *    on this battle is already in progress — try again", an error that names a
 *    cause that does not exist and invites a retry that cannot work. The two
 *    cases are distinguishable: a lost race votes against with
 *    `ResourceLockedError`, a dead Redis votes against with a connection error.
 *    (Verified against redlock 5.0.0-beta.2 with a live server and a dead port.)
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ─── Fakes ────────────────────────────────────────────────────────────────

/** Records the order of operations so "inside the lock" is observable. */
const trace: string[] = [];

const mockAcquire = jest.fn();
const mockRelease = jest.fn(async () => undefined);

const db = {
  battle: {
    findUnique: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  battleParticipant: { findMany: jest.fn(), update: jest.fn() },
  battleLeaderboard: { upsert: jest.fn(), findMany: jest.fn() },
  battleAnswer: { findMany: jest.fn() },
};

jest.mock('../../lib/prisma', () => ({ __esModule: true, default: db }));

jest.mock('../../services/cacheService', () => ({
  __esModule: true,
  redis: { status: 'end', quit: jest.fn(), on: jest.fn() },
  redlock: {
    acquire: (...args: unknown[]) => mockAcquire(...args),
  },
}));

jest.mock('../../services/memoryCache', () => ({
  __esModule: true,
  getCached: () => null,
  setCached: () => undefined,
  invalidatePattern: () => undefined,
}));

import { BattleRepository } from '../../repositories/battleRepository';
import {
  BATTLE_SUBMIT_LOCK_TTL_MS,
  BATTLE_TX_MAX_WAIT_MS,
  BATTLE_TX_TIMEOUT_MS,
} from '../../utils/deadlines';

const BATTLE_ID = '11111111-1111-4111-8111-111111111111';
const OWNER = 'owner-user-id';

/**
 * An `ExecutionError` shaped the way redlock 5 really shapes one: `attempts` is
 * an array of promises of `ExecutionStats`, and the reason each client refused
 * lives in the `votesAgainst` Map.
 */
function executionError(reason: Error) {
  const err = new Error(
    'The operation was unable to achieve a quorum during its retry window.'
  ) as Error & { attempts: Promise<unknown>[] };
  err.name = 'ExecutionError';
  err.attempts = [
    Promise.resolve({
      membershipSize: 1,
      quorumSize: 1,
      votesFor: new Set(),
      votesAgainst: new Map([['client', reason]]),
    }),
  ];
  return err;
}

function resourceLocked() {
  const e = new Error(
    'The operation was applied to: 0 of the 1 requested resources.'
  );
  e.name = 'ResourceLockedError';
  return e;
}

function lobbyBattle(overrides: Record<string, unknown> = {}) {
  return {
    id: BATTLE_ID,
    user_id: OWNER,
    status: 'LOBBY',
    current_participants: 2,
    total_questions: 2,
    participants: [{ status: 'READY' }, { status: 'READY' }],
    _count: { questions: 2 },
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  trace.length = 0;
  mockAcquire.mockImplementation(async () => {
    trace.push('lock:acquire');
    return {
      release: async () => {
        trace.push('lock:release');
        return mockRelease();
      },
    };
  });
  db.battle.findUnique.mockImplementation(async () => {
    trace.push('db:battle.findUnique');
    return lobbyBattle();
  });
  db.battle.findUniqueOrThrow.mockImplementation(async () => lobbyBattle());
  db.battle.updateMany.mockImplementation(async () => {
    trace.push('db:battle.updateMany');
    return { count: 1 };
  });
  db.battle.update.mockImplementation(async () => {
    trace.push('db:battle.update');
    return lobbyBattle({ status: 'IN_PROGRESS' });
  });
  db.battleParticipant.findMany.mockResolvedValue([] as never);
  db.battleAnswer.findMany.mockResolvedValue([] as never);
  db.battleLeaderboard.upsert.mockResolvedValue({} as never);
});

const repo = () => new BattleRepository();

// ─── 1. startBattle: the guard must be inside the lock ────────────────────

describe('startBattle — the transition is decided under the lock', () => {
  it('reads the battle only AFTER the lock is held', async () => {
    await repo().startBattle(BATTLE_ID, OWNER);

    const acquiredAt = trace.indexOf('lock:acquire');
    const readAt = trace.indexOf('db:battle.findUnique');

    expect(acquiredAt).toBeGreaterThanOrEqual(0);
    expect(readAt).toBeGreaterThan(acquiredAt);
  });

  it('writes conditionally, so a battle that left LOBBY cannot be restarted', async () => {
    // The compare-and-set loses: some other actor already moved it on.
    db.battle.updateMany.mockImplementation(async () => {
      trace.push('db:battle.updateMany');
      return { count: 0 };
    });

    await expect(repo().startBattle(BATTLE_ID, OWNER)).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it('never uses an unconditional update for the transition', async () => {
    await repo().startBattle(BATTLE_ID, OWNER);

    // An unconditional `update` would overwrite the status whatever it is —
    // including flipping a COMPLETED battle back to IN_PROGRESS.
    expect(db.battle.update).not.toHaveBeenCalled();
    expect(db.battle.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'LOBBY' }),
      })
    );
  });
});

// ─── 2. completeBattle: serializing is not deduplicating ──────────────────

describe('completeBattle — running twice must not write twice', () => {
  it('does nothing and reports alreadyCompleted when the battle is COMPLETED', async () => {
    db.battle.findUnique.mockImplementation(async () =>
      lobbyBattle({ status: 'COMPLETED', winner_id: 'someone' })
    );

    const result = (await repo().completeBattle(BATTLE_ID)) as {
      alreadyCompleted?: boolean;
    };

    expect(result.alreadyCompleted).toBe(true);
    expect(db.battle.update).not.toHaveBeenCalled();
    expect(db.battle.updateMany).not.toHaveBeenCalled();
    expect(db.battleLeaderboard.upsert).not.toHaveBeenCalled();
  });

  it('performs the transition once when the battle is still running', async () => {
    db.battle.findUnique.mockImplementation(async () =>
      lobbyBattle({ status: 'IN_PROGRESS' })
    );
    db.battleParticipant.findMany.mockResolvedValue([
      {
        user_id: 'a',
        score: 10,
        correct_count: 1,
        wrong_count: 0,
        avg_time_per_answer_ms: 100,
        user: { username: 'a', avatar_url: null },
      },
    ] as never);

    const result = (await repo().completeBattle(BATTLE_ID)) as {
      alreadyCompleted?: boolean;
    };

    expect(result.alreadyCompleted).toBe(false);
    expect(db.battle.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: BATTLE_ID }),
      })
    );
  });
});

// ─── 3. A dead Redis is not a lost race ───────────────────────────────────

describe('withBattleLock — the error names the cause it really had', () => {
  it('answers 409 when the lock is genuinely held by someone else', async () => {
    mockAcquire.mockImplementation(async () => {
      throw executionError(resourceLocked());
    });

    await expect(repo().startBattle(BATTLE_ID, OWNER)).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it('answers 503 when Redis is unreachable, and does not blame a rival', async () => {
    mockAcquire.mockImplementation(async () => {
      throw executionError(new Error('Connection is closed.'));
    });

    const err = (await repo()
      .startBattle(BATTLE_ID, OWNER)
      .catch((e: Error) => e)) as Error & { statusCode?: number };

    expect(err.statusCode).toBe(503);
    // The old message invited a retry that could never succeed.
    expect(err.message).not.toMatch(/already in progress/i);
  });
});

// ─── 4. The lock must outlive the work it protects ────────────────────────

describe('the lock is released on every path', () => {
  it('releases when the guarded work throws', async () => {
    db.battle.updateMany.mockImplementation(async () => {
      throw new Error('database exploded');
    });

    await expect(repo().startBattle(BATTLE_ID, OWNER)).rejects.toThrow(
      'database exploded'
    );
    expect(trace).toContain('lock:release');
  });
});

describe('the lock TTL outlives the transaction it guards', () => {
  /**
   * `submitAnswer` held a 15 000 ms lock around a Prisma interactive
   * transaction whose own timeout was also 15 000 ms — and Prisma counts
   * `maxWait` (waiting for a pool connection) SEPARATELY from `timeout`. So the
   * transaction was permitted to still be writing after the lock had gone, and
   * `redlock.acquire()` does not auto-extend: `automaticExtensionThreshold` is
   * only consulted by `redlock.using()`, which this codebase never calls.
   *
   * Asserted as an inequality rather than as numbers, so the budget cannot be
   * raised without moving the TTL — the same shape as the breaker/transport
   * assertions in slowDependency.test.ts.
   */
  it('lock TTL strictly exceeds maxWait + transaction timeout', () => {
    expect(BATTLE_TX_MAX_WAIT_MS + BATTLE_TX_TIMEOUT_MS).toBeLessThan(
      BATTLE_SUBMIT_LOCK_TTL_MS
    );
  });

  it('submitAnswer really asks for that TTL, and really sets maxWait', async () => {
    // The inequality above is worth nothing if submitAnswer keeps its own
    // hardcoded numbers, so assert the values that reach redlock and Prisma
    // rather than the constants next to them.
    let txOptions: { maxWait?: number; timeout?: number } | undefined;
    (db as unknown as Record<string, unknown>).$transaction = async (
      fn: (tx: unknown) => Promise<unknown>,
      options?: { maxWait?: number; timeout?: number }
    ) => {
      txOptions = options;
      throw Object.assign(new Error('stop here'), { statusCode: 400 });
    };

    await repo()
      .submitAnswer(BATTLE_ID, 'q1', 'user-1', 0, 10)
      .catch(() => undefined);

    const ttlUsed = mockAcquire.mock.calls[0]?.[1] as number;

    expect(txOptions?.maxWait).toBe(BATTLE_TX_MAX_WAIT_MS);
    expect(txOptions?.timeout).toBe(BATTLE_TX_TIMEOUT_MS);
    expect((txOptions?.maxWait ?? 0) + (txOptions?.timeout ?? 0)).toBeLessThan(
      ttlUsed
    );
  });
});
