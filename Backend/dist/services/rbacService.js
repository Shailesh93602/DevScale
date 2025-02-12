"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRole = createRole;
exports.createPermission = createPermission;
exports.assignRoleToUser = assignRoleToUser;
exports.checkPermission = checkPermission;
exports.getRoleHierarchy = getRoleHierarchy;
exports.createPermissionGroup = createPermissionGroup;
exports.addCustomPermissionRule = addCustomPermissionRule;
exports.checkResourcePermission = checkResourcePermission;
exports.checkRole = checkRole;
exports.updateRole = updateRole;
exports.deleteRole = deleteRole;
exports.updatePermission = updatePermission;
exports.deletePermission = deletePermission;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const cacheService_1 = require("./cacheService");
const prisma = new client_1.PrismaClient();
async function createRole(data) {
    const existing = await prisma.role.findUnique({ where: { name: data.name } });
    if (existing)
        throw (0, errorHandler_1.createAppError)('Role already exists', 400);
    return prisma.role.create({
        data: {
            name: data.name,
            description: data.description,
            parentId: data.parentId,
            permissions: data.permissions
                ? { connect: data.permissions.map((id) => ({ id })) }
                : undefined,
        },
        include: { permissions: true, parent: true },
    });
}
async function createPermission(data) {
    const existing = await prisma.permission.findUnique({
        where: { name: data.name },
    });
    if (existing)
        throw (0, errorHandler_1.createAppError)('Permission already exists', 400);
    return prisma.permission.create({
        data: {
            name: data.name,
            description: data.description,
            resource: data.resource,
            action: data.action,
        },
    });
}
async function assignRoleToUser(userId, roleId) {
    const user = await prisma.user.update({
        where: { id: userId },
        data: { roleId },
        include: { role: { include: { permissions: true } } },
    });
    await (0, cacheService_1.deleteCache)(`user:${userId}:permissions`);
    return user;
}
async function checkPermission(userId, resource, action) {
    const cacheKey = `user:${userId}:${resource}:${action}`;
    const cached = await (0, cacheService_1.getCache)(cacheKey);
    if (cached !== undefined)
        return Boolean(cached);
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
    if (!user?.role)
        return false;
    const hasPermission = checkHierarchyPermissions(user.role, resource, action);
    await (0, cacheService_1.setCache)(cacheKey, hasPermission, { ttl: 300 });
    return hasPermission;
}
function checkHierarchyPermissions(role, resource, action) {
    if (role.permissions.some((p) => p.resource === resource && p.action === action)) {
        return true;
    }
    return role.parent
        ? checkHierarchyPermissions(role.parent, resource, action)
        : false;
}
async function getRoleHierarchy(roleId) {
    const role = await prisma.role.findUnique({
        where: { id: roleId },
        include: {
            permissions: true,
            children: { include: { permissions: true } },
            parent: { include: { permissions: true } },
        },
    });
    if (!role)
        throw (0, errorHandler_1.createAppError)('Role not found', 404);
    return role;
}
async function createPermissionGroup(data) {
    const existing = await prisma.permissionGroup.findUnique({
        where: { name: data.name },
    });
    if (existing)
        throw (0, errorHandler_1.createAppError)('Permission group exists', 400);
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
async function addCustomPermissionRule(permissionId, rule) {
    const permission = await prisma.permission.update({
        where: { id: permissionId },
        data: {
            conditions: rule,
        },
    });
    return permission;
}
async function checkResourcePermission(userId, resource, action, resourceId) {
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
    if (!user?.role)
        return false;
    // Check direct permissions
    const directPermission = user.role.permissions.find((p) => p.resource === resource && p.action === action);
    if (directPermission) {
        // Check custom rules if they exist
        if (directPermission.conditions) {
            const rule = directPermission.conditions;
            return await evaluateCustomRule(rule, userId, resourceId);
        }
        return true;
    }
    // Check group permissions
    const hasGroupPermission = user.role.permissions.some((p) => p.groups.some((g) => g.permissions.some((gp) => gp.resource === resource && gp.action === action)));
    return hasGroupPermission;
}
async function evaluateCustomRule(rule, userId, resourceId) {
    switch (rule.condition) {
        case 'ownership':
            return await checkResourceOwnership(userId, resourceId, rule.params);
        case 'time_based':
            return checkTimeBasedAccess(rule.params);
        case 'quota':
            return await checkQuotaLimit(userId, rule.params);
        default:
            return false;
    }
}
async function checkResourceOwnership(userId, resourceId, params) {
    if (!resourceId || !params?.resourceType)
        return false;
    const resourceType = params.resourceType;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resource = await prisma[resourceType].findFirst({
        where: {
            id: resourceId,
            authorId: userId,
        },
    });
    return !!resource;
}
function checkTimeBasedAccess(params) {
    const { startTime, endTime } = params;
    const currentTime = new Date();
    return currentTime >= new Date(startTime) && currentTime <= new Date(endTime);
}
async function checkQuotaLimit(userId, params) {
    const { limit, period, resource } = params;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);
    const resourceType = resource;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const count = await prisma[resourceType].count({
        where: {
            authorId: userId,
            created_at: {
                gte: startDate,
            },
        },
    });
    return count < limit;
}
async function checkRole(userId, role) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
    });
    return user?.role?.name === role;
}
async function updateRole(roleId, data) {
    const existingRole = await prisma.role.findUnique({
        where: { id: roleId },
        include: { permissions: true },
    });
    if (!existingRole)
        throw (0, errorHandler_1.createAppError)('Role not found', 404);
    return prisma.role.update({
        where: { id: roleId },
        data: {
            name: data.name,
            description: data.description,
            parentId: data.parentId,
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
async function deleteRole(roleId) {
    const usersWithRole = await prisma.user.count({
        where: { roleId },
    });
    if (usersWithRole > 0) {
        throw (0, errorHandler_1.createAppError)('Cannot delete role assigned to users', 400);
    }
    await prisma.role.delete({
        where: { id: roleId },
    });
}
async function updatePermission(permissionId, data) {
    const existing = await prisma.permission.findUnique({
        where: { id: permissionId },
    });
    if (!existing)
        throw (0, errorHandler_1.createAppError)('Permission not found', 404);
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
async function deletePermission(permissionId) {
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
        throw (0, errorHandler_1.createAppError)('Permission is in use and cannot be deleted', 400);
    }
    await prisma.permission.delete({
        where: { id: permissionId },
    });
}
//# sourceMappingURL=rbacService.js.map