import { expect, test } from '@playwright/test';
import { loginAsStudent } from '../utils/login';
import { BZ, goto, clickNext, selectWorkingRoadmap } from './support.steps';

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 10: Cancel Battle (Creator)
// ─────────────────────────────────────────────────────────────────────────────
export function registerCancelFlow() {
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
      await expect(page.getByText('Step 3 of 4')).toBeVisible({
        timeout: 5000,
      });
      await clickNext(page);
      await page.waitForTimeout(500);

      // Verify step 4 and source shown
      await expect(page.getByText('Step 4 of 4')).toBeVisible({
        timeout: 5000,
      });
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
      cancelBattleId =
        cancelCreatedUuid || page.url().split('/battle-zone/')[1];
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
}
