import { test, expect } from '@playwright/test';
import { testUser } from './utils/testUsers';

/**
 * The create-roadmap modal validates on submit.
 *
 * Every check here is a hard assertion. The previous version console.error'd
 * "USABILITY ISSUE" when a validation message was missing and ended with
 * `expect(true).toBeTruthy()`, so it could not fail. The messages asserted
 * are the zod schema's own — `Title must be at least 5 characters`, `Please
 * select a category` (src/app/career-roadmap/create-roadmap.tsx).
 */
test.describe('Create Roadmap Modal Validation', () => {
  test('an empty submit shows the title and category errors, and Cancel closes the modal', async ({
    page,
  }) => {
    await page.goto('/auth/login');
    const admin = testUser('admin');
    await page.fill('input[id="login-email"]', admin.email);
    await page.fill('input[id="login-password"]', admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    await page.goto('/career-roadmap');
    const createBtn = page
      .getByRole('button', { name: /Create Roadmap/i })
      .first();
    await expect(createBtn).toBeVisible({ timeout: 15000 });
    await createBtn.click();

    const modalTitle = page.getByText(/create new roadmap/i).first();
    await expect(modalTitle).toBeVisible();

    // Submit with nothing filled in.
    await page.locator('button[type="submit"]').first().click();

    await expect(
      page.getByText(/Title must be at least/),
      'title validation error missing',
    ).toBeVisible();
    await expect(
      page.getByText('Please select a category').first(),
      'category validation error missing',
    ).toBeVisible();

    const closeBtn = page
      .getByRole('button', { name: /cancel|close/i })
      .first();
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(modalTitle).toBeHidden();
  });
});
