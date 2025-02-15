import { PrismaClient, User, Prisma } from '@prisma/client';
import { assignRoleToUser } from './rbacService';

const prisma = new PrismaClient();

interface UserSearchParams {
  query?: string;
  role?: string;
  status?: string;
  date_range?: {
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
    date_range,
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
    where.role_id = role;
  }

  // Filter by status (if you have a status field)
  if (status) {
    where.status = status;
  }

  // Filter by date range
  if (date_range) {
    where.created_at = {
      gte: date_range.start,
      lte: date_range.end,
    };
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        role: true,
        user_points: true,
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
  user_id: string,
  role_id: string
): Promise<User> {
  const user = await assignRoleToUser(user_id, role_id);
  await logUserActivity(user_id, 'ROLE_UPDATE', { role_id });
  return user;
}

export async function updateUserStatus(
  user_id: string,
  status: string,
  reason?: string
): Promise<User> {
  const user = await prisma.user.update({
    where: { id: user_id },
    data: {
      status,
    },
  });

  await logUserActivity(user_id, 'STATUS_UPDATE', { status, reason });
  return user;
}

export async function getUserActivityLogs(
  user_id: string,
  page = 1,
  limit = 10
) {
  const [logs, total] = await Promise.all([
    prisma.userActivityLog.findMany({
      where: { user_id },
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.userActivityLog.count({ where: { user_id } }),
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
  user_ids: string[],
  action: 'suspend' | 'activate' | 'delete' | 'changeRole',
  params?: { role_id?: string; reason?: string }
): Promise<void> {
  const transaction: Prisma.PrismaPromise<unknown>[] = [];

  for (const user_id of user_ids) {
    switch (action) {
      case 'suspend':
        transaction.push(
          prisma.user.update({
            where: { id: user_id },
            data: { status: 'suspended' },
          }) as Prisma.PrismaPromise<unknown>
        );
        break;
      case 'activate':
        transaction.push(
          prisma.user.update({
            where: { id: user_id },
            data: { status: 'active' },
          }) as Prisma.PrismaPromise<unknown>
        );
        break;
      case 'delete':
        transaction.push(
          prisma.user.delete({
            where: { id: user_id },
          }) as Prisma.PrismaPromise<unknown>
        );
        break;
      case 'changeRole':
        if (params?.role_id) {
          transaction.push(
            prisma.user.update({
              where: { id: user_id },
              data: { role_id: params.role_id },
            }) as Prisma.PrismaPromise<unknown>
          );
        }
        break;
    }

    // Log the activity
    transaction.push(
      prisma.userActivityLog.create({
        data: {
          user_id,
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
  user_id: string,
  action: string,
  details: Prisma.InputJsonValue
): Promise<void> {
  await prisma.userActivityLog.create({
    data: {
      user_id,
      action,
      details,
      timestamp: new Date(),
    },
  });
}

export async function getUserStats(user_id: string) {
  const [
    totalPosts,
    totalComments,
    totalChallenges,
    totalArticles,
    userPoints,
  ] = await Promise.all([
    prisma.forumPost.count({ where: { user_id: user_id } }),
    prisma.forumComment.count({ where: { user_id: user_id } }),
    prisma.challengeSubmission.count({ where: { user_id: user_id } }),
    prisma.article.count({ where: { author_id: user_id } }),
    prisma.userPoints.findUnique({ where: { user_id: user_id } }),
  ]);

  return {
    totalPosts,
    totalComments,
    totalChallenges,
    totalArticles,
    points: userPoints?.points ?? 0,
  };
}
