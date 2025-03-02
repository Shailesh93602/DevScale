"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRoadMap = exports.updateRoadMap = exports.createRoadMap = exports.getRoadMap = exports.getMainConceptsInRoadmap = exports.getAllRoadmaps = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const index_1 = require("../utils/index");
exports.getAllRoadmaps = (0, index_1.catchAsync)(async (req, res) => {
    const roadmaps = await prisma_1.default.roadmap.findMany({
        include: {
            main_concepts: {
                select: {
                    main_concept: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                        },
                    },
                },
                orderBy: {
                    created_at: 'asc',
                },
            },
        },
        orderBy: {
            created_at: 'asc',
        },
    });
    res.status(200).json(roadmaps);
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
        return res.status(404).json({ message: 'Roadmap not found' });
    }
    res.status(200).json(roadmap.main_concepts);
});
exports.getRoadMap = (0, index_1.catchAsync)(async (req, res) => {
    const roadMapId = req.params.id;
    const roadMap = await prisma_1.default.roadmap.findUnique({
        where: { id: roadMapId },
    });
    if (!roadMap) {
        return res
            .status(404)
            .json({ success: false, message: 'Roadmap not found' });
    }
    res.status(200).json({ success: true, roadMap });
});
exports.createRoadMap = (0, index_1.catchAsync)(async (req, res) => {
    const user_id = req.user.id;
    const { title, description, content } = req.body;
    if (!title || !description || !content) {
        return res.status(400).json({
            success: false,
            message: 'Title, description, and content are required',
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
    res.status(201).json({ success: true, roadMap: newRoadMap });
});
exports.updateRoadMap = (0, index_1.catchAsync)(async (req, res) => {
    const roadMapId = req.params.id;
    const { title, description } = req.body;
    const roadMap = await prisma_1.default.roadmap.findUnique({
        where: { id: roadMapId },
    });
    if (!roadMap) {
        return res
            .status(404)
            .json({ success: false, message: 'Roadmap not found' });
    }
    const updatedRoadMap = await prisma_1.default.roadmap.update({
        where: { id: roadMapId },
        data: {
            title: title ?? roadMap.title,
            description: description ?? roadMap.description,
            // content: content ?? roadMap.content,
        },
    });
    res.status(200).json({ success: true, roadMap: updatedRoadMap });
});
exports.deleteRoadMap = (0, index_1.catchAsync)(async (req, res) => {
    const roadMapId = req.params.id;
    const roadMap = await prisma_1.default.roadmap.findUnique({
        where: { id: roadMapId },
    });
    if (!roadMap) {
        return res
            .status(404)
            .json({ success: false, message: 'Roadmap not found' });
    }
    await prisma_1.default.roadmap.delete({
        where: { id: roadMapId },
    });
    res
        .status(200)
        .json({ success: true, message: 'Roadmap deleted successfully' });
});
//# sourceMappingURL=roadMapControllers.js.map