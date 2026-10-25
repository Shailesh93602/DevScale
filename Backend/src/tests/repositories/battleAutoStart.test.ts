// Auto-start for matched battles: WAITING/LOBBY only, both seats READY, start needs two players.
import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';

type Row = Record<string, unknown>;
type Where = Record<string, unknown>;
const db = {
  battles: new Map<string, Row>(),
  participants: [] as Row[],
};

function matches(row: Row, where: Where): boolean {
  return Object.entries(where).every(([k, cond]) => {
    const v = row[k];
    if (cond && typeof cond === 'object') {
      const c = cond as { in?: unknown[]; not?: unknown; gte?: number };
      if (c.in) return c.in.includes(v);
      if ('not' in c) return v !== c.not;
      if (c.gte !== undefined) return (v as number) >= c.gte;
    }
    return v === cond;
  });
}

function updateMany(rows: () => Row[]) {
  return async ({ where, data }: { where: Where; data: Row }) => {
    const hit = rows().filter((r) => matches(r, where));
    hit.forEach((r) => Object.assign(r, data));
    return { count: hit.length };
  };
}

const fakePrisma = {
  battle: {
    updateMany: updateMany(() => [...db.battles.values()]),
    count: async ({ where }: { where: Where }) =>
      [...db.battles.values()].filter((r) => matches(r, where)).length,
  },
  battleParticipant: { updateMany: updateMany(() => db.participants) },
  battleQuestion: { findMany: async () => [] },
};

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    ...fakePrisma,
    $transaction: (fn: (t: typeof fakePrisma) => unknown) => fn(fakePrisma),
  },
}));
jest.mock('../../repositories/battle/lock', () => ({
  resolveBattleId: async (id: string) => id,
  withBattleLock: (_id: string, _ttl: number, fn: () => unknown) => fn(),
}));
const emitToRoom = jest.fn();
jest.mock('../../services/socket', () => ({
  __esModule: true,
  default: { emitToRoom: (...a: unknown[]) => emitToRoom(...a) },
}));
jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { autoReadyMatchedBattle } from '../../repositories/battle/lifecycle';
import { battleSocketService } from '../../services/battleSocket';

function seed(status: string, seats = 2) {
  db.battles.set('b1', { id: 'b1', status, current_participants: seats });
  db.participants = ['u1', 'u2']
    .slice(0, seats)
    .map((user_id) => ({ battle_id: 'b1', user_id, status: 'JOINED' }));
}
const statuses = () => db.participants.map((p) => p.status);
const emitted = (name: string) =>
  emitToRoom.mock.calls.filter((c) => c[1] === name);

beforeEach(() => {
  jest.clearAllMocks();
  db.battles.clear();
  db.participants = [];
});

describe('autoReadyMatchedBattle', () => {
  it.each(['WAITING', 'LOBBY'])(
    'from %s: LOBBY with both seats READY',
    async (status) => {
      seed(status);
      await expect(autoReadyMatchedBattle('b1')).resolves.toBe(true);
      expect(db.battles.get('b1')?.status).toBe('LOBBY');
      expect(statuses()).toEqual(['READY', 'READY']);
    }
  );

  it.each(['IN_PROGRESS', 'COMPLETED', 'CANCELLED'])(
    'refuses a %s battle and touches nothing',
    async (status) => {
      seed(status);
      await expect(autoReadyMatchedBattle('b1')).resolves.toBe(false);
      expect(db.battles.get('b1')?.status).toBe(status);
      expect(statuses()).toEqual(['JOINED', 'JOINED']);
    }
  );

  it('refuses a battle with one seat taken', async () => {
    seed('WAITING', 1);
    await expect(autoReadyMatchedBattle('b1')).resolves.toBe(false);
    expect(statuses()).toEqual(['JOINED']);
  });

  it('is safe to repeat', async () => {
    seed('WAITING');
    await Promise.all([
      autoReadyMatchedBattle('b1'),
      autoReadyMatchedBattle('b1'),
    ]);
    expect(db.battles.get('b1')?.status).toBe('LOBBY');
    expect(statuses()).toEqual(['READY', 'READY']);
  });
});

describe('scheduleAutoStart', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    battleSocketService.cleanup('b1');
    jest.useRealTimers();
  });

  it('announces the lobby, then starts once the countdown ends', async () => {
    seed('WAITING');
    await autoReadyMatchedBattle('b1');
    battleSocketService.scheduleAutoStart('b1', Date.now() + 10_000);
    expect(emitted('battle:status_changed')[0][2]).toEqual({ status: 'LOBBY' });
    await jest.advanceTimersByTimeAsync(9_000);
    expect(db.battles.get('b1')?.status).toBe('LOBBY');
    await jest.advanceTimersByTimeAsync(1_000);
    expect(db.battles.get('b1')?.status).toBe('IN_PROGRESS');
    expect(statuses()).toEqual(['PLAYING', 'PLAYING']);
    expect(emitted('battle:started')).toHaveLength(1);
  });

  it('does not start if a player left during the countdown', async () => {
    seed('WAITING');
    await autoReadyMatchedBattle('b1');
    battleSocketService.scheduleAutoStart('b1', Date.now() + 10_000);
    db.battles.get('b1')!.current_participants = 1;
    await jest.advanceTimersByTimeAsync(11_000);
    expect(db.battles.get('b1')?.status).toBe('LOBBY');
    expect(emitted('battle:started')).toHaveLength(0);
  });

  it('does not start a battle cancelled during the countdown', async () => {
    seed('WAITING');
    await autoReadyMatchedBattle('b1');
    battleSocketService.scheduleAutoStart('b1', Date.now() + 10_000);
    db.battles.get('b1')!.status = 'CANCELLED';
    await jest.advanceTimersByTimeAsync(11_000);
    expect(db.battles.get('b1')?.status).toBe('CANCELLED');
    expect(emitted('battle:started')).toHaveLength(0);
  });

  it('a manual start during the countdown wins once; the countdown stands down', async () => {
    seed('WAITING');
    await autoReadyMatchedBattle('b1');
    battleSocketService.scheduleAutoStart('b1', Date.now() + 10_000);
    db.battles.get('b1')!.status = 'IN_PROGRESS'; // repo.startBattle's CAS won
    await battleSocketService.startBattle('b1');
    await jest.advanceTimersByTimeAsync(11_000);
    expect(emitted('battle:started')).toHaveLength(1);
  });
});
