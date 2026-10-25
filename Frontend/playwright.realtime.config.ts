import { defineConfig, devices } from '@playwright/test';

// Local realtime proof; services come from Backend/qa/realtime/run-local-proof.sh.
// See Backend/docs/REALTIME_HOSTING.md, "Local proof".
export default defineConfig({
  testDir: './realtime-local',
  outputDir: '/tmp/eduscale-playwright/realtime-local',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 300_000,
  reporter: [['list']],
  use: {
    baseURL: process.env.RT_FRONTEND_URL || 'http://127.0.0.1:3055',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 20_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
