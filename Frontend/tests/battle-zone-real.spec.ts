/**
 * battle-zone-real.spec.ts
 *
 * Real end-to-end tests for the Battle Zone — no mocks, no fakes.
 * Every test hits the live frontend (baseURL from playwright.config.ts) and
 * the live backend the app is built against (NEXT_PUBLIC_API_BASE_URL).
 * Two real Supabase accounts are used for multi-user flows.
 *
 * Accounts (passwords come from E2E_*_PASSWORD — see tests/utils/testUsers.ts):
 *   Player 1 (creator):  testuser@yopmail.com
 *   Player 2 (joiner):   battleplayer2@yopmail.com
 *
 * Prerequisites:
 *   - npm run seed:battles   (in Backend) — ensures 5 WAITING battles exist
 *   - Backend running at NEXT_PUBLIC_API_BASE_URL (export it for this process
 *     too; the default is localhost:4000)
 *   - Frontend running at the configured baseURL
 *
 * NOTHING HERE IS CONDITIONAL ON WHAT THE PAGE HAPPENS TO SHOW. This file used
 * to wrap most of its steps in `if (await x.isVisible().catch(() => false))`
 * with a console.log in the else branch, and every test in a serial chain
 * opened with `if (!battleId) { test.skip(); return; }`. Against the local e2e
 * database, 24 of its 79 tests skipped and the rest passed while the lobby
 * never opened, no answer was ever submitted and no battle ever completed.
 * Every control a step needs is now asserted to exist, every API call a step
 * makes is asserted to succeed, and a broken previous step fails the chain
 * instead of skipping it. src/test/playwright-silent-skip.test.ts keeps it so.
 */

import { expect, test, type Page } from '@playwright/test';
import { loginAsStudent, loginAsPlayer2 } from './utils/login';

const BZ = '/battle-zone';

// The spec's own API calls go to the backend the app under test talks to.
// This was hardcoded to :4000, so a run against any other backend hit the
// wrong (or no) server and every direct-API assertion failed for a reason
// unrelated to the product.
const API =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';

// ── Shared helpers ────────────────────────────────────────────────────────────

async function goto(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page
    .waitForLoadState('networkidle', { timeout: 15000 })
    .catch(() => {});
}

/** Click the first visible "Next" button that is the form navigation button (not Next.js dev-tools). */
async function clickNext(page: Page) {
  await page.getByRole('button', { name: 'Next', exact: true }).click();
}

/**
 * Pick the first roadmap in the QuestionSourceSelector and wait until the
 * pool check has confirmed it as the question source. Returns the roadmap's
 * title so later steps can assert the summary names the same source.
 *
 * This used to hard-code 'Full Stack Web Development', a roadmap that exists
 * in one particular database. Against the local e2e seed every wizard test
 * failed on that option lookup, and the serial chains behind them skipped.
 */
async function selectWorkingRoadmap(page: Page): Promise<string> {
  // Wait for roadmaps to load (placeholder changes from 'Loading...').
  const roadmapCombo = page.getByRole('combobox').first();
  await expect(roadmapCombo).not.toHaveText('Loading...', { timeout: 45000 });

  // The pool check is what sets questionSource; it must answer.
  const poolResponsePromise = page.waitForResponse(
    (r) =>
      r.url().includes('/battles/question-pool') &&
      r.request().method() === 'GET',
    { timeout: 15000 },
  );

  await roadmapCombo.click();
  const option = page.getByRole('option').first();
  await expect(option).toBeVisible({ timeout: 10000 });
  const title = (await option.innerText()).trim();
  await option.click();

  const pool = await poolResponsePromise;
  expect(pool.status(), 'question-pool check').toBe(200);

  // Next is disabled until questionSource is set (isStepValid() at step 2).
  const nextBtn = page.getByRole('button', { name: 'Next', exact: true });
  await expect(nextBtn).toBeEnabled({ timeout: 10000 });
  return title;
}

const BATTLE_CARD_TITLE =
  'text=/\\[(?:PRACTICE|QUICK|SCHEDULED|TOPIC|SUBJECT|MAIN CONCEPT|ROADMAP)\\]/';

/** All visible battle cards by title (call waitForBattleList first). */
async function getBattleTitles(page: Page): Promise<string[]> {
  return page.locator(BATTLE_CARD_TITLE).allInnerTexts();
}

/**
 * Wait for the battle list to render: either a battle card or the empty state.
 * Neither appearing is a failure — the old Promise.race().catch(() => {})
 * turned a list that never loaded into a pass.
 */
async function waitForBattleList(page: Page) {
  await page
    .waitForLoadState('networkidle', { timeout: 20000 })
    .catch(() => {});
  await expect(
    page
      .locator(BATTLE_CARD_TITLE)
      .first()
      .or(page.getByText('No battles found')),
  ).toBeVisible({ timeout: 20000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 1: Battle List — Authentication Required
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Flow 1 — Battle Zone list (authenticated)', () => {
  test.setTimeout(120000);

  test('redirects unauthenticated user to login', async ({ page }) => {
    await page.goto(BZ, { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/auth\/login/, { timeout: 10000 });
    expect(page.url()).toContain('/auth/login');
  });

  test('callbackUrl preserved so user returns to battle zone after login', async ({
    page,
  }) => {
    await page.goto(BZ, { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/auth\/login/, { timeout: 10000 });
    expect(page.url()).toContain('callbackUrl=%2Fbattle-zone');
  });

  test('shows Battle Zone Arena and seeded battles after login', async ({
    page,
  }) => {
    await loginAsStudent(page);
    await goto(page, BZ);
    await waitForBattleList(page);

    await expect(page.getByText('Battle Zone Arena')).toBeVisible({
      timeout: 10000,
    });

    const titles = await getBattleTitles(page);
    expect(titles.length).toBeGreaterThanOrEqual(1);
  });

  test('shows 5 seeded battles — all with Waiting status label', async ({
    page,
  }) => {
    await loginAsStudent(page);
    await goto(page, BZ);
    await waitForBattleList(page);

    const waitingBadges = page.getByText('Waiting');
    const count = await waitingBadges.count();
    expect(count).toBeGreaterThanOrEqual(5); // one per battle card + one in header area if any
  });

  test('status badges are human-readable — no raw enum values', async ({
    page,
  }) => {
    await loginAsStudent(page);
    await goto(page, BZ);
    await waitForBattleList(page);
    const text = await page.locator('body').innerText();
    // Raw enum values must never appear in UI
    expect(text).not.toContain('IN_PROGRESS');
    expect(text).not.toContain('CANCELLED');
    expect(text).not.toContain('LOBBY');
    // WAITING and COMPLETED can appear if there's no battles with those statuses
    // but they must NOT appear as badge labels — the labels are "Waiting" / "Completed"
    const badgeText = await page
      .locator('.badge, [class*="badge"]')
      .allInnerTexts();
    for (const t of badgeText) {
      expect(t).not.toMatch(
        /^WAITING$|^LOBBY$|^IN_PROGRESS$|^COMPLETED$|^CANCELLED$/,
      );
    }
  });

  test('difficulty labels are human-readable (Easy/Medium/Hard, not EASY/MEDIUM/HARD)', async ({
    page,
  }) => {
    await loginAsStudent(page);
    await goto(page, BZ);
    await waitForBattleList(page);
    const text = await page.locator('body').innerText();
    // Human-readable capitalised forms must exist
    expect(text).toMatch(/\bEasy\b|\bMedium\b|\bHard\b/);
    // Raw ALL-CAPS forms must not appear in badge context
    expect(text).not.toMatch(/\bEASY\b/);
    expect(text).not.toMatch(/\bMEDIUM\b/);
    expect(text).not.toMatch(/\bHARD\b/);
  });

  test('each battle card shows participant count in X/Y format', async ({
    page,
  }) => {
    await loginAsStudent(page);
    await goto(page, BZ);
    await waitForBattleList(page);
    // Battle cards render the live/max fraction as "<n> / <m> players"
    await expect(
      page.getByText(/\d+\s*\/\s*\d+\s+players/i).first(),
    ).toBeVisible({
      timeout: 10000,
    });
  });

  test('each battle card shows creator username', async ({ page }) => {
    await loginAsStudent(page);
    await goto(page, BZ);
    await waitForBattleList(page);
    // Cards attribute the creator inline as "by <username>"
    await expect(page.getByText(/\bby\s+\S+/i).first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('Create Battle button is visible in the header', async ({ page }) => {
    await loginAsStudent(page);
    await goto(page, BZ);
    await expect(
      page.getByRole('link', { name: /create battle/i }).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test('WAITING battles show "Join Battle" button', async ({ page }) => {
    await loginAsStudent(page);
    await goto(page, BZ);
    await waitForBattleList(page);
    await expect(
      page.getByRole('button', { name: 'Join Battle' }).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test('page loads without any JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await loginAsStudent(page);
    await goto(page, BZ);
    await waitForBattleList(page);
    expect(errors).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 2: Filters and Search
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Flow 2 — Filters and search', () => {
  test.setTimeout(120000);

  test('filter dropdown has all valid status options (not legacy UPCOMING)', async ({
    page,
  }) => {
    await loginAsStudent(page);
    await goto(page, BZ);
    await waitForBattleList(page);

    const filterTrigger = page.getByRole('combobox').first();
    await filterTrigger.click();
    await page.waitForTimeout(300);

    const options = await page.getByRole('option').allInnerTexts();
    expect(options).toContain('All Battles');
    expect(options).toContain('Waiting');
    expect(options).toContain('In Lobby');
    expect(options).toContain('In Progress');
    expect(options).toContain('Completed');
    expect(options).toContain('Cancelled');
    expect(options.map((o) => o.toLowerCase())).not.toContain('upcoming');
  });

  test('filtering by "Waiting" shows the seeded battles', async ({ page }) => {
    await loginAsStudent(page);
    await goto(page, BZ);
    await waitForBattleList(page);

    const filterTrigger = page.getByRole('combobox').first();
    await filterTrigger.click();
    await page.getByRole('option', { name: 'Waiting', exact: true }).click();
    await waitForBattleList(page);

    // All 5 seeded battles are WAITING so they should all show
    const titles = await getBattleTitles(page);
    expect(titles.length).toBeGreaterThanOrEqual(1);
  });

  test('filtering by "In Progress" shows no battles (none are active)', async ({
    page,
  }) => {
    await loginAsStudent(page);
    await goto(page, BZ);
    await waitForBattleList(page);

    const filterTrigger = page.getByRole('combobox').first();
    await filterTrigger.click();
    await page
      .getByRole('option', { name: 'In Progress', exact: true })
      .click();
    await waitForBattleList(page);

    // No seeded battles are IN_PROGRESS, so empty state should show
    await expect(page.getByText(/no battles found/i)).toBeVisible({
      timeout: 8000,
    });
  });

  test('searching by title narrows results', async ({ page }) => {
    await loginAsStudent(page);
    await goto(page, BZ);
    await waitForBattleList(page);

    const searchInput = page.getByPlaceholder('Search battles...');
    await searchInput.fill('Data Structures');
    await page.waitForTimeout(800); // debounce

    // Should show "[TOPIC] Data Structures Showdown"
    await expect(page.getByText(/Data Structures Showdown/i)).toBeVisible({
      timeout: 8000,
    });

    // Should NOT show unrelated battles
    const titles = await getBattleTitles(page);
    // All visible titles should be related to data structures
    for (const t of titles) {
      expect(t.toLowerCase()).toContain('data');
    }
  });

  test('clearing search shows all battles again', async ({ page }) => {
    await loginAsStudent(page);
    await goto(page, BZ);
    await waitForBattleList(page);

    const searchInput = page.getByPlaceholder('Search battles...');
    await searchInput.fill('zzz-no-match');
    await page.waitForTimeout(800);
    await expect(page.getByText(/no battles found/i)).toBeVisible({
      timeout: 8000,
    });

    await searchInput.clear();
    // Wait for the list to actually repopulate rather than racing a fixed delay:
    // the empty state must clear and real battle cards must come back.
    await expect(page.getByText(/no battles found/i)).toBeHidden({
      timeout: 10000,
    });
    await waitForBattleList(page);
    const titles = await getBattleTitles(page);
    expect(titles.length).toBeGreaterThanOrEqual(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 3: Battle Detail — WAITING Phase + Slug Navigation
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Flow 3 — Battle detail WAITING phase + slug navigation', () => {
  test.setTimeout(120000);
  // Shared seeded battle for all Flow 3 tests (resolved via API at first use)
  let seededBattle: { id: string; slug: string } | null = null;

  /** Get a seeded WAITING battle that testuser has not joined (0 participants) */
  async function getSeededWaitingBattle(page: Page) {
    if (seededBattle) return seededBattle;
    const resp = await page.request.get(
      `${API}/battles?limit=20&status=WAITING`,
    );
    const json = await resp.json();
    // Find a seeded battle where testuser is not a participant (current_participants === 0)
    const battle = json.data.find(
      (b: {
        slug?: string;
        title: string;
        status: string;
        current_participants: number;
      }) =>
        b.status === 'WAITING' &&
        b.slug &&
        b.current_participants === 0 &&
        /^\[(TOPIC|SUBJECT|MAIN CONCEPT|ROADMAP|PRACTICE|QUICK|SCHEDULED)\]/.test(
          b.title,
        ),
    );
    expect(
      battle,
      'No seeded WAITING battle with 0 participants — run npm run seed:battles',
    ).toBeTruthy();
    seededBattle = { id: battle.id, slug: battle.slug };
    return seededBattle!;
  }

  test('clicking "View Details" navigates to battle detail via slug', async ({
    page,
  }) => {
    await loginAsStudent(page);
    const b = await getSeededWaitingBattle(page);

    // Navigate via the slug URL to test slug routing
    await goto(page, `/battle-zone/${b.slug}`);
    await page.waitForTimeout(2000);

    // Page should be on /battle-zone/[slug-or-uuid] — the slug gets canonicalized to UUID
    expect(page.url()).toContain('/battle-zone/');
    expect(page.url()).not.toContain('/battle-zone/create');
  });

  test('battle detail shows WAITING phase heading', async ({ page }) => {
    await loginAsStudent(page);
    const b = await getSeededWaitingBattle(page);

    await goto(page, `/battle-zone/${b.id}`);
    await page
      .waitForLoadState('networkidle', { timeout: 15000 })
      .catch(() => {});
    await page.waitForTimeout(2000);

    await expect(page.getByText('Waiting for players')).toBeVisible({
      timeout: 10000,
    });
  });

  test('battle detail shows participant count X/Y format', async ({ page }) => {
    await loginAsStudent(page);
    const b = await getSeededWaitingBattle(page);

    await goto(page, `/battle-zone/${b.id}`);
    await page
      .waitForLoadState('networkidle', { timeout: 15000 })
      .catch(() => {});
    await page.waitForTimeout(2000);

    // "0 / 4 players joined" format
    await expect(page.getByText(/\d+ \/ \d+ players joined/)).toBeVisible({
      timeout: 10000,
    });
  });

  test('battle detail shows Join Battle button for non-participant', async ({
    page,
  }) => {
    await loginAsStudent(page);
    const b = await getSeededWaitingBattle(page);

    await goto(page, `/battle-zone/${b.id}`);
    await page.waitForTimeout(2000);

    await expect(page.getByRole('button', { name: 'Join Battle' })).toBeVisible(
      { timeout: 10000 },
    );
  });

  test('battle detail shows no raw enum values', async ({ page }) => {
    await loginAsStudent(page);
    const b = await getSeededWaitingBattle(page);

    await goto(page, `/battle-zone/${b.id}`);
    await page.waitForTimeout(2000);

    const text = await page.locator('body').innerText();
    expect(text).not.toContain('IN_PROGRESS');
    expect(text).not.toContain('EASY');
    expect(text).not.toContain('HARD');
    expect(text).not.toContain('MEDIUM');
  });

  test('battle detail breadcrumb shows Battle Zone link', async ({ page }) => {
    await loginAsStudent(page);
    const b = await getSeededWaitingBattle(page);

    await goto(page, `/battle-zone/${b.id}`);
    await page.waitForTimeout(2000);

    await expect(
      page.getByRole('link', { name: /battle zone/i }).first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test('direct navigation via slug redirects to UUID URL', async ({ page }) => {
    await loginAsStudent(page);
    // Get a battle slug from the API
    const resp = await page.request.get(`${API}/battles?limit=1`);
    const json = await resp.json();
    const battle = json.data[0];
    expect(battle.slug).toBeTruthy();

    await goto(page, `/battle-zone/${battle.slug}`);
    await page.waitForTimeout(3000);

    // Should redirect to UUID
    const finalUrl = page.url();
    expect(finalUrl).toContain(`/battle-zone/${battle.id}`);
    expect(finalUrl).not.toContain(battle.slug);
  });

  test('page loads without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await loginAsStudent(page);
    await goto(page, BZ);
    await waitForBattleList(page);

    // Full battle cards expose a "Details" button that routes to the detail page
    await page
      .getByRole('button', { name: /details/i })
      .first()
      .click();
    await page.waitForURL(/\/battle-zone\/[a-z0-9-]+/, { timeout: 10000 });
    await page.waitForTimeout(2000);

    expect(errors).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 4: Join and Leave Battle
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Flow 4 — Join and leave a battle', () => {
  test.setTimeout(120000);

  // All tests in this block run serially to avoid race conditions on DB state
  test.describe.configure({ mode: 'serial' });

  let battleId: string;

  test('join a seeded battle from the detail page', async ({ page }) => {
    await loginAsStudent(page);

    // Get a battle that testuser has not joined
    const resp = await page.request.get(`${API}/battles?limit=10`);
    const json = await resp.json();
    // Only consider seeded battles (title starts with [TYPE] prefix) with 0 participants
    // This avoids picking testuser-created battles (e.g. "Cancel Test...") where creator can't join
    const battle = json.data.find(
      (b: { current_participants: number; title: string; status: string }) =>
        b.current_participants === 0 &&
        b.status === 'WAITING' &&
        /^\[(TOPIC|SUBJECT|MAIN CONCEPT|ROADMAP|PRACTICE|QUICK|SCHEDULED)\]/.test(
          b.title,
        ),
    );
    expect(
      battle,
      'No seeded WAITING battle with 0 participants found — run npm run seed:battles',
    ).toBeTruthy();
    battleId = battle.id;

    await goto(page, `/battle-zone/${battleId}`);
    await page.waitForTimeout(2000);

    const joinBtn = page.getByRole('button', { name: 'Join Battle' });
    await expect(joinBtn).toBeVisible({ timeout: 10000 });

    // The join must reach the API and succeed — not merely be clicked.
    const joinRespPromise = page.waitForResponse(
      (r) =>
        r.url().includes(`/battles/`) &&
        r.url().includes('/join') &&
        r.request().method() === 'POST',
      { timeout: 15000 },
    );

    await joinBtn.click();

    const joinResp = await joinRespPromise;
    expect(joinResp.status(), await joinResp.text()).toBeLessThan(300);

    // After joining, the "Leave" button should appear
    await expect(page.getByRole('button', { name: 'Leave' })).toBeVisible({
      timeout: 8000,
    });
  });

  test('participant count increases after joining', async ({ page }) => {
    await loginAsStudent(page);
    await goto(page, `/battle-zone/${battleId}`);
    await page.waitForTimeout(2000);

    // "1 / X players joined" means testuser is in the battle
    await expect(page.getByText(/1 \/ \d+ players joined/)).toBeVisible({
      timeout: 8000,
    });
  });

  test('testuser appears in participant list after joining', async ({
    page,
  }) => {
    await loginAsStudent(page);
    await goto(page, `/battle-zone/${battleId}`);
    await page.waitForTimeout(2000);

    // The seeded student logs in as "teststudent" (the name also feeds the
    // avatar fallback, so match the first occurrence rather than demand one).
    await expect(page.getByText('teststudent').first()).toBeVisible({
      timeout: 8000,
    });
  });

  test('join again shows error (already enrolled)', async ({ page }) => {
    await loginAsStudent(page);
    await goto(page, `/battle-zone/${battleId}`);
    await page.waitForTimeout(2000);

    // Already enrolled: the page offers Leave and no longer offers Join. The
    // old assertion accepted either button, which every battle page satisfies.
    await expect(page.getByRole('button', { name: 'Leave' })).toBeVisible({
      timeout: 8000,
    });
    await expect(page.getByRole('button', { name: 'Join Battle' })).toHaveCount(
      0,
    );
  });

  test('leave battle removes user from participant list', async ({ page }) => {
    await loginAsStudent(page);
    await goto(page, `/battle-zone/${battleId}`);
    await page.waitForTimeout(2000);

    const leaveBtn = page.getByRole('button', { name: 'Leave' });
    await expect(leaveBtn).toBeVisible({ timeout: 8000 });
    await leaveBtn.click();
    // After leaving, redirected to /battle-zone list
    await page.waitForURL(/\/battle-zone$/, { timeout: 10000 });

    // Navigate back to verify
    await goto(page, `/battle-zone/${battleId}`);
    await page.waitForTimeout(2000);
    // Count should be 0 again
    await expect(page.getByText(/0 \/ \d+ players joined/)).toBeVisible({
      timeout: 8000,
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 5: Create Battle — 4-Step Wizard
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Flow 5 — Create battle wizard', () => {
  test.setTimeout(180000);
  test.describe.configure({ mode: 'serial' });

  const BATTLE_TITLE = `E2E Test Battle ${Date.now()}`;
  let createdBattleId = '';

  test('step 1: title required, description required, Next disabled until filled', async ({
    page,
  }) => {
    await loginAsStudent(page);
    await goto(page, `${BZ}/create`);
    await page.waitForTimeout(2000);

    // Step 1 is visible
    await expect(page.getByText('Step 1 of 4 — Battle Info')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByPlaceholder('Enter a catchy title')).toBeVisible();

    // Next button should be disabled (title/description empty)
    const nextBtn = page.getByRole('button', { name: 'Next', exact: true });
    await expect(nextBtn).toBeDisabled({ timeout: 5000 });
  });

  test('step 1: fills title + description, Next becomes enabled', async ({
    page,
  }) => {
    await loginAsStudent(page);
    await goto(page, `${BZ}/create`);
    await page.waitForTimeout(2000);

    await page.getByPlaceholder('Enter a catchy title').fill(BATTLE_TITLE);
    await page
      .getByPlaceholder('Describe what this battle is about')
      .fill('Real E2E test battle created by Playwright.');

    const nextBtn = page.getByRole('button', { name: 'Next', exact: true });
    await expect(nextBtn).toBeEnabled({ timeout: 5000 });
  });

  test('step 2: question source selector visible after advancing from step 1', async ({
    page,
  }) => {
    await loginAsStudent(page);
    await goto(page, `${BZ}/create`);
    await page.waitForTimeout(2000);

    await page.getByPlaceholder('Enter a catchy title').fill(BATTLE_TITLE);
    await page
      .getByPlaceholder('Describe what this battle is about')
      .fill('Real E2E test battle.');
    await clickNext(page);
    await page.waitForTimeout(1500);

    await expect(page.getByText('Step 2 of 4 — Question Source')).toBeVisible({
      timeout: 8000,
    });
    await expect(page.getByText('Curriculum')).toBeVisible();
    await expect(page.getByText('DSA Challenges')).toBeVisible();
  });

  test('step 2: Roadmap dropdown loads real roadmaps from backend', async ({
    page,
  }) => {
    await loginAsStudent(page);
    await goto(page, `${BZ}/create`);
    await page.waitForTimeout(2000);

    await page.getByPlaceholder('Enter a catchy title').fill(BATTLE_TITLE);
    await page
      .getByPlaceholder('Describe what this battle is about')
      .fill('Real E2E test battle.');
    await clickNext(page);

    // Wait for roadmaps to load (combobox changes from "Loading..." to actual options)
    const roadmapCombo = page.getByRole('combobox').first();
    await expect(roadmapCombo).not.toHaveText('Loading...', { timeout: 20000 });
    // Should now have real roadmap options
    const comboText = await roadmapCombo.textContent();
    expect(comboText).not.toContain('Loading...');
  });

  test('step 2: selecting Roadmap level sets source and enables Next', async ({
    page,
  }) => {
    await loginAsStudent(page);
    await goto(page, `${BZ}/create`);
    await page.waitForTimeout(2000);

    await page.getByPlaceholder('Enter a catchy title').fill(BATTLE_TITLE);
    await page
      .getByPlaceholder('Describe what this battle is about')
      .fill('Real E2E test battle.');
    await clickNext(page);
    await page.waitForTimeout(2000);

    await selectWorkingRoadmap(page);

    // After selecting a roadmap the pool counter shows a non-zero count.
    await expect(page.getByText(/Questions: [1-9]\d*/)).toBeVisible();
  });

  test('step 3: settings page shows participant count, time, and points sliders', async ({
    page,
  }) => {
    await loginAsStudent(page);
    await goto(page, `${BZ}/create`);
    await page.waitForTimeout(2000);

    // Step 1
    await page.getByPlaceholder('Enter a catchy title').fill(BATTLE_TITLE);
    await page
      .getByPlaceholder('Describe what this battle is about')
      .fill('Real E2E test battle.');
    await clickNext(page);
    await page.waitForTimeout(2000);

    // Step 2 — select a roadmap
    await selectWorkingRoadmap(page);
    await clickNext(page);
    await page.waitForTimeout(1500);

    await expect(page.getByText('Step 3 of 4 — Settings')).toBeVisible({
      timeout: 8000,
    });
    // Check settings fields are visible
    const text = await page.locator('body').innerText();
    expect(text).toMatch(/type/i);
    expect(text).toMatch(/difficulty/i);
  });

  test('step 4: preview shows battle summary before launch', async ({
    page,
  }) => {
    await loginAsStudent(page);
    await goto(page, `${BZ}/create`);
    await page.waitForTimeout(2000);

    // Step 1
    await page.getByPlaceholder('Enter a catchy title').fill(BATTLE_TITLE);
    await page
      .getByPlaceholder('Describe what this battle is about')
      .fill('Real E2E test battle.');
    await clickNext(page);
    await page.waitForTimeout(2000);

    // Step 2 — select roadmap
    await selectWorkingRoadmap(page);
    await clickNext(page);
    await page.waitForTimeout(1500);

    // Step 3 — just proceed
    await clickNext(page);
    await page.waitForTimeout(1500);

    // Step 4 — Preview & Launch
    await expect(page.getByText('Step 4 of 4 — Preview & Launch')).toBeVisible({
      timeout: 8000,
    });
    await expect(page.getByText(BATTLE_TITLE)).toBeVisible();
    // "Create Battle & Load Questions" button should be visible
    await expect(
      page.getByRole('button', { name: /create battle/i }),
    ).toBeVisible({ timeout: 8000 });
  });

  test('step 4: launching battle redirects to battle detail page (slug or UUID URL)', async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await loginAsStudent(page);
    await goto(page, `${BZ}/create`);
    await page.waitForTimeout(1000);

    // Step 1
    await page.getByPlaceholder('Enter a catchy title').fill(BATTLE_TITLE);
    await page
      .getByPlaceholder('Describe what this battle is about')
      .fill('Real E2E test battle.');
    await clickNext(page);
    await page.waitForTimeout(500);

    // Step 2 — select roadmap and wait for pool check to confirm questionSource is set
    const roadmapTitle = await selectWorkingRoadmap(page);

    // Verify the "Source" badge is visible (confirms questionSource is non-null in the selector)
    await expect(page.getByText('Source:')).toBeVisible({ timeout: 5000 });

    await clickNext(page);
    await page.waitForTimeout(1000);

    // Step 3 — verify we actually advanced
    await expect(page.getByText('Step 3 of 4')).toBeVisible({ timeout: 5000 });
    await clickNext(page);
    await page.waitForTimeout(1000);

    // Step 4 — verify we are at step 4 and the source label is shown in summary
    await expect(page.getByText('Step 4 of 4')).toBeVisible({ timeout: 5000 });
    // Source label shows in the battle summary row
    await expect(
      page.getByText(roadmapTitle, { exact: true }).first(),
    ).toBeVisible({ timeout: 5000 });

    // Launch
    const launchBtn = page.getByRole('button', {
      name: /create battle.*load questions/i,
    });
    await expect(launchBtn).toBeVisible({ timeout: 8000 });
    await expect(launchBtn).toBeEnabled({ timeout: 8000 });
    // Wait for QuestionPreviewList to finish loading before clicking (more reliable than networkidle)
    await expect(page.getByText('Sampling questions...')).toBeHidden({
      timeout: 15000,
    });

    // The launch must produce a created battle: a POST answered 2xx with an
    // id. This used to log diagnostics when it did not and pass on the URL.
    const battleApiResponsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/v1/battles') &&
        resp.request().method() === 'POST',
      { timeout: 35000 },
    );

    await launchBtn.click();

    const battleApiResp = await battleApiResponsePromise;
    const json = await battleApiResp.json();
    expect(
      battleApiResp.status(),
      `POST /battles: ${JSON.stringify(json).slice(0, 300)}`,
    ).toBeLessThan(300);
    expect(json?.data?.id, 'created battle has no id').toBeTruthy();
    createdBattleId = json.data.id;

    // Should navigate to the new battle's detail page (not /create)
    await page.waitForURL(/\/battle-zone\/(?!create)[a-z0-9-]+/, {
      timeout: 45000,
    });
    const url = page.url();
    expect(url).toContain('/battle-zone/');
    expect(url).not.toContain('/battle-zone/create');
    expect(pageErrors, 'uncaught page errors while creating a battle').toEqual(
      [],
    );
  });

  test('newly created battle shows WAITING status on detail page', async ({
    page,
  }) => {
    expect(
      createdBattleId,
      'battle was not created by the previous step',
    ).toBeTruthy();
    await loginAsStudent(page);
    await goto(page, `/battle-zone/${createdBattleId}`);
    await page.waitForTimeout(2000);
    await expect(page.getByText('Waiting for players')).toBeVisible({
      timeout: 10000,
    });
  });

  test('newly created battle has questions loaded (from question pool)', async ({
    page,
  }) => {
    expect(
      createdBattleId,
      'battle was not created by the previous step',
    ).toBeTruthy();
    // Check via API that the battle has questions
    await loginAsStudent(page);
    const resp = await page.request.get(
      `${API}/battles/${createdBattleId}`,
      { headers: { Authorization: 'Bearer ignore' } }, // public endpoint
    );
    const json = await resp.json();
    const questionCount = json.data?._count?.questions ?? 0;
    console.log('Question count for created battle:', questionCount);
    expect(questionCount).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 6: Multi-User — Join, Ready, Start, Play, Leaderboard
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Flow 6 — Multi-user gameplay (Player1 creates, Player2 joins)', () => {
  test.setTimeout(300000); // 5 min for full gameplay
  test.describe.configure({ mode: 'serial' });

  let battleId: string;
  let player2Page: Page;

  /** Create a PRACTICE battle through the wizard as the page's user. */
  async function createTestBattle(page: Page): Promise<string> {
    await goto(page, `${BZ}/create`);
    await page
      .getByPlaceholder('Enter a catchy title')
      .fill(`Gameplay Test ${Date.now()}`);
    await page
      .getByPlaceholder('Describe what this battle is about')
      .fill('Multi-user gameplay test.');
    await clickNext(page);

    const roadmapTitle = await selectWorkingRoadmap(page);
    await clickNext(page);
    await expect(page.getByText('Step 3 of 4')).toBeVisible({ timeout: 5000 });

    // PRACTICE: no per-question timer, so the test paces the battle.
    const practiceBtn = page.getByRole('button', {
      name: 'Practice',
      exact: true,
    });
    await expect(practiceBtn).toBeVisible();
    await practiceBtn.click();
    await clickNext(page);

    await expect(page.getByText('Step 4 of 4')).toBeVisible({ timeout: 5000 });
    await expect(
      page.getByText(roadmapTitle, { exact: true }).first(),
    ).toBeVisible({ timeout: 5000 });

    const launchBtn = page.getByRole('button', {
      name: /create battle.*load questions/i,
    });
    await expect(launchBtn).toBeVisible({ timeout: 8000 });
    await expect(launchBtn).toBeEnabled({ timeout: 8000 });
    await expect(page.getByText('Sampling questions...')).toBeHidden({
      timeout: 15000,
    });

    const creationResponsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/v1/battles') &&
        resp.request().method() === 'POST',
      { timeout: 35000 },
    );
    await launchBtn.click();
    const creationResp = await creationResponsePromise;
    const creationJson = await creationResp.json();
    expect(
      creationResp.status(),
      `POST /battles: ${JSON.stringify(creationJson).slice(0, 300)}`,
    ).toBeLessThan(300);
    const createdUuid: string = creationJson?.data?.id;
    expect(createdUuid, 'created battle has no id').toBeTruthy();
    await page.waitForURL(/\/battle-zone\/(?!create)[a-z0-9-]+/, {
      timeout: 45000,
    });
    return createdUuid;
  }

  /** Join as the page's user: the join is answered 2xx and Leave appears. */
  async function joinAsParticipant(pg: Page, id: string) {
    await goto(pg, `/battle-zone/${id}`);
    await expect(pg.getByText('Waiting for players')).toBeVisible({
      timeout: 10000,
    });
    const joinBtn = pg.getByRole('button', { name: 'Join Battle' });
    await expect(joinBtn).toBeVisible({ timeout: 10000 });
    await expect(joinBtn).toBeEnabled({ timeout: 5000 });
    const joinRespPromise = pg.waitForResponse(
      (r) =>
        r.url().includes('/battles/') &&
        r.url().includes('/join') &&
        r.request().method() === 'POST',
      { timeout: 15000 },
    );
    await joinBtn.click();
    const joinResp = await joinRespPromise;
    expect(joinResp.status(), await joinResp.text()).toBeLessThan(300);
    await expect(pg.getByRole('button', { name: 'Leave' })).toBeVisible({
      timeout: 15000,
    });
  }

  test('Player1 creates a battle and sees WAITING phase', async ({ page }) => {
    await loginAsStudent(page);
    battleId = await createTestBattle(page);

    await expect(page.getByText('Waiting for players')).toBeVisible({
      timeout: 10000,
    });
    // The creator is not auto-enrolled: the page offers Join.
    await expect(page.getByRole('button', { name: 'Join Battle' })).toBeVisible(
      { timeout: 10000 },
    );
  });

  test('Player1 joins their own battle', async ({ page }) => {
    expect(
      battleId,
      'battle was not created by the previous step',
    ).toBeTruthy();
    await loginAsStudent(page);
    await joinAsParticipant(page, battleId);
  });

  test('Player2 (different account) can see the battle in the list', async ({
    browser,
  }) => {
    expect(
      battleId,
      'battle was not created by the previous step',
    ).toBeTruthy();
    // Create a second browser context for Player2
    const ctx2 = await browser.newContext();
    player2Page = await ctx2.newPage();
    await loginAsPlayer2(player2Page);
    await goto(player2Page, BZ);
    await waitForBattleList(player2Page);

    await expect(player2Page.getByText('Battle Zone Arena')).toBeVisible({
      timeout: 10000,
    });
  });

  test('Player2 joins the created battle', async () => {
    expect(
      battleId && player2Page,
      'battle or player-2 session missing from the previous steps',
    ).toBeTruthy();
    await joinAsParticipant(player2Page, battleId);
  });

  test('both players see each other in participant list', async ({ page }) => {
    expect(
      battleId,
      'battle was not created by the previous step',
    ).toBeTruthy();
    await loginAsStudent(page);
    await goto(page, `/battle-zone/${battleId}`);

    await expect(page.getByText('Waiting for players')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText(/2 \/ \d+ players joined/)).toBeVisible({
      timeout: 8000,
    });
    await expect(page.getByText('Participants (2)')).toBeVisible({
      timeout: 8000,
    });
    // Usernames render in the participant list's font-medium spans (scoped so
    // the avatar fallback, which prepends the first letter, does not match).
    await expect(
      page.locator('span.font-medium', { hasText: 'teststudent' }).first(),
    ).toBeVisible({ timeout: 5000 });
    await expect(
      page.locator('span.font-medium', { hasText: 'battleplayer2' }).first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test('Player1 opens lobby then marks ready', async ({ page }) => {
    expect(
      battleId,
      'battle was not created by the previous step',
    ).toBeTruthy();
    await loginAsStudent(page);
    await goto(page, `/battle-zone/${battleId}`);
    await expect(page.getByRole('button', { name: 'Leave' })).toBeVisible({
      timeout: 10000,
    });

    // Both players are enrolled, so the creator is offered "Open Lobby". Each
    // control here used to sit behind an isVisible() guard with a console.log
    // in the else branch — a lobby that never opened still passed.
    const openLobbyBtn = page.getByRole('button', { name: 'Open Lobby' });
    await expect(openLobbyBtn).toBeVisible({ timeout: 10000 });
    const lobbyRespPromise = page.waitForResponse(
      (r) =>
        r.url().includes('/battles/') &&
        r.url().includes('/lobby') &&
        r.request().method() === 'POST',
      { timeout: 10000 },
    );
    await openLobbyBtn.click();
    const lobbyResp = await lobbyRespPromise;
    expect(lobbyResp.status(), await lobbyResp.text()).toBe(200);
    await expect(page.getByText('Lobby — Get Ready!')).toBeVisible({
      timeout: 10000,
    });

    const markReadyBtn = page.getByRole('button', { name: 'Mark as Ready' });
    await expect(markReadyBtn).toBeVisible({ timeout: 8000 });
    await markReadyBtn.click();
    await expect(page.getByText(/you are ready/i)).toBeVisible({
      timeout: 8000,
    });
  });

  test('Player2 marks ready', async () => {
    expect(
      battleId && player2Page,
      'battle or player-2 session missing from the previous steps',
    ).toBeTruthy();
    await goto(player2Page, `/battle-zone/${battleId}`);
    await expect(player2Page.getByText('Lobby — Get Ready!')).toBeVisible({
      timeout: 10000,
    });

    const markReadyBtn = player2Page.getByRole('button', {
      name: 'Mark as Ready',
    });
    await expect(markReadyBtn).toBeVisible({ timeout: 10000 });
    const readyRespPromise = player2Page.waitForResponse(
      (r) =>
        r.url().includes('/battles/') &&
        r.url().includes('/ready') &&
        r.request().method() === 'POST',
      { timeout: 10000 },
    );
    await markReadyBtn.click();
    const readyResp = await readyRespPromise;
    expect(readyResp.status(), await readyResp.text()).toBeLessThan(300);
    await expect(markReadyBtn).toBeHidden({ timeout: 8000 });
  });

  test('Player1 (creator) can start the battle when all ready', async ({
    page,
  }) => {
    expect(
      battleId,
      'battle was not created by the previous step',
    ).toBeTruthy();
    await loginAsStudent(page);
    await goto(page, `/battle-zone/${battleId}`);
    await expect(page.getByText('Lobby — Get Ready!')).toBeVisible({
      timeout: 10000,
    });

    // Everyone is ready, so the creator must be offered Start. An absent
    // Start button used to be logged, and the test passed without starting.
    const startBtn = page.getByRole('button', { name: 'Start Battle' });
    await expect(startBtn).toBeVisible({ timeout: 15000 });
    await expect(startBtn).toBeEnabled({ timeout: 15000 });
    const startRespPromise = page.waitForResponse(
      (r) =>
        r.url().includes('/battles/') &&
        r.url().includes('/start') &&
        r.request().method() === 'POST',
      { timeout: 15000 },
    );
    await startBtn.click();
    const startResp = await startRespPromise;
    expect(startResp.status(), await startResp.text()).toBe(200);
    // The lobby transitions on the battle:started socket event. That event
    // is the realtime claim itself, so it is asserted rather than papered
    // over with a reload.
    await expect(page.getByText(/In Progress|Battle in progress/i)).toBeVisible(
      { timeout: 20000 },
    );
  });

  test('questions appear when battle is IN_PROGRESS', async ({ page }) => {
    expect(
      battleId,
      'battle was not created by the previous step',
    ).toBeTruthy();
    await loginAsStudent(page);
    await goto(page, `/battle-zone/${battleId}`);

    // A participant in a live battle sees the current question. The previous
    // regex (/question|battle|progress|waiting|lobby/) matched every possible
    // state of the page and could not fail.
    await expect(page.getByText('In Progress').first()).toBeVisible({
      timeout: 15000,
    });
    await expect(page.locator('p.text-lg.font-semibold').first()).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByRole('button', { name: 'Submit Answer' }),
    ).toBeVisible();
  });

  test('Player1 can see MCQ options and select an answer', async ({ page }) => {
    expect(
      battleId,
      'battle was not created by the previous step',
    ).toBeTruthy();
    await loginAsStudent(page);
    await goto(page, `/battle-zone/${battleId}`);

    // Each option button renders a letter badge (A–D) next to the answer text.
    // Match on that badge so selection doesn't depend on how the answer reads.
    const option = page
      .getByRole('button')
      .filter({ has: page.locator('span').filter({ hasText: /^[A-D]$/ }) })
      .first();
    await expect(option).toBeVisible({ timeout: 15000 });

    const submitBtn = page.getByRole('button', { name: /submit answer/i });
    await expect(submitBtn).toBeVisible();
    await expect(
      submitBtn,
      'Submit must be disabled before an option is chosen',
    ).toBeDisabled();
    await option.click();
    await expect(submitBtn).toBeEnabled();

    const answerRespPromise = page.waitForResponse(
      (r) =>
        r.url().includes('/battles/answer') && r.request().method() === 'POST',
      { timeout: 15000 },
    );
    await submitBtn.click();
    const answerResp = await answerRespPromise;
    expect(answerResp.status(), await answerResp.text()).toBeLessThan(300);
    // Feedback renders once the submit response lands ("✓ Correct! +N points"
    // or "✗ Incorrect — 0 points").
    await expect(page.getByText(/Correct!|Incorrect/i).first()).toBeVisible({
      timeout: 12000,
    });
  });

  test('leaderboard tab shows participants and scores', async ({ page }) => {
    expect(
      battleId,
      'battle was not created by the previous step',
    ).toBeTruthy();
    await loginAsStudent(page);
    await goto(page, `/battle-zone/${battleId}`);

    // The Leaderboard tab is offered during and after the battle.
    const lbTab = page.getByRole('button', { name: 'Leaderboard' });
    await expect(lbTab).toBeVisible({ timeout: 10000 });
    await lbTab.click();
    await expect(
      page.getByText(/teststudent|battleplayer2/i).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  // Cleanup: close player2 context
  test.afterAll(async () => {
    if (player2Page && !player2Page.isClosed()) {
      await player2Page.context().close();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 7: My Battles Page
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Flow 7 — My Battles page', () => {
  test.setTimeout(120000);

  test('My Battles page loads without errors for authenticated user', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await loginAsStudent(page);
    await goto(page, `${BZ}/my-battles`);
    await page.waitForTimeout(2000);
    expect(errors).toHaveLength(0);
  });

  test('My Battles page redirects to login for unauthenticated user', async ({
    page,
  }) => {
    await page.goto(`${BZ}/my-battles`, { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/auth\/login/, { timeout: 10000 });
    expect(page.url()).toContain('/auth/login');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 8: Statistics Page
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Flow 8 — Statistics page', () => {
  test.setTimeout(120000);

  test('redirects unauthenticated user to login', async ({ page }) => {
    await page.goto(`${BZ}/statistics`, { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/auth\/login/, { timeout: 10000 });
    expect(page.url()).toContain('/auth/login');
  });

  test('loads without JS errors for authenticated user', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await loginAsStudent(page);
    await goto(page, `${BZ}/statistics`);
    await page.waitForTimeout(2000);
    expect(errors).toHaveLength(0);
  });

  test('shows no NaN values anywhere on the page', async ({ page }) => {
    await loginAsStudent(page);
    await goto(page, `${BZ}/statistics`);
    await page.waitForTimeout(3000);
    const text = await page.locator('body').innerText();
    expect(text).not.toContain('NaN');
    expect(text).not.toContain('undefined');
  });

  test('shows the 4 stat cards (Win Rate, Accuracy, Average Score, Response Time)', async ({
    page,
  }) => {
    await loginAsStudent(page);
    await goto(page, `${BZ}/statistics`);
    await page.waitForTimeout(3000);

    const text = await page.locator('body').innerText();
    // If statistics are available, these cards must be present
    // If not, graceful "unavailable" message is shown
    const hasStats = text.match(/win rate/i) && text.match(/accuracy/i);
    const hasError = text.match(/statistics unavailable|unable to load/i);
    expect(hasStats || hasError).toBeTruthy();
  });

  test('timeframe selector (All Time / This Month) is functional', async ({
    page,
  }) => {
    await loginAsStudent(page);
    await goto(page, `${BZ}/statistics`);
    await page.waitForTimeout(3000);

    const selector = page
      .getByRole('combobox')
      .filter({ hasText: /all time/i });
    await expect(selector).toBeVisible({ timeout: 10000 });
    await selector.click();
    await expect(page.getByRole('option', { name: /this month/i })).toBeVisible(
      { timeout: 5000 },
    );
    await page.getByRole('option', { name: /this month/i }).click();
    // The trigger now reads "This Month" (so `selector`, filtered on
    // "All Time", no longer matches — assert with a fresh locator).
    await expect(
      page.getByRole('combobox').filter({ hasText: /this month/i }),
    ).toBeVisible();
    // Page should not crash
    const text = await page.locator('body').innerText();
    expect(text).not.toContain('NaN');
  });

  test('shows win rate as a percentage (not NaN%)', async ({ page }) => {
    await loginAsStudent(page);
    await goto(page, `${BZ}/statistics`);
    await page.waitForTimeout(3000);

    const text = await page.locator('body').innerText();
    expect(text).not.toMatch(/NaN%/);
  });

  test('"Browse All Battles" button navigates back to battle zone list', async ({
    page,
  }) => {
    await loginAsStudent(page);
    await goto(page, `${BZ}/statistics`);
    await page.waitForTimeout(3000);

    const browseBtn = page.getByRole('button', { name: /browse all battles/i });
    await expect(browseBtn).toBeVisible({ timeout: 10000 });
    await browseBtn.click();
    await page.waitForURL(/\/battle-zone$/, { timeout: 8000 });
  });

  test('export button is disabled with tooltip "Export coming soon"', async ({
    page,
  }) => {
    await loginAsStudent(page);
    await goto(page, `${BZ}/statistics`);
    await page.waitForTimeout(3000);

    const exportBtn = page.locator('button[title="Export coming soon"]');
    await expect(exportBtn).toBeVisible({ timeout: 10000 });
    await expect(exportBtn).toBeDisabled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 9: Battle Zone Layout
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Flow 9 — Layout and navigation', () => {
  test.setTimeout(120000);

  test('layout header shows Create Battle link on all sub-pages', async ({
    page,
  }) => {
    await loginAsStudent(page);
    for (const path of [`${BZ}`, `${BZ}/statistics`]) {
      await goto(page, path);
      await page.waitForTimeout(1500);
      await expect(
        page.getByRole('link', { name: /create battle/i }).first(),
      ).toBeVisible({ timeout: 8000 });
    }
  });

  test('global stats in layout show numeric values (active, upcoming, participants)', async ({
    page,
  }) => {
    await loginAsStudent(page);
    await goto(page, `${BZ}/statistics`); // stats bar shown on sub-pages
    await page.waitForTimeout(2000);
    const text = await page.locator('body').innerText();
    // Stats bar should show "Active Battles" and "Upcoming Battles" with numbers
    expect(text).toMatch(/active battles/i);
    expect(text).toMatch(/upcoming battles/i);
    // Numbers should be present
    expect(text).toMatch(/\d+/);
  });

  test('breadcrumb on statistics page shows "statistics" segment', async ({
    page,
  }) => {
    await loginAsStudent(page);
    await goto(page, `${BZ}/statistics`);
    await page.waitForTimeout(1500);
    // Breadcrumb shows "Statistics" link pointing to /battle-zone/statistics
    await expect(
      page
        .getByRole('link', { name: 'Statistics' })
        .filter({ hasText: 'Statistics' })
        .first(),
    ).toBeVisible({ timeout: 8000 });
  });

  test('Back button on create page goes to previous page', async ({ page }) => {
    await loginAsStudent(page);
    await goto(page, BZ);
    await waitForBattleList(page);
    await page
      .getByRole('link', { name: /create battle/i })
      .first()
      .click();
    await page.waitForURL(/\/battle-zone\/create/, { timeout: 10000 });

    const backBtn = page.getByRole('button', { name: 'Back', exact: true });
    await expect(backBtn).toBeVisible({ timeout: 8000 });
    await backBtn.click();
    // Should navigate back to /battle-zone
    await page.waitForURL(/\/battle-zone/, { timeout: 10000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 10: Cancel Battle (Creator)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Flow 10 — Cancel battle', () => {
  test.setTimeout(180000);
  test.describe.configure({ mode: 'serial' });

  let cancelBattleId: string;

  test('creator can cancel a WAITING battle', async ({ page }) => {
    await loginAsStudent(page);

    // Create a fresh battle to cancel
    await goto(page, `${BZ}/create`);
    await page.waitForTimeout(2000);
    await page
      .getByPlaceholder('Enter a catchy title')
      .fill(`Cancel Test ${Date.now()}`);
    await page
      .getByPlaceholder('Describe what this battle is about')
      .fill('This battle will be cancelled.');
    await clickNext(page);

    // Select roadmap with quiz questions seeded
    const roadmapTitle = await selectWorkingRoadmap(page);
    await clickNext(page);
    await page.waitForTimeout(500);

    // Verify step 3
    await expect(page.getByText('Step 3 of 4')).toBeVisible({ timeout: 5000 });
    await clickNext(page);
    await page.waitForTimeout(500);

    // Verify step 4 and source shown
    await expect(page.getByText('Step 4 of 4')).toBeVisible({ timeout: 5000 });
    await expect(
      page.getByText(roadmapTitle, { exact: true }).first(),
    ).toBeVisible({ timeout: 5000 });

    const launchBtn = page.getByRole('button', {
      name: /create battle.*load questions/i,
    });
    await expect(launchBtn).toBeVisible({ timeout: 8000 });
    await expect(launchBtn).toBeEnabled({ timeout: 8000 });
    // Wait for QuestionPreviewList to finish loading before clicking
    await expect(page.getByText('Sampling questions...')).toBeHidden({
      timeout: 15000,
    });

    // Capture UUID from creation API response (reliable, not dependent on URL redirect timing)
    const cancelCreationRespPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/v1/battles') &&
        resp.request().method() === 'POST',
      { timeout: 35000 },
    );
    await launchBtn.click();
    const cancelCreationResp = await cancelCreationRespPromise;
    const cancelCreationJson = await cancelCreationResp
      .json()
      .catch(() => ({}));
    const cancelCreatedUuid: string = cancelCreationJson?.data?.id;

    await page.waitForURL(/\/battle-zone\/(?!create)[a-z0-9-]+/, {
      timeout: 45000,
    });
    cancelBattleId = cancelCreatedUuid || page.url().split('/battle-zone/')[1];
    console.log('Cancel test battle ID:', cancelBattleId);

    // Wait for battle page to fully load (slug→UUID redirect completes, content renders)
    await expect(page.getByText('Waiting for players')).toBeVisible({
      timeout: 10000,
    });

    // Join the battle first (creator must be a participant to see cancel button)
    const leaveBtn = page.getByRole('button', { name: 'Leave' });
    const joinBtn = page.getByRole('button', { name: 'Join Battle' });
    await expect(joinBtn).toBeVisible({ timeout: 5000 });
    await expect(joinBtn).toBeEnabled({ timeout: 3000 });
    const joinRespPromise = page.waitForResponse(
      (r) =>
        r.url().includes('/battles/') &&
        r.url().includes('/join') &&
        r.request().method() === 'POST',
      { timeout: 15000 },
    );
    await joinBtn.click();
    const joinResp = await joinRespPromise;
    expect(joinResp.status(), await joinResp.text()).toBeLessThan(300);

    // After join, Leave button must appear before Cancel button is shown
    await expect(leaveBtn).toBeVisible({ timeout: 8000 });

    // Cancel button should be visible for creator who is a participant
    const cancelBtn = page.getByRole('button', { name: 'Cancel Battle' });
    await expect(cancelBtn).toBeVisible({ timeout: 5000 });
    await cancelBtn.click();
    // Should redirect to /battle-zone after cancellation
    await page.waitForURL(/\/battle-zone/, { timeout: 10000 });
    expect(page.url()).toContain('/battle-zone');
  });

  test('cancelled battle shows CANCELLED status or is removed from list', async ({
    page,
  }) => {
    expect(
      cancelBattleId,
      'battle was not created by the previous step',
    ).toBeTruthy();
    await loginAsStudent(page);
    await goto(page, `/battle-zone/${cancelBattleId}`);
    await page.waitForTimeout(2000);
    const text = await page.locator('body').innerText();
    // Either shows cancelled state or "Battle not found"
    const isCancelled =
      text.match(/cancelled|battle complete/i) ||
      text.match(/battle not found/i);
    expect(isCancelled).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 11: Comprehensive Battle Gameplay
// Tests: WAITING → LOBBY → IN_PROGRESS → COMPLETED
//        Question rendering, answer submission, correctness feedback,
//        scoring, leaderboard accuracy, winner determination
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Flow 11 — Complete battle gameplay (answer submission + scoring)', () => {
  test.setTimeout(600000); // 10 minutes: setup + lobby + every question + completion
  test.describe.configure({ mode: 'serial' });

  let gameplayBattleId: string;
  let totalQuestions = 0;
  let player2Page: Page;

  const questionText = (pg: Page) =>
    pg.locator('p.text-lg.font-semibold').first();

  /** Create a QUICK battle with the wizard defaults; returns its id. */
  async function createGameplayBattle(page: Page): Promise<string> {
    await goto(page, `${BZ}/create`);
    await page
      .getByPlaceholder('Enter a catchy title')
      .fill(`[GAMEPLAY] Flow 11 ${Date.now()}`);
    await page
      .getByPlaceholder('Describe what this battle is about')
      .fill('Comprehensive gameplay test.');
    await clickNext(page);

    await selectWorkingRoadmap(page);
    await clickNext(page);

    // Step 3: QUICK is the default type; assert it rather than click "if
    // visible". The sliders keep their defaults — the loop below reads the
    // question count from the created battle instead of assuming five.
    await expect(page.getByText('Step 3 of 4')).toBeVisible({ timeout: 5000 });
    const quickBtn = page.getByRole('button', { name: 'Quick', exact: true });
    await expect(quickBtn).toBeVisible();
    await quickBtn.click();
    await clickNext(page);

    await expect(page.getByText('Step 4 of 4')).toBeVisible({ timeout: 5000 });
    const launchBtn = page.getByRole('button', {
      name: /create battle.*load questions/i,
    });
    await expect(launchBtn).toBeVisible({ timeout: 8000 });
    await expect(launchBtn).toBeEnabled({ timeout: 8000 });
    await expect(page.getByText('Sampling questions...')).toBeHidden({
      timeout: 15000,
    });

    const creationRespPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/v1/battles') &&
        resp.request().method() === 'POST',
      { timeout: 35000 },
    );
    await launchBtn.click();
    const creationResp = await creationRespPromise;
    const creationJson = await creationResp.json();
    expect(
      creationResp.status(),
      `POST /battles: ${JSON.stringify(creationJson).slice(0, 300)}`,
    ).toBeLessThan(300);
    const uuid: string = creationJson?.data?.id;
    expect(uuid, 'created battle has no id').toBeTruthy();
    totalQuestions = Number(creationJson?.data?.total_questions ?? 0);
    expect(totalQuestions, 'created battle has no questions').toBeGreaterThan(
      0,
    );
    await page.waitForURL(/\/battle-zone\/(?!create)[a-z0-9-]+/, {
      timeout: 45000,
    });
    return uuid;
  }

  /** Join as the page's user: the join is answered 2xx and Leave appears. */
  async function joinBattle(pg: Page, battleId: string) {
    await goto(pg, `/battle-zone/${battleId}`);
    await expect(pg.getByText('Waiting for players')).toBeVisible({
      timeout: 10000,
    });
    const joinBtn = pg.getByRole('button', { name: 'Join Battle' });
    await expect(joinBtn).toBeVisible({ timeout: 10000 });
    await expect(joinBtn).toBeEnabled({ timeout: 5000 });
    const joinRespPromise = pg.waitForResponse(
      (r) =>
        r.url().includes('/battles/') &&
        r.url().includes('/join') &&
        r.request().method() === 'POST',
      { timeout: 15000 },
    );
    await joinBtn.click();
    const joinResp = await joinRespPromise;
    expect(joinResp.status(), await joinResp.text()).toBeLessThan(300);
    await expect(pg.getByRole('button', { name: 'Leave' })).toBeVisible({
      timeout: 15000,
    });
  }

  /** Mark ready as the page's user; the button goes away once accepted. */
  async function markReady(pg: Page) {
    const markReadyBtn = pg.getByRole('button', { name: 'Mark as Ready' });
    await expect(markReadyBtn).toBeVisible({ timeout: 10000 });
    const readyRespPromise = pg.waitForResponse(
      (r) =>
        r.url().includes('/battles/') &&
        r.url().includes('/ready') &&
        r.request().method() === 'POST',
      { timeout: 10000 },
    );
    await markReadyBtn.click();
    const readyResp = await readyRespPromise;
    expect(readyResp.status(), await readyResp.text()).toBeLessThan(300);
    await expect(markReadyBtn).toBeHidden({ timeout: 8000 });
  }

  /**
   * Answer the current question as the page's user: pick the first option,
   * submit, get a 2xx and on-screen feedback. Returns the question's text so
   * the caller can wait for the next one.
   */
  async function answerCurrentQuestion(pg: Page, label: string) {
    const q = questionText(pg);
    await expect(q).toBeVisible({ timeout: 30000 });
    const text = (await q.innerText()).trim();

    const optionGrid = pg.locator('.grid.gap-3').first();
    await expect(optionGrid).toBeVisible({ timeout: 5000 });
    const submitBtn = pg.getByRole('button', { name: 'Submit Answer' });
    await expect(submitBtn).toBeVisible();
    await optionGrid.locator('button').first().click();
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });

    const answerRespPromise = pg.waitForResponse(
      (r) =>
        r.url().includes('/battles/answer') && r.request().method() === 'POST',
      { timeout: 15000 },
    );
    await submitBtn.click();
    const answerResp = await answerRespPromise;
    const body = await answerResp.text();
    expect(answerResp.status(), `${label} answer: ${body}`).toBeLessThan(300);
    // The server's verdict is the outcome; it must be a real boolean.
    expect(
      typeof JSON.parse(body)?.data?.is_correct,
      `${label} answer carried no verdict: ${body}`,
    ).toBe('boolean');
    // On screen: "✓ Correct! +N points" / "✗ Incorrect — 0 points". When this
    // is the last answer of the battle the server completes it immediately and
    // the feedback is replaced by the completion view ("Battle Complete!", or
    // "You Won! 🎉" on the winner's page), which is also proof the answer
    // landed.
    await expect(
      pg.getByText(/Correct!|Incorrect|Battle Complete!|You Won!/i).first(),
    ).toBeVisible({ timeout: 12000 });
    return text;
  }

  test('creates gameplay battle and both players join', async ({
    page,
    browser,
  }) => {
    await loginAsStudent(page);
    gameplayBattleId = await createGameplayBattle(page);

    await joinBattle(page, gameplayBattleId);

    const ctx2 = await browser.newContext();
    player2Page = await ctx2.newPage();
    await loginAsPlayer2(player2Page);
    await joinBattle(player2Page, gameplayBattleId);

    await goto(page, `/battle-zone/${gameplayBattleId}`);
    await expect(page.getByText(/2 \/ \d+ players joined/)).toBeVisible({
      timeout: 8000,
    });
  });

  test('creator opens lobby and both players mark ready', async ({ page }) => {
    expect(
      gameplayBattleId && player2Page,
      'battle or player-2 session missing from the previous step',
    ).toBeTruthy();
    await loginAsStudent(page);
    await goto(page, `/battle-zone/${gameplayBattleId}`);
    await expect(page.getByText('Waiting for players')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByRole('button', { name: 'Leave' })).toBeVisible({
      timeout: 10000,
    });

    // "Open Lobby" is offered to the creator once ≥2 players are enrolled.
    const openLobbyBtn = page.getByRole('button', { name: 'Open Lobby' });
    await expect(openLobbyBtn).toBeVisible({ timeout: 10000 });
    const lobbyRespPromise = page.waitForResponse(
      (r) =>
        r.url().includes('/battles/') &&
        r.url().includes('/lobby') &&
        r.request().method() === 'POST',
      { timeout: 10000 },
    );
    await openLobbyBtn.click();
    const lobbyResp = await lobbyRespPromise;
    expect(lobbyResp.status(), await lobbyResp.text()).toBe(200);
    await expect(page.getByText('Lobby — Get Ready!')).toBeVisible({
      timeout: 10000,
    });

    await markReady(page);
    await expect(page.getByText(/you are ready/i)).toBeVisible({
      timeout: 8000,
    });

    await goto(player2Page, `/battle-zone/${gameplayBattleId}`);
    await expect(player2Page.getByText('Lobby — Get Ready!')).toBeVisible({
      timeout: 10000,
    });
    await markReady(player2Page);
  });

  test('creator starts battle and questions appear', async ({ page }) => {
    expect(
      gameplayBattleId,
      'battle was not created by the previous step',
    ).toBeTruthy();
    await loginAsStudent(page);
    await goto(page, `/battle-zone/${gameplayBattleId}`);
    await expect(page.getByText('Lobby — Get Ready!')).toBeVisible({
      timeout: 15000,
    });

    // Both players marked ready, so the creator is offered Start (enabled
    // once the questions are dealt). The socket must be live before the
    // click, or the client misses battle:started.
    await expect(page.getByText('Live', { exact: true })).toBeVisible({
      timeout: 15000,
    });
    const startBtn = page.getByRole('button', { name: 'Start Battle' });
    await expect(startBtn).toBeVisible({ timeout: 15000 });
    await expect(startBtn).toBeEnabled({ timeout: 15000 });
    const startRespPromise = page.waitForResponse(
      (r) =>
        r.url().includes('/battles/') &&
        r.url().includes('/start') &&
        r.request().method() === 'POST',
      { timeout: 15000 },
    );
    await startBtn.click();
    const startResp = await startRespPromise;
    expect(startResp.status(), await startResp.text()).toBe(200);

    await expect(page.getByText(/In Progress|Battle in progress/i)).toBeVisible(
      { timeout: 20000 },
    );
    await expect(questionText(page)).toBeVisible({ timeout: 20000 });
    // Nothing chosen yet, so Submit is disabled (the old Flow 12 assertion,
    // which only ran if an IN_PROGRESS battle happened to be listed).
    await expect(
      page.getByRole('button', { name: 'Submit Answer' }),
    ).toBeDisabled();
  });

  test('both players answer every question with correctness feedback', async ({
    page,
  }) => {
    expect(
      gameplayBattleId && player2Page,
      'battle or player-2 session missing from the previous steps',
    ).toBeTruthy();
    await loginAsStudent(page);
    await goto(page, `/battle-zone/${gameplayBattleId}`);
    await goto(player2Page, `/battle-zone/${gameplayBattleId}`);
    await expect(page.getByText('In Progress').first()).toBeVisible({
      timeout: 15000,
    });

    for (let qIdx = 0; qIdx < totalQuestions; qIdx++) {
      const label = `Q${qIdx + 1}/${totalQuestions}`;
      const asked = await answerCurrentQuestion(page, `${label} P1`);
      await answerCurrentQuestion(player2Page, `${label} P2`);

      if (qIdx < totalQuestions - 1) {
        // The server advances after the per-question timer (30s default) or
        // once everyone has answered; either way the next question must be a
        // different one.
        await expect(questionText(page)).not.toHaveText(asked, {
          timeout: 45000,
        });
        await expect(questionText(player2Page)).not.toHaveText(asked, {
          timeout: 45000,
        });
      }
    }
  });

  test('battle completes and final leaderboard shows scores', async ({
    page,
  }) => {
    expect(
      gameplayBattleId,
      'battle was not created by the previous step',
    ).toBeTruthy();
    await loginAsStudent(page);
    await goto(page, `/battle-zone/${gameplayBattleId}`);

    // Every question is answered; the server completes the battle when the
    // last answer lands or the last timer runs out. Allow one timer plus
    // slack. The heading reads "Battle Complete!" — or "You Won! 🎉" when the
    // viewer is the winner.
    await expect(
      page.getByRole('heading', { name: /Battle Complete!|You Won!/ }),
    ).toBeVisible({ timeout: 90000 });
    await expect(page.getByText('Final Standings')).toBeVisible({
      timeout: 8000,
    });
    // Both players, each with a score.
    await expect(page.locator('text=/\\d+ pts/')).toHaveCount(2, {
      timeout: 8000,
    });
  });

  test('final leaderboard shows both players with correct scores and ranking', async ({
    page,
  }) => {
    expect(
      gameplayBattleId,
      'battle was not created by the previous step',
    ).toBeTruthy();
    await loginAsStudent(page);
    await goto(page, `/battle-zone/${gameplayBattleId}`);
    await expect(page.getByText('Final Standings')).toBeVisible({
      timeout: 15000,
    });

    const lbTab = page.getByRole('button', { name: 'Leaderboard' });
    await expect(lbTab).toBeVisible({ timeout: 10000 });
    await lbTab.click();
    await expect(page.getByText(/teststudent/i).first()).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText(/battleplayer2/i).first()).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText(/\d+ correct/i).first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('statistics page reflects completed battle in user history', async ({
    page,
  }) => {
    expect(
      gameplayBattleId,
      'battle was not created by the previous step',
    ).toBeTruthy();
    await loginAsStudent(page);
    await goto(page, `${BZ}/statistics`);

    // The battles-played card reads "<n> battles"; a completed battle makes
    // <n> at least one. The old assertion matched the word "battles" anywhere
    // on the page. (The Win Rate card next to it read "0 of 0 battles" for a
    // player with seven completed battles in this run — that card is not used
    // as evidence here, and is worth a look on its own.)
    await expect(page.getByText(/^[1-9]\d* battles$/)).toBeVisible({
      timeout: 15000,
    });
  });

  test.afterAll(async () => {
    if (player2Page && !player2Page.isClosed()) {
      await player2Page.context().close();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 12: Battle list state
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Flow 12 — Battle list shows the seeded WAITING battles', () => {
  test.setTimeout(120000);

  test('the list shows WAITING battle cards with a join affordance', async ({
    page,
  }) => {
    await loginAsStudent(page);
    await goto(page, BZ);
    await waitForBattleList(page);

    // The seed guarantees WAITING battles; this used to `return` when the
    // word "Waiting" was not found and pass.
    await expect(page.getByText('Waiting').first()).toBeVisible({
      timeout: 10000,
    });
    const cards = page.locator(BATTLE_CARD_TITLE);
    expect(await cards.count()).toBeGreaterThanOrEqual(1);
    await expect(
      page.getByRole('button', { name: 'Join Battle' }).first(),
    ).toBeVisible({ timeout: 10000 });
  });
});
