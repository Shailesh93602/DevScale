import { test, expect } from '@playwright/test';

test.describe('Authentication Pages', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('body')).toBeVisible();
  });

  test('register page renders', async ({ page }) => {
    await page.goto('/auth/register');
    await expect(page.locator('body')).toBeVisible();
  });

  test('forgot password page renders', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    await expect(page.locator('body')).toBeVisible();
  });
});
