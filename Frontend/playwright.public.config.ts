import { defineConfig, devices } from '@playwright/test';

/**
 * The public-surface suite: specs that assert what a visitor with NO session
 * sees. Currently tests/anonymous-read-only.spec.ts.
 *
 * WHY A SEPARATE CONFIG.
 *
 * playwright.config.ts has a globalSetup that runs `npm run seed:battles` in
 * Backend/ before every run. That script loads Backend/.env, whose
 * DATABASE_URL points at the shared Supabase instance — so "run the
 * anonymous e2e locally" would write battle rows to a database this suite
 * never reads. These specs need no seed, no backend and no login, so they get
 * a config with no globalSetup and no auth project.
 *
 * Same port discipline as the main config: 3220, overridable, and an
 * already-running server on that port is reused rather than duplicated.
 *
 *   npx playwright test -c playwright.public.config.ts
 */
const PORT = Number(process.env.PORT || 3220);
const EXTERNAL_BASE_URL = process.env.PLAYWRIGHT_BASE_URL;
const BASE_URL = EXTERNAL_BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests',
  testMatch: /anonymous-read-only\.spec\.ts/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 120_000,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }]]
    : [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: EXTERNAL_BASE_URL
    ? undefined
    : {
        command: `npx next dev -p ${PORT}`,
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
