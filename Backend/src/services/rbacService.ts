import {
  PrismaClient,
  Role,
  Permission,
  User,
  PermissionGroup,
  Prisma,
} from '@prisma/client';
import { createAppError } from '../utils/errorHandler';
import { deleteCache, getCache, setCache } from './cacheService';

const prisma = new PrismaClient();

type JsonValue = Prisma.InputJsonValue;
type ResourceParams = {
  resourceType: string;
  [key: string]: JsonValue;
};

interface CustomPermissionRule {
  condition: string;
  params: ResourceParams;
}

type PrismaModels = {
  [K in keyof PrismaClient]: PrismaClient[K] extends { findFirst: () => void }
    ? K
    : never;
}[keyof PrismaClient];

interface TimeBasedParams extends ResourceParams {
  startTime: string | Date;
  endTime: string | Date;
}

interface QuotaParams extends ResourceParams {
  limit: number;
  period: number;
  resource: string;
}

// Update role type to include full parent hierarchy
type RoleWithHierarchy = Role & {
  permissions: Permission[];
  parent: RoleWithHierarchy | null;
};

export async function createRole(data: {
  name: string;
  description?: string;
  permissions?: string[];
  parent_id?: string;
}): Promise<Role> {
  const existing = await prisma.role.findUnique({
    where: { name: data.name },
  });
  if (existing) throw createAppError('Role already exists', 400);

  return prisma.role.create({
    data: {
      name: data.name,
      description: data.description,
      parent_id: data.parent_id,
      permissions: data.permissions
        ? { connect: data.permissions.map((id) => ({ id })) }
        : undefined,
    },
    include: { permissions: true, parent: true },
  });
}

export async function createPermission(data: {
  name: string;
  description?: string;
  resource: string;
  action: string;
}): Promise<Permission> {
  const existing = await prisma.permission.findUnique({
    where: { name: data.name },
  });
  if (existing) throw createAppError('Permission already exists', 400);

  return prisma.permission.create({
    data: {
      name: data.name,
      description: data.description,
      resource: data.resource,
      action: data.action,
    },
  });
}

export async function assignRoleToUser(
  user_id: string,
  role_id: string
): Promise<User> {
  const user = await prisma.user.update({
    where: { id: user_id },
    data: { role_id },
    include: { role: { include: { permissions: true } } },
  });

  await deleteCache(`user:${user_id}:permissions`);
  return user;
}

export async function checkPermission(
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  const cacheKey = `user:${userId}:${resource}:${action}`;
  const cached = await getCache<boolean>(cacheKey);
  if (cached !== undefined) return Boolean(cached);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: true,
          parent: { include: { permissions: true, parent: true } },
        },
      },
    },
  });

  if (!user?.role) return false;

  const hasPermission = checkHierarchyPermissions(
    user.role as RoleWithHierarchy,
    resource,
    action
  );

  await setCache(cacheKey, hasPermission, { ttl: 300 });
  return hasPermission;
}

function checkHierarchyPermissions(
  role: RoleWithHierarchy,
  resource: string,
  action: string
): boolean {
  if (
    role.permissions.some((p) => p.resource === resource && p.action === action)
  ) {
    return true;
  }
  return role.parent
    ? checkHierarchyPermissions(role.parent, resource, action)
    : false;
}

export async function getRoleHierarchy(roleId: string): Promise<Role> {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: {
      permissions: true,
      children: { include: { permissions: true } },
      parent: { include: { permissions: true } },
    },
  });

  if (!role) throw createAppError('Role not found', 404);
  return role;
}

export async function createPermissionGroup(data: {
  name: string;
  description?: string;
  permissions?: string[];
}): Promise<PermissionGroup> {
  const existing = await prisma.permissionGroup.findUnique({
    where: { name: data.name },
  });
  if (existing) throw createAppError('Permission group exists', 400);

  return prisma.permissionGroup.create({
    data: {
      name: data.name,
      description: data.description,
      permissions: data.permissions
        ? { connect: data.permissions.map((id) => ({ id })) }
        : undefined,
    },
    include: { permissions: true },
  });
}

export async function addCustomPermissionRule(
  permissionId: string,
  rule: CustomPermissionRule
): Promise<Permission> {
  const permission = await prisma.permission.update({
    where: { id: permissionId },
    data: {
      conditions: rule as unknown as
        | Prisma.NullableJsonNullValueInput
        | Prisma.InputJsonValue,
    },
  });

  return permission;
}

export async function checkResourcePermission(
  userId: string,
  resource: string,
  action: string,
  resourceId?: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              groups: {
                include: {
                  permissions: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user?.role) return false;

  // Check direct permissions
  const directPermission = user.role.permissions.find(
    (p) => p.resource === resource && p.action === action
  );

  if (directPermission) {
    // Check custom rules if they exist
    if (directPermission.conditions) {
      const rule =
        directPermission.conditions as unknown as CustomPermissionRule;
      return await evaluateCustomRule(rule, userId, resourceId);
    }
    return true;
  }

  // Check group permissions
  const hasGroupPermission = user.role.permissions.some((p) =>
    p.groups.some((g) =>
      g.permissions.some(
        (gp) => gp.resource === resource && gp.action === action
      )
    )
  );

  return hasGroupPermission;
}

async function evaluateCustomRule(
  rule: CustomPermissionRule,
  userId: string,
  resourceId?: string
): Promise<boolean> {
  switch (rule.condition) {
    case 'ownership':
      return await checkResourceOwnership(userId, resourceId, rule.params);
    case 'time_based':
      return checkTimeBasedAccess(rule.params as TimeBasedParams);
    case 'quota':
      return await checkQuotaLimit(userId, rule.params as QuotaParams);
    default:
      return false;
  }
}

async function checkResourceOwnership(
  userId: string,
  resourceId?: string,
  params?: ResourceParams
): Promise<boolean> {
  if (!resourceId || !params?.resourceType) return false;

  const resourceType = params.resourceType as PrismaModels;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resource = await (prisma[resourceType] as any).findFirst({
    where: {
      id: resourceId,
      authorId: userId,
    },
  });

  return !!resource;
}

function checkTimeBasedAccess(params: TimeBasedParams): boolean {
  const { startTime, endTime } = params;
  const currentTime = new Date();
  return currentTime >= new Date(startTime) && currentTime <= new Date(endTime);
}

async function checkQuotaLimit(
  userId: string,
  params: QuotaParams
): Promise<boolean> {
  const { limit, period, resource } = params;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);

  const resourceType = resource as PrismaModels;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const count = await (prisma[resourceType] as any).count({
    where: {
      authorId: userId,
      created_at: {
        gte: startDate,
      },
    },
  });

  return count < limit;
}

export async function checkRole(
  userId: string,
  role: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });
  return user?.role?.name === role;
}

export async function updateRole(
  role_id: string,
  data: {
    name?: string;
    description?: string;
    parent_id?: string | null;
    permissions?: string[];
  }
): Promise<Role> {
  const existingRole = await prisma.role.findUnique({
    where: { id: role_id },
    include: { permissions: true },
  });

  if (!existingRole) throw createAppError('Role not found', 404);

  return prisma.role.update({
    where: { id: role_id },
    data: {
      name: data.name,
      description: data.description,
      parent_id: data.parent_id,
      permissions: data.permissions
        ? {
            disconnect: existingRole.permissions.map((p) => ({ id: p.id })),
            connect: data.permissions.map((id) => ({ id })),
          }
        : undefined,
    },
    include: { permissions: true, parent: true },
  });
}

export async function deleteRole(role_id: string): Promise<void> {
  const usersWithRole = await prisma.user.count({
    where: { role_id },
  });

  if (usersWithRole > 0) {
    throw createAppError('Cannot delete role assigned to users', 400);
  }

  await prisma.role.delete({
    where: { id: role_id },
  });
}

export async function updatePermission(
  permissionId: string,
  data: {
    name?: string;
    description?: string;
    resource?: string;
    action?: string;
  }
): Promise<Permission> {
  const existing = await prisma.permission.findUnique({
    where: { id: permissionId },
  });

  if (!existing) throw createAppError('Permission not found', 404);

  return prisma.permission.update({
    where: { id: permissionId },
    data: {
      name: data.name,
      description: data.description,
      resource: data.resource,
      action: data.action,
    },
  });
}

export async function deletePermission(permissionId: string): Promise<void> {
  const inUse = await prisma.role.count({
    where: {
      permissions: {
        some: { id: permissionId },
      },
    },
  });

  const inGroups = await prisma.permissionGroup.count({
    where: {
      permissions: {
        some: { id: permissionId },
      },
    },
  });

  if (inUse > 0 || inGroups > 0) {
    throw createAppError('Permission is in use and cannot be deleted', 400);
  }

  await prisma.permission.delete({
    where: { id: permissionId },
  });
}
