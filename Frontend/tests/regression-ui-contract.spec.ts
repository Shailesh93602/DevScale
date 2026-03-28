import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { loginAsStudent } from './utils/login';

const srcDir = path.join(process.cwd(), 'src');

function collectSourceFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(fullPath));
      continue;
    }

    if (
      !/\.(ts|tsx|js|jsx)$/.test(entry.name) ||
      entry.name.endsWith('.d.ts')
    ) {
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

test('regression: source does not use Tailwind dark: classes in TS/TSX/JS/JSX', async () => {
  const sourceFiles = collectSourceFiles(srcDir);
  const offenders: string[] = [];

  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf8');
    // Allow dark:prose-invert — it's a Tailwind Typography plugin modifier,
    // not a color override, and required for prose content in both themes.
    const hasForbiddenDark = /\bdark:(?!prose-invert\b)/.test(content);
    if (hasForbiddenDark) {
      offenders.push(path.relative(process.cwd(), file));
    }
  }

  expect(
    offenders,
    `Forbidden dark: classes found in source files:\n${offenders.join('\n')}`,
  ).toEqual([]);
});

test('regression: redux-persist uses SSR-safe storage strategy', async () => {
  const storeFile = path.join(srcDir, 'lib', 'store.ts');
  const content = fs.readFileSync(storeFile, 'utf8');

  expect(content).toContain('const createNoopStorage');
  expect(content).toContain(
    "typeof window !== 'undefined' ? storage : createNoopStorage()",
  );
});

test('regression: navbar alignment classes are stable and no redux-persist SSR warning appears on public pages', async ({
  page,
}) => {
  const navbarFile = path.join(srcDir, 'components', 'Navbar', 'index.tsx');
  const navbarContent = fs.readFileSync(navbarFile, 'utf8');

  // Verify stable structural classes exist in the navbar
  expect(navbarContent).toContain('hidden flex-1 items-center justify-center');
  expect(navbarContent).toContain('flex items-center gap-1 rounded-full p-1');
  expect(navbarContent).toContain('fixed inset-x-0 top-0 z-50');

  const consoleMessages: string[] = [];
  page.on('console', (message) => {
    consoleMessages.push(message.text());
  });

  await page.goto('/about');
  await expect(page.locator('nav')).toBeVisible();

  const reduxPersistWarning = consoleMessages.find((message) =>
    /redux-persist failed to create sync storage/i.test(message),
  );
  expect(reduxPersistWarning).toBeUndefined();
});

test('regression: primary CTA buttons use white text', async ({ page }) => {
  // career-roadmap is auth-required — login first
  await loginAsStudent(page);
  await page.goto('/career-roadmap');
  await page
    .waitForLoadState('networkidle', { timeout: 15000 })
    .catch(() => {});

  const createRoadmapButton = page
    .getByRole('button', {
      name: /Create Roadmap/i,
    })
    .first();
  const explorePathsButton = page
    .getByRole('button', {
      name: /Explore Popular Paths/i,
    })
    .first();

  await expect(createRoadmapButton).toBeVisible({ timeout: 10000 });
  await expect(explorePathsButton).toBeVisible({ timeout: 10000 });

  await expect(createRoadmapButton).toHaveClass(/bg-primary/);
  await expect(createRoadmapButton).toHaveClass(/text-primary-foreground/);
  await expect(explorePathsButton).toHaveClass(/bg-primary/);
  await expect(explorePathsButton).toHaveClass(/text-primary-foreground/);
});
