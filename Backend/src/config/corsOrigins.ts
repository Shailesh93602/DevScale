/** Comma-separated CORS_ORIGIN entries; each may hold `*` wildcards (e.g. `https://*.vercel.app`). */
export function parseAllowedOrigins(csv: string | undefined): string[] {
  return (csv || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

function wildcardToRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');
  return new RegExp('^' + escaped + '$');
}

export function isOriginAllowed(origin: string, allowed: string[]): boolean {
  return allowed.some((o) =>
    o.includes('*') ? wildcardToRegex(o).test(origin) : o === origin
  );
}
