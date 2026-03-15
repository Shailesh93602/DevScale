import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page loads without errors', async ({ page }) => {
    await expect(page).toHaveTitle(/EduScale/);
  });

  test('hero section displays EduScale branding', async ({ page }) => {
    const heroText = page.locator('text=EduScale is the all-in-one platform');
    await expect(heroText).toBeVisible();
  });

  test('hero section has CTA buttons', async ({ page }) => {
    await expect(page.locator('text=Get Started Free').first()).toBeVisible();
    await expect(page.locator('text=Explore Features').first()).toBeVisible();
  });

  test('features section is visible on scroll', async ({ page }) => {
    const features = page.locator('text=Test Your Skills in Battle Zone');
    await features.scrollIntoViewIfNeeded();
    await expect(features).toBeVisible();
  });

  test('leaderboard section renders', async ({ page }) => {
    const leaderboard = page.locator('text=Weekly Leaderboard');
    await leaderboard.scrollIntoViewIfNeeded();
    await expect(leaderboard).toBeVisible();
  });

  test('scroll to top button is present', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);
    const scrollBtn = page.locator('main svg[viewBox="0 0 24 24"]').last();
    await expect(scrollBtn).toBeVisible();
  });

  test('no old branding references visible', async ({ page }) => {
    const content = await page.textContent('body');
    expect(content).not.toContain('LegacyBrand');
    expect(content).not.toContain('OldName');
  });
});
