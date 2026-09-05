/**
 * seed-battles.ts — `npm run seed:battles`
 *
 * Thin entrypoint: load Backend/.env, build the Prisma client, hand both to
 * runBattleSeeder() in ./battle-seeder.ts. The guard and the seed live there
 * so they can be unit-tested with a mocked client
 * (src/tests/scripts/seed-battles.test.ts).
 *
 * `import 'dotenv/config'` is deliberate. tsx does not load .env, while the
 * Prisma client resolves its datasource on its own — so without loading it
 * here the URL check would judge an EMPTY string while the client opened
 * whatever Backend/.env names. Loading it makes the check see the same value
 * the client will use; a URL already exported in the shell still wins, because
 * dotenv never overrides. The live-connection check inside the guard is there
 * for the case where the two still disagree.
 *
 * A refusal exits 1 with the reason. Frontend/tests/global-setup.ts turns that
 * into an aborted Playwright run, not a warning.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { runBattleSeeder } from './battle-seeder.js';

const prisma = new PrismaClient();

runBattleSeeder(prisma, process.env.DATABASE_URL)
  .catch((err: unknown) => {
    console.error(
      '\nSeeder failed:',
      err instanceof Error ? err.message : String(err)
    );
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
