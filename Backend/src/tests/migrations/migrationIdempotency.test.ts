import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { describe, it, expect } from '@jest/globals';

/**
 * Migrations must be safe to run against a database that already holds the
 * objects they create, and a migration production has already applied must
 * never be edited.
 *
 * WHY THIS TEST EXISTS.
 *
 * Migrations run on every production deploy — `Backend/scripts/vercel-build.sh`
 * calls `prisma migrate deploy` when `VERCEL_ENV=production`, and a failure
 * there fails the BUILD, on purpose. That is the right design and it is also
 * the whole blast radius: anything that makes `migrate deploy` refuse to run
 * stops every deploy, not just the one carrying the bad migration.
 *
 * The sibling repo (KhataGO) lost a week of production deploys to exactly this.
 * A migration created six indexes with bare `CREATE INDEX`; three of them
 * already existed in the production database, put there by two migrations that
 * live in production's `_prisma_migrations` table and not in that repository.
 * The first statement raised `42P07 relation ... already exists`, PostgreSQL
 * rolled the whole migration back, Prisma recorded it as failed, and from then
 * on every build died at `migrate deploy` with `P3009` before compiling
 * anything. The site kept serving the last good deploy, so nothing looked
 * broken from outside.
 *
 * It was invisible for two reasons worth repeating here, because both apply to
 * this repo as well:
 *
 *   1. `prisma migrate status` reported the wedged migration as "the last
 *      common migration" and never used the word "failed".
 *   2. The migration had been verified against a local database built by
 *      replaying THAT repository's migrations — which therefore did not have
 *      the pre-existing objects. It passed every check that was run, because
 *      the local database and production disagreed about precisely the thing
 *      the migration asserted.
 *
 * THE STATE OF THIS REPO, MEASURED 2026-09-06 (read-only, against production).
 *
 * EduScale is currently clean, and that is a fact with a date on it rather than
 * a property of the code:
 *
 *   - production's `_prisma_migrations` holds exactly the 15 migrations in this
 *     repo — no extra rows, none with `finished_at IS NULL`, none rolled back;
 *   - all 15 recorded checksums equal the sha256 of the files on disk;
 *   - replaying the chain onto an empty PostgreSQL 17 produces an object set
 *     IDENTICAL to production's `public` schema — 356 indexes, 126 tables,
 *     1001 columns (same types, defaults and nullability), 285 constraints,
 *     with an empty diff in both directions.
 *
 * So there is no drift to trip over today. This test exists because drift is
 * not a permanent property either: two of the 15 migrations
 * (`20260615000000_drop_quizquestion_system_b`, `20260615010000_enums_to_text`)
 * carry `applied_steps_count = 0` with `started_at = finished_at`, which is the
 * signature of `migrate resolve --applied` — their SQL was run out of band and
 * Prisma was told about it afterwards. The effects are in production, so
 * nothing is wrong; but it is direct evidence that DDL reaches this database by
 * routes this repository does not record. That is the precondition KhataGO had.
 *
 * A migration's job is to make the database MATCH the schema afterwards, not to
 * assert what the database did not have beforehand. `IF NOT EXISTS` states the
 * first; a bare `CREATE INDEX` quietly states the second, inside a transaction
 * that takes every other statement down with it. It costs nothing when the
 * object is absent, and it is the difference between a no-op and a week of dead
 * deploys when it is present.
 *
 * WHAT IS ENFORCED, AND WHY THESE SIX.
 *
 * These are the statement kinds this repo's migrations actually use to create
 * things. Four have a native guard, so the fix is two words:
 *
 *   CREATE INDEX / CREATE TABLE / CREATE EXTENSION / ADD COLUMN  →  IF NOT EXISTS
 *
 * Two have no `IF NOT EXISTS` in PostgreSQL at all — `CREATE TYPE` and
 * `ALTER TABLE ... ADD CONSTRAINT`. They are still enforced, because a
 * duplicate raises `42710` and wedges the deploy in exactly the same way, but
 * the accepted spelling is different: either a `DO $$ ... EXCEPTION WHEN
 * duplicate_object ... $$` block, or a matching `DROP ... IF EXISTS` earlier in
 * the same file. `docs/MIGRATIONS.md` has both recipes.
 *
 * `CREATE INDEX CONCURRENTLY` is exempt on purpose: it cannot run inside
 * Prisma's migration transaction at all (`25001`, and that was tried in
 * `20260829170000_audit_indexes` before the file was rewritten), so it is a
 * separate out-of-band conversation rather than something this rule can fix.
 */

const MIGRATIONS_DIR = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'prisma',
  'migrations'
);

export type RuleId =
  | 'CREATE INDEX'
  | 'CREATE TABLE'
  | 'CREATE EXTENSION'
  | 'ADD COLUMN'
  | 'CREATE TYPE'
  | 'ADD CONSTRAINT';

export interface Offender {
  rule: RuleId;
  statement: string;
}

export type RuleCounts = Partial<Record<RuleId, number>>;

/**
 * Unguarded creations per already-applied migration, counted 2026-09-06.
 *
 * This is a RATCHET, not an exemption. Every one of these files has a checksum
 * recorded in production's `_prisma_migrations`; editing one is the P3006
 * failure this file's other test exists to prevent, and their statements have
 * already run successfully, once, everywhere they will ever run. So the numbers
 * record what is there and may only go DOWN. A NEW migration is enforced
 * strictly, because it is not in this map — which is the entire point.
 *
 * Do not add entries. Adding one is a visible, deliberate act in review, and
 * the only honest reason to do it is that production applied a migration this
 * rule should have caught.
 */
const RATCHET = new Map<string, RuleCounts>([
  [
    '20260305131830_baseline',
    {
      'CREATE TYPE': 31,
      'CREATE TABLE': 125,
      'CREATE INDEX': 186,
      'ADD CONSTRAINT': 159,
    },
  ],
  [
    '20260308124944_replace_full_name_with_first_last_name',
    { 'ADD COLUMN': 2 },
  ],
  ['20260309055621_', { 'ADD CONSTRAINT': 1 }],
  [
    '20260328170915_update_subscription_for_stripe',
    {
      'CREATE TYPE': 3,
      'CREATE TABLE': 1,
      'CREATE INDEX': 35,
      'ADD COLUMN': 34,
      'ADD CONSTRAINT': 7,
    },
  ],
  [
    '20260622000000_add_ai_code_review_fields',
    { 'CREATE INDEX': 2, 'ADD COLUMN': 6, 'ADD CONSTRAINT': 1 },
  ],
  [
    '20260622010000_add_content_embedding',
    { 'CREATE TABLE': 1, 'CREATE INDEX': 3 },
  ],
  [
    '20260622020000_add_user_rating',
    { 'CREATE TABLE': 1, 'CREATE INDEX': 2, 'ADD CONSTRAINT': 1 },
  ],
  ['20260823120000_unique_ai_review_per_submission', { 'CREATE INDEX': 1 }],
  [
    '20260829140000_user_ai_key',
    { 'CREATE TABLE': 1, 'CREATE INDEX': 2, 'ADD CONSTRAINT': 1 },
  ],
  [
    '20260830070000_user_permission_overrides',
    { 'CREATE INDEX': 1, 'ADD COLUMN': 4 },
  ],
  ['20260905120000_content_embedding_dimensions', { 'ADD COLUMN': 1 }],
]);

/**
 * sha256 of each migration file, equal to the `checksum` column production's
 * `_prisma_migrations` recorded when it applied them (verified row by row,
 * read-only, 2026-09-06 — all 15 matched).
 *
 * Editing a file a database has already applied makes `migrate deploy` refuse
 * with `P3006` ("migration ... was modified after it was applied"), which stops
 * every deploy just as thoroughly as `P3009` does. There is no fix for it in
 * the repo — recovery needs a hand on the production database — so the cheap
 * move is to make the edit fail here instead.
 *
 * EVERY migration must be pinned, including a brand new one: adding the hash in
 * the same PR that adds the migration costs one line and closes the gap where
 * an unpinned file could be applied and then quietly edited. Changing a hash
 * that already exists is the thing this test is for — do not do it to make the
 * test pass.
 */
const APPLIED_CHECKSUMS = new Map<string, string>([
  [
    '20260305131830_baseline',
    '8cc0d56baa75cf432ddc936625b2f7e9c647c635b76212fe1748764b9ac7ff34',
  ],
  [
    '20260308124944_replace_full_name_with_first_last_name',
    'a5774b5d4c334157b9406de1ca1c958d27e2b5f62ef31eda0ca2cd540838a022',
  ],
  [
    '20260309055621_',
    'a4fb8c6a3818f6795bf93c907cdf5d2ee3db258fca14ba758c27d73ebee8910c',
  ],
  [
    '20260328170915_update_subscription_for_stripe',
    'b6e640cec8ca2582aba6e528a722b87a759e221c94c3b6c56004208be2b1920d',
  ],
  [
    '20260615000000_drop_quizquestion_system_b',
    '24ea16243e9075712013bdd614f3f102d10bc30407b3b7c311f5123efbfefe9d',
  ],
  [
    '20260615010000_enums_to_text',
    '05544b83095379297659cae3e416568d867884e22943093384f8cb733e39ae15',
  ],
  [
    '20260622000000_add_ai_code_review_fields',
    '485af865f1b0e0176aa4f77680c26fef427e8a50d534147017b5db75c8a2b6e7',
  ],
  [
    '20260622010000_add_content_embedding',
    'e91ef512ccc0e76512eea513034aad28e1d697d8ce2234c434de3f8f88f39472',
  ],
  [
    '20260622020000_add_user_rating',
    'd9971a712a9d5dc548d26427b65190a341c3bf6a270120f4b333233e119f46fc',
  ],
  [
    '20260823120000_unique_ai_review_per_submission',
    '01ffd41fe0c292c6d03b997f1b838c36f44984f0d6389e9b9fc787aa6b23ed0f',
  ],
  [
    '20260829140000_user_ai_key',
    'b37501a7d477582674f9d9252afc0061fb8969e7b1ac95ce9cd2f777c263c86b',
  ],
  [
    '20260829170000_audit_indexes',
    'f4c7261bb3d011b1c1a72e2bc1f87afbd40dc098dab7b62c6d0ccb5ee522e2f3',
  ],
  [
    '20260829190000_challenge_submission_indexes',
    'af6d1505bb6735265c2e8249bb8f4115d3c5f0102fe37561f6dc66e3cf1d3650',
  ],
  [
    '20260830070000_user_permission_overrides',
    'f2dc693f50a79d2a6d1ea2990d360ff2635230fe92463bf9974b3e531f4e291f',
  ],
  [
    '20260905120000_content_embedding_dimensions',
    'f07b60a2b0ca8272b50e3352d717530ee29f839dc0b091e42ffa4d6415ff38cb',
  ],
]);

/**
 * Full-line `--` comments only. The prose in these files talks ABOUT
 * `CREATE INDEX` at length — `20260829170000_audit_indexes` explains why it is
 * not using `CONCURRENTLY` — and a scanner that reads comments as code would
 * report the explanation as the offence.
 */
function stripComments(sql: string): string {
  return sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');
}

/**
 * Split on `;`, but not on a `;` inside a dollar-quoted body. Without this the
 * `DO $$ ... $$` block that is the ONLY way to guard a `CREATE TYPE` would be
 * chopped into fragments, and the guard would read as an offence — the rule
 * would reject its own remedy.
 */
export function splitStatements(sql: string): string[] {
  const src = stripComments(sql);
  const out: string[] = [];
  let buffer = '';
  let tag: string | null = null;

  for (let i = 0; i < src.length; i++) {
    if (tag === null) {
      const opening = /^\$[A-Za-z_]*\$/.exec(src.slice(i));
      if (opening) {
        buffer += opening[0];
        i += opening[0].length - 1;
        tag = opening[0];
        continue;
      }
      if (src[i] === ';') {
        out.push(buffer);
        buffer = '';
        continue;
      }
      buffer += src[i];
    } else {
      if (src.startsWith(tag, i)) {
        buffer += tag;
        i += tag.length - 1;
        tag = null;
        continue;
      }
      buffer += src[i];
    }
  }
  out.push(buffer);

  return out.map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
}

function occurrences(pattern: RegExp, text: string): number {
  return (text.match(pattern) ?? []).length;
}

/** Rules with a native `IF NOT EXISTS`, expressed as total minus guarded. */
const NATIVE_RULES: Array<{
  id: RuleId;
  total: RegExp;
  guarded: RegExp;
  exempt?: RegExp;
}> = [
  {
    id: 'CREATE INDEX',
    total: /\bCREATE\s+(?:UNIQUE\s+)?INDEX\b/gi,
    guarded:
      /\bCREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:CONCURRENTLY\s+)?IF\s+NOT\s+EXISTS\b/gi,
    // CONCURRENTLY cannot run in Prisma's migration transaction, so it is out
    // of scope rather than merely allowed. The lookahead keeps a guarded
    // CONCURRENTLY index from being subtracted twice.
    exempt:
      /\bCREATE\s+(?:UNIQUE\s+)?INDEX\s+CONCURRENTLY\s+(?!IF\s+NOT\s+EXISTS\b)/gi,
  },
  {
    id: 'CREATE TABLE',
    total: /\bCREATE\s+TABLE\b/gi,
    guarded: /\bCREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\b/gi,
  },
  {
    id: 'CREATE EXTENSION',
    total: /\bCREATE\s+EXTENSION\b/gi,
    guarded: /\bCREATE\s+EXTENSION\s+IF\s+NOT\s+EXISTS\b/gi,
  },
  {
    id: 'ADD COLUMN',
    total: /\bADD\s+COLUMN\b/gi,
    guarded: /\bADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\b/gi,
  },
];

const DO_BLOCK = /\bDO\s+\$/i;
const HANDLES_DUPLICATE =
  /\bEXCEPTION\b[\s\S]*\bWHEN\b[\s\S]*?\b(?:duplicate_object|duplicate_table|duplicate_column|duplicate_schema)\b/i;

/** The `DO $$ ... EXCEPTION WHEN duplicate_object ... $$` remedy. */
function isDoBlockGuarded(statement: string): boolean {
  return DO_BLOCK.test(statement) && HANDLES_DUPLICATE.test(statement);
}

const ADD_CONSTRAINT_NAMED =
  /\bADD\s+CONSTRAINT\s+(?:"?[\w-]+"?\.)?"?([\w-]+)"?/gi;
const DROP_CONSTRAINT_GUARDED =
  /\bDROP\s+CONSTRAINT\s+IF\s+EXISTS\s+(?:"?[\w-]+"?\.)?"?([\w-]+)"?/gi;
const CREATE_TYPE_NAMED = /\bCREATE\s+TYPE\s+(?:"?[\w-]+"?\.)?"?([\w-]+)"?/gi;
const DROP_TYPE_GUARDED =
  /\bDROP\s+TYPE\s+IF\s+EXISTS\s+(?:"?[\w-]+"?\.)?"?([\w-]+)"?/gi;

function preview(statement: string): string {
  return statement.length > 120 ? `${statement.slice(0, 117)}...` : statement;
}

/**
 * Every object creation in one migration file that would raise `42P07`/`42710`
 * against a database that already holds the object.
 *
 * Counting is per OCCURRENCE, not per statement: a single
 * `ALTER TABLE x ADD COLUMN a, ADD COLUMN b` guards two things or none, and
 * "the statement has a guard somewhere in it" is not the property that matters.
 */
export function analyze(sql: string): Offender[] {
  const offenders: Offender[] = [];
  const droppedConstraints = new Set<string>();
  const droppedTypes = new Set<string>();

  for (const statement of splitStatements(sql)) {
    // Collected before the offence check so that a DROP and an ADD in the SAME
    // statement pair up, and so that a DROP later in the file does not
    // retroactively excuse an earlier ADD.
    for (const m of statement.matchAll(DROP_CONSTRAINT_GUARDED)) {
      droppedConstraints.add(m[1]);
    }
    for (const m of statement.matchAll(DROP_TYPE_GUARDED)) {
      droppedTypes.add(m[1]);
    }

    if (isDoBlockGuarded(statement)) continue;

    for (const rule of NATIVE_RULES) {
      const unguarded =
        occurrences(rule.total, statement) -
        occurrences(rule.guarded, statement) -
        (rule.exempt ? occurrences(rule.exempt, statement) : 0);
      for (let i = 0; i < unguarded; i++) {
        offenders.push({ rule: rule.id, statement: preview(statement) });
      }
    }

    for (const m of statement.matchAll(CREATE_TYPE_NAMED)) {
      if (!droppedTypes.has(m[1])) {
        offenders.push({ rule: 'CREATE TYPE', statement: preview(statement) });
      }
    }
    for (const m of statement.matchAll(ADD_CONSTRAINT_NAMED)) {
      if (!droppedConstraints.has(m[1])) {
        offenders.push({
          rule: 'ADD CONSTRAINT',
          statement: preview(statement),
        });
      }
    }
  }

  return offenders;
}

export function countByRule(offenders: Offender[]): RuleCounts {
  const counts: RuleCounts = {};
  for (const o of offenders) counts[o.rule] = (counts[o.rule] ?? 0) + 1;
  return counts;
}

function migrationDirs(): string[] {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((name) =>
      fs.existsSync(path.join(MIGRATIONS_DIR, name, 'migration.sql'))
    )
    .sort();
}

function readMigration(dir: string): Buffer {
  return fs.readFileSync(path.join(MIGRATIONS_DIR, dir, 'migration.sql'));
}

/**
 * Jest's `expect` takes no message argument (that is Vitest), so the guidance
 * has to travel in the value being compared. Each offender is rendered as a
 * line, and the assertion is against the list — a failure then prints the
 * exact statements rather than a bare count.
 */
function renderOffenders(offenders: Offender[]): string[] {
  return offenders.map((o) => `${o.rule} — ${o.statement}`);
}

describe('migrations create objects idempotently', () => {
  const dirs = migrationDirs();

  it('finds the migrations at all', () => {
    // A scan of nothing passes. This is the check that the input set has not
    // silently emptied — a moved directory would otherwise turn the whole
    // suite below into zero assertions.
    expect(dirs.length).toBeGreaterThanOrEqual(15);
    expect(dirs).toContain('20260305131830_baseline');
    expect(dirs).toContain('20260905120000_content_embedding_dimensions');
  });

  describe.each(dirs)('%s', (dir) => {
    const allowed = RATCHET.get(dir);

    if (allowed === undefined) {
      // A new migration. Strict: production can already hold anything it
      // creates, and a bare creation fails the whole migration (42P07/42710)
      // and wedges every later deploy on P3009. Use IF NOT EXISTS for
      // INDEX/TABLE/EXTENSION/ADD COLUMN; for CREATE TYPE and ADD CONSTRAINT
      // see docs/MIGRATIONS.md.
      it('creates nothing without a guard', () => {
        expect(
          renderOffenders(analyze(readMigration(dir).toString('utf8')))
        ).toEqual([]);
      });
      return;
    }

    // Already applied in production, with a recorded checksum. The count may
    // only go DOWN — and in practice the file must not be edited at all.
    it('has no more unguarded creations than it is ratcheted for', () => {
      const counts = countByRule(analyze(readMigration(dir).toString('utf8')));
      const regressions = (Object.keys(counts) as RuleId[])
        .filter((rule) => (counts[rule] ?? 0) > (allowed[rule] ?? 0))
        .map(
          (rule) =>
            `${rule}: ${counts[rule]} unguarded, ratcheted at ${allowed[rule] ?? 0}`
        );
      expect(regressions).toEqual([]);
    });
  });

  it('the ratchet has no stale entries', () => {
    expect([...RATCHET.keys()].filter((n) => !dirs.includes(n))).toEqual([]);
  });

  it('the ratchet does not over-allow', () => {
    // A ratchet whose numbers are higher than reality is a silent licence to
    // add offences. Every allowance must be exactly what the file contains
    // today; if a file gets BETTER, the numbers here come down with it.
    //
    // Compared key-order-independently: the order rules are declared in is an
    // implementation detail of the scanner, and a test that fails on it would
    // be noise rather than a finding.
    const canonical = (counts: RuleCounts): string =>
      JSON.stringify(
        Object.fromEntries(
          Object.entries(counts).sort(([a], [b]) => a.localeCompare(b))
        )
      );

    const drifted = [...RATCHET.entries()]
      .map(([name, allowed]) => ({
        name,
        actual: countByRule(analyze(readMigration(name).toString('utf8'))),
        allowed,
      }))
      .filter(({ actual, allowed }) => canonical(actual) !== canonical(allowed))
      .map(
        ({ name, actual, allowed }) =>
          `${name}: file has ${canonical(actual)}, ratchet says ${canonical(allowed)}`
      );
    expect(drifted).toEqual([]);
  });
});

describe('migrations already applied in production are frozen', () => {
  const dirs = migrationDirs();

  it('every migration is pinned', () => {
    // Pinning in the same PR that adds the migration closes the window where
    // an unpinned file could be applied to production and then quietly edited.
    //   shasum -a 256 prisma/migrations/<name>/migration.sql
    expect(dirs.filter((d) => !APPLIED_CHECKSUMS.has(d))).toEqual([]);
  });

  it('no pinned migration has been edited since it was applied', () => {
    // Production recorded each file's checksum when it applied it. Editing one
    // makes `prisma migrate deploy` refuse with P3006 and stops every deploy,
    // exactly as thoroughly as P3009 does — and unlike P3009 there is nothing
    // in the repo that fixes it. Write a NEW migration instead.
    const edited = dirs
      .filter((dir) => APPLIED_CHECKSUMS.has(dir))
      .filter(
        (dir) =>
          createHash('sha256').update(readMigration(dir)).digest('hex') !==
          APPLIED_CHECKSUMS.get(dir)
      );
    expect(edited).toEqual([]);
  });

  it('the pin list has no stale entries', () => {
    expect(
      [...APPLIED_CHECKSUMS.keys()].filter((n) => !dirs.includes(n))
    ).toEqual([]);
  });
});

describe('the check itself has teeth', () => {
  const offending = (sql: string): RuleId[] => analyze(sql).map((o) => o.rule);

  it('flags a bare CREATE INDEX and a bare CREATE UNIQUE INDEX', () => {
    expect(offending('CREATE INDEX "a_idx" ON "A"("b");')).toEqual([
      'CREATE INDEX',
    ]);
    expect(offending('CREATE UNIQUE INDEX "a_key" ON "A"("b");')).toEqual([
      'CREATE INDEX',
    ]);
  });

  it('accepts IF NOT EXISTS in either case and across newlines', () => {
    expect(
      offending('create index if not exists "a_idx"\n  ON "A"("b");')
    ).toEqual([]);
    expect(
      offending('CREATE UNIQUE INDEX IF NOT EXISTS "a_key" ON "A"("b");')
    ).toEqual([]);
  });

  it('ignores CONCURRENTLY, which cannot run in a migration transaction anyway', () => {
    expect(offending('CREATE INDEX CONCURRENTLY "a_idx" ON "A"("b");')).toEqual(
      []
    );
    // ...and does not double-subtract when it is also guarded.
    expect(
      offending('CREATE INDEX CONCURRENTLY IF NOT EXISTS "a_idx" ON "A"("b");')
    ).toEqual([]);
  });

  it('flags a bare CREATE TABLE and accepts the guarded one', () => {
    expect(offending('CREATE TABLE "A" ("id" TEXT NOT NULL);')).toEqual([
      'CREATE TABLE',
    ]);
    expect(
      offending('CREATE TABLE IF NOT EXISTS "A" ("id" TEXT NOT NULL);')
    ).toEqual([]);
  });

  it('flags a bare CREATE EXTENSION and accepts the guarded one', () => {
    expect(offending('CREATE EXTENSION vector;')).toEqual(['CREATE EXTENSION']);
    expect(offending('CREATE EXTENSION IF NOT EXISTS vector;')).toEqual([]);
  });

  it('counts ADD COLUMN per clause, not per statement', () => {
    // The half-guarded case is the one a statement-level check gets wrong.
    expect(
      offending(
        'ALTER TABLE "A" ADD COLUMN IF NOT EXISTS "a" TEXT, ADD COLUMN "b" TEXT;'
      )
    ).toEqual(['ADD COLUMN']);
    expect(
      offending(
        'ALTER TABLE "A" ADD COLUMN IF NOT EXISTS "a" TEXT, ADD COLUMN IF NOT EXISTS "b" TEXT;'
      )
    ).toEqual([]);
  });

  it('flags a bare CREATE TYPE, and accepts a preceding DROP TYPE IF EXISTS', () => {
    expect(offending(`CREATE TYPE "Status" AS ENUM ('A');`)).toEqual([
      'CREATE TYPE',
    ]);
    expect(
      offending(
        `DROP TYPE IF EXISTS "Status";\nCREATE TYPE "Status" AS ENUM ('A');`
      )
    ).toEqual([]);
    // Order matters: a DROP after the CREATE excuses nothing.
    expect(
      offending(
        `CREATE TYPE "Status" AS ENUM ('A');\nDROP TYPE IF EXISTS "Status";`
      )
    ).toEqual(['CREATE TYPE']);
  });

  it('flags a bare ADD CONSTRAINT, and accepts a preceding DROP CONSTRAINT IF EXISTS', () => {
    expect(
      offending(
        'ALTER TABLE "A" ADD CONSTRAINT "A_b_fkey" FOREIGN KEY ("b") REFERENCES "B"("id");'
      )
    ).toEqual(['ADD CONSTRAINT']);
    expect(
      offending(
        'ALTER TABLE "A" DROP CONSTRAINT IF EXISTS "A_b_fkey";\n' +
          'ALTER TABLE "A" ADD CONSTRAINT "A_b_fkey" FOREIGN KEY ("b") REFERENCES "B"("id");'
      )
    ).toEqual([]);
    // A different constraint name is not covered by the drop.
    expect(
      offending(
        'ALTER TABLE "A" DROP CONSTRAINT IF EXISTS "A_other_fkey";\n' +
          'ALTER TABLE "A" ADD CONSTRAINT "A_b_fkey" FOREIGN KEY ("b") REFERENCES "B"("id");'
      )
    ).toEqual(['ADD CONSTRAINT']);
  });

  it('accepts a DO block that swallows duplicate_object', () => {
    expect(
      offending(
        `DO $$ BEGIN\n` +
          `  ALTER TABLE "A" ADD CONSTRAINT "A_b_fkey" FOREIGN KEY ("b") REFERENCES "B"("id");\n` +
          `EXCEPTION WHEN duplicate_object THEN NULL;\n` +
          `END $$;`
      )
    ).toEqual([]);
  });

  it('does NOT accept a DO block with no duplicate handler', () => {
    // The block is the remedy only because of the handler. Without it the
    // statement raises exactly the same error, and the rule must say so.
    expect(
      offending(
        `DO $$ BEGIN\n` +
          `  ALTER TABLE "A" ADD CONSTRAINT "A_b_fkey" FOREIGN KEY ("b") REFERENCES "B"("id");\n` +
          `END $$;`
      )
    ).toEqual(['ADD CONSTRAINT']);
  });

  it('does not split a statement on a semicolon inside a dollar-quoted body', () => {
    // Without dollar-quote awareness the block above is chopped up, its
    // EXCEPTION clause lands in a different fragment, and the rule rejects its
    // own remedy.
    expect(
      splitStatements(`DO $$ BEGIN\n  SELECT 1;\n  SELECT 2;\nEND $$;`)
    ).toHaveLength(1);
  });

  it('ignores prose in comments that mentions CREATE INDEX', () => {
    expect(
      offending(
        `-- Plain CREATE INDEX rather than CONCURRENTLY: Prisma runs migrations\n` +
          `-- CREATE TABLE "x" would be wrong here.\n` +
          `CREATE INDEX IF NOT EXISTS "a_idx" ON "A"("b");`
      )
    ).toEqual([]);
  });

  it('finds the offender among several good statements', () => {
    expect(
      analyze(
        `CREATE INDEX IF NOT EXISTS "a_idx" ON "A"("b");\n` +
          `CREATE INDEX "b_idx" ON "B"("c");\n` +
          `CREATE INDEX IF NOT EXISTS "c_idx" ON "C"("d");`
      )
    ).toEqual([
      { rule: 'CREATE INDEX', statement: 'CREATE INDEX "b_idx" ON "B"("c")' },
    ]);
  });

  it('reports a clean file as clean', () => {
    expect(
      offending(
        `CREATE TABLE IF NOT EXISTS "A" ("id" TEXT NOT NULL);\n` +
          `CREATE INDEX IF NOT EXISTS "a_idx" ON "A"("id");\n` +
          `ALTER TABLE "A" ADD COLUMN IF NOT EXISTS "b" TEXT;`
      )
    ).toEqual([]);
  });
});
