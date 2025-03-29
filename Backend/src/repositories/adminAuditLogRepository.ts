import { PrismaClient, SecurityAuditLog, Prisma } from '@prisma/client';
import { createAppError } from '../utils/errorHandler';
import logger from '../utils/logger';
import BaseRepository from './baseRepository';
import {
  AuditLogParams,
  ChangeHistoryParams,
  SecurityLogParams,
} from '@/types';

const prisma = new PrismaClient();

export default class AdminAuditLogRepository extends BaseRepository<
  PrismaClient['adminAuditLog']
> {
  constructor() {
    super(prisma.adminAuditLog);
  }
  async logAdminAction(params: AuditLogParams) {
    try {
      const log = await this.create({
        data: {
          ...params,
          details: params.details
            ? (params.details as Prisma.InputJsonValue)
            : Prisma.DbNull,
        },
      });
      logger.info('Admin action logged', { logId: log.id, ...params });
      return log;
    } catch (error) {
      logger.error('Failed to log admin action:', error);
      throw createAppError('Failed to log admin action', 500);
    }
  }

  async logSecurityEvent(params: SecurityLogParams) {
    try {
      // TODO: Review this and replace it if required
      const log = await prisma.securityAuditLog.create({
        data: {
          ...params,
          metadata: params.metadata as Prisma.InputJsonValue | undefined,
        },
      });

      if (params.severity === 'critical') {
        await this.notifyCriticalSecurityEvent(log);
      }
      return log;
    } catch (error) {
      logger.error('Failed to log security event:', error);
      throw createAppError('Failed to log security event', 500);
    }
  }

  async trackChange(params: ChangeHistoryParams) {
    try {
      return await prisma.changeHistory.create({
        data: {
          ...params,
          changes: params.changes
            ? (params.changes as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        },
      });
    } catch (error) {
      logger.error('Failed to track change:', error);
      throw createAppError('Failed to track change', 500);
    }
  }

  async logAccess(
    user_id: string | null,
    route: string,
    method: string,
    status_code: number,
    ip_address: string,
    user_agent: string | null,
    duration: number
  ) {
    try {
      await prisma.accessLog.create({
        data: {
          user_id,
          route,
          method,
          status_code,
          ip_address,
          user_agent,
          duration,
        },
      });
    } catch (error) {
      logger.error('Failed to log access:', error);
    }
  }

  async logSystemEvent(
    type: string,
    level: string,
    message: string,
    metadata?: Record<string, unknown>
  ) {
    try {
      await prisma.systemLog.create({
        data: {
          type,
          level,
          message,
          metadata: metadata as Prisma.InputJsonValue | undefined,
        },
      });
    } catch (error) {
      logger.error('Failed to log system event:', error);
    }
  }

  async getAdminAuditLogs(
    filters: Record<string, unknown>,
    page = 1,
    limit = 10
  ) {
    const where = this.buildWhereClause(filters);
    return this.paginate({ page, limit }, [], {}, where);
  }

  async getSecurityAuditLogs(
    filters: Record<string, unknown>,
    page = 1,
    limit = 10
  ) {
    const where = this.buildWhereClause(filters);
    return this.paginate({ page, limit }, [], {}, where);
  }

  async getChangeHistory(
    filters: Record<string, unknown>,
    page = 1,
    limit = 10
  ) {
    const where = this.buildWhereClause(filters);
    return this.paginate({ page, limit }, [], {}, where);
  }

  async getAccessLogs(filters: Record<string, unknown>, page = 1, limit = 10) {
    const where = this.buildWhereClause(filters);
    return this.paginate({ page, limit }, [], {}, where);
  }

  async getSystemLogs(filters: Record<string, unknown>, page = 1, limit = 10) {
    const where = this.buildWhereClause(filters);
    return this.paginate({ page, limit }, [], {}, where);
  }

  private buildWhereClause(filters: Record<string, unknown>) {
    const where: Record<string, unknown> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) where[key] = value;
    });
    return where;
  }

  private async notifyCriticalSecurityEvent(log: SecurityAuditLog) {
    logger.warn('Critical security event:', log);
    // Implement notification logic
  }
}
