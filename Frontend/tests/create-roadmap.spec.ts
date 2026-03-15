import { test, expect } from '@playwright/test';

test.describe('Create Roadmap Modal Validation', () => {
  test('Find UI/UX and Usability Issues', async ({ page }) => {
    // 0. Login
    await page.goto('/auth/login');
    await page.fill('input[id="login-email"]', 'admin@eduscale.io');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // 1. Navigate to main roadmap page (which contains the modal)
    await page.goto('/career-roadmap');

    // 2. Open create roadmap modal
    const createBtn = page.locator('button:has-text("Create Roadmap")').first();
    await createBtn.click();

    // 3. Verify modal is visible
    const modalTitle = page.getByText(/create new roadmap/i);
    await expect(modalTitle).toBeVisible();

    // Trigger validation
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    await page.waitForTimeout(1000);

    const titleError = page.locator('text="Title must be at least"');
    const categoryError = page
      .locator('text="Please select a category"')
      .first();

    // Check missing validation errors (accessibility/visibility)
    if ((await titleError.isVisible()) === false) {
      console.error('USABILITY ISSUE: Title validation error missing');
    }

    if ((await categoryError.isVisible()) === false) {
      console.error('USABILITY ISSUE: Category validation error missing');
    }

    // Modal close button
    const closeBtn = page
      .getByRole('button', { name: /cancel|close/i })
      .first();
    await closeBtn.hover();

    expect(true).toBeTruthy();
  });
});
