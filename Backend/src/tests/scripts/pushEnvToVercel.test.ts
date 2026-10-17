// eduscale-backend#21-05 — the Vercel env pusher refuses dev values and never rm's first.
import { describe, it, expect, beforeEach } from '@jest/globals';
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const SCRIPT = path.join(__dirname, '../../../scripts/push-env-to-vercel.sh');
let dir: string;

function run(envFile: string) {
  fs.writeFileSync(path.join(dir, '.env.production'), envFile);
  const res = spawnSync('bash', [SCRIPT], {
    cwd: dir,
    encoding: 'utf8',
    env: {
      ...process.env,
      ENV_FILE: '.env.production',
      PATH: `${path.join(dir, 'bin')}:${process.env.PATH}`,
    },
  });
  const log = fs.existsSync(path.join(dir, 'calls.log'))
    ? fs.readFileSync(path.join(dir, 'calls.log'), 'utf8').trim().split('\n')
    : [];
  return { status: res.status, stdout: res.stdout, log };
}

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'push-env-'));
  fs.mkdirSync(path.join(dir, '.vercel'));
  fs.writeFileSync(
    path.join(dir, '.vercel/project.json'),
    '{"projectId":"prj_test"}'
  );
  fs.mkdirSync(path.join(dir, 'scripts'));
  fs.writeFileSync(
    path.join(dir, 'scripts/vercel-env-keys.txt'),
    '# allow-list\nNODE_ENV\nAPI_URL\nJWT_SECRET\n'
  );
  fs.mkdirSync(path.join(dir, 'bin'));
  // A fake `vercel` that records its argv and the value piped to it.
  fs.writeFileSync(
    path.join(dir, 'bin/vercel'),
    '#!/bin/bash\necho "$* <= $(cat)" >> "$PWD/calls.log"\n',
    { mode: 0o755 }
  );
});

describe('push-env-to-vercel.sh', () => {
  it('refuses NODE_ENV=development before pushing anything', () => {
    const out = run('NODE_ENV=development\nJWT_SECRET=s3cret\n');
    expect(out.status).not.toBe(0);
    expect(out.log).toEqual([]);
  });

  it('refuses a localhost URL before pushing anything', () => {
    const out = run('NODE_ENV=production\nAPI_URL=http://localhost:5000\n');
    expect(out.status).not.toBe(0);
    expect(out.log).toEqual([]);
  });

  it('pushes only allow-listed keys, with --force and never `env rm`, parsing like dotenv', () => {
    const out = run(
      [
        'NODE_ENV=production',
        "JWT_SECRET='quoted value'",
        'API_URL=https://api.example.com # the public API',
        'E2E_ADMIN_PASSWORD=hunter2',
      ].join('\n') + '\n'
    );
    expect(out.status).toBe(0);
    expect(out.log).toEqual([
      'env add NODE_ENV production --force <= production',
      'env add JWT_SECRET production --force <= quoted value',
      'env add API_URL production --force <= https://api.example.com',
    ]);
  });
});
