import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { loginAsStudent } from './utils/login';

const reviewDir = process.env.BATTLE_REVIEW_DIR
  ? path.resolve(process.env.BATTLE_REVIEW_DIR)
  : '/tmp/eduscale-playwright/battle-zone-review';

const routesToReview = [
  '/battle-zone',
  '/battle-zone/battles',
  '/battle-zone/my-battles',
  '/battle-zone/leaderboard',
  '/battle-zone/statistics',
  '/battle-zone/community',
  '/battle-zone/create',
];

const isIgnorableFailedRequest = (url: string, errorText: string) => {
  if (errorText !== 'net::ERR_ABORTED') {
    return false;
  }

  return (
    url.includes('/_next/static/webpack/') ||
    url.includes('/dashboard?_rsc=') ||
    url.endsWith('/dashboard') ||
    url.endsWith('/auth/login')
  );
};

const waitForRouteReadyState = async (route: string, page: Page) => {
  if (route === '/battle-zone/statistics') {
    await Promise.race([
      page
        .getByRole('heading', { name: 'Battle Statistics' })
        .waitFor({ timeout: 12000 }),
      page
        .getByRole('heading', { name: 'Statistics unavailable' })
        .waitFor({ timeout: 12000 }),
    ]);
    return;
  }

  if (route === '/battle-zone/my-battles') {
    await page
      .getByRole('heading', { name: 'My Battles' })
      .waitFor({ timeout: 12000 });
    return;
  }

  if (route === '/battle-zone/create') {
    await page
      .getByRole('heading', { name: /Create/i })
      .first()
      .waitFor({ timeout: 12000 });
    return;
  }

  if (route === '/battle-zone') {
    await Promise.race([
      page
        .getByRole('heading', { name: 'Battle Zone Arena' })
        .waitFor({ timeout: 12000 }),
      page.getByText('Welcome to Battle Zone!').waitFor({ timeout: 12000 }),
    ]);
    return;
  }

  await page
    .waitForLoadState('networkidle', { timeout: 12000 })
    .catch(() => {});
};

test.describe('Battle Zone authenticated review', () => {
  test('login and capture visual/functional review artifacts', async ({
    page,
  }) => {
    test.setTimeout(420000);
    mkdirSync(reviewDir, { recursive: true });

    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];
    const serverErrors: string[] = [];
    const routeIssues: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('requestfailed', (req) => {
      const errorText = req.failure()?.errorText || 'failed';
      const url = req.url();
      if (isIgnorableFailedRequest(url, errorText)) {
        return;
      }
      failedRequests.push(`${req.method()} ${url} :: ${errorText}`);
    });

    page.on('response', (res) => {
      if (res.status() >= 500) {
        serverErrors.push(
          `${res.status()} ${res.request().method()} ${res.url()}`,
        );
      }
    });

    await loginAsStudent(page);
    await expect(page).toHaveURL(/\/dashboard/);
    await page.screenshot({
      path: path.join(reviewDir, '01-dashboard-after-login.png'),
      fullPage: true,
    });

    for (let i = 0; i < routesToReview.length; i++) {
      const route = routesToReview[i];
      try {
        const response = await page.goto(route, {
          waitUntil: 'domcontentloaded',
          timeout: 60000,
        });

        if ((response?.status() ?? 0) >= 500) {
          routeIssues.push(`${route}: HTTP ${response?.status()}`);
        }

        await page
          .waitForLoadState('networkidle', { timeout: 15000 })
          .catch(() => {});
        await expect(page.locator('body')).toBeVisible();
        await waitForRouteReadyState(route, page);
        await page.waitForTimeout(1000);
      } catch (error) {
        routeIssues.push(
          `${route}: ${(error as Error).message.split('\n')[0]}`,
        );
      }

      const screenshotPath = path.join(
        reviewDir,
        `${String(i + 2).padStart(2, '0')}-${route.replace(/\//g, '_') || 'home'}.png`,
      );

      try {
        await page.locator('body').screenshot({
          path: screenshotPath,
          timeout: 30000,
        });
      } catch {
        routeIssues.push(`${route}: screenshot timeout`);
      }
    }

    const report = [
      '# Battle Zone Auth Review',
      '',
      `Reviewed routes: ${routesToReview.join(', ')}`,
      '',
      `Console error count: ${consoleErrors.length}`,
      ...consoleErrors.map((e) => `- ${e}`),
      '',
      `Failed request count: ${failedRequests.length}`,
      ...failedRequests.map((e) => `- ${e}`),
      '',
      `5xx response count: ${serverErrors.length}`,
      ...serverErrors.map((e) => `- ${e}`),
      '',
      `Route issues: ${routeIssues.length}`,
      ...routeIssues.map((e) => `- ${e}`),
      '',
    ].join('\n');

    writeFileSync(path.join(reviewDir, 'review-report.md'), report, 'utf-8');
  });
});
