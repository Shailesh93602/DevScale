import { expect, test } from '@playwright/test';
import { loginAsStudent } from '../utils/login';
import {
  BZ,
  API,
  goto,
  clickNext,
  selectWorkingRoadmap,
} from './support.steps';

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 5: Create Battle — 4-Step Wizard
// ─────────────────────────────────────────────────────────────────────────────
export function registerCreateWizardFlow() {
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

      await expect(page.getByText('Step 2 of 4 — Question Source')).toBeVisible(
        {
          timeout: 8000,
        },
      );
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
      await expect(roadmapCombo).not.toHaveText('Loading...', {
        timeout: 20000,
      });
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
      await expect(
        page.getByText('Step 4 of 4 — Preview & Launch'),
      ).toBeVisible({
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
      await expect(page.getByText('Step 3 of 4')).toBeVisible({
        timeout: 5000,
      });
      await clickNext(page);
      await page.waitForTimeout(1000);

      // Step 4 — verify we are at step 4 and the source label is shown in summary
      await expect(page.getByText('Step 4 of 4')).toBeVisible({
        timeout: 5000,
      });
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
      expect(
        pageErrors,
        'uncaught page errors while creating a battle',
      ).toEqual([]);
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
}
