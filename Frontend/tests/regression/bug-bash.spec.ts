import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// This is our central bug tracker store for this test run
const bugs: { route: string; issue: string; severity: string }[] = [];
const evidencesDir = path.join(process.cwd(), 'playwright-report', 'evidences');

test.beforeAll(() => {
  if (!fs.existsSync(evidencesDir)) {
    fs.mkdirSync(evidencesDir, { recursive: true });
  }
});

test.afterAll(() => {
  const reportPath = path.join(process.cwd(), 'bug-bash-report.md');
  const markdown = [
    '# UI Regression & Bug Bash Report',
    'Generated automatically by Playwright',
    '',
    `Total Issues Found: **${bugs.length}**`,
    '',
    ...bugs.map(
      (bug, i) =>
        `### ${i + 1}. [${bug.severity}] Issue on \`${bug.route}\`\n**Description:** ${bug.issue}`,
    ),
  ].join('\n');

  fs.writeFileSync(reportPath, markdown, 'utf-8');
});

const routesToCheck = [
  '/',
  '/about',
  '/auth/login',
  '/auth/register',
  '/dashboard',
  '/career-roadmap',
  '/coding-challenges',
  '/battle-zone',
  '/community',
];

const emptyStateIndicators = [
  'No challenges found',
  'No roadmaps',
  '0 results',
  'does not exist',
  '404',
];

test.describe('Automated UI Bug Bash', () => {
  for (const route of routesToCheck) {
    test(`Scan route for visual bugs and empty content: ${route}`, async ({
      page,
    }) => {
      const pageErrors: string[] = [];

      // Catch console errors
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          pageErrors.push(`Console Error: ${msg.text()}`);
        }
      });

      // Catch page errors
      page.on('pageerror', (err) => {
        pageErrors.push(`JS Exception: ${err.message}`);
      });

      console.log(`Navigating to ${route}`);
      // Navigate to route
      await page
        .goto(route, { waitUntil: 'networkidle', timeout: 15000 })
        .catch((e) => {
          bugs.push({
            route,
            issue: `Failed to load page: ${e.message}`,
            severity: 'CRITICAL',
          });
        });

      // Check for empty states
      const textContent = await page.content();
      const lowerContent = textContent.toLowerCase();

      for (const indicator of emptyStateIndicators) {
        if (lowerContent.includes(indicator.toLowerCase())) {
          bugs.push({
            route,
            issue: `Found empty state / missing data indicator: "${indicator}"`,
            severity: 'HIGH',
          });
        }
      }

      // Record any JS errors
      for (const err of pageErrors) {
        bugs.push({
          route,
          issue: err,
          severity: 'HIGH',
        });
      }

      // Take a screenshot as visual evidence
      const screenshotName = route.replace(/\//g, '_') || 'home';
      await page.screenshot({
        path: path.join(evidencesDir, `${screenshotName}.png`),
        fullPage: true,
      });

      // Simple pass just so test doesn't fail runner (we are collecting bugs)
      expect(true).toBeTruthy();
    });
  }
});
