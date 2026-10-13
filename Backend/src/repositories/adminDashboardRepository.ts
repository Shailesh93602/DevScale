import { AdminAuditLog, Content } from '@prisma/client';
import { ContentStatus } from '../constants/enums';
import type { User } from '@prisma/client';
import { createAppError } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';
import { getCache, setCache } from '../services/cacheService';
import {
  DashboardMetrics,
  ResourceAllocation,
  ReportConfig,
} from '../types/adminDashboard';
import { Parser } from 'json2csv';
import BaseRepository from './baseRepository.js';
import UserRepository from './userRepository';
import {
  getActivityMetrics,
  getSystemHealth,
} from './adminDashboard/healthMetrics.js';
import { fetchMetricData } from './adminDashboard/reportMetrics.js';

import prisma from '../lib/prisma.js';

export default class AdminDashboardRepository extends BaseRepository<
  User,
  typeof prisma.user
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
          data[metric] = await fetchMetricData(
            this,
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

  async getSystemAuditLogs(): Promise<AdminAuditLog[]> {
    try {
      // Admin actions (role changes, deletions, moderation) are recorded in
      // adminAuditLog — not the general-purpose auditLog table.
      return await prisma.adminAuditLog.findMany({
        orderBy: { created_at: 'desc' },
        take: 100,
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

  private getActivityMetrics() {
    return getActivityMetrics();
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

  private getSystemHealth() {
    return getSystemHealth();
  }
}
