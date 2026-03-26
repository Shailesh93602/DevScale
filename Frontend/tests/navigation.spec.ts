import { test, expect } from '@playwright/test';
import { loginAsStudent } from './utils/login';

test.describe('Navigation', () => {
  test('navbar displays EduScale logo', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav a:has-text("EduScale")')).toBeVisible();
  });

  test('navbar logo points to homepage', async ({ page }) => {
    await page.goto('/about');
    // The logo link has "E" + "EduScale" as text content; match by hasText rather than exact accessible name
    const logo = page.locator('nav a').filter({ hasText: 'EduScale' }).first();
    await expect(logo).toBeVisible({ timeout: 10000 });
    // Unauthenticated on /about → logo should point to homepage
    await expect(logo).toHaveAttribute('href', '/');
  });

  test('public nav items are visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
  });

  test('theme toggle button exists', async ({ page }) => {
    await page.goto('/');
    const themeButton = page.locator('nav button:has(svg)').first();
    await expect(themeButton).toBeVisible();
  });

  test('authenticated user sees app navbar on public pages', async ({
    page,
  }) => {
    // Login as a real user — Supabase auth drives the navbar, not a mocked API
    await loginAsStudent(page);

    // Navigate to a protected page that should show the authenticated navbar
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    // Authenticated navbar should NOT show a "Get Started" button
    await expect(
      page.locator('nav a:has-text("Get Started")'),
    ).toHaveCount(0);

    // Logo should now point to /dashboard when authenticated
    const logo = page.locator('nav a').filter({ hasText: 'EduScale' }).first();
    await expect(logo).toBeVisible({ timeout: 10000 });
    await expect(logo).toHaveAttribute('href', '/dashboard');
  });
});
