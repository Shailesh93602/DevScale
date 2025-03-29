"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../utils/index");
const apiResponse_1 = require("../utils/apiResponse");
const roadmapRepository_1 = __importDefault(require("../repositories/roadmapRepository"));
const userRoadmapRepository_1 = __importDefault(require("@/repositories/userRoadmapRepository"));
const roadmapCategoryRepository_1 = __importDefault(require("@/repositories/roadmapCategoryRepository"));
class RoadmapController {
    roadmapRepo;
    userRoadmapRepo;
    roadmapCategoryRepo;
    constructor() {
        this.roadmapRepo = new roadmapRepository_1.default();
        this.userRoadmapRepo = new userRoadmapRepository_1.default();
        this.roadmapCategoryRepo = new roadmapCategoryRepository_1.default();
    }
    getAllRoadmaps = (0, index_1.catchAsync)(async (req, res) => {
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
        const roadmaps = await this.roadmapRepo.getAllRoadmaps(whereClause.where);
        return (0, apiResponse_1.sendResponse)(res, 'ROADMAPS_FETCHED', {
            data: roadmaps,
        });
    });
    getMainConceptsInRoadmap = (0, index_1.catchAsync)(async (req, res) => {
        const roadmapId = req.params.id;
        const roadmap = await this.roadmapRepo.getRoadmap(roadmapId);
        if (!roadmap) {
            return (0, apiResponse_1.sendResponse)(res, 'ROADMAP_NOT_FOUND', {
                error: 'Roadmap not found',
            });
        }
        return (0, apiResponse_1.sendResponse)(res, 'MAIN_CONCEPTS_FETCHED', {
            data: roadmap.main_concepts,
        });
    });
    getRoadMap = (0, index_1.catchAsync)(async (req, res) => {
        const roadMapId = req.params.id;
        const roadMap = await this.roadmapRepo.getRoadmap(roadMapId);
        if (!roadMap) {
            return (0, apiResponse_1.sendResponse)(res, 'ROADMAP_NOT_FOUND', {
                error: 'Roadmap not found',
            });
        }
        (0, apiResponse_1.sendResponse)(res, 'ROADMAP_FETCHED', { data: { roadMap } });
    });
    createRoadMap = (0, index_1.catchAsync)(async (req, res) => {
        const user_id = req.user.id;
        const { title, description, content } = req.body;
        if (!title || !description || !content) {
            return (0, apiResponse_1.sendResponse)(res, 'INVALID_PAYLOAD', {
                error: 'Invalid payload',
            });
        }
        const newRoadMap = await this.roadmapRepo.createRoadmap({
            title,
            description,
            author_id: user_id,
        });
        (0, apiResponse_1.sendResponse)(res, 'ROADMAP_CREATED', { data: newRoadMap });
    });
    createRoadmap = (0, index_1.catchAsync)(async (req, res) => {
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
        const roadmap = await this.roadmapRepo.create({
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
    updateRoadMap = (0, index_1.catchAsync)(async (req, res) => {
        const roadMapId = req.params.id;
        const { title, description } = req.body;
        const roadMap = await this.roadmapRepo.getRoadmap(roadMapId);
        if (!roadMap) {
            return (0, apiResponse_1.sendResponse)(res, 'ROADMAP_NOT_FOUND', {
                error: 'Roadmap not found',
            });
        }
        const updatedRoadMap = await this.roadmapRepo.update({
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
    deleteRoadMap = (0, index_1.catchAsync)(async (req, res) => {
        const roadMapId = req.params.id;
        const roadMap = await this.roadmapRepo.getRoadmap(roadMapId);
        if (!roadMap) {
            return (0, apiResponse_1.sendResponse)(res, 'ROADMAP_NOT_FOUND', {
                error: 'Roadmap not found',
            });
        }
        await this.roadmapRepo.delete({
            where: { id: roadMapId },
        });
        return (0, apiResponse_1.sendResponse)(res, 'ROADMAP_DELETED', {
            data: { id: roadMapId },
        });
    });
    updateSubjectsOrder = (0, index_1.catchAsync)(async (req, res) => {
        // TODO: implement logic to update the order
        return (0, apiResponse_1.sendResponse)(res, 'SUBJECT_ORDER_UPDATED', {
            data: null,
        });
    });
    enrollRoadMap = (0, index_1.catchAsync)(async (req, res) => {
        const userId = req.user?.id;
        const { roadmapId } = req.body;
        if (!roadmapId) {
            return (0, apiResponse_1.sendResponse)(res, 'INVALID_ROADMAP_ID', {
                error: 'Invalid roadmap ID',
            });
        }
        const roadmap = await this.roadmapRepo.getUserRoadmap(roadmapId, userId);
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
        await this.userRoadmapRepo.create({
            data: {
                user_id: userId,
                roadmap_id: roadmapId,
            },
        });
        return (0, apiResponse_1.sendResponse)(res, 'ROADMAP_ENROLLED', { data: null });
    });
    getRoadmapCategories = (0, index_1.catchAsync)(async (req, res) => {
        const categories = await this.roadmapCategoryRepo.findMany();
        return (0, apiResponse_1.sendResponse)(res, 'ROADMAP_CATEGORIES_FETCHED', {
            data: categories,
        });
    });
}
exports.default = RoadmapController;
//# sourceMappingURL=roadMapControllers.js.map