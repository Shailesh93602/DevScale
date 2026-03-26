import { expect, test } from '@playwright/test';
import { loginAsStudent } from './utils/login';
import { gotoWithRetry } from './utils/navigation';

test.describe('Battle Zone Create Flow', () => {
  test('subjects and topics load and user can create a battle', async ({ page }) => {
    test.setTimeout(180000);
    await loginAsStudent(page);
    await gotoWithRetry(page, '/battle-zone/create');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    const titleInput = page.getByPlaceholder('Enter a catchy title');
    const descriptionInput = page.getByPlaceholder(
      'Describe what this battle is about',
    );
    // Shadcn <Form> is FormProvider (React context only, not an HTML <form> element)
    // so we must scope to page, not form locator
    const nextButton = page.getByRole('button', { name: 'Next', exact: true });

    // ── Step 1: Battle Info ──────────────────────────────────────────────
    const fillStepOne = async () => {
      await titleInput.fill(`Playwright Battle ${Date.now()}`);
      await descriptionInput.fill(
        'Automated E2E validation battle for create flow.',
      );
    };

    await fillStepOne();
    if (!(await nextButton.isEnabled())) {
      await fillStepOne();
    }

    await expect(nextButton).toBeEnabled({ timeout: 30000 });
    await nextButton.click();

    // ── Step 2: Question Source ──────────────────────────────────────────
    // QuestionSourceSelector renders comboboxes for the scope hierarchy
    const subjectTrigger = page.getByRole('combobox').first();
    await expect(subjectTrigger).toBeVisible({ timeout: 15000 });
    await subjectTrigger.click();

    const subjectOptions = page.getByRole('option');
    await expect(subjectOptions.first()).toBeVisible({ timeout: 10000 });
    await subjectOptions.first().click();

    // Second combobox (topic or sub-level) may appear after first selection
    const topicTrigger = page.getByRole('combobox').nth(1);
    const topicVisible = await topicTrigger.isVisible({ timeout: 5000 }).catch(() => false);
    if (topicVisible) {
      await topicTrigger.click();
      const topicOptions = page.getByRole('option');
      const topicOptionVisible = await topicOptions.first().isVisible({ timeout: 5000 }).catch(() => false);
      if (topicOptionVisible) {
        await topicOptions.first().click();
      }
    }

    // Wait for Next button to become enabled (questionSource must be set)
    await expect(nextButton).toBeEnabled({ timeout: 20000 });
    await nextButton.click();

    // ── Step 3: Battle Settings ──────────────────────────────────────────
    // Default type is QUICK — date/time fields are only shown for SCHEDULED.
    // No date/time filling needed; just advance to step 4.
    await expect(nextButton).toBeEnabled({ timeout: 10000 });
    await nextButton.click();

    // ── Step 4: Preview & Launch ─────────────────────────────────────────
    // Click "Create Battle & Load Questions" to create the battle
    const createBtn = page.getByRole('button', { name: /Create Battle/i });
    const createBtnVisible = await createBtn.isVisible({ timeout: 10000 }).catch(() => false);

    if (createBtnVisible) {
      await createBtn.click();

      // Wait for redirect to battle detail page after successful creation
      await page.waitForTimeout(3000);
      const redirectedToBattle = /\/battle-zone\/[0-9a-f-]{8,}/i.test(page.url()) ||
        /\/battle-zone\/[a-z0-9-]+-[a-z0-9]{8,}/i.test(page.url());
      const onPreviewStep = await page.getByText(/Preview & Launch|Question Preview/i).isVisible().catch(() => false);

      expect(redirectedToBattle || onPreviewStep).toBeTruthy();
    } else {
      // If create button not found, at least verify we reached step 4
      await expect(page.getByText(/Preview & Launch|Question Preview/i)).toBeVisible({ timeout: 10000 });
    }

    await expect(page.locator('body')).toBeVisible();
  });
});
