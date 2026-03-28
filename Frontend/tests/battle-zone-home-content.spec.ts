import { expect, test } from '@playwright/test';
import { loginAsStudent } from './utils/login';
import { gotoWithRetry } from './utils/navigation';

test.describe('Battle Zone Home Experience', () => {
  test('home page shows actionable battle discovery content', async ({
    page,
  }) => {
    test.setTimeout(180000);
    await loginAsStudent(page);

    await gotoWithRetry(page, '/battle-zone');
    await page
      .waitForLoadState('networkidle', { timeout: 15000 })
      .catch(() => {});

    await expect(
      page.getByRole('heading', { name: 'Battle Zone Arena' }),
    ).toBeVisible();
    await expect(page.getByPlaceholder('Search battles...')).toBeVisible();
    await expect(
      page
        .getByRole('button', {
          name: /Create Battle|Create Your First Battle/i,
        })
        .first(),
    ).toBeVisible();
  });
});
