import type { DashboardSummary } from '@/hooks/useDashboard';

// sessionStorage SWR cache for the dashboard summary. Keyed by user id: an
// unkeyed entry seeded the NEXT account to sign in on this tab with the
// previous user's stats, roadmaps and activity.
const CACHE_PREFIX = 'dashboard:summary:v1';
const CACHE_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes — mirrors backend TTL

const keyFor = (userId: string) => `${CACHE_PREFIX}:${userId}`;

export function readDashboardCache(
  userId: string | null | undefined,
): DashboardSummary | null {
  if (!userId) return null;
  try {
    const raw = sessionStorage.getItem(keyFor(userId));
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw) as {
      data: DashboardSummary;
      ts: number;
    };
    if (Date.now() - ts > CACHE_MAX_AGE_MS) return null;
    return data;
  } catch {
    return null;
  }
}

export function writeDashboardCache(
  userId: string | null | undefined,
  data: DashboardSummary,
) {
  if (!userId) return;
  try {
    sessionStorage.setItem(
      keyFor(userId),
      JSON.stringify({ data, ts: Date.now() }),
    );
  } catch {
    // sessionStorage full or unavailable — ignore
  }
}

/** Drops every cached summary (including the old unkeyed one) on sign-out. */
export function clearDashboardCache() {
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) sessionStorage.removeItem(key);
    }
  } catch {
    // unavailable — nothing to clear
  }
}
