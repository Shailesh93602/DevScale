import { Prisma, User } from '@prisma/client';
import BaseRepository from './baseRepository';
import { createAppError } from '@/utils/errorHandler';
import logger from '@/utils/logger';
import prisma from '../lib/prisma';

export default class UserRepository extends BaseRepository<typeof prisma.user> {
  constructor() {
    super(prisma.user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prismaClient.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prismaClient.user.findUnique({
      where: { username },
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prismaClient.user.create({
      data,
    });
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prismaClient.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: string): Promise<void> {
    await this.prismaClient.user.delete({
      where: { id },
    });
  }

  async getUserProfile(id: string): Promise<User | null> {
    return this.prismaClient.user.findUnique({
      where: { id },
      include: {
        role: true,
        user_permissions: true,
      },
    });
  }

  async upsertUserProfile(
    data: {
      supabase_id: string;
      email: string;
      username: string;
      graduation_year?: number;
      skills?: string[];
    } & Prisma.UserCreateInput
  ) {
    return this.upsert({
      where: { supabase_id: data.supabase_id },
      create: {
        ...data,
        role: { connect: { name: 'STUDENT' } },
      },
      update: {
        ...data,
        role: { connect: { name: 'STUDENT' } },
        updated_at: new Date(),
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        specialization: true,
        college: true,
      },
    });
  }

  async updateUserRole(userId: string, roleId: string): Promise<User> {
    try {
      const user = await this.update({
        where: { id: userId },
        data: { role_id: roleId },
      });

      if (!user) throw createAppError('User not found', 404);
      return user;
    } catch (error) {
      logger.error('Error updating user role:', error);
      throw createAppError('Failed to update user role', 500);
    }
  }

  async updateUserStatus(user_id: string, status: string): Promise<User> {
    const user = await this.update({
      where: { id: user_id },
      data: { status },
    });

    return user;
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    usersByRole: Record<
      'beginner' | 'intermediate' | 'advanced' | 'expert' | 'unknown',
      number
    >;
    completionRates: Record<string, number>;
  }> {
    const [totalUsers, activeUsers, newUsers] = await Promise.all([
      this.count(),
      this.count({
        where: { status: 'active' },
      }),
      this.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    const usersByRole = await this.groupBy({
      by: [Prisma.UserScalarFieldEnum.experience_level],
      _count: true,
      orderBy: {
        experience_level: 'asc',
      },
    });

    // Create a map with all experience levels initialized to 0
    const roleCountMap: Record<
      'beginner' | 'intermediate' | 'advanced' | 'expert' | 'unknown',
      number
    > = {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
      expert: 0,
      unknown: 0,
    };

    // Update counts from the database results
    usersByRole.forEach((group) => {
      const level =
        group[Prisma.UserScalarFieldEnum.experience_level] ?? 'unknown';
      roleCountMap[level.toLowerCase() as keyof typeof roleCountMap] =
        typeof group._count === 'number' ? group._count : 0;
    });

    // TODO: Add actual logic here
    const completionRates: Record<string, number> = {};

    return {
      totalUsers,
      activeUsers,
      newUsers,
      usersByRole: roleCountMap,
      completionRates,
    };
  }

  async searchUsers(params: {
    query?: string;
    role?: string;
    status?: string;
    date_range?: { start: Date; end: Date };
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
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

    if (query) {
      where.OR = [
        { username: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { full_name: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role_id = role;
    }

    if (status) {
      where.status = status;
    }

    if (date_range) {
      where.created_at = {
        gte: date_range.start,
        lte: date_range.end,
      };
    }

    const [users, total] = await Promise.all([
      this.findMany({
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
      this.count({ where }),
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

  async bulkUpdateUsers(
    user_ids: string[],
    action: 'suspend' | 'activate' | 'delete' | 'changeRole',
    params?: { role_id?: string; reason?: string }
  ): Promise<void> {
    const transaction: Prisma.PrismaPromise<unknown>[] = [];

    for (const user_id of user_ids) {
      switch (action) {
        case 'suspend':
          transaction.push(
            this.update({
              where: { id: user_id },
              data: { status: 'suspended' },
            }) as Prisma.PrismaPromise<unknown>
          );
          break;
        case 'activate':
          transaction.push(
            this.update({
              where: { id: user_id },
              data: { status: 'active' },
            }) as Prisma.PrismaPromise<unknown>
          );
          break;
        case 'delete':
          transaction.push(
            this.delete({
              where: { id: user_id },
            }) as Prisma.PrismaPromise<unknown>
          );
          break;
        case 'changeRole':
          if (params?.role_id) {
            transaction.push(
              this.update({
                where: { id: user_id },
                data: { role_id: params.role_id },
              }) as Prisma.PrismaPromise<unknown>
            );
          }
          break;
      }

      // TODO: Update this with relevant common function
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

  async getAllUsers(params: { page: number; limit: number; search: string }) {
    const { page = 1, limit = 10, search = '' } = params;
    return this.paginate(
      {
        page,
        limit,
        search,
      },
      [],
      {},
      {}
    );
  }

  async getUserByEmail(email: string) {
    await this.findUnique({
      where: { email },
    });
  }

  async getUserById(id: string) {
    await this.findUnique({
      where: { id },
    });
  }

  // assign role to user
  async assignRole(id: string, role_id: string) {
    await this.update({
      where: { id },
      data: { role_id },
    });
  }
}
