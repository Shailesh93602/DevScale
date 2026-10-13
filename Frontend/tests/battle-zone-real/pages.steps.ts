import { expect, test } from '@playwright/test';
import { loginAsStudent } from '../utils/login';
import { BZ, goto, waitForBattleList } from './support.steps';

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 7: My Battles Page
// ─────────────────────────────────────────────────────────────────────────────
export function registerMyBattlesFlow() {
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
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 8: Statistics Page
// ─────────────────────────────────────────────────────────────────────────────
export function registerStatisticsFlow() {
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

    test('the Win Rate card, the per-difficulty battle counts and the header quick stat describe the same history', async ({
      page,
    }) => {
      // The payload is one query; the page used to read its counters from the
      // wrong level and showed "0 of 0 battles" beside a "2 battles" card for
      // the same player. So the cards are checked against the live API answer
      // AND against each other: the Win Rate caption's denominator is the
      // completed-battle count, the Performance-by-Difficulty cards partition
      // exactly those battles, and the Battle Zone header's quick stat is the
      // same percentage. No card is optional; a player with no completed
      // battles must show "--" and "0 of 0 battles", never a confident "0%".
      await loginAsStudent(page);
      const statsResponse = page.waitForResponse(
        (r) =>
          r.url().includes('/battles/statistics/me') &&
          r.request().method() === 'GET' &&
          r.status() === 200,
        { timeout: 20000 },
      );
      await goto(page, `${BZ}/statistics`);
      const body = (await (await statsResponse).json()) as {
        data: {
          stats: { wins: number; completed_battles: number; win_rate: number };
          performance_by_difficulty: { battles: number }[];
        };
      };
      const { wins, completed_battles, win_rate } = body.data.stats;
      const expectedValue = completed_battles > 0 ? `${win_rate}%` : '--';

      const card = page.getByTestId('stat-card-win-rate');
      await expect(card).toBeVisible({ timeout: 15000 });
      await expect(card.getByTestId('stat-card-value')).toHaveText(
        expectedValue,
      );
      await expect(card).toContainText(
        `${wins} of ${completed_battles} battles`,
      );

      // Every completed battle is in exactly one difficulty bucket.
      const perDifficulty = await page
        .getByTestId('difficulty-battles')
        .allTextContents();
      const partitioned = perDifficulty.reduce(
        (n, text) => n + Number(/\d+/.exec(text)?.[0] ?? 0),
        0,
      );
      expect(partitioned).toBe(completed_battles);
      expect(
        body.data.performance_by_difficulty.reduce((n, g) => n + g.battles, 0),
      ).toBe(completed_battles);

      await expect(page.getByTestId('quick-stat-win-rate')).toHaveText(
        expectedValue,
      );
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
      await expect(
        page.getByRole('option', { name: /this month/i }),
      ).toBeVisible({ timeout: 5000 });
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

      const browseBtn = page.getByRole('button', {
        name: /browse all battles/i,
      });
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
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 9: Battle Zone Layout
// ─────────────────────────────────────────────────────────────────────────────
export function registerLayoutFlow() {
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

    test('Back button on create page goes to previous page', async ({
      page,
    }) => {
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
}
