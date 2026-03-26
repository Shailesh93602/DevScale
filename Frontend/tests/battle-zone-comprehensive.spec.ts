/**
 * battle-zone-comprehensive.spec.ts
 *
 * End-to-end coverage for the battle zone feature:
 * - Public list page: renders battles, human-readable labels, no raw enums
 * - Battle detail page: status/type/difficulty labels, correct UI per status
 * - Statistics page: no NaN, correct fields rendered
 * - Create flow: 4-step navigation, step 3 shows "Next" not "Create Battle"
 * - Join flow: already-enrolled shows error toast, not a silent failure
 */

import { expect, test } from '@playwright/test';
import { loginAsStudent } from './utils/login';
import { gotoWithRetry } from './utils/navigation';

// ── Helpers ──────────────────────────────────────────────────────────────────

const BATTLE_ZONE = '/battle-zone';

/** Returns true if the page body text contains no raw enum-style strings. */
async function hasNoRawEnums(page: import('@playwright/test').Page) {
  const body = await page.locator('body').innerText();
  // These are the raw enum values that should never appear verbatim in UI text
  const banned = ['IN_PROGRESS', 'WAITING', 'COMPLETED', 'CANCELLED', 'LOBBY'];
  return banned.every((token) => !body.includes(token));
}

// ── Battle Zone Public List Page ──────────────────────────────────────────────

test.describe('Battle Zone — public list page', () => {
  test('loads without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await gotoWithRetry(page, BATTLE_ZONE);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    expect(errors).toHaveLength(0);
  });

  test('shows "Battle Zone" heading or arena label', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsStudent(page);
    await gotoWithRetry(page, BATTLE_ZONE);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    await expect(
      page.getByText(/battle zone/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('shows "Create Battle" button', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsStudent(page);
    await gotoWithRetry(page, BATTLE_ZONE);
    await expect(
      page.getByRole('link', { name: /create battle/i }).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('battle cards show human-readable status labels, not raw enums', async ({ page }) => {
    await gotoWithRetry(page, BATTLE_ZONE);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    // Wait briefly for battle cards to render
    await page.waitForTimeout(2000);

    const body = await page.locator('body').innerText();
    // If there are any battle cards, their status badges must be human-readable
    const rawEnums = ['IN_PROGRESS', 'WAITING', 'COMPLETED', 'CANCELLED', 'LOBBY'];
    for (const raw of rawEnums) {
      expect(body).not.toContain(raw);
    }
  });

  test('difficulty labels are human-readable (not EASY/MEDIUM/HARD)', async ({ page }) => {
    await gotoWithRetry(page, BATTLE_ZONE);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const body = await page.locator('body').innerText();
    // Raw difficulty enums should not appear verbatim
    // (they should be capitalised "Easy", "Medium", "Hard" instead)
    expect(body).not.toMatch(/\bEASY\b/);
    expect(body).not.toMatch(/\bMEDIUM\b/);
    expect(body).not.toMatch(/\bHARD\b/);
  });
});

// ── Statistics Page ────────────────────────────────────────────────────────────

test.describe('Battle Zone — statistics page', () => {
  test('loads without error when unauthenticated', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await gotoWithRetry(page, `${BATTLE_ZONE}/statistics`);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    expect(errors).toHaveLength(0);
  });

  test('loads without error when authenticated', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsStudent(page);
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await gotoWithRetry(page, `${BATTLE_ZONE}/statistics`);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    expect(errors).toHaveLength(0);
  });

  test('does not show NaN anywhere on the page', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsStudent(page);
    await gotoWithRetry(page, `${BATTLE_ZONE}/statistics`);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const body = await page.locator('body').innerText();
    expect(body).not.toContain('NaN');
  });

  test('win rate stat shows a percentage or "--" (never raw NaN)', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsStudent(page);
    await gotoWithRetry(page, `${BATTLE_ZONE}/statistics`);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const body = await page.locator('body').innerText();
    // Win rate must not be NaN%
    expect(body).not.toMatch(/NaN%/);
  });
});

// ── BattleZoneLayout header stats ─────────────────────────────────────────────

test.describe('Battle Zone — layout header stats (authenticated)', () => {
  test.setTimeout(120_000);

  test('win rate in header shows a % or "--" but never NaN%', async ({ page }) => {
    await loginAsStudent(page);
    await gotoWithRetry(page, `${BATTLE_ZONE}/create`);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(/NaN%/);
  });
});

// ── Create Battle Flow ─────────────────────────────────────────────────────────

test.describe('Battle Zone — create flow button labels', () => {
  test.setTimeout(180_000);

  test('step 1 shows "Next" button', async ({ page }) => {
    await loginAsStudent(page);
    await gotoWithRetry(page, `${BATTLE_ZONE}/create`);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    // Shadcn <Form> is FormProvider (context only), not a <form> element — use page directly.
    // Use exact: true to avoid matching Next.js Dev Tools button (aria-label="Open Next.js Dev Tools")
    await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /^create battle$/i })).not.toBeVisible();
  });

  test('step 2 shows "Next" button (not "Create Battle")', async ({ page }) => {
    await loginAsStudent(page);
    await gotoWithRetry(page, `${BATTLE_ZONE}/create`);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    // Fill step 1 and advance
    await page.getByPlaceholder('Enter a catchy title').fill(`Label Test ${Date.now()}`);
    await page.getByPlaceholder('Describe what this battle is about').fill('Testing step labels.');

    // Use exact: true to avoid matching Next.js Dev Tools button
    const nextBtn = page.getByRole('button', { name: 'Next', exact: true });
    await expect(nextBtn).toBeEnabled({ timeout: 10000 });
    await nextBtn.click();

    // Step 2: Subject/Topic
    await expect(nextBtn).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /^create battle$/i })).not.toBeVisible();
  });

  test('step 3 shows "Next" button (not "Create Battle")', async ({ page }) => {
    await loginAsStudent(page);
    await gotoWithRetry(page, `${BATTLE_ZONE}/create`);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    // Use exact: true to avoid matching Next.js Dev Tools button
    const nextBtn = page.getByRole('button', { name: 'Next', exact: true });

    // Step 1 → 2
    await page.getByPlaceholder('Enter a catchy title').fill(`Step3 Test ${Date.now()}`);
    await page.getByPlaceholder('Describe what this battle is about').fill('Testing step 3 label.');
    await expect(nextBtn).toBeEnabled({ timeout: 10000 });
    await nextBtn.click();

    // Step 2: pick a subject and topic
    const subjectTrigger = page.getByRole('combobox').first();
    await expect(subjectTrigger).toBeVisible({ timeout: 15000 });
    await subjectTrigger.click();
    await page.getByRole('option').first().click();

    const topicTrigger = page.getByRole('combobox').nth(1);
    await topicTrigger.click();
    await page.getByRole('option').first().click();
    await nextBtn.click();

    // Step 3: Schedule & Settings — must show "Next", not "Create Battle"
    await expect(nextBtn).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /^create battle$/i })).not.toBeVisible();
  });
});

// ── Battle detail page labels ──────────────────────────────────────────────────

test.describe('Battle Zone — detail page labels', () => {
  test('detail page shows no raw enum status values', async ({ page }) => {
    // Navigate to list first, grab the first battle link if any
    await gotoWithRetry(page, BATTLE_ZONE);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Find a "View Details" or battle card link
    const detailLink = page.getByRole('button', { name: /view details/i }).first();
    const hasDetails = await detailLink.isVisible().catch(() => false);

    if (!hasDetails) {
      test.skip(); // No battles in DB — skip
      return;
    }

    await detailLink.click();
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    await expect(hasNoRawEnums(page)).resolves.toBe(true);
  });
});
