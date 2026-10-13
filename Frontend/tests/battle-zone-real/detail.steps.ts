import { expect, test, type Page } from '@playwright/test';
import { loginAsStudent } from '../utils/login';
import { BZ, API, goto, waitForBattleList } from './support.steps';

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 3: Battle Detail — WAITING Phase + Slug Navigation
// ─────────────────────────────────────────────────────────────────────────────
export function registerDetailFlow() {
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

    test('battle detail shows participant count X/Y format', async ({
      page,
    }) => {
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

      await expect(
        page.getByRole('button', { name: 'Join Battle' }),
      ).toBeVisible({ timeout: 10000 });
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

    test('battle detail breadcrumb shows Battle Zone link', async ({
      page,
    }) => {
      await loginAsStudent(page);
      const b = await getSeededWaitingBattle(page);

      await goto(page, `/battle-zone/${b.id}`);
      await page.waitForTimeout(2000);

      await expect(
        page.getByRole('link', { name: /battle zone/i }).first(),
      ).toBeVisible({ timeout: 5000 });
    });

    test('direct navigation via slug redirects to UUID URL', async ({
      page,
    }) => {
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
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 4: Join and Leave Battle
// ─────────────────────────────────────────────────────────────────────────────
export function registerJoinLeaveFlow() {
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
      await expect(
        page.getByRole('button', { name: 'Join Battle' }),
      ).toHaveCount(0);
    });

    test('leave battle removes user from participant list', async ({
      page,
    }) => {
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
}
