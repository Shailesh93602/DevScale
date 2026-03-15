import { PrismaClient, Role, Permission } from '@prisma/client';
import BaseRepository from './baseRepository';

import prisma from '../lib/prisma';

export class RBACRepository extends BaseRepository<PrismaClient['role']> {
  constructor() {
    super(prisma.role);
  }

  async createRole(data: {
    name: string;
    description?: string;
    permissions?: string[];
  }): Promise<Role> {
    const { permissions, ...roleData } = data;
    return this.create({
      data: {
        ...roleData,
        ...(permissions && {
          permissions: {
            connect: permissions.map((id) => ({ id })),
          },
        }),
      },
    });
  }

  async updateRole(
    roleId: string,
    data: {
      name?: string;
      description?: string;
      permissions?: string[];
    }
  ): Promise<Role> {
    const { permissions, ...roleData } = data;
    return this.update({
      where: { id: roleId },
      data: {
        ...roleData,
        ...(permissions && {
          permissions: {
            set: permissions.map((id) => ({ id })),
          },
        }),
      },
    });
  }

  async getRoleHierarchy(roleId: string) {
    return this.findUnique({
      where: { id: roleId },
      include: {
        permissions: true,
        users: true,
      },
    });
  }

  async createPermission(data: {
    name: string;
    description?: string;
    key: string;
  }): Promise<Permission> {
    return prisma.permission.create({ data });
  }

  async updatePermission(
    permissionId: string,
    data: {
      name?: string;
      description?: string;
      key?: string;
    }
  ): Promise<Permission> {
    return prisma.permission.update({
      where: { id: permissionId },
      data,
    });
  }

  async deletePermission(permissionId: string): Promise<Permission> {
    return prisma.permission.delete({
      where: { id: permissionId },
    });
  }

  async checkPermission(
    userId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.role) {
      return false;
    }

    const requiredKey = `${resource}:${action}`;
    return user.role.permissions.some(
      (rp) => rp.permission.key === requiredKey || rp.permission.key === '*'
    );
  }
}
