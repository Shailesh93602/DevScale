/**
 * "Might this request belong to a signed-in user?" — answered from cookies
 * alone, with no network call.
 *
 * WHY NOT `supabase.auth.getUser()` IN THE PAGE.
 *
 * The public pages (/career-roadmap, /coding-challenges) render one of two
 * trees: the server-rendered read-only view for visitors, or the existing
 * client dashboard for members. Deciding that with getUser() would put a
 * Supabase round-trip in front of every anonymous page view — the exact call
 * the middleware's fast path exists to avoid, because a cold or paused free-
 * tier project turns it into MIDDLEWARE_INVOCATION_TIMEOUT.
 *
 * @supabase/ssr stores the session in cookies named `sb-<project-ref>-auth-
 * token`, chunked as `.0`, `.1`, … when it does not fit in one. Their presence
 * is a cheap, honest signal: no cookie means certainly signed out. A cookie
 * means "probably signed in" — and if it is stale, the client dashboard it
 * selects handles that itself exactly as it always has (AuthContext resolves
 * to unauthenticated and the page behaves as the old one did). Nothing here
 * grants access; every protected API call still carries and verifies a JWT.
 */

const SUPABASE_AUTH_COOKIE = /^sb-[^-]+(?:-[^-]+)*-auth-token(?:\.\d+)?$/;

export function isSupabaseAuthCookieName(name: string): boolean {
  return SUPABASE_AUTH_COOKIE.test(name);
}

/** True if any cookie looks like a Supabase session. */
export function hasSupabaseSessionCookie(
  cookies: ReadonlyArray<{ name: string }>,
): boolean {
  return cookies.some((c) => isSupabaseAuthCookieName(c.name));
}
