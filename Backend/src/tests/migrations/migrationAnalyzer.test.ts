import { describe, it, expect } from '@jest/globals';

import { analyze, splitStatements, type RuleId } from './migrationSql';

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
