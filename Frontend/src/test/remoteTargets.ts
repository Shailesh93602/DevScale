/**
 * The default Playwright suite writes as the real test accounts: it creates,
 * joins and plays battles and creates and approves articles. The seeder only
 * guards its own DATABASE_URL, so this checks the two things it cannot see,
 * the site under test and the API that site calls. Either one off localhost
 * means the writes land on a hosted backend.
 */
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

export const TARGET_VARS = [
  'PLAYWRIGHT_BASE_URL',
  'NEXT_PUBLIC_API_BASE_URL',
  'NEXT_PUBLIC_REALTIME_API_BASE_URL',
] as const;

/** Names (never values) of the target variables that point off this machine. */
export function remoteTargets(
  env: Record<string, string | undefined>,
): string[] {
  return TARGET_VARS.filter((name) => {
    const value = env[name];
    if (!value) return false;
    try {
      return !LOCAL_HOSTS.has(new URL(value).hostname);
    } catch {
      return true; // unparseable: cannot prove it is local
    }
  });
}

/** `next dev` precedence: the process env, then these files, first match wins. */
const DEV_ENV_FILES = [
  '.env.development.local',
  '.env.local',
  '.env.development',
  '.env',
];

/**
 * Resolves TARGET_VARS the way `next dev` will for the webServer. Only these
 * keys are read, and only to classify their host; nothing is printed.
 */
export function resolveTargetEnv(
  processEnv: Record<string, string | undefined>,
  readFile: (name: string) => string | null,
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  const files = DEV_ENV_FILES.map(readFile);
  for (const name of TARGET_VARS) {
    out[name] = processEnv[name];
    for (const text of files) {
      if (out[name] !== undefined || text === null) continue;
      // dotenv also accepts `export KEY=` and `KEY: value`; its last line wins.
      const line = new RegExp(
        `^\\s*(?:export\\s+)?${name}(?:\\s*=|:)\\s*(.*)$`,
        'gm',
      );
      const m = [...text.matchAll(line)].pop();
      if (m) out[name] = m[1].trim().replace(/^(['"])(.*)\1$/, '$2');
    }
  }
  return out;
}
