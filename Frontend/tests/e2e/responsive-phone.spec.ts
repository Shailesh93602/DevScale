import { test, expect } from '@playwright/test';
import { login, settle, SEED_HINT } from './helpers';

/**
 * ED-7, second half — the two tab strips on the challenge page at 360px.
 *
 * Stacking the panels fixed the split, but both tab strips still CLIPPED on a
 * phone: the four problem tabs are ~430px wide, and one trigger per test case
 * makes the console strip ~480px at eight cases. Their wrappers were
 * overflow:visible inside an overflow:hidden panel, so the later tabs were
 * simply cut off and unreachable by touch. This test pins the 360px behaviour
 * (the narrowest common phone): no page-level horizontal scroll, the editor on
 * screen, and every tab in both strips reachable by scrolling the strip.
 *
 * Phone-only by CONFIG: playwright.e2e.config.ts runs this file under the
 * mobile project and ignores it on desktop. It used to live next to the
 * shared-viewport test behind `test.skip(project !== 'mobile')`, which made
 * the desktop run report a skipped-but-green result for a test that never
 * executed there.
 *
 * The run-code response is stubbed at the network edge so the console renders
 * a known number of cases — the layout under test needs eight tabs, and the
 * real executor is an external service whose case count varies per challenge.
 */
test('challenge page at 360px: no horizontal page scroll, editor reachable, tab strips scroll', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 780 });

  await page.route('**/run-code', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        error: false,
        message: 'ok',
        data: Array.from({ length: 8 }, (_, i) => ({
          input: `[${i}]`,
          expectedOutput: String(i),
          actualOutput: String(i),
          status: i === 3 ? 'Wrong Answer' : 'Accepted',
          executionTime: 1,
          memoryUsed: 1,
        })),
      }),
    }),
  );

  await login(page, 'student');
  await page.goto('/coding-challenges');
  await settle(page);
  const firstLink = page.locator('a[href^="/coding-challenges/"]').first();
  await expect(firstLink, `no challenge to open — ${SEED_HINT}`).toBeVisible();
  await firstLink.click();
  await page.waitForURL(/\/coding-challenges\/[^/]+$/, { timeout: 30_000 });
  await settle(page);

  const noPageOverflow = async (when: string) => {
    const o = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(
      o.scrollWidth,
      `page scrolls horizontally ${when} (${o.scrollWidth} > ${o.innerWidth})`,
    ).toBeLessThanOrEqual(o.innerWidth);
  };

  await noPageOverflow('on load');

  // The editor is on screen and no wider than the viewport.
  const editor = page.locator('.monaco-editor').first();
  await expect(editor).toBeVisible({ timeout: 30_000 });
  const editorBox = await editor.boundingBox();
  expect(editorBox, 'editor has no box').not.toBeNull();
  expect(editorBox!.x).toBeGreaterThanOrEqual(0);
  expect(editorBox!.x + editorBox!.width).toBeLessThanOrEqual(360);

  // Every tab in a strip must be reachable: the strip (or its wrapper) scrolls,
  // and after scrolling the last tab into view its right edge is on screen.
  const assertStripScrolls = async (tabText: string, expectedTabs: number) => {
    const strip = page
      .getByRole('tablist')
      .filter({ hasText: tabText })
      .first();
    await expect(strip).toBeVisible();
    const tabs = strip.getByRole('tab');
    await expect(tabs).toHaveCount(expectedTabs);

    const scroller = await strip.evaluate((el) => {
      // Either the list itself or its immediate wrapper is the scroll container.
      const candidates = [el, el.parentElement as HTMLElement];
      const found = candidates.find((c) => {
        const ox = getComputedStyle(c).overflowX;
        return ox === 'auto' || ox === 'scroll';
      });
      return found
        ? {
            overflowX: getComputedStyle(found).overflowX,
            scrollWidth: found.scrollWidth,
            clientWidth: found.clientWidth,
          }
        : null;
    });
    expect(scroller, `${tabText} strip has no scroll container`).not.toBeNull();

    const last = tabs.last();
    await last.scrollIntoViewIfNeeded();
    const box = await last.boundingBox();
    expect(box, `${tabText} last tab has no box`).not.toBeNull();
    expect(
      Math.round(box!.x + box!.width),
      `${tabText} last tab is still off screen after scrolling the strip`,
    ).toBeLessThanOrEqual(360);
    await last.click();
    await expect(last).toHaveAttribute('data-state', 'active');
  };

  await assertStripScrolls('Description', 4);
  // Back to the problem statement so the next steps see the normal layout.
  await page.getByRole('tab', { name: 'Description' }).click();

  // Run → eight console tabs.
  const runButton = page.getByRole('button', { name: 'Run Code' });
  await expect(runButton).toBeVisible();
  await runButton.click();
  await expect(page.getByRole('tab', { name: 'Case 1' })).toBeVisible({
    timeout: 20_000,
  });
  await assertStripScrolls('Case 1', 8);
  await noPageOverflow('after running code');
});
