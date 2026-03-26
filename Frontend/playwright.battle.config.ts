import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: '/tmp/mrengineer-playwright/battle-zone',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 90000,
  reporter: [['html', { open: 'never', outputFolder: '/tmp/mrengineer-playwright/battle-zone-report' }]],
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'retain-on-failure',
    screenshot: 'on',
    video: 'on',
    actionTimeout: 20000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npx next dev -p 3001 --webpack',
    url: 'http://localhost:3001',
    reuseExistingServer: false,
    timeout: 120000,
  },
});
