import { PrismaClient, SecurityAuditLog, Prisma } from '@prisma/client';
import { createAppError } from '../utils/errorHandler';
import logger from '../utils/logger';

const prisma = new PrismaClient();

interface AuditLogParams {
  adminId: string;
  action: string;
  entity: string;
  entityId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

interface SecurityLogParams {
  type: string;
  severity: string;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
}

interface ChangeHistoryParams {
  entity: string;
  entityId: string;
  action: string;
  changes: Record<string, unknown>;
  userId: string;
  reason?: string;
}

export const logAdminAction = async (params: AuditLogParams) => {
  try {
    const log = await prisma.adminAuditLog.create({
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
};

export const logSecurityEvent = async (params: SecurityLogParams) => {
  try {
    const log = await prisma.securityAuditLog.create({
      data: {
        ...params,
        metadata: params.metadata as Prisma.InputJsonValue | undefined,
      },
    });

    if (params.severity === 'critical') {
      await notifyCriticalSecurityEvent(log);
    }
    return log;
  } catch (error) {
    logger.error('Failed to log security event:', error);
    throw createAppError('Failed to log security event', 500);
  }
};

export const trackChange = async (params: ChangeHistoryParams) => {
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
};

export const logAccess = async (
  userId: string | null,
  route: string,
  method: string,
  statusCode: number,
  ipAddress: string,
  userAgent: string | null,
  duration: number
) => {
  try {
    await prisma.accessLog.create({
      data: {
        userId,
        route,
        method,
        statusCode,
        ipAddress,
        userAgent,
        duration,
      },
    });
  } catch (error) {
    logger.error('Failed to log access:', error);
  }
};

export const logSystemEvent = async (
  type: string,
  level: string,
  message: string,
  metadata?: Record<string, unknown>
) => {
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
};

// Query functions
export const getAdminAuditLogs = async (
  filters: Record<string, unknown>,
  page = 1,
  limit = 10
) => {
  const where = buildWhereClause(filters);
  return paginateResults(prisma.adminAuditLog, where, page, limit);
};

export const getSecurityAuditLogs = async (
  filters: Record<string, unknown>,
  page = 1,
  limit = 10
) => {
  const where = buildWhereClause(filters);
  return paginateResults(prisma.securityAuditLog, where, page, limit);
};

export const getChangeHistory = async (
  filters: Record<string, unknown>,
  page = 1,
  limit = 10
) => {
  const where = buildWhereClause(filters);
  return paginateResults(prisma.changeHistory, where, page, limit);
};

export const getAccessLogs = async (
  filters: Record<string, unknown>,
  page = 1,
  limit = 10
) => {
  const where = buildWhereClause(filters);
  return paginateResults(prisma.accessLog, where, page, limit);
};

export const getSystemLogs = async (
  filters: Record<string, unknown>,
  page = 1,
  limit = 10
) => {
  const where = buildWhereClause(filters);
  return paginateResults(prisma.systemLog, where, page, limit);
};

// Helper functions
const buildWhereClause = (filters: Record<string, unknown>) => {
  const where: Record<string, unknown> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) where[key] = value;
  });
  return where;
};

const paginateResults = async <T extends Prisma.ModelName>(
  model: PrismaClient[Uncapitalize<T>],
  where: Prisma.AdminAuditLogWhereInput,
  page: number,
  limit: number
) => {
  const [data, total] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (model as any).findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: 'desc' },
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (model as any).count({ where }),
  ]);

  return {
    data,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  };
};

const notifyCriticalSecurityEvent = async (log: SecurityAuditLog) => {
  logger.warn('Critical security event:', log);
  // Implement notification logic
};
