import {
  Prisma,
  ContentStatus,
  Status,
  AuditLog,
  Content,
  PrismaClient,
} from '@prisma/client';
import { createAppError } from '../utils/errorHandler';
import logger from '../utils/logger';
import { getCache, setCache } from '../services/cacheService';
import {
  DashboardMetrics,
  ResourceAllocation,
  ReportConfig,
  MetricData,
  MetricDataType,
  UserGrowthMetric,
  ContentEngagementMetric,
  ChallengeCompletionMetric,
  ResourceUsageMetric,
} from '../types/adminDashboard';
import { Parser } from 'json2csv';
import BaseRepository from './baseRepository';
import UserRepository from './userRepository';

import prisma from '../lib/prisma';

export default class AdminDashboardRepository extends BaseRepository<
  PrismaClient['user']
> {
  private readonly userRepo: UserRepository;
  constructor() {
    super(prisma.user);
    this.userRepo = new UserRepository();
  }
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const cachedMetrics = await getCache<DashboardMetrics>(
        'admin:dashboard:metrics'
      );
      if (cachedMetrics) return cachedMetrics;

      const [userStats, platformMetrics, activityMetrics, systemHealth] =
        await Promise.all([
          this.userRepo.getUserStats(),
          this.getPlatformMetrics(),
          this.getActivityMetrics(),
          this.getSystemHealth(),
        ]);

      const metrics = {
        userStats,
        platformMetrics,
        activityMetrics,
        systemHealth,
      };

      await setCache('admin:dashboard:metrics', metrics, { ttl: 300 });
      return metrics;
    } catch (error) {
      logger.error('Error fetching dashboard metrics:', error);
      throw createAppError('Failed to fetch dashboard metrics', 500);
    }
  }

  async allocateResources(
    allocation: ResourceAllocation
  ): Promise<ResourceAllocation> {
    try {
      // Implementation depends on your resource allocation needs
      return allocation;
    } catch (error) {
      logger.error('Error allocating resources:', error);
      throw createAppError('Failed to allocate resources', 500);
    }
  }

  async generateCustomReport(
    config: ReportConfig
  ): Promise<Record<string, unknown> | string> {
    try {
      const { metrics, filters, groupBy, timeRange, format = 'json' } = config;
      const data: Record<string, unknown> = {};

      await Promise.all(
        metrics.map(async (metric) => {
          data[metric] = await this.fetchMetricData(
            metric,
            filters,
            groupBy,
            timeRange
          );
        })
      );

      if (format === 'csv') {
        const parser = new Parser();
        return parser.parse(data);
      }

      return data;
    } catch (error) {
      logger.error('Error generating report:', error);
      throw createAppError('Failed to generate report', 500);
    }
  }

  private async fetchMetricData(
    metric: string,
    filters?: Record<string, unknown>,
    groupBy?: string[],
    timeRange?: { start: Date; end: Date }
  ): Promise<MetricData[]> {
    const baseQuery = this.buildMetricQuery(
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
      return this.transformMetricData(metric, result as MetricDataType[]);
    } catch (error) {
      logger.error(`Error fetching metric ${metric}:`, error);
      throw createAppError(`Failed to fetch metric ${metric}`, 500);
    }
  }

  private buildMetricQuery(
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
        return this.groupBy({
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

  private transformMetricData(
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

  async getSystemAuditLogs(): Promise<AuditLog[]> {
    try {
      return await prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 100,
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error('Error fetching audit logs:', error);
      throw createAppError('Failed to fetch audit logs', 500);
    }
  }

  async getContentModerationQueue(): Promise<Content[]> {
    try {
      return await prisma.content.findMany({
        where: {
          status: ContentStatus.PENDING_REVIEW,
        },
        include: {
          author: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
        },
        orderBy: {
          created_at: 'asc',
        },
      });
    } catch (error) {
      logger.error('Error fetching moderation queue:', error);
      throw createAppError('Failed to fetch moderation queue', 500);
    }
  }

  async moderateContentItem(
    contentId: string,
    action: 'approve' | 'reject',
    reason: string,
    moderatorId: string
  ): Promise<Content> {
    try {
      const content = await prisma.content.update({
        where: { id: contentId },
        data: {
          status:
            action === 'approve'
              ? ContentStatus.APPROVED
              : ContentStatus.REJECTED,
          moderations: {
            create: {
              content_type: 'CONTENT',
              notes: reason,
              action: action.toUpperCase(),
              moderator_id: moderatorId,
            },
          },
        },
      });

      if (!content) throw createAppError('Content not found', 404);
      return content;
    } catch (error) {
      logger.error('Error moderating content:', error);
      throw createAppError('Failed to moderate content', 500);
    }
  }

  private async getCompletionRates(): Promise<Record<string, number>> {
    const roadmaps = await prisma.roadmap.findMany({
      include: {
        _count: {
          select: {
            progress: true,
          },
        },
        progress: {
          where: {
            status: Status.APPROVED,
          },
        },
      },
    });

    return Object.fromEntries(
      roadmaps.map((roadmap) => [
        roadmap.title,
        roadmap._count.progress > 0
          ? (roadmap.progress.length / roadmap._count.progress) * 100
          : 0,
      ])
    );
  }

  private async getPeakUsageTimes(): Promise<string[]> {
    const hourlyUsage = await prisma.auditLog.groupBy({
      by: ['timestamp'],
      where: {
        action: 'LOGIN',
        timestamp: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      _count: true,
      orderBy: {
        _count: {
          timestamp: 'desc',
        },
      },
      take: 3,
    });

    return hourlyUsage.map(
      ({ timestamp }) =>
        new Date(timestamp).getHours().toString().padStart(2, '0') + ':00'
    );
  }

  private async getActivityMetrics(): Promise<{
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
    peakUsageTimes: string[];
  }> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [daily, weekly, monthly] = await Promise.all([
      prisma.auditLog.count({
        where: {
          timestamp: { gte: oneDayAgo },
          action: 'LOGIN',
        },
      }),
      prisma.auditLog.count({
        where: {
          timestamp: { gte: oneWeekAgo },
          action: 'LOGIN',
        },
      }),
      prisma.auditLog.count({
        where: {
          timestamp: { gte: oneMonthAgo },
          action: 'LOGIN',
        },
      }),
    ]);

    // Calculate average session duration from audit logs
    const sessionDurations = await prisma.auditLog.findMany({
      where: {
        action: 'SESSION',
        timestamp: { gte: oneMonthAgo },
      },
      select: {
        details: true,
      },
    });

    const averageSessionDuration =
      sessionDurations.reduce((acc, { details }) => {
        const duration =
          typeof details === 'object' && details
            ? ((details as { duration?: number }).duration ?? 0)
            : 0;
        return acc + duration;
      }, 0) / (sessionDurations.length || 1);

    const peakUsageTimes = await this.getPeakUsageTimes();

    return {
      dailyActiveUsers: daily,
      weeklyActiveUsers: weekly,
      monthlyActiveUsers: monthly,
      averageSessionDuration,
      peakUsageTimes,
    };
  }

  private async getPlatformMetrics(): Promise<{
    totalRoadmaps: number;
    totalChallenges: number;
    totalArticles: number;
    totalQuizzes: number;
    engagementRate: number;
  }> {
    const [totalRoadmaps, totalChallenges, totalArticles, totalQuizzes] =
      await Promise.all([
        prisma.roadmap.count(),
        prisma.challenge.count(),
        prisma.content.count({
          where: { status: ContentStatus.APPROVED },
        }),
        prisma.quiz.count(),
      ]);

    // Calculate engagement rate (example: active users / total users)
    const [activeUsers, totalUsers] = await Promise.all([
      this.count({ where: { status: 'active' } }),
      this.count(),
    ]);

    const engagementRate =
      totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

    return {
      totalRoadmaps,
      totalChallenges,
      totalArticles,
      totalQuizzes,
      engagementRate,
    };
  }

  private async getSystemHealth(): Promise<{
    databaseStatus: string;
    cacheStatus: string;
    averageResponseTime: number;
    errorRate: number;
  }> {
    try {
      const databaseStatus = 'healthy';

      // Check cache status
      const cacheStatus =
        (await getCache('test')) !== null ? 'healthy' : 'error';

      // Get average response time from audit logs
      const responseTimes = await prisma.auditLog.findMany({
        where: {
          action: 'API_REQUEST',
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
        select: {
          details: true,
        },
      });

      const averageResponseTime =
        responseTimes.reduce((acc, { details }) => {
          const duration =
            typeof details === 'object' && details
              ? ((details as { duration?: number }).duration ?? 0)
              : 0;
          return acc + duration;
        }, 0) / (responseTimes.length || 1);

      // Calculate error rate
      const [totalRequests, errorRequests] = await Promise.all([
        prisma.auditLog.count({
          where: {
            action: 'API_REQUEST',
            timestamp: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        }),
        prisma.auditLog.count({
          where: {
            action: 'ERROR',
            timestamp: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

      const errorRate =
        totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0;

      return {
        databaseStatus,
        cacheStatus,
        averageResponseTime,
        errorRate,
      };
    } catch (error) {
      logger.error('Error checking system health:', error);
      return {
        databaseStatus: 'error',
        cacheStatus: 'error',
        averageResponseTime: 0,
        errorRate: 100,
      };
    }
  }
}
