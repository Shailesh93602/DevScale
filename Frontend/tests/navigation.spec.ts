import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('navbar displays EduScale logo', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav a:has-text("EduScale")')).toBeVisible();
  });

  test('navbar logo points to homepage', async ({ page }) => {
    await page.goto('/about');
    const logo = page
      .locator('nav')
      .getByRole('link', { name: 'EduScale', exact: true })
      .first();
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
    await page.route('**/users/me', async (route) => {
      await route.fulfill({
        json: {
          success: true,
          message: 'ok',
          error: false,
          data: {
            user: {
              id: '1',
              username: 'student',
              name: 'Student User',
              profilePicture: '',
            },
          },
        },
      });
    });

    await page.goto('/community');
    await expect(
      page.locator('nav').getByRole('link', { name: 'Dashboard' }),
    ).toBeVisible();
    await expect(
      page.locator('nav').getByRole('link', { name: 'Get Started' }),
    ).toHaveCount(0);
  });
});
