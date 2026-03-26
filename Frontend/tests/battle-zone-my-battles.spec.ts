import { expect, test } from '@playwright/test';
import { loginAsStudent } from './utils/login';
import { gotoWithRetry } from './utils/navigation';

test.describe('Battle Zone My Battles', () => {
  test('authenticated user can open my-battles page', async ({ page }) => {
    test.setTimeout(180000);
    await loginAsStudent(page);

    await gotoWithRetry(page, '/battle-zone/my-battles');

    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
    await expect(page.getByRole('heading', { name: 'My Battles' })).toBeVisible(
      { timeout: 20000 },
    );
    await expect(page.locator('body')).toBeVisible();
  });
});
