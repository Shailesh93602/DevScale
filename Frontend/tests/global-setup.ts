import { execSync } from 'child_process';
import path from 'path';

/**
 * Seeds the five battles the battle-zone specs rely on by running
 * `npm run seed:battles` in Backend/ before the run.
 *
 * THAT SEED DELETES EVERY BATTLE ROW FIRST, and it resolves its database from
 * Backend/.env — the shared Supabase project — unless DATABASE_URL is exported.
 * The seeder refuses anything that is not a local throwaway (localhost plus a
 * *_test / *_e2e database, confirmed on the live connection) and exits 1.
 *
 * This file used to catch that exit, print a WARNING and let the run continue,
 * so `npx playwright test` produced a wall of unrelated battle failures while
 * the one line that explained them scrolled past. A refused or failed seed now
 * aborts the run with the reason.
 *
 * PLAYWRIGHT_SKIP_SEED=1 skips the seed explicitly, for runs that need no
 * battles. CI's public WCAG sweep is one: it installs Frontend only, has no
 * Backend node_modules, and its seed step had been failing silently on every
 * run. The skip is logged so a run without battles never looks like a seeded
 * one.
 *
 * Recipe: docs/QA_COVERAGE.md → "Running the default Playwright suite safely".
 */
export default async function globalSetup() {
  if (process.env.PLAYWRIGHT_SKIP_SEED === '1') {
    console.log(
      '\n[global-setup] PLAYWRIGHT_SKIP_SEED=1 — battle seeding SKIPPED. ' +
        'Specs that need seeded battles will fail.\n',
    );
    return;
  }

  const backendDir = path.resolve(__dirname, '../../Backend');
  console.log(
    '\n[global-setup] Seeding battle data before the run (npm run seed:battles in Backend/)...',
  );
  try {
    execSync('npm run seed:battles', {
      cwd: backendDir,
      stdio: 'inherit',
      timeout: 60000,
    });
  } catch (err) {
    const e = err as { status?: number | null; signal?: string | null };
    const how =
      e.signal != null
        ? `killed by ${e.signal}`
        : e.status != null
          ? `exit code ${e.status}`
          : 'could not start';
    throw new Error(
      [
        `[global-setup] Battle seeding failed (${how}) — see the seeder output above. ` +
          'Aborting the run rather than testing against unseeded or unknown data.',
        'The seeder writes only to a local throwaway: export ' +
          'DATABASE_URL=postgresql://<you>@localhost:5434/eduscale_test ' +
          '(host localhost, database *_test / *_e2e) and run the backend against the same database — ' +
          'docs/QA_COVERAGE.md → "Running the default Playwright suite safely".',
        'Runs that need no battles can set PLAYWRIGHT_SKIP_SEED=1.',
      ].join('\n'),
    );
  }
  console.log('[global-setup] Battle seeding complete.\n');
}
