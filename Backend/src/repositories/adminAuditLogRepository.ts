import { AdminAuditLog, SecurityAuditLog, Prisma } from '@prisma/client';
import { createAppError } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';
import BaseRepository from './baseRepository.js';
import prisma from '../lib/prisma.js';
import {
  AuditLogParams,
  ChangeHistoryParams,
  SecurityLogParams,
} from '../types/index.js';

/**
 * Hard ceiling on how many log rows any single read may return.
 *
 * A caller can ask for fewer. It cannot ask for more — an audit table is the
 * one place where "just fetch them all" is guaranteed to get slower forever,
 * and the caller who does it is usually mid-incident.
 */
const MAX_LOG_PAGE = 500;

export default class AdminAuditLogRepository extends BaseRepository<
  AdminAuditLog,
  typeof prisma.adminAuditLog
> {
  constructor() {
    super(prisma.adminAuditLog);
  }

  async logAdminAction(params: AuditLogParams) {
    try {
      return await this.prismaClient.adminAuditLog.create({
        data: {
          admin_id: params.admin_id,
          action: params.action,
          entity: params.entity,
          entity_id: params.entity_id,
          details: params.details
            ? (params.details as unknown as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          ip_address: params.ip_address,
          user_agent: params.user_agent,
        },
      });
    } catch (error) {
      logger.error('Failed to log admin action:', error);
      throw createAppError('Failed to log admin action', 500);
    }
  }

  async logSecurityEvent(params: SecurityLogParams) {
    try {
      return await this.prismaClient.securityAuditLog.create({
        data: {
          type: params.type,
          severity: params.severity,
          description: params.description,
          metadata: params.metadata
            ? (params.metadata as unknown as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          ip_address: params.ip_address,
          user_agent: params.user_agent,
          user_id: params.user_id,
        },
      });
    } catch (error) {
      logger.error('Failed to log security event:', error);
      throw createAppError('Failed to log security event', 500);
    }
  }

  async logChangeHistory(params: ChangeHistoryParams) {
    try {
      return await this.prismaClient.changeHistory.create({
        data: {
          entity: params.entity,
          entity_id: params.entity_id,
          action: params.action,
          changes: params.changes as unknown as Prisma.InputJsonValue,
          user_id: params.user_id,
          reason: params.reason,
        },
      });
    } catch (error) {
      logger.error('Failed to log change history:', error);
      throw createAppError('Failed to log change history', 500);
    }
  }

  /**
   * Security events in a date range, newest first.
   *
   * BOUNDED. This was an unbounded `findMany` on a table that only ever grows
   * and is now kept for a year — so the query would eventually load the entire
   * trail into memory, and the first person to notice would be whoever ran it
   * during an incident. A cap is not a limitation here: nobody reads ten
   * thousand audit rows, they page through the recent ones.
   */
  async getSecurityLogs(
    startDate?: Date,
    endDate?: Date,
    type?: string,
    severity?: string,
    limit = MAX_LOG_PAGE
  ): Promise<SecurityAuditLog[]> {
    try {
      return await this.prismaClient.securityAuditLog.findMany({
        take: Math.min(limit, MAX_LOG_PAGE),
        where: {
          created_at: {
            gte: startDate,
            lte: endDate,
          },
          type: type ? { equals: type } : undefined,
          severity: severity ? { equals: severity } : undefined,
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    } catch (error) {
      logger.error('Failed to get security logs:', error);
      throw createAppError('Failed to get security logs', 500);
    }
  }

  /** Bounded for the same reason as getSecurityLogs. */
  async getChangeHistory(
    entity: string,
    entityId: string,
    limit = MAX_LOG_PAGE
  ): Promise<ChangeHistoryParams[]> {
    try {
      const history = await this.prismaClient.changeHistory.findMany({
        take: Math.min(limit, MAX_LOG_PAGE),
        where: {
          entity,
          entity_id: entityId,
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      return history.map((record) => ({
        ...record,
        changes: record.changes as Record<string, unknown>,
        reason: record.reason || undefined,
      }));
    } catch (error) {
      logger.error('Failed to get change history:', error);
      throw createAppError('Failed to get change history', 500);
    }
  }
}
