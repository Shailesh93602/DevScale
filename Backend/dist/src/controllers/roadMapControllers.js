"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoadmapCategories = exports.enrollRoadMap = exports.updateSubjectsOrder = exports.deleteRoadMap = exports.updateRoadMap = exports.createRoadmap = exports.createRoadMap = exports.getRoadMap = exports.getMainConceptsInRoadmap = exports.getAllRoadmaps = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const index_1 = require("../utils/index");
const pagination_1 = require("../utils/pagination");
const apiResponse_1 = require("../utils/apiResponse");
exports.getAllRoadmaps = (0, index_1.catchAsync)(async (req, res) => {
    const { type } = req.query;
    const userId = req.user?.id;
    const whereClause = {};
    if (userId) {
        switch (type) {
            case 'featured':
                whereClause.where = {
                    user_id: { not: userId },
                    user_roadmaps: {
                        none: { user_id: userId },
                    },
                    // is_public: true,
                };
                break;
            case 'my-roadmaps':
                whereClause.where = {
                    user_id: userId,
                };
                break;
            case 'enrolled':
                whereClause.where = {
                    user_roadmaps: {
                        some: { user_id: userId },
                    },
                };
                break;
        }
    }
    const roadmaps = await (0, pagination_1.paginate)({
        req,
        model: prisma_1.default.roadmap,
        searchFields: ['title', 'description'],
        whereClause: whereClause.where, // Pass only the where conditions
        selection: {
            include: {
                user: {
                    select: {
                        id: true,
                        username: true, // Changed from 'name' to 'username'
                        full_name: true, // Added full_name as an option
                    },
                },
            },
        },
    });
    return (0, apiResponse_1.sendResponse)(res, 'ROADMAPS_FETCHED', {
        data: roadmaps,
    });
});
exports.getMainConceptsInRoadmap = (0, index_1.catchAsync)(async (req, res) => {
    const roadmapId = req.params.id;
    const roadmap = await prisma_1.default.roadmap.findUnique({
        where: { id: roadmapId },
        include: {
            main_concepts: {
                select: {
                    main_concept: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            subjects: {
                                select: {
                                    subject: {
                                        select: {
                                            id: true,
                                            title: true,
                                        },
                                    },
                                },
                                orderBy: {
                                    created_at: 'asc',
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    created_at: 'asc',
                },
            },
        },
    });
    if (!roadmap) {
        return (0, apiResponse_1.sendResponse)(res, 'ROADMAP_NOT_FOUND', {
            error: 'Roadmap not found',
        });
    }
    return (0, apiResponse_1.sendResponse)(res, 'MAIN_CONCEPTS_FETCHED', {
        data: roadmap.main_concepts,
    });
});
exports.getRoadMap = (0, index_1.catchAsync)(async (req, res) => {
    const roadMapId = req.params.id;
    const roadMap = await prisma_1.default.roadmap.findUnique({
        where: { id: roadMapId },
    });
    if (!roadMap) {
        return (0, apiResponse_1.sendResponse)(res, 'ROADMAP_NOT_FOUND', {
            error: 'Roadmap not found',
        });
    }
    (0, apiResponse_1.sendResponse)(res, 'ROADMAP_FETCHED', { data: { roadMap } });
});
exports.createRoadMap = (0, index_1.catchAsync)(async (req, res) => {
    const user_id = req.user.id;
    const { title, description, content } = req.body;
    if (!title || !description || !content) {
        return (0, apiResponse_1.sendResponse)(res, 'INVALID_PAYLOAD', {
            error: 'Invalid payload',
        });
    }
    const newRoadMap = await prisma_1.default.roadmap.create({
        data: {
            title,
            description,
            // content,
            user_id,
        },
    });
    (0, apiResponse_1.sendResponse)(res, 'ROADMAP_CREATED', { data: newRoadMap });
});
exports.createRoadmap = (0, index_1.catchAsync)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return (0, apiResponse_1.sendResponse)(res, 'UNAUTHORIZED', {
            error: 'User not authenticated',
        });
    }
    const { title, description, categoryId, difficulty, estimatedHours, isPublic, version, tags, mainConcepts, } = req.body;
    const createInput = {
        title,
        description,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        difficulty,
        estimatedHours,
        is_public: isPublic,
        version,
        tags: tags.join(','), // Convert array to comma-separated string
        user: {
            connect: { id: userId },
        },
        main_concepts: {
            create: mainConcepts.map((concept, index) => ({
                order: index,
                main_concept: {
                    connect: { id: concept.main_concept_id },
                },
            })),
        },
        topics: {
            create: mainConcepts.flatMap((concept, conceptIndex) => concept.subjects.flatMap((subject, subjectIndex) => subject.topics.map((topic, topicIndex) => ({
                topic: {
                    connect: { id: topic.topic_id },
                },
                order: conceptIndex * 1000 + subjectIndex * 100 + topicIndex,
            })))),
        },
    };
    // Create the roadmap
    const roadmap = await prisma_1.default.roadmap.create({
        data: createInput,
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    full_name: true,
                },
            },
            main_concepts: {
                include: {
                    main_concept: true,
                },
            },
            topics: {
                include: {
                    topic: true,
                },
            },
        },
    });
    return (0, apiResponse_1.sendResponse)(res, 'ROADMAP_CREATED', {
        data: roadmap,
    });
});
exports.updateRoadMap = (0, index_1.catchAsync)(async (req, res) => {
    const roadMapId = req.params.id;
    const { title, description } = req.body;
    const roadMap = await prisma_1.default.roadmap.findUnique({
        where: { id: roadMapId },
    });
    if (!roadMap) {
        return (0, apiResponse_1.sendResponse)(res, 'ROADMAP_NOT_FOUND', {
            error: 'Roadmap not found',
        });
    }
    const updatedRoadMap = await prisma_1.default.roadmap.update({
        where: { id: roadMapId },
        data: {
            title: title ?? roadMap.title,
            description: description ?? roadMap.description,
            // content: content ?? roadMap.content,
        },
    });
    return (0, apiResponse_1.sendResponse)(res, 'ROADMAP_UPDATED', {
        data: updatedRoadMap,
    });
});
exports.deleteRoadMap = (0, index_1.catchAsync)(async (req, res) => {
    const roadMapId = req.params.id;
    const roadMap = await prisma_1.default.roadmap.findUnique({
        where: { id: roadMapId },
    });
    if (!roadMap) {
        return (0, apiResponse_1.sendResponse)(res, 'ROADMAP_NOT_FOUND', {
            error: 'Roadmap not found',
        });
    }
    await prisma_1.default.roadmap.delete({
        where: { id: roadMapId },
    });
    return (0, apiResponse_1.sendResponse)(res, 'ROADMAP_DELETED', {
        data: { id: roadMapId },
    });
});
exports.updateSubjectsOrder = (0, index_1.catchAsync)(async (req, res) => {
    // TODO: implement logic to update the order
    return (0, apiResponse_1.sendResponse)(res, 'SUBJECT_ORDER_UPDATED', {
        data: null,
    });
});
exports.enrollRoadMap = (0, index_1.catchAsync)(async (req, res) => {
    const userId = req.user?.id;
    const { roadmapId } = req.body;
    if (!roadmapId) {
        return (0, apiResponse_1.sendResponse)(res, 'INVALID_ROADMAP_ID', {
            error: 'Invalid roadmap ID',
        });
    }
    const roadmap = await prisma_1.default.roadmap.findUnique({
        where: { id: roadmapId },
        include: {
            user_roadmaps: {
                where: { user_id: userId },
            },
        },
    });
    if (!roadmap) {
        return (0, apiResponse_1.sendResponse)(res, 'ROADMAP_NOT_FOUND', {
            error: 'Roadmap not found',
        });
    }
    if (roadmap.user_roadmaps.some((ur) => ur.user_id === userId)) {
        return (0, apiResponse_1.sendResponse)(res, 'ROADMAP_ALREADY_ENROLLED', {
            error: 'Already enrolled',
        });
    }
    await prisma_1.default.userRoadmap.create({
        data: {
            user_id: userId,
            roadmap_id: roadmapId,
        },
    });
    return (0, apiResponse_1.sendResponse)(res, 'ROADMAP_ENROLLED', { data: null });
});
exports.getRoadmapCategories = (0, index_1.catchAsync)(async (req, res) => {
    const categories = await prisma_1.default.roadmapCategory.findMany();
    return (0, apiResponse_1.sendResponse)(res, 'ROADMAP_CATEGORIES_FETCHED', {
        data: categories,
    });
});
//# sourceMappingURL=roadMapControllers.js.map