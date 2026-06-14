import { test as setup } from '@playwright/test';
import fs from 'node:fs';
import {
  realLogin,
  AUTH_DIR,
  STUDENT_STATE,
  PLAYER2_STATE,
} from './utils/login';

/**
 * Authenticate ONCE per user and persist the session. Every authenticated test
 * then reuses the saved state (see utils/login.ts) instead of logging in again,
 * which keeps Supabase auth calls to ~2 per run and avoids the rate limit.
 */
setup.beforeAll(() => {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
});

setup('authenticate as student', async ({ page }) => {
  await realLogin(page, 'testuser@yopmail.com', 'Test@123');
  await page.context().storageState({ path: STUDENT_STATE });
});

setup('authenticate as player2', async ({ page }) => {
  await realLogin(page, 'battleplayer2@yopmail.com', 'Test@1234');
  await page.context().storageState({ path: PLAYER2_STATE });
});
