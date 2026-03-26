import { test, expect } from '@playwright/test';

test.describe('Branding Verification', () => {
  test('footer renders EduScale branding and support contact', async ({
    page,
  }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer.locator('text=EduScale').first()).toBeVisible();
    await expect(footer.locator('text=contact@exaveltech.com')).toBeVisible();
  });

  test('navbar has EduScale logo text', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav a:has-text("EduScale")')).toBeVisible();
  });

  test('about page mentions Exavel Technologies', async ({ page }) => {
    await page.goto('/about');
    await expect(
      page.locator('text=Exavel Technologies').first(),
    ).toBeVisible();
  });
});
