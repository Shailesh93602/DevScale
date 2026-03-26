import { expect, test } from '@playwright/test';

const publicRoutes = ['/', '/about', '/contact', '/faq', '/blogs'];

test.describe('Public UI Regression', () => {
  test.setTimeout(120000);
  test.describe.configure({ mode: 'serial' });

  test('public pages keep public navbar without auth redirect', async ({
    page,
  }) => {
    for (const route of publicRoutes) {
      await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await expect(page).toHaveURL(
        new RegExp(`${route === '/' ? '/$' : route}$`),
      );
      await expect(page.locator('nav a:has-text("EduScale")')).toBeVisible({
        timeout: 20000,
      });
      await expect(page.getByRole('navigation').getByRole('link', { name: 'Log in' })).toBeVisible({
        timeout: 20000,
      });
      await expect(page.getByRole('navigation').getByRole('link', { name: 'Get Started' })).toBeVisible({
        timeout: 20000,
      });
    }
  });

  test('primary CTAs keep high-contrast foreground classes', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 45000 });
    const heroCta = page.getByRole('link', { name: /get started/i }).first();
    await expect(heroCta).toBeVisible({ timeout: 20000 });
    await expect(heroCta).toHaveClass(/text-primary-foreground/);

    await page.goto('/contact', {
      waitUntil: 'domcontentloaded',
      timeout: 45000,
    });
    await expect(page.getByLabel('Email')).toBeVisible({ timeout: 20000 });
    const sendButton = page.getByRole('button', { name: /send|sending/i });
    await expect(sendButton).toBeVisible({ timeout: 20000 });
    await expect(sendButton).toHaveClass(/text-primary-foreground/);
  });
});
