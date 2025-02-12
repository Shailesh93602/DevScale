import { PrismaClient, User, Prisma } from '@prisma/client';
import { assignRoleToUser } from './rbacService';

const prisma = new PrismaClient();

interface UserSearchParams {
  query?: string;
  role?: string;
  status?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function searchUsers(params: UserSearchParams) {
  const {
    query,
    role,
    status,
    dateRange,
    page = 1,
    limit = 10,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = params;

  const where: Prisma.UserWhereInput = {};

  // Search by query across multiple fields
  if (query) {
    where.OR = [
      { username: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
      { full_name: { contains: query, mode: 'insensitive' } },
    ];
  }

  // Filter by role
  if (role) {
    where.roleId = role;
  }

  // Filter by status (if you have a status field)
  if (status) {
    where.status = status;
  }

  // Filter by date range
  if (dateRange) {
    where.created_at = {
      gte: dateRange.start,
      lte: dateRange.end,
    };
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        role: true,
        userPoints: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  };
}

export async function updateUserRole(
  userId: string,
  roleId: string
): Promise<User> {
  const user = await assignRoleToUser(userId, roleId);
  await logUserActivity(userId, 'ROLE_UPDATE', { roleId });
  return user;
}

export async function updateUserStatus(
  userId: string,
  status: string,
  reason?: string
): Promise<User> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      status,
    },
  });

  await logUserActivity(userId, 'STATUS_UPDATE', { status, reason });
  return user;
}

export async function getUserActivityLogs(
  userId: string,
  page = 1,
  limit = 10
) {
  const [logs, total] = await Promise.all([
    prisma.userActivityLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.userActivityLog.count({ where: { userId } }),
  ]);

  return {
    logs,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  };
}

export async function bulkUpdateUsers(
  userIds: string[],
  action: 'suspend' | 'activate' | 'delete' | 'changeRole',
  params?: { roleId?: string; reason?: string }
): Promise<void> {
  const transaction: Prisma.PrismaPromise<unknown>[] = [];

  for (const userId of userIds) {
    switch (action) {
      case 'suspend':
        transaction.push(
          prisma.user.update({
            where: { id: userId },
            data: { status: 'suspended' },
          }) as Prisma.PrismaPromise<unknown>
        );
        break;
      case 'activate':
        transaction.push(
          prisma.user.update({
            where: { id: userId },
            data: { status: 'active' },
          }) as Prisma.PrismaPromise<unknown>
        );
        break;
      case 'delete':
        transaction.push(
          prisma.user.delete({
            where: { id: userId },
          }) as Prisma.PrismaPromise<unknown>
        );
        break;
      case 'changeRole':
        if (params?.roleId) {
          transaction.push(
            prisma.user.update({
              where: { id: userId },
              data: { roleId: params.roleId },
            }) as Prisma.PrismaPromise<unknown>
          );
        }
        break;
    }

    // Log the activity
    transaction.push(
      prisma.userActivityLog.create({
        data: {
          userId,
          action: `BULK_${action.toUpperCase()}`,
          details: params as Prisma.InputJsonValue,
          timestamp: new Date(),
        },
      })
    );
  }

  await prisma.$transaction(transaction);
}

async function logUserActivity(
  userId: string,
  action: string,
  details: Prisma.InputJsonValue
): Promise<void> {
  await prisma.userActivityLog.create({
    data: {
      userId,
      action,
      details,
      timestamp: new Date(),
    },
  });
}

export async function getUserStats(userId: string) {
  const [
    totalPosts,
    totalComments,
    totalChallenges,
    totalArticles,
    userPoints,
  ] = await Promise.all([
    prisma.forumPost.count({ where: { userId } }),
    prisma.forumComment.count({ where: { userId } }),
    prisma.challengeSubmission.count({ where: { userId } }),
    prisma.article.count({ where: { authorId: userId } }),
    prisma.userPoints.findUnique({ where: { userId } }),
  ]);

  return {
    totalPosts,
    totalComments,
    totalChallenges,
    totalArticles,
    points: userPoints?.points ?? 0,
  };
}
