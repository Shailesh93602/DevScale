import { defineConfig, devices } from '@playwright/test';

/**
 * Signed-out pages rendered against a FIXTURE API instead of a backend.
 *
 * The anonymous pages fetch during SSR, so page.route cannot stub them; this
 * config starts tests/fixtures/public-api-stub.mjs and points the dev server's
 * NEXT_PUBLIC_API_BASE_URL at it. Its own ports (3221 / 4799) so it never
 * reuses the public suite's server, which talks to a real or absent API.
 *
 *   npx playwright test -c playwright.fixture.config.ts
 */
const PORT = 3221;
const STUB_PORT = 4799;

export default defineConfig({
  testDir: './tests',
  testMatch: /coding-challenges-mobile\.spec\.ts/,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 120_000,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'mobile', use: { ...devices['Pixel 7'] } }],
  webServer: [
    {
      command: 'node tests/fixtures/public-api-stub.mjs',
      url: `http://localhost:${STUB_PORT}/health`,
      env: { STUB_PORT: String(STUB_PORT) },
      reuseExistingServer: false,
    },
    {
      command: `npx next dev -p ${PORT}`,
      url: `http://localhost:${PORT}`,
      env: {
        // The CI build's placeholders: nothing here may reach a real service.
        NEXT_PUBLIC_SUPABASE_URL: 'https://placeholder.supabase.co',
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'placeholder',
        NEXT_PUBLIC_WS_URL: `http://localhost:${STUB_PORT}`,
        NEXT_PUBLIC_API_BASE_URL: `http://localhost:${STUB_PORT}/api/v1`,
      },
      reuseExistingServer: false,
      timeout: 180_000,
    },
  ],
});
