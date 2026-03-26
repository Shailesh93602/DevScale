import { test, expect } from '@playwright/test';

test.describe('Authentication and Dashboard Flow', () => {
  test('successful login redirects to dashboard with user content', async ({
    page,
  }) => {
    // 1. Go to login page
    await page.goto('/auth/login');

    // 2. Fill in credentials (use testuser@yopmail.com — confirmed working with dashboard)
    await page.fill('input[id="login-email"]', 'testuser@yopmail.com');
    await page.fill('input[id="login-password"]', 'Test@123');

    // 3. Submit form
    await page.click('button[type="submit"]');

    // 4. Wait for navigation to dashboard
    // Note: App.tsx and middleware handle redirection to /dashboard
    await page.waitForURL('**/dashboard');

    // 5. Verify dashboard content — use longer timeouts since real Supabase auth + API calls take time
    await expect(page.getByText(/Welcome back/i)).toBeVisible({ timeout: 30000 });

    // Check for dashboard stats — StatCard renders titles as <p> tags, not headings
    await expect(page.getByText('Enrolled Roadmaps').first()).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Topics Completed').first()).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Current Streak').first()).toBeVisible({ timeout: 20000 });

    // Check for specific sections
    await expect(page.getByText('Your Learning Progress')).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Recommended For You')).toBeVisible({ timeout: 20000 });
  });

  test('failed login shows error message', async ({ page }) => {
    await page.goto('/auth/login');
    const randomEmail = `wrong-${Date.now()}@email.com`;
    await page.fill('input[id="login-email"]', randomEmail);
    // Use a password that meets client-side validation requirements but is incorrect
    await page.fill('input[id="login-password"]', 'WrongPassword1!');
    await page.click('button[type="submit"]');

    await expect(page.getByText(/invalid|incorrect|failed|error/i)).toBeVisible(
      { timeout: 20000 },
    );
  });

  test('unauthenticated user redirected when accessing private routes', async ({
    page,
  }) => {
    // Attempt to access a private route directly
    // goto follows the server redirect to /auth/login, use domcontentloaded to avoid hanging
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // The middleware redirects to /auth/login?callbackUrl=... — check URL directly
    await page.waitForURL(/\/auth\/login/, { timeout: 20000 });
    expect(page.url()).toContain('/auth/login');
  });
});
