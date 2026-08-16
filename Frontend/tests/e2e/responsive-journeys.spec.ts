import { test, expect } from '@playwright/test';
import { login, settle } from './helpers';

/**
 * ED-7 — "the coding-challenge page is unusable on mobile".
 *
 * The page splits problem statement and editor with a ResizablePanelGroup fixed
 * to direction="horizontal". At 390px that leaves roughly 150px for the problem
 * text and 230px for the editor, so neither is usable. These tests measure the
 * rendered widths instead of eyeballing a screenshot.
 *
 * Runs under both projects: on desktop the panels must stay side by side, on
 * mobile they must stack.
 */

const MIN_READABLE_PANEL_PX = 280;

test('coding-challenge layout is usable at this viewport', async ({
  page,
}, testInfo) => {
  await login(page, 'student');
  await page.goto('/coding-challenges');
  await settle(page);

  const firstLink = page.locator('a[href^="/coding-challenges/"]').first();
  test.skip((await firstLink.count()) === 0, 'no challenges seeded');
  await firstLink.click();
  await page.waitForURL(/\/coding-challenges\/[^/]+$/, { timeout: 30_000 });
  await settle(page);

  const panels = page.locator('[data-panel]');
  const count = await panels.count();
  test.skip(count < 2, 'resizable panel layout not present on this page');

  const boxes: { width: number; x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const box = await panels.nth(i).boundingBox();
    if (box && box.width > 0)
      boxes.push({ width: box.width, x: box.x, y: box.y });
  }
  expect(boxes.length).toBeGreaterThanOrEqual(2);

  const isMobile = testInfo.project.name === 'mobile';
  if (isMobile) {
    // Stacked: the panels must not sit side by side at 390px.
    const sideBySide = boxes.some((b, i) =>
      boxes.some(
        (other, j) =>
          j !== i && Math.abs(other.y - b.y) < 40 && other.x !== b.x,
      ),
    );
    expect(
      sideBySide,
      'panels are still side by side on a 390px viewport — neither pane is readable',
    ).toBe(false);
  }

  for (const box of boxes) {
    expect(
      box.width,
      `a panel rendered at ${Math.round(box.width)}px — below the readable minimum`,
    ).toBeGreaterThanOrEqual(MIN_READABLE_PANEL_PX);
  }

  // Nothing may spill off screen horizontally either.
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 2);
});
