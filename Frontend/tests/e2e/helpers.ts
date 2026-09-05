import { Page, BrowserContext, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

export const API_BASE =
  process.env.E2E_API_BASE ?? 'http://localhost:4010/api/v1';

// Credentials come from the environment — see tests/utils/testUsers.ts for why.
import { testUser, type UserKey } from '../utils/testUsers';

export { testUser };
export type { UserKey };

/**
 * Log in through the real UI. Every journey spec starts here rather than
 * injecting a session, because the login form + redirect is itself part of the
 * journey we are asserting.
 */
const loggedInAs = new WeakMap<Page, UserKey>();

export function currentUser(page: Page): UserKey {
  const who = loggedInAs.get(page);
  if (!who) throw new Error('login() must run before apiAs() on this page');
  return who;
}

export async function login(page: Page, who: UserKey) {
  const { email, password } = testUser(who);
  // Already signed in? /auth/login redirects straight to /dashboard and the
  // form never renders, so drop the existing session first. This makes login()
  // safe to call repeatedly — journeys switch roles mid-test.
  if (loggedInAs.has(page)) {
    if (loggedInAs.get(page) === who) return;
    await page.context().clearCookies();
    await page
      .evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      })
      .catch(() => {});
    loggedInAs.delete(page);
  }
  await page.goto('/auth/login');
  await page.fill('input[id="login-email"]', email);
  await page.fill('input[id="login-password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 90_000 });
  await expect(page).toHaveURL(/\/dashboard/);
  loggedInAs.set(page, who);
}

/**
 * Access token for direct API assertions.
 *
 * The app uses @supabase/ssr, which keeps the session in (chunked, base64
 * encoded) cookies rather than localStorage, so scraping it out of the browser
 * is brittle. Minting a token straight from Supabase with the same credentials
 * the UI just used is equivalent and stable. Tokens are cached per user so the
 * suite stays well under Supabase's auth rate limit.
 */
const tokenCache = new Map<string, string>();

function readEnv(name: string): string {
  if (process.env[name]) return process.env[name] as string;
  const envPath = path.join(__dirname, '..', '..', '.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
      if (!match || match[1] !== name) continue;
      const raw = match[2].trim();
      // Quoted values may be followed by a trailing comment.
      const quoted = raw.match(/^(["'])(.*?)\1/);
      return (quoted ? quoted[2] : raw.split(/\s+#/)[0]).trim();
    }
  }
  throw new Error(`missing env var ${name}`);
}

export async function tokenFor(page: Page, who: UserKey): Promise<string> {
  const cached = tokenCache.get(who);
  if (cached) return cached;
  const url = readEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = readEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  const res = await page.request.post(
    `${url}/auth/v1/token?grant_type=password`,
    {
      headers: { apikey: key, 'Content-Type': 'application/json' },
      data: testUser(who),
    },
  );
  const json = await res.json();
  if (!json?.access_token) {
    throw new Error(
      `Supabase sign-in failed for ${who}: ${JSON.stringify(json)}`,
    );
  }
  tokenCache.set(who, json.access_token);
  return json.access_token;
}

/** Authenticated API call as a specific role. */
export async function apiAs(
  page: Page,
  method: string,
  path: string,
  body?: unknown,
  who: UserKey = currentUser(page),
) {
  const token = await tokenFor(page, who);
  return page.request.fetch(API_BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-xsrf-token': 'e2e-csrf',
      Cookie: 'XSRF-TOKEN=e2e-csrf',
    },
    data: body as Record<string, unknown> | undefined,
  });
}

export interface PageProblems {
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: string[];
  brokenImages: string[];
}

/**
 * Attach console/network listeners BEFORE navigating, then call
 * `collectBrokenImages` after the page settles. Next.js dev-overlay and
 * third-party analytics noise is filtered so a failure means a real defect.
 */
export function watchPage(page: Page): PageProblems {
  const problems: PageProblems = {
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
    brokenImages: [],
  };

  const IGNORED = [
    /Download the React DevTools/i,
    /\[Fast Refresh\]/i,
    /webpack-hmr/i,
    /Sentry/i,
    // Sentry's tunnelRoute (next.config.mjs) proxies to ingest.sentry.io. With
    // no outbound network — CI, or a sandbox — it 500s. That is the telemetry
    // pipe, not the product.
    /\/monitoring(\?|$)/,
    /ingest\.[a-z]+\.sentry\.io/i,
    /favicon\.ico/i,
    /_next\/static\/development/i,
    // React 19 dev-only hydration hints that Next itself emits in dev mode.
    /Warning: Extra attributes from the server/i,
    // The browser logs this alongside every failed request; the `response`
    // listener below already records those WITH their URL, so counting the
    // console copy too would double-report and, worse, report ignored URLs
    // (the console line carries no URL to filter on).
    /^Failed to load resource:/i,
  ];
  const ignored = (text: string) => IGNORED.some((re) => re.test(text));

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (!ignored(text)) problems.consoleErrors.push(text);
  });
  page.on('pageerror', (err) => {
    if (!ignored(err.message)) problems.pageErrors.push(err.message);
  });
  page.on('requestfailed', (req) => {
    const url = req.url();
    if (ignored(url)) return;
    problems.failedRequests.push(
      `${req.method()} ${url} — ${req.failure()?.errorText}`,
    );
  });
  page.on('response', (res) => {
    const url = res.url();
    if (res.status() < 400 || ignored(url)) return;
    // 401 on an authenticated probe from a logged-out page is expected.
    if (res.status() === 401 || res.status() === 403) return;
    problems.failedRequests.push(
      `${res.status()} ${res.request().method()} ${url}`,
    );
  });

  return problems;
}

/** Every <img> that rendered with no intrinsic size actually failed to load. */
export async function collectBrokenImages(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    Array.from(document.images)
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.currentSrc || img.src),
  );
}

export async function settle(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page
    .waitForLoadState('networkidle', { timeout: 15_000 })
    .catch(() => {});
  await page.waitForTimeout(800);
}

/**
 * The fixtures Backend/qa/seed-e2e.mjs creates, resolved through the same
 * challenge list the journeys always read.
 *
 * A missing fixture FAILS the test. Every spec used to do
 * `test.skip(!topicId, 'run seed-e2e first')`, and a skipped test is green in
 * every summary line anyone reads — nothing distinguished "seeded and passing"
 * from "never ran". The seed is part of the documented setup, so its absence
 * is a broken environment, not a reason to report success.
 */
export const FIXTURE_CHALLENGE = 'QA E2E Two Sum';
export const FIXTURE_XSS_CHALLENGE = 'QA E2E XSS Probe';
export const SEED_HINT =
  'fixture missing — run `npm run qa:seed` in Backend/ against the local e2e database (docs/QA_COVERAGE.md)';

export interface FixtureChallenge {
  id: string;
  title: string;
  topicId?: string;
  topic_id?: string;
}

export async function fixtureChallenge(
  page: Page,
  title: string = FIXTURE_CHALLENGE,
): Promise<FixtureChallenge> {
  const res = await apiAs(page, 'GET', '/challenges?page=1&limit=100');
  const json = await res.json();
  const list: FixtureChallenge[] =
    json?.data?.challenges ??
    json?.data?.data ??
    (Array.isArray(json?.data) ? json.data : []);
  const found = list.find((c) => c.title === title);
  expect(found, `"${title}" — ${SEED_HINT}`).toBeTruthy();
  return found as FixtureChallenge;
}

export async function fixtureTopicId(page: Page): Promise<string> {
  const challenge = await fixtureChallenge(page);
  const topicId = challenge.topicId ?? challenge.topic_id;
  expect(
    topicId,
    `"${FIXTURE_CHALLENGE}" has no topic — ${SEED_HINT}`,
  ).toBeTruthy();
  return topicId as string;
}

/** A second, independent browser session — used for the two-player battle. */
export async function loginInContext(context: BrowserContext, who: UserKey) {
  const page = await context.newPage();
  await login(page, who);
  return page;
}
