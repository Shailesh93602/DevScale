import { expect, test } from '@playwright/test';
import { loginAsStudent } from './utils/login';
import { gotoWithRetry } from './utils/navigation';

/**
 * The four-step create-battle wizard, end to end, with a battle actually
 * created at the end.
 *
 * Every optional branch is gone. The previous version probed a second
 * combobox "if it appeared", clicked Create "if visible", and then accepted
 * EITHER a redirect OR still being on the preview step — so a wizard whose
 * launch button did nothing passed. The roadmap level alone is a complete
 * question source (the pool check answers with a count), so the flow is
 * deterministic: pick the first roadmap, wait for the pool, advance, launch,
 * land on the new battle.
 */
test.describe('Battle Zone Create Flow', () => {
  test('subjects and topics load and user can create a battle', async ({
    page,
  }) => {
    test.setTimeout(180000);
    await loginAsStudent(page);
    await gotoWithRetry(page, '/battle-zone/create');
    await page
      .waitForLoadState('networkidle', { timeout: 15000 })
      .catch(() => {});

    // Shadcn <Form> is FormProvider (React context only, not an HTML <form>
    // element) so we scope to page, not a form locator.
    const nextButton = page.getByRole('button', { name: 'Next', exact: true });

    // ── Step 1: Battle Info ──────────────────────────────────────────────
    await page
      .getByPlaceholder('Enter a catchy title')
      .fill(`Playwright Battle ${Date.now()}`);
    await page
      .getByPlaceholder('Describe what this battle is about')
      .fill('Automated E2E validation battle for create flow.');
    await expect(nextButton).toBeEnabled({ timeout: 30000 });
    await nextButton.click();

    // ── Step 2: Question Source ──────────────────────────────────────────
    // The roadmap combobox is populated from the API; choosing a roadmap
    // triggers the question-pool check, which is what enables Next.
    const roadmapCombo = page.getByRole('combobox').first();
    await expect(roadmapCombo).toBeVisible({ timeout: 15000 });
    await expect(roadmapCombo).not.toHaveText('Loading...', {
      timeout: 45000,
    });
    const poolResponse = page.waitForResponse(
      (r) =>
        r.url().includes('/battles/question-pool') &&
        r.request().method() === 'GET',
      { timeout: 20000 },
    );
    await roadmapCombo.click();
    const firstRoadmap = page.getByRole('option').first();
    await expect(firstRoadmap).toBeVisible({ timeout: 10000 });
    await firstRoadmap.click();
    expect((await poolResponse).status()).toBe(200);
    await expect(page.getByText('Source:')).toBeVisible({ timeout: 15000 });
    await expect(nextButton).toBeEnabled({ timeout: 20000 });
    await nextButton.click();

    // ── Step 3: Battle Settings ──────────────────────────────────────────
    // Default type is QUICK — date/time fields are only shown for SCHEDULED.
    await expect(page.getByText('Step 3 of 4')).toBeVisible({
      timeout: 10000,
    });
    await expect(nextButton).toBeEnabled({ timeout: 10000 });
    await nextButton.click();

    // ── Step 4: Preview & Launch ─────────────────────────────────────────
    // The battle must be created (a 2xx with an id) and the wizard must
    // leave for the new battle's page.
    await expect(page.getByText('Step 4 of 4')).toBeVisible({
      timeout: 10000,
    });
    const createBtn = page.getByRole('button', {
      name: /create battle.*load questions/i,
    });
    await expect(createBtn).toBeVisible({ timeout: 10000 });
    await expect(createBtn).toBeEnabled({ timeout: 10000 });
    await expect(page.getByText('Sampling questions...')).toBeHidden({
      timeout: 15000,
    });
    const created = page.waitForResponse(
      (r) =>
        r.url().includes('/api/v1/battles') && r.request().method() === 'POST',
      { timeout: 35000 },
    );
    await createBtn.click();
    const resp = await created;
    const json = await resp.json();
    expect(resp.status(), JSON.stringify(json).slice(0, 300)).toBeLessThan(300);
    expect(json?.data?.id, 'created battle has no id').toBeTruthy();
    await page.waitForURL(/\/battle-zone\/(?!create)[a-z0-9-]+/, {
      timeout: 45000,
    });
    await expect(page.getByText('Waiting for players')).toBeVisible({
      timeout: 15000,
    });
  });
});
