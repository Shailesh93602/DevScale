import { defineConfig, devices } from '@playwright/test';

/**
 * NEVER hardcode the port here.
 *
 * `url` and `baseURL` were both pinned to http://localhost:3000 with
 * `reuseExistingServer: !CI`. Port 3000 routinely serves a DIFFERENT Next.js
 * app on a dev machine — and when it does, Playwright finds something
 * listening, decides the server is already up, and runs the entire suite
 * against somebody else's site while reporting green.
 *
 * That is not hypothetical in this workspace: a visual sweep once captured the
 * wrong site end to end. KhataGO's config carries the same warning for the same
 * reason.
 *
 * A distinctive default port makes a collision unlikely, and PLAYWRIGHT_BASE_URL
 * lets CI or a deployed-environment run point somewhere explicit.
 */
const PORT = Number(process.env.PORT || 3220);
const EXTERNAL_BASE_URL = process.env.PLAYWRIGHT_BASE_URL;
const BASE_URL = EXTERNAL_BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests',
  globalSetup: './tests/global-setup.ts',
  // fullyParallel: false means tests within a single file run serially —
  // critical for battle-zone-real.spec.ts which shares DB state across tests.
  // Multiple workers run different FILES in parallel, which is safe.
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : 6,
  timeout: 90000,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
  },
  projects: [
    // Logs in once per user and saves the session (tests/.auth/*.json), so the
    // authenticated specs reuse it instead of re-logging-in (avoids the Supabase
    // auth rate limit). Public/unauthenticated tests don't call loginAs* and so
    // stay logged out — no global storageState is applied.
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
  // Skipped entirely when PLAYWRIGHT_BASE_URL points at an already-running or
  // deployed target — starting a second server in that case is the other half
  // of the same wrong-target bug.
  webServer: EXTERNAL_BASE_URL
    ? undefined
    : {
        command: `npx next dev -p ${PORT}`,
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
});
