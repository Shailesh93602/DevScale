import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import type { PrismaClient } from '@prisma/client';

import { runBattleSeeder } from '../../scripts/battle-seeder.js';

/**
 * The seeder path, with the database mocked.
 *
 * `npm run seed:battles` deletes every battle row before it writes, and
 * Frontend/tests/global-setup.ts runs it before every default Playwright run
 * with Backend/.env — the shared Supabase project — as the ambient config. So
 * what this file proves is ORDER: the guard runs first, refuses anything that
 * is not a local throwaway, and on refusal no write and (for a remote URL) no
 * query has happened. The accepting case proves the guard is not simply
 * refusing everything.
 */

const SUPABASE_URL =
  'postgresql://u:p@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const LOCAL_THROWAWAY_URL = 'postgresql://me@localhost:5434/eduscale_test';

type MockDelegate = Record<string, jest.Mock>;

interface MockClient {
  $queryRaw: jest.Mock;
  battleAnswer: MockDelegate;
  battleQuestion: MockDelegate;
  battleLeaderboard: MockDelegate;
  battleParticipant: MockDelegate;
  battle: MockDelegate;
  user: MockDelegate;
  topic: MockDelegate;
  subject: MockDelegate;
  mainConcept: MockDelegate;
  roadmap: MockDelegate;
}

/** A client whose live connection reports `connectedDb` from current_database(). */
function mockClient(connectedDb: string): MockClient {
  let nextId = 1;
  const resolved = () => jest.fn(async () => ({ count: 0 }));
  return {
    $queryRaw: jest.fn(async () => [{ db: connectedDb }]),
    battleAnswer: { deleteMany: resolved() },
    battleQuestion: { deleteMany: resolved(), createMany: resolved() },
    battleLeaderboard: { deleteMany: resolved() },
    battleParticipant: { deleteMany: resolved() },
    battle: {
      deleteMany: resolved(),
      create: jest.fn(async (args: unknown) => {
        const { data } = args as { data: { title: string } };
        return { id: `battle-${nextId++}`, title: data.title };
      }),
      update: resolved(),
    },
    user: {
      findFirst: jest.fn(async () => ({ id: 'user-1', username: 'seeder' })),
    },
    topic: { findFirst: jest.fn(async () => null) },
    subject: { findFirst: jest.fn(async () => null) },
    mainConcept: { findFirst: jest.fn(async () => null) },
    roadmap: { findFirst: jest.fn(async () => null) },
  };
}

/** Every call that would change a row, across all delegates. */
function writeCount(client: MockClient): number {
  const writes = [
    client.battleAnswer.deleteMany,
    client.battleQuestion.deleteMany,
    client.battleQuestion.createMany,
    client.battleLeaderboard.deleteMany,
    client.battleParticipant.deleteMany,
    client.battle.deleteMany,
    client.battle.create,
    client.battle.update,
  ];
  return writes.reduce((n, fn) => n + fn.mock.calls.length, 0);
}

const asPrisma = (client: MockClient) => client as unknown as PrismaClient;

describe('seed:battles — the local-only guard is in front of every write', () => {
  let log: ReturnType<typeof jest.spyOn>;
  const savedOverride = process.env.ALLOW_REMOTE_SEED;

  beforeEach(() => {
    log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    delete process.env.ALLOW_REMOTE_SEED;
  });

  afterEach(() => {
    log.mockRestore();
    if (savedOverride === undefined) delete process.env.ALLOW_REMOTE_SEED;
    else process.env.ALLOW_REMOTE_SEED = savedOverride;
  });

  // THE TEST THIS FILE EXISTS FOR.
  it('refuses the Supabase pooler URL before touching the connection', async () => {
    const client = mockClient('postgres');

    await expect(
      runBattleSeeder(asPrisma(client), SUPABASE_URL)
    ).rejects.toThrow(/REFUSING TO SEED BATTLES[\s\S]*not local/);

    expect(client.$queryRaw).not.toHaveBeenCalled();
    expect(writeCount(client)).toBe(0);
  });

  it('refuses a local host whose database is not a throwaway', async () => {
    for (const db of ['eduscale', 'postgres']) {
      const client = mockClient(db);

      await expect(
        runBattleSeeder(
          asPrisma(client),
          `postgresql://me@localhost:5432/${db}`
        )
      ).rejects.toThrow(/not an obvious throwaway/);

      expect(client.$queryRaw).not.toHaveBeenCalled();
      expect(writeCount(client)).toBe(0);
    }
  });

  // The case a string check cannot see: the URL passed, but the client opened
  // something else (a .env that won, a pooler, a tunnel to the wrong place).
  it('refuses when the URL is a throwaway but the live connection reports `postgres`', async () => {
    const client = mockClient('postgres');

    await expect(
      runBattleSeeder(asPrisma(client), LOCAL_THROWAWAY_URL)
    ).rejects.toThrow(/connected to database "postgres"/);

    expect(client.$queryRaw).toHaveBeenCalledTimes(1);
    expect(writeCount(client)).toBe(0);
  });

  it('refuses an unset DATABASE_URL rather than letting the client choose', async () => {
    const client = mockClient('eduscale_test');

    await expect(runBattleSeeder(asPrisma(client), undefined)).rejects.toThrow(
      /not set/
    );

    expect(writeCount(client)).toBe(0);
  });

  // The previous guard had this switch. Pin its removal.
  it('ALLOW_REMOTE_SEED=true no longer bypasses the guard', async () => {
    process.env.ALLOW_REMOTE_SEED = 'true';
    const client = mockClient('postgres');

    await expect(
      runBattleSeeder(asPrisma(client), SUPABASE_URL)
    ).rejects.toThrow(/REFUSING TO SEED BATTLES/);

    expect(writeCount(client)).toBe(0);
  });

  it('names the fix in the refusal, so it is actionable from a Playwright log', async () => {
    const client = mockClient('postgres');
    let message = '';
    try {
      await runBattleSeeder(asPrisma(client), SUPABASE_URL);
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).toContain('aws-1-us-east-1.pooler.supabase.com');
    expect(message).toContain('eduscale_test');
    expect(message).toContain('docs/QA_COVERAGE.md');
  });

  it('seeds five battles once URL and connection both name a local throwaway', async () => {
    const client = mockClient('eduscale_test');

    const result = await runBattleSeeder(asPrisma(client), LOCAL_THROWAWAY_URL);

    expect(client.$queryRaw).toHaveBeenCalledTimes(1);
    expect(result.created).toBe(5);
    expect(result.battles.map((b) => b.source_type)).toEqual([
      'topic',
      'subject',
      'main_concept',
      'roadmap',
      'none',
    ]);

    // The guard ran before the first delete, and the delete before the first create.
    const guardOrder = client.$queryRaw.mock.invocationCallOrder[0];
    const deleteOrder = client.battle.deleteMany.mock.invocationCallOrder[0];
    const createOrder = client.battle.create.mock.invocationCallOrder[0];
    expect(guardOrder).toBeLessThan(deleteOrder);
    expect(deleteOrder).toBeLessThan(createOrder);

    expect(client.battle.deleteMany).toHaveBeenCalledTimes(1);
    expect(client.battle.create).toHaveBeenCalledTimes(5);
    expect(client.battleQuestion.createMany).toHaveBeenCalledTimes(5);
    for (const call of client.battleQuestion.createMany.mock.calls) {
      const { data } = call[0] as { data: unknown[] };
      expect(data).toHaveLength(5);
    }

    // The manual battle carries no pool source; the others name theirs.
    const created = client.battle.create.mock.calls.map(
      (call) => (call[0] as { data: Record<string, unknown> }).data
    );
    expect(created[0].question_source_type).toBe('topic');
    expect(created[4].question_source_type).toBeNull();
    expect(created[4].question_source_id).toBeNull();
  });
});
