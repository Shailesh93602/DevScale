import { Page, expect } from '@playwright/test';

async function loginWith(page: Page, email: string, password: string) {
  await page.goto('/auth/login');
  await page.fill('input[id="login-email"]', email);
  await page.fill('input[id="login-password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');
  await page
    .waitForLoadState('networkidle', { timeout: 15000 })
    .catch(() => {});
  await page.waitForTimeout(500);
  await expect(page).toHaveURL(/\/dashboard/);
}

/** Primary test user — creates/manages battles */
export async function loginAsStudent(page: Page) {
  await loginWith(page, 'testuser@yopmail.com', 'Test@123');
}

/** Secondary test user — joins battles as an opponent */
export async function loginAsPlayer2(page: Page) {
  await loginWith(page, 'battleplayer2@yopmail.com', 'Test@1234');
}
