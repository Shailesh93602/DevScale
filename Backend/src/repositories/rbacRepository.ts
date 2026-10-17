import { Role, Permission } from '@prisma/client';
import BaseRepository from './baseRepository.js';

import prisma from '../lib/prisma.js';

const joinRows = (permissionIds: string[]) =>
  permissionIds.map((id) => ({ permission: { connect: { id } } }));

export class RBACRepository extends BaseRepository<Role, typeof prisma.role> {
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
        // Role.permissions is the RolePermission join table, keyed by its own
        // ids, so permission ids become join rows rather than connects.
        ...(permissions && {
          permissions: { create: joinRows(permissions) },
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
          permissions: { deleteMany: {}, create: joinRows(permissions) },
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
