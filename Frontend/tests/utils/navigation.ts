import { Page } from '@playwright/test';

export async function gotoWithRetry(
  page: Page,
  url: string,
  attempts = 3,
): Promise<void> {
  let lastError: Error | null = null;

  for (let i = 0; i < attempts; i++) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      return;
    } catch (error) {
      lastError = error as Error;
      if (page.isClosed()) {
        break;
      }
      await page.waitForTimeout(1000);
    }
  }

  throw lastError ?? new Error(`Failed to navigate to ${url}`);
}
