import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';

type RouteAudit = {
  route: string;
  finalPath: string;
  httpStatus: number | null;
  contentCovered: boolean;
};

test.use({ video: 'on' });

test.describe('Focused smoke routes and core journeys', () => {
  test('student/admin/dashboard/challenges/roadmaps route smoke', async ({
    page,
  }) => {
    const targets = [
      '/auth/login',
      '/dashboard',
      '/admin',
      '/coding-challenges',
      '/career-roadmap',
      '/career-roadmap/roadmaps',
    ];

    const evidenceDir = path.join(
      process.cwd(),
      'test-results',
      'focused-smoke',
      'screenshots',
    );
    mkdirSync(evidenceDir, { recursive: true });

    const routeAudit: RouteAudit[] = [];

    for (const route of targets) {
      const response = await page.goto(route, {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForTimeout(800);

      const finalPath = new URL(page.url()).pathname;
      const contentCovered = finalPath === route;

      routeAudit.push({
        route,
        finalPath,
        httpStatus: response?.status() ?? null,
        contentCovered,
      });

      const screenshotName = route
        .replace(/\//g, '_')
        .replace(/^_+/, '')
        .concat('.png');

      await page.screenshot({
        path: path.join(evidenceDir, screenshotName),
        fullPage: true,
      });

      expect(response?.status() ?? 0).toBeLessThan(500);
      expect(page.locator('body')).toBeVisible();
    }

    const reportPath = path.join(
      process.cwd(),
      'test-results',
      'focused-smoke',
      'route-coverage.json',
    );
    mkdirSync(path.dirname(reportPath), { recursive: true });
    writeFileSync(reportPath, JSON.stringify(routeAudit, null, 2), 'utf-8');
  });
});
