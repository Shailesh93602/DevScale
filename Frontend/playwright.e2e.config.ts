import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end journey suite (tests/e2e).
 *
 * Runs on pinned ports so it never collides with the other Playwright configs
 * or a dev server someone left running: frontend 3220, backend 4010. The
 * backend must already be up on 4010 and pointed at a LOCAL database — these
 * specs create battles, submit answers and publish articles.
 *
 *   cd Backend && DATABASE_URL=postgresql://localhost:5432/eduscale_e2e \
 *     DIRECT_URL=... REDIS_URL=redis://localhost:6379/5 PORT=4010 \
 *     node -r module-alias/register dist/main.js
 *   cd Frontend && npx playwright test -c playwright.e2e.config.ts
 */
const FRONTEND_PORT = 3220;
const API_BASE = process.env.E2E_API_BASE ?? 'http://localhost:4010/api/v1';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: '/tmp/eduscale-playwright/e2e',
  // Battle specs share DB state across steps inside a file; different files are
  // still free to run in parallel.
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Serial by default: the Next dev server compiles routes on first hit and
  // Supabase rate-limits auth, so parallel workers make the suite flaky rather
  // than fast. Raise it against a production build.
  workers: Number(process.env.E2E_WORKERS ?? 1),
  timeout: 180_000,
  expect: { timeout: 15_000 },
  reporter: [
    ['list'],
    [
      'html',
      { open: 'never', outputFolder: '/tmp/eduscale-playwright/e2e-report' },
    ],
  ],
  use: {
    baseURL: `http://localhost:${FRONTEND_PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 20_000,
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
      // Phone-only assertions are excluded HERE, not skipped at runtime: a
      // `test.skip(project !== 'mobile')` inside the spec reported a green,
      // skipped desktop result for a test that never ran.
      testIgnore: /responsive-phone\.spec\.ts/,
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } },
      testMatch: /(page-health|responsive-journeys|responsive-phone)\.spec\.ts/,
    },
  ],
  webServer: {
    command: `npx next dev -p ${FRONTEND_PORT} --webpack`,
    url: `http://localhost:${FRONTEND_PORT}`,
    reuseExistingServer: true,
    timeout: 180_000,
    env: {
      NEXT_PUBLIC_API_BASE_URL: API_BASE,
      NEXT_PUBLIC_WS_URL: API_BASE.replace('/api/v1', ''),
    },
  },
});
