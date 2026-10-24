// Battle writes and matchmaking must reach the long-lived host that runs the
// sockets and battle timers; see Backend/docs/REALTIME_HOSTING.md.
// With NEXT_PUBLIC_REALTIME_API_BASE_URL unset, everything behaves as before.

/** A free host's cold start is about a minute; the default 20 s gives up first. */
export const REALTIME_TIMEOUT_MS = 75_000;

export function realtimeApiBase(): string | undefined {
  const base = process.env.NEXT_PUBLIC_REALTIME_API_BASE_URL?.trim();
  return base || undefined;
}

function pathOf(url: string | undefined): string {
  if (!url) return '';
  try {
    return new URL(url, 'http://relative.invalid').pathname.replace(
      /^\/api\/v1(?=\/)/,
      '',
    );
  } catch {
    return url;
  }
}

/** True for any battle or matchmaking path, reads included. */
export function isBattlePath(url: string | undefined): boolean {
  return /^\/(battles|matchmaking)(\/|$)/.test(pathOf(url));
}

/** Matchmaking queues live in the realtime host's Redis; battle writes arm its timers. */
export function needsRealtimeHost(
  method: string | undefined,
  url: string | undefined,
): boolean {
  const path = pathOf(url);
  if (/^\/matchmaking(\/|$)/.test(path)) return true;
  if (!/^\/battles(\/|$)/.test(path)) return false;
  return (method ?? 'get').toLowerCase() !== 'get';
}

/** Socket.io origin: explicit WS URL, else the realtime host, else the REST host. */
export function socketBaseUrl(): string {
  const strip = (u: string) => u.replace(/\/api\/v1\/?$/, '');
  return (
    process.env.NEXT_PUBLIC_WS_URL ||
    strip(realtimeApiBase() ?? '') ||
    strip(process.env.NEXT_PUBLIC_API_BASE_URL ?? '') ||
    'http://localhost:5000'
  );
}

let warmed = false;

/** Fire-and-forget wake-up of a sleeping free host, once per page load. */
export function warmRealtimeHost(): void {
  const base = realtimeApiBase();
  if (warmed || !base || typeof fetch !== 'function') return;
  warmed = true;
  // /health/ready answers without touching the database or Redis.
  fetch(`${base.replace(/\/$/, '')}/health/ready`, { cache: 'no-store' }).catch(
    () => {
      warmed = false;
    },
  );
}

/** Test hook. */
export function resetWarmRealtimeHost(): void {
  warmed = false;
}
