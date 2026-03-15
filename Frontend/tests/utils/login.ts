import { Page, expect } from '@playwright/test';

export async function loginAsStudent(page: Page) {
  // 1. Go to login page
  await page.goto('/auth/login');

  // 2. Fill in credentials (assuming admin@eduscale.io is the test user)
  await page.fill('input[id="login-email"]', 'admin@eduscale.io');
  await page.fill('input[name="password"]', 'Admin@123');

  // 3. Submit form
  await page.click('button[type="submit"]');

  // 4. Wait for navigation to dashboard
  await page.waitForURL('**/dashboard');

  // 5. Verify successful login
  await expect(page.getByText(/Welcome back/i)).toBeVisible();
}
