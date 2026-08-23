import { describe, it, expect } from '@jest/globals';

import { assertTestDatabaseUrl } from './assertTestDatabase.js';

describe('assertTestDatabaseUrl', () => {
  it('accepts the CI service container URL', () => {
    // The exact string the workflow sets. If this ever stops matching, the
    // whole backend-test job fails at import with a confusing message, so it
    // is worth pinning rather than trusting.
    expect(() =>
      assertTestDatabaseUrl(
        'postgresql://postgres:postgres@localhost:5432/eduscale_test'
      )
    ).not.toThrow();
  });

  // 🔴 THE HOLE THIS GUARD ONCE HAD.
  //
  // `postgres` was briefly allowed as the CI container's default database name.
  // Production Supabase's database is ALSO named `postgres`, so the name check
  // would have accepted production and only the host check stood in the way.
  // The CI container is named eduscale_test precisely so this can stay refused.
  it('refuses the name `postgres`, even on localhost', () => {
    expect(() =>
      assertTestDatabaseUrl('postgresql://postgres:postgres@localhost:5432/postgres')
    ).toThrow(/not an obvious throwaway/);
  });

  it('accepts a local *_test / *_e2e database', () => {
    for (const db of ['eduscale_test', 'eduscale_e2e', 'anything_test']) {
      expect(() =>
        assertTestDatabaseUrl(`postgresql://me@localhost:5434/${db}`)
      ).not.toThrow();
    }
  });

  // THE TEST THIS FILE EXISTS FOR.
  //
  // Backend/.env points DATABASE_URL at production Supabase, and this suite
  // creates and deletes users. Before the guard, `npm test` wrote there.
  it('refuses production Supabase', () => {
    expect(() =>
      assertTestDatabaseUrl(
        'postgresql://u:p@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true'
      )
    ).toThrow(/not local/);
  });

  it('refuses any remote host, even with a throwaway database name', () => {
    // The near-miss a name-only check would wave through.
    expect(() =>
      assertTestDatabaseUrl('postgresql://u:p@10.0.0.5:5432/eduscale_test')
    ).toThrow(/not local/);
  });

  it('refuses a local host pointed at a real database name', () => {
    // A developer with a local copy of the real schema, named `eduscale`.
    expect(() =>
      assertTestDatabaseUrl('postgresql://me@localhost:5432/eduscale')
    ).toThrow(/not an obvious throwaway/);
  });

  it('refuses an unset or unparseable URL rather than defaulting', () => {
    expect(() => assertTestDatabaseUrl(undefined)).toThrow(/not set/);
    expect(() => assertTestDatabaseUrl('nonsense')).toThrow(/parseable/);
  });

  it('names the offending host, so the refusal is actionable', () => {
    try {
      assertTestDatabaseUrl('postgresql://u:p@db.example.com:5432/postgres');
      throw new Error('should have thrown');
    } catch (error) {
      expect((error as Error).message).toContain('db.example.com');
    }
  });
});
