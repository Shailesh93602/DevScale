const PROBE_ORIGIN = 'https://eduscale.invalid';

/**
 * Returns `value` as a same-origin path (pathname + search + hash), or
 * `fallback`. `startsWith('/')` alone is not enough: '//evil.com' and
 * '/\evil.com' are protocol-relative to a browser, and appending '@evil.com'
 * to an origin makes the origin userinfo. Parsing decides what the browser
 * will decide, and only the parsed path is ever returned.
 */
export function safeRedirectPath(
  value: string | null | undefined,
  fallback: string,
): string {
  if (!value || !value.startsWith('/')) return fallback;
  try {
    const url = new URL(value, PROBE_ORIGIN);
    if (url.origin !== PROBE_ORIGIN) return fallback;
    // '/..//evil.com' parses to the pathname '//evil.com', which is
    // protocol-relative again once handed to the browser.
    if (/^\/[/\\]/.test(url.pathname)) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
