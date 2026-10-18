import { test, expect } from '@playwright/test';

/**
 * Live smoke 2026-10-18, defect E2: signed-out /coding-challenges was 807px
 * wide on a 390px phone. Each card's markdown description rendered its own
 * `# Title` <h1> and a fenced example block whose min-content width set the
 * grid column, so the page scrolled sideways and the navbar's menu button
 * sat off-screen at x≈777.
 */
test('signed-out /coding-challenges fits a 390px phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/coding-challenges');
  const cards = page.locator('li').filter({ hasText: 'Sign in to solve' });
  await expect(cards.first()).toBeVisible();

  const scrollWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );
  expect(scrollWidth, 'page scrolls horizontally').toBeLessThanOrEqual(390);

  // The title appears once per card, and the preview has no markdown blocks.
  await expect(
    page.getByText('Find Median from Data Stream', { exact: true }),
  ).toHaveCount(1);
  expect(await cards.locator('h1, pre, code').count()).toBe(0);

  const menu = page.getByRole('button', { name: 'Toggle menu' }).first();
  const box = await menu.boundingBox();
  expect(box, 'menu button has no box').not.toBeNull();
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
});
