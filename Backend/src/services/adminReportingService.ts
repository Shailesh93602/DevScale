import { PrismaClient, Prisma } from '@prisma/client';
import { createAppError } from '../utils/errorHandler';
import logger from '../utils/logger';
import { Parser } from 'json2csv';

const prisma = new PrismaClient();

interface ReportConfig {
  metrics: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters?: Record<string, any>;
  groupBy?: string[];
  timeRange?: {
    start: Date;
    end: Date;
  };
  format?: 'json' | 'csv';
}

interface TrendData {
  period: string;
  value: number;
}

export async function generateCustomReport(config: ReportConfig) {
  try {
    const { metrics, filters, groupBy, timeRange, format = 'json' } = config;
    const data: Record<string, unknown> = {};

    await Promise.all(
      metrics.map(async (metric) => {
        data[metric] = await fetchMetricData(
          metric,
          filters,
          groupBy,
          timeRange
        );
      })
    );

    if (format === 'csv') {
      const parser = new Parser();
      return parser.parse(flattenData(data));
    }

    return data;
  } catch (error) {
    logger.error('Error generating custom report:', error);
    throw createAppError('Failed to generate report', 500);
  }
}

export async function analyzeTrends(
  metric: string,
  period: 'daily' | 'weekly' | 'monthly',
  timeRange: { start: Date; end: Date }
): Promise<TrendData[]> {
  const { start, end } = timeRange;

  switch (metric) {
    case 'user_growth':
      return getUserGrowthTrend(period, start, end);
    case 'content_engagement':
      return getContentEngagementTrend(period, start, end);
    case 'platform_usage':
      return getPlatformUsageTrend(period, start, end);
    default:
      throw createAppError('Invalid metric for trend analysis', 400);
  }
}

export async function getPerformanceReport(timeRange: {
  start: Date;
  end: Date;
}) {
  const { start, end } = timeRange;

  const [apiPerformance, errorRates, resourceUsage, responseTimeDistribution] =
    await Promise.all([
      getApiPerformanceMetrics(start, end),
      getErrorRateMetrics(start, end),
      getResourceUsageMetrics(start, end),
      getResponseTimeDistribution(start, end),
    ]);

  return {
    apiPerformance,
    errorRates,
    resourceUsage,
    responseTimeDistribution,
  };
}

// Helper functions
async function fetchMetricData(
  metric: string,
  filters?: Record<string, unknown>,
  groupBy?: string[],
  timeRange?: { start: Date; end: Date }
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { ...filters };
  if (timeRange) {
    where.created_at = {
      gte: timeRange.start,
      lte: timeRange.end,
    };
  }

  switch (metric) {
    case 'user_count':
      return prisma.user.groupBy({
        by: (groupBy as Prisma.UserScalarFieldEnum[]) || [],
        where,
        _count: true,
      });

    case 'content_metrics':
      return prisma.article.groupBy({
        by: (groupBy as Prisma.ArticleScalarFieldEnum[]) || [],
        where,
        _count: true,
      });

    // Add more metric cases as needed
    default:
      throw createAppError(`Unsupported metric: ${metric}`, 400);
  }
}

function flattenData(data: Record<string, unknown>): unknown[] {
  const flattened: unknown[] = [];
  Object.entries(data).forEach(([metric, values]) => {
    if (Array.isArray(values)) {
      values.forEach((value) => {
        flattened.push({ metric, ...value });
      });
    } else {
      flattened.push({ metric, value: values });
    }
  });
  return flattened;
}

async function getUserGrowthTrend(
  period: string,
  start: Date,
  end: Date
): Promise<TrendData[]> {
  const users = await prisma.user.groupBy({
    by: ['created_at'],
    where: {
      created_at: {
        gte: start,
        lte: end,
      },
    },
    _count: true,
  });

  return aggregateByPeriod(users, period, 'created_at', '_count');
}

async function getContentEngagementTrend(
  period: string,
  start: Date,
  end: Date
): Promise<TrendData[]> {
  const engagementData = await prisma.dailyTopic.groupBy({
    by: ['date'],
    where: {
      date: { gte: start, lte: end },
    },
    _count: {
      _all: true,
    },
  });

  return engagementData.map((item) => ({
    period: formatPeriod(item.date, period),
    value: item._count?._all ?? 0,
  }));
}

async function getPlatformUsageTrend(
  period: string,
  start: Date,
  end: Date
): Promise<TrendData[]> {
  const usageData = await prisma.userActivityLog.groupBy({
    by: ['timestamp'],
    where: {
      timestamp: { gte: start, lte: end },
      action: { in: ['LOGIN', 'CONTENT_VIEW', 'API_CALL'] },
    },
    _count: true,
  });

  return aggregateByPeriod(usageData, period, 'timestamp', '_count');
}

function aggregateByPeriod(
  data: Array<Record<string, Date | number>>,
  period: string,
  dateField: string,
  valueField: string
): TrendData[] {
  return data.reduce((acc, item) => {
    const periodKey = formatPeriod(new Date(item[dateField]), period);
    const existing = acc.find((x: TrendData) => x.period === periodKey);
    const value = Number(item[valueField]) || 0;

    if (existing) {
      existing.value += value;
    } else {
      acc.push({ period: periodKey, value });
    }
    return acc;
  }, [] as TrendData[]);
}

function formatPeriod(date: Date, period: string): string {
  const d = new Date(date);
  switch (period) {
    case 'daily':
      return d.toISOString().split('T')[0];
    case 'weekly':
      return `${d.getFullYear()}-W${Math.ceil(d.getDate() / 7)}`;
    case 'monthly':
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    default:
      throw createAppError(`Unsupported period: ${period}`, 400);
  }
}

// Analytics helper methods
export async function getPageViewAnalytics(start: Date, end: Date) {
  return prisma.dailyTopicView.aggregate({
    _sum: { view_count: true },
    where: { created_at: { gte: start, lte: end } },
  });
}

export async function getFeatureUsageAnalytics(start: Date, end: Date) {
  return prisma.userActivityLog.groupBy({
    by: ['action'],
    _count: true,
    where: { timestamp: { gte: start, lte: end } },
  });
}

export async function getSessionAnalytics(start: Date, end: Date) {
  return prisma.accessLog.aggregate({
    _avg: { duration: true },
    _max: { duration: true },
    _min: { duration: true },
    where: { created_at: { gte: start, lte: end } },
  });
}

export async function getUserPathAnalytics(start: Date, end: Date) {
  return prisma.accessLog.groupBy({
    by: ['route'],
    _count: true,
    where: { created_at: { gte: start, lte: end } },
  });
}

export async function getApiPerformanceMetrics(start: Date, end: Date) {
  return prisma.accessLog.aggregate({
    _avg: { duration: true, status_code: true },
    where: { created_at: { gte: start, lte: end } },
  });
}

export async function getErrorRateMetrics(start: Date, end: Date) {
  return prisma.accessLog.groupBy({
    by: ['status_code'],
    _count: true,
    where: {
      created_at: { gte: start, lte: end },
      status_code: { gte: 400 },
    },
  });
}

export async function getResourceUsageMetrics(start: Date, end: Date) {
  const [downloadStats, ratingStats, difficultyStats] = await Promise.all([
    prisma.resource.aggregate({
      _sum: { downloadCount: true },
      where: { created_at: { gte: start, lte: end } },
    }),
    prisma.resource.aggregate({
      _avg: { rating: true },
      where: { created_at: { gte: start, lte: end } },
    }),
    prisma.resource.groupBy({
      by: ['difficulty'],
      _count: { _all: true },
      where: { created_at: { gte: start, lte: end } },
    }),
  ]);

  return {
    totalDownloads: downloadStats._sum.downloadCount ?? 0,
    averageRating: ratingStats._avg.rating || 0,
    countsByDifficulty: difficultyStats.reduce(
      (acc, { difficulty, _count }) => ({
        ...acc,
        [difficulty]: _count._all,
      }),
      {}
    ),
  };
}

export async function getResponseTimeDistribution(start: Date, end: Date) {
  const distribution = await prisma.$queryRaw<
    { range: string; count: number }[]
  >`
    SELECT 
      CASE
        WHEN duration < 100 THEN '0-100ms'
        WHEN duration BETWEEN 100 AND 500 THEN '100-500ms'
        WHEN duration BETWEEN 500 AND 1000 THEN '500ms-1s'
        WHEN duration BETWEEN 1000 AND 3000 THEN '1-3s'
        ELSE '3s+'
      END as range,
      COUNT(*) as count
    FROM "AccessLog"
    WHERE created_at BETWEEN ${start} AND ${end}
    GROUP BY range
    ORDER BY MIN(duration)
  `;

  return distribution.map((item) => ({
    range: item.range,
    count: Number(item.count),
  }));
}
