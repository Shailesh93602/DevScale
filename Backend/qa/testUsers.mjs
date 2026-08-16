/**
 * The single source of truth for E2E / QA test-account credentials.
 *
 * WHY THIS EXISTS: these passwords used to be hardcoded in ten files across the
 * Backend and Frontend — including `admin@eduscale.io` — and this repo is
 * mirrored to a PUBLIC remote (DevScale). Anyone reading the repo had the admin
 * password for whatever Supabase project the app was pointed at. Secret
 * scanning flagged it, correctly.
 *
 * Emails stay in code: they are fixture identities, not secrets, and keeping
 * them here avoids eight more env vars. Passwords come from the environment
 * with NO fallback — if they are unset the harness fails loudly rather than
 * silently trying a guessable default.
 *
 * Local setup: copy `.env.example` and set the four E2E_*_PASSWORD values to
 * anything you like, then run the seeder, which reads the same variables.
 */

const ACCOUNTS = {
  student: { email: 'testuser@yopmail.com', env: 'E2E_STUDENT_PASSWORD' },
  student2: { email: 'battleplayer2@yopmail.com', env: 'E2E_STUDENT2_PASSWORD' },
  admin: { email: 'admin@eduscale.io', env: 'E2E_ADMIN_PASSWORD' },
  moderator: { email: 'moderator@eduscale.io', env: 'E2E_MODERATOR_PASSWORD' },
};

function requirePassword(envName) {
  const value = process.env[envName];
  if (!value) {
    throw new Error(
      `${envName} is not set. E2E test-account passwords are read from the ` +
        `environment, never hardcoded — see Backend/qa/testUsers.mjs. Set the ` +
        `four E2E_*_PASSWORD variables (see .env.example) and re-run.`
    );
  }
  return value;
}

/** `{ student: { email, password }, ... }` — throws if any password is unset. */
export const TEST_USERS = Object.fromEntries(
  Object.entries(ACCOUNTS).map(([key, { email, env }]) => [
    key,
    {
      get email() {
        return email;
      },
      get password() {
        return requirePassword(env);
      },
    },
  ])
);

/** The seeder needs plain objects it can iterate; same env rules apply. */
export function resolveTestUsers() {
  return Object.fromEntries(
    Object.entries(ACCOUNTS).map(([key, { email, env }]) => [
      key,
      { email, password: requirePassword(env) },
    ])
  );
}
