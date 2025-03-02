"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteResource = exports.updateResource = exports.getResource = exports.getResources = exports.createResource = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const cacheService_1 = require("./cacheService");
const prisma = new client_1.PrismaClient();
const createResource = async (data) => {
    try {
        const { userId, ...resourceData } = data;
        const resource = await prisma.resource.create({
            data: {
                ...resourceData,
                tags: data.tags || [],
                user: { connect: { id: userId } },
            },
            include: { user: { select: { username: true, avatar_url: true } } },
        });
        await (0, cacheService_1.deleteCache)('resources:all');
        return resource;
    }
    catch (error) {
        throw (0, errorHandler_1.createAppError)('Failed to create resource', 500, error);
    }
};
exports.createResource = createResource;
const getResources = async (filters) => {
    const cacheKey = `resources:${JSON.stringify(filters)}`;
    const cached = await (0, cacheService_1.getCache)(cacheKey);
    if (cached)
        return cached;
    const resources = await prisma.resource.findMany({
        where: {
            category: filters?.category,
            type: filters?.type,
            tags: filters?.tags ? { hasEvery: filters.tags } : undefined,
            OR: filters?.search
                ? [
                    { title: { contains: filters.search, mode: 'insensitive' } },
                    { description: { contains: filters.search, mode: 'insensitive' } },
                    { content: { contains: filters.search, mode: 'insensitive' } },
                ]
                : undefined,
        },
        include: {
            user: { select: { username: true, avatar_url: true } },
            _count: { select: { articles: true, interviewQuestions: true } },
        },
        orderBy: { created_at: 'desc' },
    });
    await (0, cacheService_1.setCache)(cacheKey, resources, { ttl: 3600 });
    return resources;
};
exports.getResources = getResources;
const getResource = async (id) => {
    const cacheKey = `resource:${id}`;
    const cached = await (0, cacheService_1.getCache)(cacheKey);
    if (cached)
        return cached;
    const resource = await prisma.resource.findUnique({
        where: { id },
        include: {
            user: { select: { username: true, avatar_url: true } },
            articles: true,
            interviewQuestions: true,
        },
    });
    if (!resource)
        throw (0, errorHandler_1.createAppError)('Resource not found', 404);
    await (0, cacheService_1.setCache)(cacheKey, resource, { ttl: 3600 });
    return resource;
};
exports.getResource = getResource;
const updateResource = async (id, data) => {
    const { userId, ...updateData } = data;
    const resource = await prisma.resource.update({
        where: { id },
        data: {
            ...updateData,
            user: userId ? { connect: { id: userId } } : undefined,
        },
        include: { user: { select: { username: true, avatar_url: true } } },
    });
    await (0, cacheService_1.deleteCache)(`resource:${id}`);
    await (0, cacheService_1.deleteCache)('resources:all');
    return resource;
};
exports.updateResource = updateResource;
const deleteResource = async (id) => {
    await prisma.resource.delete({ where: { id } });
    await (0, cacheService_1.deleteCache)(`resource:${id}`);
    await (0, cacheService_1.deleteCache)('resources:all');
};
exports.deleteResource = deleteResource;
//# sourceMappingURL=resourceService.js.map