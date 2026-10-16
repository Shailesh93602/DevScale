/**
 * eduscale-backend#21-01 — `npm run qa` had no local-database guard.
 *
 * qa/run.mjs and qa/socket.mjs load Backend/.env (production DATABASE_URL)
 * and then create, delete and probe rows. seed-e2e.mjs refused non-local
 * targets; these two did not. This spawns the real entry points with
 * obviously non-local targets (every endpoint is unroutable, so nothing can
 * be reached even if the guard were missing) and asserts they refuse.
 */
import { describe, it, expect } from '@jest/globals';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const QA = join(__dirname, '..', '..', '..', 'qa');
const DEAD = 'http://127.0.0.1:1';

const run = (script: string, env: Record<string, string>) =>
  spawnSync(process.execPath, [join(QA, script)], {
    env: {
      ...process.env,
      SUPABASE_URL: DEAD,
      QA_BASE: `${DEAD}/api/v1`,
      QA_WS: DEAD,
      QA_ALLOW_REMOTE: '',
      ...env,
    },
    encoding: 'utf8',
    timeout: 30_000,
  });

describe('QA entry points refuse non-local targets', () => {
  it.each(['run.mjs', 'socket.mjs'])(
    '%s refuses a non-local DATABASE_URL',
    (script) => {
      const r = run(script, {
        DATABASE_URL: 'postgresql://u:p@db.invalid:5432/prod',
      });
      expect(r.status).toBe(2);
      expect(r.stderr).toContain('REFUSING TO RUN QA');
    }
  );

  it('refuses a remote QA_BASE even with a local database', () => {
    const r = run('run.mjs', {
      DATABASE_URL: 'postgresql://u:p@127.0.0.1:1/eduscale_e2e',
      QA_BASE: 'https://api.example.invalid/api/v1',
    });
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('QA_BASE is not local');
  });

  it('lets a fully local target through the guard', () => {
    const r = spawnSync(process.execPath, [join(QA, 'localOnly.mjs')], {
      env: {
        ...process.env,
        DATABASE_URL: 'postgresql://u:p@localhost:5432/eduscale_e2e',
        QA_BASE: 'http://localhost:4000/api/v1',
        QA_WS: 'http://localhost:4000',
      },
      encoding: 'utf8',
    });
    expect(r.status).toBe(0);
  });
});
