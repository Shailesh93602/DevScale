import { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma.js';
import { createAppError } from '../../utils/errorHandler.js';
import logger from '../../utils/logger.js';
import {
  MetricData,
  MetricDataType,
  UserGrowthMetric,
  ContentEngagementMetric,
  ChallengeCompletionMetric,
  ResourceUsageMetric,
} from '../../types/adminDashboard';

/** The user repository's `groupBy`, which the userGrowth metric runs through. */
export interface UserGrouper {
  groupBy(args: unknown): Promise<unknown[]>;
}

export async function fetchMetricData(
  users: UserGrouper,
  metric: string,
  filters?: Record<string, unknown>,
  groupBy?: string[],
  timeRange?: { start: Date; end: Date }
): Promise<MetricData[]> {
  const baseQuery = buildMetricQuery(
    users,
    metric,
    filters,
    groupBy,
    timeRange
  );

  try {
    const result = await baseQuery;
    if (!Array.isArray(result)) {
      throw createAppError('Invalid metric data format', 500);
    }
    return transformMetricData(metric, result as MetricDataType[]);
  } catch (error) {
    logger.error(`Error fetching metric ${metric}:`, error);
    throw createAppError(`Failed to fetch metric ${metric}`, 500);
  }
}

function buildMetricQuery(
  users: UserGrouper,
  metric: string,
  filters?: Record<string, unknown>,
  groupBy?: string[],
  timeRange?: { start: Date; end: Date }
) {
  const timeFilter = timeRange
    ? {
        created_at: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      }
    : {};

  switch (metric) {
    case 'userGrowth':
      return users.groupBy({
        by: ['created_at'] as Prisma.UserScalarFieldEnum[],
        where: { ...timeFilter, ...filters },
        _count: true,
        orderBy: {
          created_at: 'asc',
        },
      });

    case 'contentEngagement':
      return prisma.resource.groupBy({
        by: ['type', 'difficulty'] as Prisma.ResourceScalarFieldEnum[],
        where: { ...timeFilter, ...filters },
        _count: {
          _all: true,
        },
        _avg: {
          downloadCount: true,
          rating: true,
        },
      });

    case 'challengeCompletion':
      return prisma.challengeSubmission.groupBy({
        by: ['status'] as Prisma.ChallengeSubmissionScalarFieldEnum[],
        where: { ...timeFilter, ...filters },
        _count: true,
      });

    case 'resourceUsage':
      return prisma.resource.groupBy({
        by: ['type'] as Prisma.ResourceScalarFieldEnum[],
        where: { ...timeFilter, ...filters },
        _count: {
          _all: true,
        },
        _sum: {
          downloadCount: true,
        },
      });

    default:
      throw createAppError(`Unsupported metric: ${metric}`, 400);
  }
}

function transformMetricData(
  metric: string,
  data: MetricDataType[]
): MetricData[] {
  switch (metric) {
    case 'userGrowth':
      return (data as UserGrowthMetric[]).map((item) => ({
        date: item.created_at,
        count: item._count,
      }));

    case 'contentEngagement':
      return (data as ContentEngagementMetric[]).map((item) => ({
        type: item.type,
        difficulty: item.difficulty,
        count: item._count._all,
        downloads: item._avg.downloadCount ?? 0,
        rating: item._avg.rating ?? 0,
      }));

    case 'challengeCompletion':
      return (data as ChallengeCompletionMetric[]).map((item) => ({
        status: item.status,
        count: item._count,
      }));

    case 'resourceUsage':
      return (data as ResourceUsageMetric[]).map((item) => ({
        type: item.type,
        count: item._count._all,
        downloads: item._sum.downloadCount ?? 0,
      }));

    default:
      throw createAppError(`Unsupported metric: ${metric}`, 400);
  }
}
