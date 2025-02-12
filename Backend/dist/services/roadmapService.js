"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoadmapService = void 0;
const errorHandler_1 = require("../middlewares/errorHandler");
const cacheService_1 = require("./cacheService");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class RoadmapService {
    static async createRoadmap(data) {
        try {
            const roadmap = await prisma.roadmap.create({
                data: {
                    title: data.title,
                    description: data.description,
                    user: { connect: { id: data.authorId } },
                    isPublic: data.isPublic ?? false,
                    concepts: {
                        create: data.concepts?.map((concept) => ({
                            title: concept.title,
                            description: concept.description,
                            order: concept.order,
                            subjects: {
                                create: concept.subjects?.map((subject) => ({
                                    title: subject.title,
                                    description: subject.description,
                                    order: subject.order,
                                    topics: {
                                        create: subject.topics?.map((topic) => ({
                                            title: topic.title,
                                            description: topic.description,
                                            order: topic.order,
                                            content: topic.content,
                                            resources: topic.resources,
                                            prerequisites: topic.prerequisites,
                                        })),
                                    },
                                })),
                            },
                        })),
                    },
                },
                include: {
                    user: {
                        select: {
                            username: true,
                            avatar_url: true,
                        },
                    },
                    concepts: {
                        include: {
                            subjects: {
                                include: {
                                    topics: true,
                                },
                            },
                        },
                    },
                },
            });
            await (0, cacheService_1.deleteCache)('roadmaps:all');
            return roadmap;
        }
        catch (error) {
            throw (0, errorHandler_1.createAppError)('Failed to create roadmap', 500, error);
        }
    }
    static async getRoadmap(id) {
        const cached = await (0, cacheService_1.getCache)(`roadmap:${id}`);
        if (cached)
            return cached;
        const roadmap = await prisma.roadmap.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        username: true,
                        avatar_url: true,
                    },
                },
                concepts: {
                    orderBy: { order: 'asc' },
                    include: {
                        subjects: {
                            orderBy: { order: 'asc' },
                            include: {
                                topics: {
                                    orderBy: { order: 'asc' },
                                    include: {
                                        articles: true,
                                        quizzes: true,
                                        challenges: true,
                                    },
                                },
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
        });
        if (!roadmap) {
            throw (0, errorHandler_1.createAppError)('Roadmap not found', 404);
        }
        await (0, cacheService_1.setCache)(`roadmap:${id}`, roadmap, { ttl: 3600 });
        return roadmap;
    }
    static async updateRoadmap(id, data) {
        const updated = await prisma.roadmap.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                isPublic: data.isPublic,
            },
            include: {
                concepts: {
                    include: {
                        subjects: {
                            include: {
                                topics: true,
                            },
                        },
                    },
                },
            },
        });
        await (0, cacheService_1.deleteCache)(`roadmap:${id}`);
        await (0, cacheService_1.deleteCache)('roadmaps:all');
        return updated;
    }
    static async addConcept(roadmapId, data) {
        const concept = await prisma.concept.create({
            data: {
                title: data.title,
                description: data.description,
                order: data.order,
                roadmap: { connect: { id: roadmapId } },
                subjects: data.subjects
                    ? {
                        create: data.subjects.map((subject) => ({
                            title: subject.title,
                            description: subject.description,
                            order: subject.order,
                            topics: subject.topics
                                ? {
                                    create: subject.topics,
                                }
                                : undefined,
                        })),
                    }
                    : undefined,
            },
            include: {
                subjects: {
                    include: {
                        topics: true,
                    },
                },
            },
        });
        await (0, cacheService_1.deleteCache)('roadmaps:all');
        return concept;
    }
    static async addSubject(conceptId, data) {
        const subject = await prisma.subject.create({
            data: {
                title: data.title,
                description: data.description,
                order: data.order,
                concept: { connect: { id: conceptId } },
                topics: data.topics
                    ? {
                        create: data.topics.map((topic) => ({
                            title: topic.title,
                            description: topic.description,
                            order: topic.order,
                            content: topic.content,
                            resources: topic.resources,
                            prerequisites: topic.prerequisites,
                        })),
                    }
                    : undefined,
            },
            include: {
                topics: true,
            },
        });
        await (0, cacheService_1.deleteCache)('roadmaps:all');
        return subject;
    }
    static async addTopic(subjectId, data) {
        const topic = await prisma.topic.create({
            data: {
                ...data,
                subjectId,
            },
        });
        await (0, cacheService_1.deleteCache)('roadmaps:all');
        return topic;
    }
    static async updateTopicContent(topicId, content, resources) {
        const topic = await prisma.topic.update({
            where: { id: topicId },
            data: {
                content,
                resources,
            },
        });
        await (0, cacheService_1.deleteCache)('roadmaps:all');
        return topic;
    }
    static async linkContent(topicId, data) {
        const topic = await prisma.topic.update({
            where: { id: topicId },
            data: {
                articles: {
                    connect: data.articleIds?.map((id) => ({ id })),
                },
                quizzes: {
                    connect: data.quizIds?.map((id) => ({ id })),
                },
                challenges: {
                    connect: data.challengeIds?.map((id) => ({ id })),
                },
            },
            include: {
                articles: true,
                quizzes: true,
                challenges: true,
            },
        });
        await (0, cacheService_1.deleteCache)('roadmaps:all');
        return topic;
    }
    static async trackProgress(userId, topicId, completed) {
        const progress = await prisma.userProgress.upsert({
            where: {
                userId_topicId: {
                    userId,
                    topicId,
                },
            },
            update: {
                isCompleted: completed,
                completedAt: completed ? new Date() : null,
            },
            create: {
                userId,
                topicId,
                subjectId: '',
                isCompleted: completed,
                completedAt: completed ? new Date() : null,
            },
        });
        await (0, cacheService_1.deleteCache)('roadmaps:all');
        return progress;
    }
    static async getAllRoadmaps(userId) {
        const roadmaps = await prisma.roadmap.findMany({
            include: {
                mainConcepts: {
                    include: {
                        subjects: true,
                    },
                },
                userRoadmaps: {
                    where: userId ? { userId } : undefined,
                },
            },
        });
        return roadmaps;
    }
    static async deleteRoadmap(id) {
        await prisma.roadmap.delete({
            where: { id },
        });
        await (0, cacheService_1.deleteCache)(`roadmap:${id}`);
        await (0, cacheService_1.deleteCache)('roadmaps:all');
    }
    static async updateSubjectsOrder(roadmapId, subjectOrders) {
        await prisma.$transaction(subjectOrders.map((order) => prisma.subject.update({
            where: { id: order.subjectId },
            data: { order: order.order },
        })));
        await (0, cacheService_1.deleteCache)('roadmaps:all');
    }
    static async createCustomRoadmap(data) {
        const roadmap = await prisma.$transaction(async (tx) => {
            // Create new roadmap
            const newRoadmap = await tx.roadmap.create({
                data: {
                    title: data.title,
                    description: data.description,
                    user: { connect: { id: data.authorId } },
                    isPublic: data.isPublic ?? false,
                },
            });
            // If cloning from existing roadmap
            if (data.sourceRoadmapId) {
                const sourceRoadmap = await tx.roadmap.findUnique({
                    where: { id: data.sourceRoadmapId },
                    include: {
                        concepts: {
                            include: {
                                subjects: {
                                    include: {
                                        topics: true,
                                    },
                                },
                            },
                        },
                    },
                });
                if (!sourceRoadmap) {
                    throw (0, errorHandler_1.createAppError)('Source roadmap not found', 404);
                }
                // Clone concepts, subjects, and topics
                for (const concept of sourceRoadmap.concepts) {
                    const newConcept = await tx.concept.create({
                        data: {
                            title: concept.title,
                            description: concept.description,
                            order: concept.order,
                            roadmapId: newRoadmap.id,
                        },
                    });
                    for (const subject of concept.subjects) {
                        const newSubject = await tx.subject.create({
                            data: {
                                title: subject.title,
                                description: subject.description,
                                order: subject.order,
                                conceptId: newConcept.id,
                            },
                        });
                        await tx.topic.createMany({
                            data: subject.topics.map((topic) => ({
                                title: topic.title,
                                description: topic.description,
                                order: topic.order,
                                content: topic.content,
                                resources: topic.resources,
                                prerequisites: topic.prerequisites,
                                subjectId: newSubject.id,
                            })),
                        });
                    }
                }
            }
            await (0, cacheService_1.deleteCache)('roadmaps:all');
            return newRoadmap;
        });
        return this.getRoadmap(roadmap.id);
    }
    static async saveRoadmap(data) {
        const userRoadmap = await prisma.userRoadmap.create({
            data: {
                user: { connect: { id: data.userId } },
                roadmap: { connect: { id: data.roadmapId } },
                isCustom: data.isCustom ?? false,
                topic: { connect: { id: data.topicId } },
            },
            include: {
                roadmap: {
                    include: {
                        concepts: {
                            include: {
                                subjects: {
                                    include: {
                                        topics: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        await (0, cacheService_1.deleteCache)('roadmaps:all');
        return userRoadmap;
    }
    static async getUserRoadmaps(userId) {
        const userRoadmaps = await prisma.userRoadmap.findMany({
            where: { userId },
            include: {
                roadmap: {
                    include: {
                        user: {
                            select: {
                                username: true,
                                avatar_url: true,
                            },
                        },
                        _count: {
                            select: {
                                likes: true,
                                comments: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });
        return userRoadmaps;
    }
    static async updateRoadmapPrivacy(id, isPublic) {
        const roadmap = await prisma.roadmap.update({
            where: { id },
            data: { isPublic },
        });
        await (0, cacheService_1.deleteCache)('roadmaps:all');
        return roadmap;
    }
    static async getPublicRoadmaps(filters) {
        const roadmaps = await prisma.roadmap.findMany({
            where: {
                isPublic: true,
                userId: filters?.authorId,
                OR: filters?.search
                    ? [
                        { title: { contains: filters.search, mode: 'insensitive' } },
                        {
                            description: { contains: filters.search, mode: 'insensitive' },
                        },
                    ]
                    : undefined,
            },
            include: {
                user: {
                    select: {
                        username: true,
                        avatar_url: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                        concepts: true,
                    },
                },
            },
            orderBy: filters?.sort === 'popular'
                ? { likes: { _count: 'desc' } }
                : { createdAt: 'desc' },
        });
        return roadmaps;
    }
    static async getRoadmapProgress(userId, roadmapId) {
        const roadmap = await prisma.roadmap.findUnique({
            where: { id: roadmapId },
            include: {
                concepts: {
                    include: {
                        subjects: {
                            include: {
                                topics: {
                                    include: {
                                        userProgress: {
                                            where: { userId },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!roadmap) {
            throw (0, errorHandler_1.createAppError)('Roadmap not found', 404);
        }
        let totalTopics = 0;
        let completedTopics = 0;
        roadmap.concepts.forEach((concept) => {
            concept.subjects.forEach((subject) => {
                subject.topics.forEach((topic) => {
                    totalTopics++;
                    if (topic.userProgress.some((p) => p.isCompleted)) {
                        completedTopics++;
                    }
                });
            });
        });
        return {
            totalTopics,
            completedTopics,
            progressPercentage: totalTopics
                ? (completedTopics / totalTopics) * 100
                : 0,
            roadmap,
        };
    }
}
exports.RoadmapService = RoadmapService;
//# sourceMappingURL=roadmapService.js.map