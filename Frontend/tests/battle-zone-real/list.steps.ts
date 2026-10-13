import { expect, test } from '@playwright/test';
import { loginAsStudent } from '../utils/login';
import {
  BZ,
  goto,
  BATTLE_CARD_TITLE,
  getBattleTitles,
  waitForBattleList,
} from './support.steps';

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 1: Battle List — Authentication Required
// ─────────────────────────────────────────────────────────────────────────────
export function registerBattleListFlow() {
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
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 2: Filters and Search
// ─────────────────────────────────────────────────────────────────────────────
export function registerFiltersFlow() {
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

    test('filtering by "Waiting" shows the seeded battles', async ({
      page,
    }) => {
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
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 12: Battle list state
// ─────────────────────────────────────────────────────────────────────────────
export function registerListStateFlow() {
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
}
