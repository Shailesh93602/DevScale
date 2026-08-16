/**
 * The single source of truth for E2E test-account credentials (Frontend).
 *
 * WHY THIS EXISTS: these passwords used to be hardcoded across the Playwright
 * specs — including the ADMIN password — in a repo mirrored to a PUBLIC remote.
 * Anyone reading the source had working credentials for whichever Supabase
 * project the app pointed at. Secret scanning flagged it, correctly.
 *
 * Emails stay in code: they are fixture identities, not secrets. Passwords come
 * from the environment with NO fallback, so a missing variable fails loudly
 * instead of silently trying a guessable default.
 *
 * The Backend mirror of this file is `Backend/qa/testUsers.mjs`; both read the
 * same variable names, and the seeder that creates these accounts reads them too.
 */

const ACCOUNTS = {
  student: { email: "testuser@yopmail.com", env: "E2E_STUDENT_PASSWORD" },
  student2: {
    email: "battleplayer2@yopmail.com",
    env: "E2E_STUDENT2_PASSWORD",
  },
  admin: { email: "admin@eduscale.io", env: "E2E_ADMIN_PASSWORD" },
  moderator: { email: "moderator@eduscale.io", env: "E2E_MODERATOR_PASSWORD" },
} as const;

export type UserKey = keyof typeof ACCOUNTS;

function requirePassword(envName: string): string {
  const value = process.env[envName];
  if (!value) {
    throw new Error(
      `${envName} is not set. E2E test-account passwords are read from the ` +
        `environment, never hardcoded — see Frontend/tests/utils/testUsers.ts. ` +
        `Set the four E2E_*_PASSWORD variables (see .env.example) and re-run.`
    );
  }
  return value;
}

export function testUser(key: UserKey): { email: string; password: string } {
  return { email: ACCOUNTS[key].email, password: requirePassword(ACCOUNTS[key].env) };
}

/** Convenience for specs that only need the address. */
export function testEmail(key: UserKey): string {
  return ACCOUNTS[key].email;
}
