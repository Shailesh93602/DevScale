import { test, expect } from '@playwright/test';

test.describe('Authentication and Dashboard Flow', () => {
  test('successful login redirects to dashboard with user content', async ({
    page,
  }) => {
    // 1. Go to login page
    await page.goto('/auth/login');

    // 2. Fill in credentials
    await page.fill('input[id="login-email"]', 'admin@eduscale.io');
    await page.fill('input[name="password"]', 'Admin@123');

    // 3. Submit form
    await page.click('button[type="submit"]');

    // 4. Wait for navigation to dashboard
    // Note: App.tsx and middleware handle redirection to /dashboard
    await page.waitForURL('**/dashboard');

    // 5. Verify dashboard content
    await expect(page.getByText(/Welcome back/i)).toBeVisible();

    // Check for dashboard stats
    await expect(
      page.getByRole('heading', { name: 'Enrolled Roadmaps', exact: true }),
    ).toBeVisible();
    await expect(page.getByText('Topics Completed').first()).toBeVisible();
    await expect(page.getByText('Current Streak').first()).toBeVisible();

    // Check for specific sections
    await expect(page.getByText('Your Learning Progress')).toBeVisible();
    await expect(page.getByText('Recommended For You')).toBeVisible();
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
    await page.goto('/dashboard');

    await page.waitForURL('**/auth/login');
    expect(page.url()).toContain('/auth/login');
  });
});
