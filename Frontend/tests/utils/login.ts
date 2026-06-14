import { Page, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

export const AUTH_DIR = path.join(__dirname, '..', '.auth');
export const STUDENT_STATE = path.join(AUTH_DIR, 'student.json');
export const PLAYER2_STATE = path.join(AUTH_DIR, 'player2.json');

/**
 * Real UI login. Used by the `setup` project to authenticate ONCE per user and
 * capture the session — see auth.setup.ts. Avoid calling this from individual
 * tests; use loginAsStudent/loginAsPlayer2 which reuse the saved session and so
 * don't hammer Supabase auth (which rate-limits).
 */
export async function realLogin(page: Page, email: string, password: string) {
  await page.goto('/auth/login');
  await page.fill('input[id="login-email"]', email);
  await page.fill('input[id="login-password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');
  await page
    .waitForLoadState('networkidle', { timeout: 15000 })
    .catch(() => {});
  await page.waitForTimeout(500);
  await expect(page).toHaveURL(/\/dashboard/);
}

/**
 * Restore a previously-captured session (cookies + localStorage) into the
 * current page's context, so the app comes up authenticated WITHOUT a fresh
 * Supabase login. Returns true if a saved state existed and was applied.
 */
async function restoreSession(page: Page, stateFile: string): Promise<boolean> {
  if (!fs.existsSync(stateFile)) return false;
  const state = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
  if (Array.isArray(state.cookies) && state.cookies.length) {
    await page.context().addCookies(state.cookies);
  }
  for (const origin of state.origins ?? []) {
    const items = origin.localStorage ?? [];
    // Seed localStorage before any app script runs on the next navigation.
    await page.addInitScript((entries: { name: string; value: string }[]) => {
      for (const { name, value } of entries) {
        try {
          localStorage.setItem(name, value);
        } catch {
          /* ignore */
        }
      }
    }, items);
  }
  return true;
}

async function authViaSavedStateOrLogin(
  page: Page,
  stateFile: string,
  email: string,
  password: string,
) {
  if (await restoreSession(page, stateFile)) {
    await page.goto('/dashboard');
    if (/\/dashboard/.test(page.url())) return; // session valid
  }
  // Fallback (e.g. running setup, or an expired/missing session).
  await realLogin(page, email, password);
}

/** Primary test user — creates/manages battles. Reuses the saved session. */
export async function loginAsStudent(page: Page) {
  await authViaSavedStateOrLogin(
    page,
    STUDENT_STATE,
    'testuser@yopmail.com',
    'Test@123',
  );
}

/** Secondary test user — joins battles as an opponent. Reuses the saved session. */
export async function loginAsPlayer2(page: Page) {
  await authViaSavedStateOrLogin(
    page,
    PLAYER2_STATE,
    'battleplayer2@yopmail.com',
    'Test@1234',
  );
}
