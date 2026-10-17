/**
 * eduscale-backend#19-03, #21-03, #21-06, #21-09 — the seed pipeline.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as fs from 'node:fs';
import * as path from 'node:path';

const calls: string[] = [];
let failOn: string | null = null;
const model = (name: string) =>
  new Proxy(
    {},
    {
      get: (_t, method: string) => async () => {
        calls.push(`${name}.${method}`);
        if (failOn === `${name}.${method}`) throw new Error('db down');
        return method === 'findMany' ? [] : { id: `${name}-id` };
      },
    }
  );
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(
    () =>
      new Proxy(
        {},
        {
          get: (_t, prop: string) =>
            prop === '$disconnect' ? async () => undefined : model(prop),
        }
      )
  ),
}));

const BACKEND = path.join(__dirname, '../../..');
const SEEDER_DIR = path.join(BACKEND, 'prisma/seeders');
// Non-literal specifiers keep tsc (rootDir: src) from compiling prisma/ files.
const load = (rel: string) => import(path.join(BACKEND, rel));

beforeEach(() => {
  calls.length = 0;
  failOn = null;
});

describe('seeder modules', () => {
  it('import only values @prisma/client actually exports at runtime', () => {
    const actual =
      jest.requireActual<Record<string, unknown>>('@prisma/client');
    const missing: string[] = [];
    for (const file of fs.readdirSync(SEEDER_DIR)) {
      if (!file.endsWith('.ts') || file.endsWith('.d.ts')) continue;
      const src = fs.readFileSync(path.join(SEEDER_DIR, file), 'utf8');
      const match = /import\s+\{([^}]*)\}\s+from\s+'@prisma\/client'/.exec(src);
      if (!match) continue;
      for (const raw of match[1].split(',')) {
        const name = raw.trim();
        if (name && !name.startsWith('type ') && actual[name] === undefined) {
          missing.push(`${file}: ${name}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('does not start seeding on import, and rejects (never exits) on failure', async () => {
    const exit = jest.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit called');
    }) as never);
    const mod = await load('prisma/seeders/role.seeder');
    await new Promise((r) => setImmediate(r));
    expect(calls).toEqual([]);

    await mod.default();
    expect(calls.filter((c) => c === 'role.upsert')).toHaveLength(3);

    failOn = 'role.upsert';
    await expect(mod.default()).rejects.toThrow('db down');
    expect(exit).not.toHaveBeenCalled();
    exit.mockRestore();
  });

  it('seeds only the roadmaps that have content — no placeholder masterclasses', async () => {
    const { roadmaps } = await load('resources/roadmaps/roadmap');
    const mod = await load(
      'prisma/seeders/roadmapMainConceptSubjectTopics.seeder'
    );
    await mod.default();
    expect(calls.filter((c) => c === 'roadmap.upsert')).toHaveLength(
      roadmaps.length
    );
  });
});

describe('runSeeders', () => {
  it('awaits each seeder to completion before loading the next', async () => {
    const { runSeeders } = await load('prisma/seed');
    const order: string[] = [];
    let release!: () => void;
    const first = new Promise<void>((r) => (release = r));
    const done = runSeeders([
      [
        'a',
        async () => ({
          default: async () => {
            order.push('a:start');
            await first;
            order.push('a:end');
          },
        }),
      ],
      ['b', async () => ({ default: async () => void order.push('b') })],
    ]);
    await new Promise((r) => setImmediate(r));
    expect(order).toEqual(['a:start']);
    release();
    await done;
    expect(order).toEqual(['a:start', 'a:end', 'b']);
  });

  it('propagates a seeder failure', async () => {
    const { runSeeders } = await load('prisma/seed');
    await expect(
      runSeeders([
        [
          'x',
          async () => ({
            default: async () => {
              throw new Error('boom');
            },
          }),
        ],
      ])
    ).rejects.toThrow('boom');
  });
});

describe('assertSeedTarget', () => {
  it('refuses a remote or unset DATABASE_URL and allows a local one', async () => {
    const { assertSeedTarget } = await load('prisma/seeders/runSeeder');
    expect(() =>
      assertSeedTarget({
        DATABASE_URL:
          'postgresql://u:p@aws-1.pooler.supabase.com:6543/postgres',
      })
    ).toThrow(/REFUSING TO SEED/);
    expect(() => assertSeedTarget({})).toThrow(/REFUSING TO SEED/);
    expect(() =>
      assertSeedTarget({ DATABASE_URL: 'postgresql://u:p@localhost:5432/x' })
    ).not.toThrow();
    const remoteOnPurpose = {
      DATABASE_URL: 'postgresql://u:p@db.example.com/x',
      SEED_ALLOW_REMOTE: '1',
    };
    expect(() => assertSeedTarget(remoteOnPurpose)).not.toThrow();
    expect(() =>
      assertSeedTarget(remoteOnPurpose, { allowOverride: false })
    ).toThrow(/REFUSING TO SEED/);
  });
});

describe('seeded article HTML (#21-04)', () => {
  it('both content seeders pass article.html through sanitizeRichText', () => {
    for (const file of ['masterRoadmap.seeder.ts', 'singleTopic.seeder.ts']) {
      const src = fs.readFileSync(path.join(SEEDER_DIR, file), 'utf8');
      expect(src).toMatch(
        /sanitizeRichText\((readText|fs\.readFileSync)\(articlePath/
      );
    }
  });

  it('no seeded article carries a raw <script> element', () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (
          entry.name === 'article.html' &&
          /<script/i.test(fs.readFileSync(full, 'utf8'))
        )
          offenders.push(full);
      }
    };
    walk(path.join(__dirname, '../../../resources/roadmapContent'));
    expect(offenders).toEqual([]);
  });
});
