import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { collectBrokenImages, settle, watchPage } from './helpers';

/**
 * Per-page health gate, run on desktop (1440) and mobile (390):
 *   0 console errors · 0 uncaught errors · 0 failed requests · every image
 *   loads · no axe WCAG 2 A/AA violations.
 *
 * Only public pages are covered here so the suite stays session-free and fast;
 * the authenticated surfaces are covered by journeys.spec.ts.
 */

const PUBLIC_PAGES = [
  { path: '/', name: 'landing' },
  { path: '/auth/login', name: 'login' },
  { path: '/auth/register', name: 'register' },
  { path: '/career-roadmap', name: 'career roadmap' },
  { path: '/coding-challenges', name: 'coding challenges' },
  { path: '/battle-zone', name: 'battle zone' },
  { path: '/articles', name: 'articles' },
  { path: '/blogs', name: 'blogs' },
  { path: '/pricing', name: 'pricing' },
  { path: '/contact', name: 'contact' },
];

for (const { path, name } of PUBLIC_PAGES) {
  test(`${name} (${path}) — no console errors, no failed requests, no broken images`, async ({
    page,
  }) => {
    const problems = watchPage(page);
    const res = await page.goto(path, { waitUntil: 'domcontentloaded' });
    expect(res?.status(), `${path} did not return a page`).toBeLessThan(400);
    await settle(page);

    problems.brokenImages = await collectBrokenImages(page);

    expect(problems.pageErrors, `uncaught errors on ${path}`).toEqual([]);
    expect(problems.consoleErrors, `console errors on ${path}`).toEqual([]);
    expect(problems.failedRequests, `failed requests on ${path}`).toEqual([]);
    expect(problems.brokenImages, `broken images on ${path}`).toEqual([]);
  });

  test(`${name} (${path}) — axe WCAG 2 A/AA`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await settle(page);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('nextjs-portal')
      .analyze();

    const summary = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.length,
      help: v.help,
      first: v.nodes[0]?.html?.slice(0, 160),
    }));
    expect(summary, `a11y violations on ${path}`).toEqual([]);
  });
}

for (const { path, name } of PUBLIC_PAGES) {
  test(`${name} (${path}) — never scrolls horizontally`, async ({
    page,
  }, testInfo) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await settle(page);
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(
      overflow.scrollWidth,
      `${path} overflows horizontally on ${testInfo.project.name}`,
    ).toBeLessThanOrEqual(overflow.clientWidth + 2);
  });
}
