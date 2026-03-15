import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

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
    if (/\bdark:/.test(content)) {
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

  expect(navbarContent).toContain('hidden h-full items-center gap-1 md:flex');
  expect(navbarContent).toContain(
    'flex h-10 items-center gap-2 rounded-md px-3 py-2',
  );
  expect(navbarContent).toContain(
    'flex h-10 items-center justify-center rounded-md px-1',
  );

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
  await page.goto('/career-roadmap');

  const createRoadmapButton = page.getByRole('button', {
    name: /Create Roadmap/i,
  });
  const explorePathsButton = page.getByRole('button', {
    name: /Explore Popular Paths/i,
  });

  await expect(createRoadmapButton).toBeVisible();
  await expect(explorePathsButton).toBeVisible();

  await expect(createRoadmapButton).toHaveClass(/bg-primary/);
  await expect(createRoadmapButton).toHaveClass(/text-white/);
  await expect(explorePathsButton).toHaveClass(/bg-primary/);
  await expect(explorePathsButton).toHaveClass(/text-white/);
});
