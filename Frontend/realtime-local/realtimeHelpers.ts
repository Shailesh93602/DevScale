import { createRequire } from 'node:module';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  expect,
  test,
  type Browser,
  type BrowserContext,
  type Page,
} from '@playwright/test';

// Shared by the realtime proofs. Local-only: fake auth, local Postgres.
// See Backend/docs/REALTIME_HOSTING.md.
const AUTH_URL = process.env.RT_FAKE_AUTH_URL || 'http://127.0.0.1:54399';
const DB_URL =
  process.env.RT_DATABASE_URL || 'postgresql://127.0.0.1:5434/eduscale_rt_test';
export const REST_HOST = process.env.RT_REST_HOST || 'http://127.0.0.1:4056';
export const REALTIME_HOST =
  process.env.RT_REALTIME_HOST || 'http://127.0.0.1:4055';

export interface PgClient {
  connect(): Promise<void>;
  end(): Promise<void>;
  query<R>(sql: string, params?: unknown[]): Promise<{ rows: R[] }>;
}
const backendRequire = createRequire(
  path.join(__dirname, '..', '..', 'Backend', 'package.json'),
);
const pg = backendRequire('pg') as {
  Client: new (o: { connectionString: string }) => PgClient;
};

export interface SocketEvent {
  name: string;
  data: Record<string, unknown>;
  at: number;
}

export interface Player {
  label: string;
  sub: string;
  context: BrowserContext;
  page: Page;
  events: SocketEvent[];
  /** Hosts that answered REST calls from this page, by method + path. */
  requests: { method: string; url: string }[];
  /** API responses >= 400 and uncaught page errors. */
  failures: string[];
  dbUserId?: string;
}

const COOKIE_CHUNK = 3180;

export async function signIn(browser: Browser, label: string): Promise<Player> {
  const sub = crypto.randomUUID();
  const res = await fetch(`${AUTH_URL}/__test/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sub,
      email: `rt-${label}-${sub.slice(0, 8)}@example.test`,
      first_name: label,
      last_name: 'Local',
    }),
  });
  expect(res.ok).toBe(true);
  const session = await res.json();

  // @supabase/ssr's browser client reads its session from this cookie.
  const name = `sb-${new URL(AUTH_URL).hostname.split('.')[0]}-auth-token`;
  const value =
    'base64-' + Buffer.from(JSON.stringify(session)).toString('base64url');
  const chunks =
    value.length <= COOKIE_CHUNK
      ? [{ name, value }]
      : (value.match(new RegExp(`.{1,${COOKIE_CHUNK}}`, 'g')) ?? []).map(
          (v, i) => ({ name: `${name}.${i}`, value: v }),
        );

  const context = await browser.newContext();
  const host = new URL(test.info().project.use.baseURL as string).hostname;
  await context.addCookies(
    chunks.map((c) => ({ ...c, domain: host, path: '/', sameSite: 'Lax' })),
  );
  const page = await context.newPage();
  const player: Player = {
    label,
    sub,
    context,
    page,
    events: [],
    requests: [],
    failures: [],
  };
  watch(player);
  return player;
}

/** Record every Socket.io event the BROWSER receives, and where REST went. */
function watch(player: Player) {
  player.page.on('websocket', (ws) => {
    ws.on('framereceived', ({ payload }) => {
      const text = typeof payload === 'string' ? payload : payload.toString();
      if (!text.startsWith('42')) return;
      try {
        const [name, data] = JSON.parse(text.slice(2)) as [
          string,
          Record<string, unknown>,
        ];
        player.events.push({ name, data: data ?? {}, at: Date.now() });
      } catch {
        // not an event frame
      }
    });
  });
  player.page.on('request', (req) => {
    const url = req.url();
    if (url.includes('/api/v1/')) {
      player.requests.push({ method: req.method(), url });
    }
  });
  player.page.on('response', (res) => {
    if (res.url().includes('/api/v1/') && res.status() >= 400) {
      player.failures.push(
        `${res.status()} ${res.request().method()} ${res.url()}`,
      );
    }
  });
  player.page.on('pageerror', (err) =>
    player.failures.push(`pageerror ${err.message}`),
  );
}

export function eventsNamed(p: Player, name: string) {
  return p.events.filter((e) => e.name === name);
}

export async function waitForEvent(
  p: Player,
  name: string,
  match: (d: Record<string, unknown>) => boolean = () => true,
  timeout = 45_000,
) {
  await expect
    .poll(() => eventsNamed(p, name).some((e) => match(e.data)), {
      timeout,
      message: `${p.label} should receive ${name}`,
    })
    .toBe(true);
}

export interface QuestionRow {
  id: string;
  order: number;
  question: string;
  correct_answer: number;
  time_limit: number;
}

export async function answer(p: Player, q: QuestionRow, option: number) {
  await expect(p.page.getByText(q.question)).toBeVisible({ timeout: 20_000 });
  const opts = p.page.locator('button', { hasText: /Answer \d+ \(/ });
  await opts.nth(option).click();
  await p.page.getByRole('button', { name: /submit answer/i }).click();
  await expect(
    p.page.getByText(/Correct! \+\d+ points|Incorrect — 0 points/),
  ).toBeVisible();
}

export const wrongOf = (q: QuestionRow) => (q.correct_answer + 1) % 4;

export async function openDb(): Promise<PgClient> {
  const db = new pg.Client({ connectionString: DB_URL });
  await db.connect();
  const live = await db.query<{ db: string }>(
    'select current_database() as db',
  );
  expect(live.rows[0].db).toMatch(/_(test|e2e)$/);
  return db;
}

/** The user row is synced by the page's first authed request, which can trail the UI. */
export async function syncedUserId(db: PgClient, p: Player): Promise<string> {
  let id: string | undefined;
  await expect
    .poll(
      async () => {
        const row = await db.query<{ id: string }>(
          'select id from "User" where supabase_id = $1',
          [p.sub],
        );
        id = row.rows[0]?.id;
        return row.rows.length;
      },
      { timeout: 20_000, message: `${p.label} should be synced` },
    )
    .toBe(1);
  return id!;
}

// Reload once the user row exists: the handshake rejects an unsynced user and the
// client never retries, so a first-visit socket misses `matchmaking:matched`.
export async function openInstantBattle(db: PgClient, p: Player) {
  const findMatch = p.page.getByRole('button', { name: /find instant match/i });
  await p.page.goto('/instant-battle');
  await expect(findMatch).toBeVisible({ timeout: 30_000 });
  p.dbUserId = await syncedUserId(db, p);
  await p.page.reload();
  await expect(findMatch).toBeVisible({ timeout: 30_000 });
}

/** The backend under test runs with both battle-flow flags on. */
export const FLOW_OPTIONS = process.env.RT_FLOW_OPTIONS === '1';
