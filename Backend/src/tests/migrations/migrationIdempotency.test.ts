import { createHash } from 'node:crypto';

import { describe, it, expect } from '@jest/globals';

import {
  analyze,
  countByRule,
  migrationDirs,
  readMigration,
  renderOffenders,
  type RuleCounts,
  type RuleId,
} from './migrationSql';

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
  [
    '20261016120000_user_progress_points_awarded',
    'e02f5a1db77ac30dccd7ba74d991efc275596b7ec9d2883ccded1f998024abee',
  ],
]);

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
