/**
 * Visual UX audit harness.
 *
 * Renders every real user-facing page at desktop + mobile widths, saves a
 * full-page screenshot, and records console errors / failed network requests
 * per page. The screenshots are reviewed by eye to catch what functional
 * assertions miss: layout breaks, overflow, misalignment, ugly empty states,
 * broken images, contrast, spacing, responsiveness.
 *
 * Run the `setup` project first so the saved student session is fresh.
 * Output: /tmp/eduscale-ux/<route>__<viewport>.png + manifest.json
 */
import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { STUDENT_STATE } from './utils/login';

const OUT = '/tmp/eduscale-ux';
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/faq',
  '/pricing',
  '/contact',
  '/blogs',
  '/resources',
  '/career-roadmap',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
];

const AUTHED_ROUTES = [
  '/dashboard',
  '/battle-zone',
  '/battle-zone/create',
  '/battle-zone/leaderboard',
  '/battle-zone/statistics',
  '/battle-zone/my-battles',
  '/achievements',
  '/profile',
  '/profile/edit',
  '/instant-battle',
  '/admin',
];

type Capture = {
  route: string;
  viewport: string;
  authed: boolean;
  file: string;
  finalUrl: string;
  errors: string[];
  failedRequests: string[];
};

const manifest: Capture[] = [];

async function shoot(
  browser: import('@playwright/test').Browser,
  route: string,
  authed: boolean,
) {
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      storageState: authed ? STUDENT_STATE : undefined,
    });
    const page = await ctx.newPage();
    const errors: string[] = [];
    const failedRequests: string[] = [];
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 240)}`);
    });
    page.on('response', (r) => {
      const u = r.url();
      if (r.status() >= 400 && !u.includes('/_next/') && !u.includes('favicon'))
        failedRequests.push(`${r.status()} ${u.split('?')[0]}`);
    });

    await page.goto(route, { waitUntil: 'load', timeout: 30000 }).catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    // Scroll through the whole page so scroll-triggered (whileInView) animations
    // fire and lazy images load — otherwise a full-page screenshot shows blank
    // sections that a real user (who scrolls) would actually see rendered.
    await page
      .evaluate(async () => {
        const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
        const h = document.body.scrollHeight;
        for (let y = 0; y < h; y += 400) {
          window.scrollTo(0, y);
          await sleep(120);
        }
        window.scrollTo(0, document.body.scrollHeight);
        await sleep(400);
        window.scrollTo(0, 0);
        await sleep(300);
      })
      .catch(() => {});
    await page.waitForTimeout(1200);

    const slug = route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '_');
    const file = path.join(OUT, `${slug}__${vp.name}.png`);
    await page.screenshot({ path: file, fullPage: true }).catch(() => {});

    manifest.push({
      route,
      viewport: vp.name,
      authed,
      file,
      finalUrl: page.url(),
      errors: [...new Set(errors)],
      failedRequests: [...new Set(failedRequests)],
    });
    await ctx.close();
  }
}

test('capture all user-facing pages', async ({ browser }) => {
  test.setTimeout(900000);
  fs.mkdirSync(OUT, { recursive: true });
  for (const r of PUBLIC_ROUTES) await shoot(browser, r, false);
  for (const r of AUTHED_ROUTES) await shoot(browser, r, true);
  fs.writeFileSync(
    path.join(OUT, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
  );
  // Print a compact summary so console/network problems are visible in the run log.
  for (const c of manifest) {
    if (c.errors.length || c.failedRequests.length || !c.finalUrl.includes(c.route === '/' ? '' : c.route.split('/')[1])) {
      console.log(
        `[UX] ${c.route} (${c.viewport}) final=${c.finalUrl} errors=${c.errors.length} failed=${c.failedRequests.length}`,
      );
      c.errors.slice(0, 3).forEach((e) => console.log(`     ${e}`));
      c.failedRequests.slice(0, 3).forEach((f) => console.log(`     ${f}`));
    }
  }
});
