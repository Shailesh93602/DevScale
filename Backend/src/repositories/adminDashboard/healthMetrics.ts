import prisma from '../../lib/prisma.js';
import { getCache, setCache } from '../../services/cacheService';
import logger from '../../utils/logger.js';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Mean of `details.duration` over audit rows, or null when there are none.
 * null means "no data" — the panel renders "—"; a measured 0 stays 0.
 */
function averageDuration(rows: { details: unknown }[]): number | null {
  if (rows.length === 0) return null;
  const total = rows.reduce<number>((acc, { details }) => {
    const duration =
      typeof details === 'object' && details
        ? ((details as { duration?: number }).duration ?? 0)
        : 0;
    return acc + duration;
  }, 0);
  return total / rows.length;
}

async function getPeakUsageTimes(): Promise<string[]> {
  const hourlyUsage = await prisma.auditLog.groupBy({
    by: ['timestamp'],
    where: {
      action: 'LOGIN',
      timestamp: { gte: new Date(Date.now() - 7 * DAY_MS) },
    },
    _count: true,
    orderBy: { _count: { timestamp: 'desc' } },
    take: 3,
  });

  return hourlyUsage.map(
    ({ timestamp }) =>
      new Date(timestamp).getHours().toString().padStart(2, '0') + ':00'
  );
}

export async function getActivityMetrics(): Promise<{
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number | null;
  peakUsageTimes: string[];
}> {
  const oneDayAgo = new Date(Date.now() - DAY_MS);
  const oneWeekAgo = new Date(Date.now() - 7 * DAY_MS);
  const oneMonthAgo = new Date(Date.now() - 30 * DAY_MS);
  const loginsSince = (since: Date) =>
    prisma.auditLog.count({
      where: { timestamp: { gte: since }, action: 'LOGIN' },
    });

  const [daily, weekly, monthly] = await Promise.all([
    loginsSince(oneDayAgo),
    loginsSince(oneWeekAgo),
    loginsSince(oneMonthAgo),
  ]);

  // Nothing writes SESSION rows to `auditLog` today, so this is null — never a fabricated 0.
  const sessionDurations = await prisma.auditLog.findMany({
    where: { action: 'SESSION', timestamp: { gte: oneMonthAgo } },
    select: { details: true },
  });
  const averageSessionDuration = averageDuration(sessionDurations);

  const peakUsageTimes = await getPeakUsageTimes();

  return {
    dailyActiveUsers: daily,
    weeklyActiveUsers: weekly,
    monthlyActiveUsers: monthly,
    averageSessionDuration,
    peakUsageTimes,
  };
}

/** Write-then-read a probe key, so a healthy Redis actually reports healthy. */
async function probeCache(): Promise<string> {
  try {
    const probeKey = 'health:cache-probe';
    await setCache(probeKey, 'ok', { ttl: 30 });
    return (await getCache<string>(probeKey)) === 'ok' ? 'healthy' : 'error';
  } catch {
    return 'error';
  }
}

export async function getSystemHealth(): Promise<{
  databaseStatus: string;
  cacheStatus: string;
  averageResponseTime: number | null;
  errorRate: number | null;
}> {
  try {
    const databaseStatus = 'healthy';
    const cacheStatus = await probeCache();

    // Get average response time from audit logs (null, not "0ms", when unmeasured)
    const responseTimes = await prisma.auditLog.findMany({
      where: {
        action: 'API_REQUEST',
        timestamp: { gte: new Date(Date.now() - DAY_MS) },
      },
      select: { details: true },
    });
    const averageResponseTime = averageDuration(responseTimes);

    const [totalRequests, errorRequests] = await Promise.all([
      prisma.auditLog.count({
        where: {
          action: 'API_REQUEST',
          timestamp: { gte: new Date(Date.now() - DAY_MS) },
        },
      }),
      prisma.auditLog.count({
        where: {
          action: 'ERROR',
          timestamp: { gte: new Date(Date.now() - DAY_MS) },
        },
      }),
    ]);

    // With no requests recorded there is no rate to report — null, not "0%".
    const errorRate =
      totalRequests > 0 ? (errorRequests / totalRequests) * 100 : null;

    return { databaseStatus, cacheStatus, averageResponseTime, errorRate };
  } catch (error) {
    logger.error('Error checking system health:', error);
    return {
      databaseStatus: 'error',
      cacheStatus: 'error',
      // Not measured, because the check itself failed — distinct from a measured zero.
      averageResponseTime: null,
      errorRate: null,
    };
  }
}
