import * as path from 'node:path';
import { config } from 'dotenv';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

// Loads .env (prod) to check the URL Prisma Client will use. SEED_ALLOW_REMOTE=1
// admits one upsert seeder remotely; prisma/seed.ts passes allowOverride:false.
export function assertSeedTarget(
  env: NodeJS.ProcessEnv = process.env,
  { allowOverride = true } = {}
): void {
  if (env === process.env) config();
  if (allowOverride && env.SEED_ALLOW_REMOTE === '1') return;
  const url = env.DATABASE_URL;
  let host = '';
  try {
    host = url ? new URL(url).hostname : '';
  } catch {
    host = '';
  }
  if (!LOCAL_HOSTS.has(host)) {
    throw new Error(
      `REFUSING TO SEED: DATABASE_URL host "${host || '(unset)'}" is not local. ` +
        'A single seeder accepts SEED_ALLOW_REMOTE=1; the full seed is local-only.'
    );
  }
}

/** Runs `seed` only when this seeder is the executed script, never on import. */
export function runIfEntryPoint(
  seederName: string,
  seed: () => Promise<void>
): void {
  const entry = path
    .basename(process.argv[1] ?? '')
    .replace(/\.(ts|js|mjs|cjs)$/, '');
  if (entry !== seederName) return;
  Promise.resolve()
    .then(() => assertSeedTarget())
    .then(seed)
    .catch((error) => {
      console.error(`${seederName} failed:`, error);
      process.exitCode = 1;
    });
}
