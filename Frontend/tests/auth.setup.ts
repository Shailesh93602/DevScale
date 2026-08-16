import { test as setup } from '@playwright/test';
import fs from 'node:fs';
import {
  realLogin,
  AUTH_DIR,
  STUDENT_STATE,
  PLAYER2_STATE,
} from './utils/login';
import { testUser } from './utils/testUsers';

/**
 * Authenticate ONCE per user and persist the session. Every authenticated test
 * then reuses the saved state (see utils/login.ts) instead of logging in again,
 * which keeps Supabase auth calls to ~2 per run and avoids the rate limit.
 */
setup.beforeAll(() => {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
});

setup('authenticate as student', async ({ page }) => {
  const { email, password } = testUser('student');
  await realLogin(page, email, password);
  await page.context().storageState({ path: STUDENT_STATE });
});

setup('authenticate as player2', async ({ page }) => {
  const { email, password } = testUser('student2');
  await realLogin(page, email, password);
  await page.context().storageState({ path: PLAYER2_STATE });
});
