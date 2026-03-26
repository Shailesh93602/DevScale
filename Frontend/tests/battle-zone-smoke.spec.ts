import { expect, test } from '@playwright/test';

const battleZoneRoutes = [
  '/battle-zone',
  '/battle-zone/battles',
  '/battle-zone/my-battles',
  '/battle-zone/leaderboard',
  '/battle-zone/statistics',
  '/battle-zone/community',
  '/battle-zone/create',
];

test.describe('Battle Zone route smoke checks', () => {
  for (const route of battleZoneRoutes) {
    test(`${route} loads without server error`, async ({ page }) => {
      const pageErrors: string[] = [];
      page.on('pageerror', (err) => pageErrors.push(err.message));

      const response = await page.goto(route, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      expect(response?.status()).toBeLessThan(500);
      expect(pageErrors).toHaveLength(0);
      await expect(page.locator('body')).toBeVisible();
    });
  }
});
