// A new user's first socket used to be refused (no row until a REST call landed, and the
// client never retried). The handshake now syncs via REST's syncUser, which survives #23-15.
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { NextFunction, Request, Response } from 'express';
import type { Socket } from 'socket.io';

interface Row {
  id: string;
  supabase_id: string;
  email: string;
  username: string;
  status: string;
  is_active: boolean;
  avatar_url: string;
  first_name: string;
  last_name: string;
}

const db = {
  rows: [] as Row[],
  /** When > 0, the first N supabase_id misses wait until N have arrived. */
  holdMisses: 0,
  waiting: [] as (() => void)[],
  createCalls: 0,
  /** Inserts forced to clash on username, as if another account held it. */
  takenUsernames: 0,
  down: false,
};

const p2002 = () => Object.assign(new Error('Unique'), { code: 'P2002' });

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    role: { findUnique: async () => ({ id: 'role-student' }) },
    user: {
      findUnique: async ({ where }: { where: { supabase_id: string } }) => {
        if (db.down) throw new Error('db down');
        const row = db.rows.find((r) => r.supabase_id === where.supabase_id);
        if (!row && db.holdMisses > 0) {
          // Every racer misses before any inserts: the worst interleaving.
          await new Promise<void>((resolve) => {
            db.waiting.push(resolve);
            if (db.waiting.length >= db.holdMisses) {
              db.holdMisses = 0;
              db.waiting.splice(0).forEach((r) => r());
            }
          });
        }
        return row ? { ...row, role: null, subscription: null } : null;
      },
      create: async ({ data }: { data: Omit<Row, 'id'> }) => {
        db.createCalls++;
        await Promise.resolve();
        if (db.takenUsernames > 0) {
          db.takenUsernames--;
          throw p2002();
        }
        if (
          db.rows.some(
            (r) =>
              r.supabase_id === data.supabase_id ||
              r.email === data.email ||
              r.username === data.username
          )
        ) {
          throw p2002();
        }
        const row = { ...data, id: `u${db.rows.length + 1}` } as Row;
        db.rows.push(row);
        return { ...row, role: null, subscription: null };
      },
    },
  },
}));

const verify = jest.fn(async (token: string) => {
  if (token === 'bad') {
    throw Object.assign(new Error('bad'), { statusCode: 401 });
  }
  return {
    id: `sb-${token}`,
    email: `${token}@example.test`,
    user_metadata: { first_name: 'New', last_name: 'Player' },
  };
});
jest.mock('../../utils/verifySupabaseToken', () => ({
  verifySupabaseToken: (t: string) => verify(t),
}));
jest.mock('../../services/cacheService', () => ({
  __esModule: true,
  redis: {
    exists: async () => 0,
    get: async () => null,
    setex: async () => 'OK',
    del: async () => 1,
  },
}));

import { authenticateSocket } from '../../services/realtime/socketHandshake';
import { authMiddleware } from '../../middlewares/authMiddleware';

type Refusal = Error & { data?: { code: string; retryable: boolean } };

const handshake = async (token?: string) => {
  const socket = {
    handshake: { auth: token ? { token } : {}, query: {} },
    data: {} as { user?: { id: string } },
  };
  let err: Refusal | undefined;
  await authenticateSocket(socket as unknown as Socket, (e) => {
    err = e as Refusal | undefined;
  });
  return { err, user: socket.data.user };
};

const rest = async (token: string) => {
  const req = { headers: { authorization: `Bearer ${token}` } } as Request;
  let err: unknown;
  await authMiddleware(
    req,
    {} as Response,
    ((e?: unknown) => {
      err = e;
    }) as NextFunction
  );
  return { err, user: req.user };
};

beforeEach(() => {
  db.rows = [];
  db.holdMisses = 0;
  db.waiting = [];
  db.createCalls = 0;
  db.takenUsernames = 0;
  db.down = false;
});

describe('socket handshake for a user with no row yet', () => {
  it('creates the row and connects, with no REST call first', async () => {
    const out = await handshake('fresh');
    expect(out.err).toBeUndefined();
    expect(db.rows).toHaveLength(1);
    expect(db.rows[0].supabase_id).toBe('sb-fresh');
    expect(out.user?.id).toBe(db.rows[0].id);
  });

  it('reuses the existing row on a later connect', async () => {
    await handshake('again');
    const second = await handshake('again');
    expect(second.err).toBeUndefined();
    expect(db.rows).toHaveLength(1);
    expect(db.createCalls).toBe(1);
  });
});

describe('first-login race (#23-15)', () => {
  it('REST and the socket racing on a new user both succeed with one row', async () => {
    db.holdMisses = 2;
    const [r, s] = await Promise.all([rest('racer'), handshake('racer')]);
    expect(db.createCalls).toBe(2); // both really tried to insert
    expect(db.rows).toHaveLength(1);
    expect(r.err).toBeUndefined();
    expect(s.err).toBeUndefined();
    expect(s.user?.id).toBe(db.rows[0].id);
    expect(r.user?.id).toBe(db.rows[0].id);
  });

  it('five concurrent first requests produce one row and no failures', async () => {
    db.holdMisses = 5;
    const results = await Promise.all([
      rest('crowd'),
      rest('crowd'),
      handshake('crowd'),
      rest('crowd'),
      handshake('crowd'),
    ]);
    expect(db.createCalls).toBe(5);
    expect(db.rows).toHaveLength(1);
    for (const r of results) expect(r.err).toBeUndefined();
    expect(new Set(results.map((r) => r.user?.id))).toEqual(
      new Set([db.rows[0].id])
    );
  });

  it('a username clash is retried with a fresh suffix', async () => {
    db.takenUsernames = 2;
    const out = await handshake('clash');
    expect(out.err).toBeUndefined();
    expect(db.rows).toHaveLength(1);
    expect(db.createCalls).toBe(3);
  });

  it('gives up after three clashes with a retryable refusal', async () => {
    db.takenUsernames = 3;
    const out = await handshake('unlucky');
    expect(db.rows).toHaveLength(0);
    expect(out.err?.data).toEqual({
      code: 'AUTH_UNAVAILABLE',
      retryable: true,
    });
  });
});

describe('handshake refusals tell the client whether to retry', () => {
  it('missing token: retryable', async () => {
    const out = await handshake();
    expect(out.err?.data).toEqual({
      code: 'AUTH_TOKEN_MISSING',
      retryable: true,
    });
  });

  it('invalid token: retryable (the client refreshes its session first)', async () => {
    const out = await handshake('bad');
    expect(out.err?.data).toEqual({
      code: 'AUTH_TOKEN_INVALID',
      retryable: true,
    });
    expect(db.createCalls).toBe(0);
  });

  it('database unavailable: retryable', async () => {
    db.down = true;
    const out = await handshake('later');
    expect(out.err?.data).toEqual({
      code: 'AUTH_UNAVAILABLE',
      retryable: true,
    });
  });

  it('suspended account: not retryable', async () => {
    await handshake('banned');
    db.rows[0].status = 'suspended';
    const out = await handshake('banned');
    expect(out.err?.data).toEqual({
      code: 'ACCOUNT_SUSPENDED',
      retryable: false,
    });
    expect(out.user).toBeUndefined();
  });
});
