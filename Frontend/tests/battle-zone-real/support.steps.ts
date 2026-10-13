import { expect, type Page } from '@playwright/test';

export const BZ = '/battle-zone';

// The spec's own API calls go to the backend the app under test talks to.
// This was hardcoded to :4000, so a run against any other backend hit the
// wrong (or no) server and every direct-API assertion failed for a reason
// unrelated to the product.
export const API =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';

// ── Shared helpers ────────────────────────────────────────────────────────────

export async function goto(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page
    .waitForLoadState('networkidle', { timeout: 15000 })
    .catch(() => {});
}

/** Click the first visible "Next" button that is the form navigation button (not Next.js dev-tools). */
export async function clickNext(page: Page) {
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
export async function selectWorkingRoadmap(page: Page): Promise<string> {
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

export const BATTLE_CARD_TITLE =
  'text=/\\[(?:PRACTICE|QUICK|SCHEDULED|TOPIC|SUBJECT|MAIN CONCEPT|ROADMAP)\\]/';

/** All visible battle cards by title (call waitForBattleList first). */
export async function getBattleTitles(page: Page): Promise<string[]> {
  return page.locator(BATTLE_CARD_TITLE).allInnerTexts();
}

/**
 * Wait for the battle list to render: either a battle card or the empty state.
 * Neither appearing is a failure — the old Promise.race().catch(() => {})
 * turned a list that never loaded into a pass.
 */
export async function waitForBattleList(page: Page) {
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
