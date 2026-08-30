import { AdminAuditLog, SecurityAuditLog, Prisma } from '@prisma/client';
import { createAppError } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';
import BaseRepository from './baseRepository.js';
import prisma from '../lib/prisma.js';
import { AuditLogParams, SecurityLogParams } from '../types/index.js';

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

  // logChangeHistory / getChangeHistory lived here and are deliberately gone.
  //
  // They were a SECOND audit mechanism: a writer with no callers, a reader with
  // no callers, and a `ChangeHistory` table that nothing wrote and the
  // retention job did not prune. AdminAuditLog.details already carries
  // before/after values (see the article-status rows, which record `from` and
  // `to`), so this duplicated the mechanism that is actually used.
  //
  // Deleted rather than wired, because two audit trails where one is dead is
  // worse than one: the next person to add an audited action has to guess which
  // is real, and the dead one looks equally official. The empty table is left
  // in place — dropping it is a destructive migration with no benefit — but the
  // code that made it look like a feature is not.
}
