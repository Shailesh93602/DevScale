import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page loads without errors', async ({ page }) => {
    await expect(page).toHaveTitle(/EduScale/);
  });

  test('hero section displays EduScale branding', async ({ page }) => {
    const heroText = page.locator('text=EduScale is the all-in-one platform');
    await expect(heroText).toBeVisible();
  });

  test('hero section has CTA buttons', async ({ page }) => {
    await expect(page.locator('text=Get Started Free').first()).toBeVisible();
    await expect(page.locator('text=Explore Features').first()).toBeVisible();
  });

  test('features section is visible on scroll', async ({ page }) => {
    const features = page.locator('text=Test Your Skills in Battle Zone');
    await features.scrollIntoViewIfNeeded();
    await expect(features).toBeVisible();
  });

  /**
   * The leaderboard block is live data, not copy. Its heading became "Rating
   * Leaderboard" on 2026-09-03 (67c55a05) when it started reading
   * GET /ratings/leaderboard, and this test kept looking for the retired
   * "Weekly Leaderboard" text. Matching the new heading alone would repeat
   * the mistake — a heading proves nothing about what is under it — so the
   * assertion is tied to the API answer the block rendered from: N rated
   * players → N podium rows (up to three) with the top rating on screen; none
   * → the honest empty state. Both branches assert; neither is optional.
   */
  test('leaderboard section renders the ratings API — rows or an honest empty state', async ({
    page,
  }) => {
    // beforeEach has already loaded '/', so navigate again with the response
    // listener armed first, or the request this test needs is already gone.
    const ratingsResponse = page.waitForResponse(
      (r) =>
        r.url().includes('/ratings/leaderboard') &&
        r.request().method() === 'GET',
    );
    await page.goto('/');
    const response = await ratingsResponse;
    expect(response.status()).toBe(200);
    const body = (await response.json()) as {
      data?: { rating: number; user: { username: string } }[];
    };
    const entries = Array.isArray(body.data) ? body.data : [];

    const board = page.locator('[data-leaderboard-source="ratings-api"]');
    await expect(board).toHaveCount(1);
    await board.scrollIntoViewIfNeeded();
    await expect(
      board.getByRole('heading', { name: 'Rating Leaderboard' }),
    ).toBeVisible();

    const podium = board.getByRole('list', { name: 'Top three players' });
    const emptyState = board.getByText('No rated players yet');

    if (entries.length === 0) {
      await expect(emptyState).toBeVisible();
      await expect(podium).toHaveCount(0);
      return;
    }

    await expect(podium).toBeVisible();
    // Empty podium slots are aria-hidden <li>s and do not count as list items.
    await expect(podium.getByRole('listitem')).toHaveCount(
      Math.min(entries.length, 3),
    );
    await expect(podium).toContainText(`${entries[0].rating} rating`);
    await expect(
      board
        .getByRole('list', { name: 'Players ranked fourth and fifth' })
        .getByRole('listitem'),
    ).toHaveCount(Math.max(0, Math.min(entries.length, 5) - 3));
    await expect(emptyState).toHaveCount(0);
  });

  test('scroll to top button is present', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);
    const scrollBtn = page.locator('main svg[viewBox="0 0 24 24"]').last();
    await expect(scrollBtn).toBeVisible();
  });

  test('no old branding references visible', async ({ page }) => {
    const content = await page.textContent('body');
    expect(content).not.toContain('LegacyBrand');
    expect(content).not.toContain('OldName');
  });
});
