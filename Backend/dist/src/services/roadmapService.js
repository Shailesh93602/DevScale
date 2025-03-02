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
            return await prisma.$transaction(async (tx) => {
                // Create the roadmap
                const roadmap = await tx.roadmap.create({
                    data: {
                        title: data.title,
                        description: data.description,
                        user: { connect: { id: data.author_id } },
                        is_public: data.is_public ?? false,
                    },
                });
                // Create and connect main concepts
                if (data.concepts) {
                    for (const concept of data.concepts) {
                        const mainConcept = await tx.mainConcept.create({
                            data: {
                                name: concept.title,
                                description: concept.description,
                                order: concept.order,
                            },
                        });
                        // Connect main concept to roadmap
                        await tx.roadmapMainConcept.create({
                            data: {
                                roadmap_id: roadmap.id,
                                main_concept_id: mainConcept.id,
                                order: concept.order,
                            },
                        });
                        // Create and connect subjects
                        if (concept.subjects) {
                            for (const subjectData of concept.subjects) {
                                const subject = await tx.subject.create({
                                    data: {
                                        title: subjectData.title,
                                        description: subjectData.description,
                                        order: subjectData.order,
                                    },
                                });
                                // Connect subject to main concept
                                await tx.mainConceptSubject.create({
                                    data: {
                                        main_concept_id: mainConcept.id,
                                        subject_id: subject.id,
                                        order: subjectData.order,
                                    },
                                });
                                // Create and connect topics
                                if (subjectData.topics) {
                                    for (const topicData of subjectData.topics) {
                                        const topic = await tx.topic.create({
                                            data: {
                                                title: topicData.title,
                                                description: topicData.description,
                                                order: topicData.order,
                                                content: topicData.content,
                                                resources: topicData.resources,
                                                prerequisites: topicData.prerequisites,
                                            },
                                        });
                                        // Connect topic to subject
                                        await tx.subjectTopic.create({
                                            data: {
                                                subject_id: subject.id,
                                                topic_id: topic.id,
                                                order: topicData.order,
                                            },
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
                return roadmap;
            });
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
                main_concepts: {
                    orderBy: { order: 'asc' },
                    include: {
                        main_concept: {
                            include: {
                                subjects: {
                                    orderBy: { order: 'asc' },
                                    include: {
                                        subject: {
                                            include: {
                                                topics: {
                                                    orderBy: { order: 'asc' },
                                                    include: {
                                                        topic: {
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
                is_public: data.is_public,
            },
            include: {
                main_concepts: {
                    select: {
                        main_concept: {
                            include: {
                                subjects: {
                                    select: {
                                        subject: {
                                            include: {
                                                topics: true,
                                            },
                                        },
                                    },
                                },
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
    static async addConcept(roadmap_id, data) {
        return await prisma.$transaction(async (tx) => {
            // Create main concept
            const mainConcept = await tx.mainConcept.create({
                data: {
                    name: data.title,
                    description: data.description,
                    order: data.order,
                },
            });
            // Connect to roadmap
            await tx.roadmapMainConcept.create({
                data: {
                    roadmap_id,
                    main_concept_id: mainConcept.id,
                    order: data.order,
                },
            });
            // Add subjects if provided
            if (data.subjects) {
                for (const subjectData of data.subjects) {
                    const subject = await tx.subject.create({
                        data: {
                            title: subjectData.title,
                            description: subjectData.description,
                            order: subjectData.order,
                        },
                    });
                    // Connect subject to main concept
                    await tx.mainConceptSubject.create({
                        data: {
                            main_concept_id: mainConcept.id,
                            subject_id: subject.id,
                            order: subjectData.order,
                        },
                    });
                    // Add topics if provided
                    if (subjectData.topics) {
                        for (const topicData of subjectData.topics) {
                            const topic = await tx.topic.create({
                                data: {
                                    title: topicData.title,
                                    description: topicData.description,
                                    order: topicData.order,
                                    content: topicData.content,
                                    resources: topicData.resources,
                                    prerequisites: topicData.prerequisites,
                                },
                            });
                            // Connect topic to subject
                            await tx.subjectTopic.create({
                                data: {
                                    subject_id: subject.id,
                                    topic_id: topic.id,
                                    order: topicData.order,
                                },
                            });
                        }
                    }
                }
            }
            return mainConcept;
        });
    }
    static async addSubject(main_concept_id, data) {
        const result = await prisma.$transaction(async (tx) => {
            const subject = await tx.subject.create({
                data: {
                    title: data.title,
                    description: data.description,
                    order: data.order,
                    main_concepts: { connect: { id: main_concept_id } },
                },
            });
            if (data.topics) {
                for (const topicData of data.topics) {
                    const topic = await tx.topic.create({
                        data: {
                            title: topicData.title,
                            description: topicData.description,
                            order: topicData.order,
                            content: topicData.content,
                            resources: topicData.resources,
                            prerequisites: topicData.prerequisites,
                        },
                    });
                    await tx.subjectTopic.create({
                        data: {
                            subject_id: subject.id,
                            topic_id: topic.id,
                            order: topicData.order,
                        },
                    });
                }
            }
            await (0, cacheService_1.deleteCache)('roadmaps:all');
            return subject;
        });
        return result;
    }
    static async addTopic(subject_id, data) {
        const topic = await prisma.topic.create({
            data: {
                title: data.title,
                description: data.description,
                order: data.order,
                content: data.content,
                resources: data.resources,
                prerequisites: data.prerequisites,
                subjects: {
                    create: {
                        subject_id: subject_id,
                        order: data.order,
                    },
                },
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
                user_id_topic_id: {
                    user_id: userId,
                    topic_id: topicId,
                },
            },
            update: {
                is_completed: completed,
                completed_at: completed ? new Date() : null,
            },
            create: {
                user_id: userId,
                topic_id: topicId,
                subject_id: '',
                is_completed: completed,
                completed_at: completed ? new Date() : null,
            },
        });
        await (0, cacheService_1.deleteCache)('roadmaps:all');
        return progress;
    }
    static async getAllRoadmaps(user_id) {
        const roadmaps = await prisma.roadmap.findMany({
            include: {
                main_concepts: {
                    select: {
                        main_concept: {
                            include: {
                                subjects: true,
                            },
                        },
                    },
                },
                user_roadmaps: {
                    where: user_id ? { user_id } : undefined,
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
    static async updateSubjectsOrder(roadmap_id, subject_orders) {
        await prisma.$transaction(subject_orders.map((order) => prisma.mainConceptSubject.updateMany({
            where: { subject_id: order.subject_id },
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
                    user: { connect: { id: data.author_id } },
                    is_public: data.is_public ?? false,
                },
            });
            // If cloning from existing roadmap
            if (data.sourceRoadmapId) {
                const sourceRoadmap = await tx.roadmap.findUnique({
                    where: { id: data.sourceRoadmapId },
                    include: {
                        main_concepts: {
                            select: {
                                main_concept: {
                                    include: {
                                        subjects: {
                                            select: {
                                                subject: {
                                                    include: {
                                                        topics: {
                                                            select: {
                                                                topic: true,
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
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
                for (const main_concept of sourceRoadmap.main_concepts) {
                    await tx.mainConcept.create({
                        data: {
                            name: main_concept.main_concept?.name,
                            description: main_concept.main_concept?.description,
                            order: main_concept.main_concept?.order,
                        },
                    });
                    for (const subject of main_concept.main_concept?.subjects ?? []) {
                        await tx.subject.create({
                            data: {
                                title: subject.subject?.title,
                                description: subject.subject?.description,
                                order: subject.subject?.order,
                            },
                        });
                        await tx.topic.createMany({
                            data: subject.subject?.topics?.map((topic) => ({
                                title: topic.topic?.title,
                                description: topic.topic?.description,
                                order: topic.topic?.order,
                                content: topic.topic?.content,
                                resources: topic.topic?.resources,
                                prerequisites: topic.topic?.prerequisites,
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
                user: { connect: { id: data.user_id } },
                roadmap: { connect: { id: data.roadmap_id } },
                is_custom: data.is_custom ?? false,
                topic: { connect: { id: data.topic_id } },
            },
            include: {
                roadmap: {
                    include: {
                        main_concepts: {
                            select: {
                                main_concept: {
                                    include: {
                                        subjects: {
                                            select: {
                                                subject: {
                                                    include: {
                                                        topics: true,
                                                    },
                                                },
                                            },
                                        },
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
    static async getUserRoadmaps(user_id) {
        const userRoadmaps = await prisma.userRoadmap.findMany({
            where: { user_id },
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
    static async updateRoadmapPrivacy(id, is_public) {
        const roadmap = await prisma.roadmap.update({
            where: { id },
            data: { is_public },
        });
        await (0, cacheService_1.deleteCache)('roadmaps:all');
        return roadmap;
    }
    static async getPublicRoadmaps(filters) {
        const roadmaps = await prisma.roadmap.findMany({
            where: {
                is_public: true,
                user_id: filters?.author_id,
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
                        main_concepts: true,
                    },
                },
            },
            orderBy: filters?.sort === 'popular'
                ? { likes: { _count: 'desc' } }
                : { created_at: 'desc' },
        });
        return roadmaps;
    }
    static async getRoadmapProgress(user_id, roadmap_id) {
        const roadmap = await prisma.roadmap.findUnique({
            where: { id: roadmap_id },
            include: {
                main_concepts: {
                    select: {
                        main_concept: {
                            include: {
                                subjects: {
                                    select: {
                                        subject: {
                                            include: {
                                                topics: {
                                                    select: {
                                                        topic: {
                                                            include: {
                                                                user_progress: {
                                                                    where: { user_id },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
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
        roadmap.main_concepts.forEach((concept) => {
            concept.main_concept?.subjects.forEach((subject) => {
                subject.subject?.topics.forEach((topic) => {
                    totalTopics++;
                    if (topic.topic?.user_progress.some((p) => p.is_completed)) {
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