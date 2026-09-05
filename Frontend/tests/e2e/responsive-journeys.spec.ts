import { test, expect } from '@playwright/test';
import { login, settle, SEED_HINT } from './helpers';

/**
 * ED-7 — "the coding-challenge page is unusable on mobile".
 *
 * The page splits problem statement and editor with a ResizablePanelGroup fixed
 * to direction="horizontal". At 390px that leaves roughly 150px for the problem
 * text and 230px for the editor, so neither is usable. This test measures the
 * rendered widths instead of eyeballing a screenshot.
 *
 * Runs under both projects: on desktop the panels must stay side by side, on
 * mobile they must stack. The 360px tab-strip assertions live in
 * responsive-phone.spec.ts, which the config runs under the mobile project
 * only — a runtime `test.skip(project !== 'mobile')` reported a green desktop
 * result for a test that had not run.
 */

const MIN_READABLE_PANEL_PX = 280;

test('coding-challenge layout is usable at this viewport', async ({
  page,
}, testInfo) => {
  await login(page, 'student');
  await page.goto('/coding-challenges');
  await settle(page);

  // A catalogue with no challenge is a broken environment, not a pass.
  const firstLink = page.locator('a[href^="/coding-challenges/"]').first();
  await expect(firstLink, `no challenge to open — ${SEED_HINT}`).toBeVisible();
  await firstLink.click();
  await page.waitForURL(/\/coding-challenges\/[^/]+$/, { timeout: 30_000 });
  await settle(page);

  // The split layout IS the thing under test; if it is not on the page the
  // widths below are meaningless and the test must say so.
  const panels = page.locator('[data-panel]');
  await expect(
    panels,
    'resizable panel layout not present on the challenge page',
  ).toHaveCount(2);

  const boxes: { width: number; x: number; y: number }[] = [];
  for (let i = 0; i < 2; i++) {
    const box = await panels.nth(i).boundingBox();
    expect(box, `panel ${i} has no box`).not.toBeNull();
    boxes.push({ width: box!.width, x: box!.x, y: box!.y });
  }

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
