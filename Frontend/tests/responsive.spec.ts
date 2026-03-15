import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
];

for (const viewport of viewports) {
  test.describe(`${viewport.name} (${viewport.width}px)`, () => {
    test.use({
      viewport: { width: viewport.width, height: viewport.height },
    });

    test('landing page renders correctly', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('main')).toBeVisible();
      // Verify no horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 20);
    });

    test('about page renders correctly', async ({ page }) => {
      await page.goto('/about');
      await expect(page.locator('h1')).toBeVisible();
    });

    test('navbar is visible', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('nav')).toBeVisible();
    });
  });
}
