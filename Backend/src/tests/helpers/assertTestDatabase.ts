/**
 * Refuse to run destructive tests against a database that isn't a throwaway.
 *
 * WHY THIS EXISTS.
 *
 * battle.test.ts creates users, topics and battles and then deletes them. The
 * checked-in Backend/.env points DATABASE_URL at PRODUCTION Supabase
 * (aws-1-…pooler.supabase.com), so `npm test` on a developer machine wrote to
 * production. It cleaned up after itself — afterAll runs even when tests fail,
 * and a read-only sweep on 2026-08-23 found zero orphans — so nothing was
 * actually harmed. It was safe by construction of the teardown, not by anything
 * preventing the connection.
 *
 * That's too thin. A crash between create and delete, a killed process, an
 * edited `where` clause, or a `deleteMany` whose filter is widened by a
 * refactor all end the same way, and they end there silently.
 *
 * TWO CHECKS, because one is not enough:
 *
 *   1. the URL string names a local or explicitly-test database
 *   2. the LIVE CONNECTION reports the database it actually opened
 *
 * (2) exists because (1) validates a string and says nothing about where the
 * client went. In the sibling KhataGO repo, a command naming a local database
 * connected to production anyway, because the Prisma CLI loads the repo's .env
 * in preference to the shell. Validate the string, then ask the connection what
 * it is.
 */
import type { PrismaClient } from '@prisma/client';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

/**
 * Database names we are willing to create and delete rows in.
 *
 * 🔴 `postgres` is deliberately NOT here, and that omission is the whole point.
 * It was on this list briefly as the CI service container's default name — and
 * PRODUCTION SUPABASE'S DATABASE IS ALSO NAMED `postgres`. The name check would
 * therefore have waved production straight through, leaving only the host check
 * between this suite and the live database.
 *
 * An allow-list whose most permissive entry matches production is not an
 * allow-list. The CI container is configured with POSTGRES_DB=eduscale_test so
 * nothing here needs to accept a default name.
 */
function isThrowawayName(name: string): boolean {
  return name.endsWith('_test') || name.endsWith('_e2e');
}

export function assertTestDatabaseUrl(url: string | undefined): void {
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. These tests write rows and need a throwaway database.'
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('DATABASE_URL is not a parseable URL.');
  }

  if (!LOCAL_HOSTS.has(parsed.hostname)) {
    throw new Error(
      [
        'REFUSING TO RUN: these tests create and delete rows.',
        `DATABASE_URL host is "${parsed.hostname}", which is not local.`,
        'Backend/.env points at PRODUCTION Supabase — never run this against it.',
        'Start a local Postgres and export DATABASE_URL before running.',
      ].join('\n')
    );
  }

  const database = parsed.pathname.replace(/^\//, '');
  if (!isThrowawayName(database)) {
    throw new Error(
      `REFUSING TO RUN: database "${database}" is not an obvious throwaway ` +
        '(expected a *_test / *_e2e name, or the CI container default).'
    );
  }
}

/**
 * Ask the open connection which database it actually opened.
 *
 * This asserts on the database NAME and not the server address, which is a
 * correction to the first version. That one also required a loopback
 * `inet_server_addr()` and failed in CI: a Docker service container is reached
 * at localhost from the runner but reports its own private address
 * (172.18.0.2) from inside. Containers, pgbouncer, proxies and tunnels all
 * legitimately report a non-loopback address, so the server address is a poor
 * signal at the connection layer — it produces false refusals, and a guard that
 * cries wolf gets deleted.
 *
 * The URL check already requires a local HOST. What this adds is the thing a
 * string cannot know: which database the client really reached. A name ending
 * in `_test`/`_e2e` cannot be production, because production is `postgres`.
 */
export async function assertConnectedToTestDatabase(
  prisma: PrismaClient
): Promise<void> {
  const [row] = await prisma.$queryRaw<
    { db: string }[]
  >`SELECT current_database() AS db`;

  if (!isThrowawayName(row.db)) {
    throw new Error(
      [
        `REFUSING TO RUN: connected to database "${row.db}", which is not a throwaway.`,
        'The client resolved a different database than the URL that was validated.',
        'Production Supabase is named "postgres" — if that is what you see, stop.',
      ].join('\n')
    );
  }
}
