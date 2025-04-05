import { SecurityAuditLog, Prisma } from '@prisma/client';
import { createAppError } from '../utils/errorHandler';
import logger from '../utils/logger';
import BaseRepository from './baseRepository';
import prisma from '../lib/prisma';
import {
  AuditLogParams,
  ChangeHistoryParams,
  SecurityLogParams,
} from '@/types';

export default class AdminAuditLogRepository extends BaseRepository<
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

  async getSecurityLogs(
    startDate?: Date,
    endDate?: Date,
    type?: string,
    severity?: string
  ): Promise<SecurityAuditLog[]> {
    try {
      return await this.prismaClient.securityAuditLog.findMany({
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

  async getChangeHistory(
    entity: string,
    entityId: string
  ): Promise<ChangeHistoryParams[]> {
    try {
      const history = await this.prismaClient.changeHistory.findMany({
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
