"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubjectsInMainConcept = exports.deleteMainConcept = exports.updateMainConcept = exports.createMainConcept = exports.getMainConceptById = exports.getAllMainConcepts = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const index_1 = require("../utils/index");
const apiResponse_1 = require("../utils/apiResponse");
// Get all main concepts
exports.getAllMainConcepts = (0, index_1.catchAsync)(async (req, res) => {
    const mainConcepts = await prisma_1.default.mainConcept.findMany({
        include: {
            subjects: {
                include: {
                    subject: {
                        select: {
                            title: true,
                            description: true,
                        },
                    },
                },
                orderBy: {
                    order: 'asc',
                },
            },
        },
        orderBy: {
            order: 'asc',
        },
    });
    return (0, apiResponse_1.sendResponse)(res, 'MAIN_CONCEPTS_FETCHED', {
        data: mainConcepts,
    });
});
// Get a single main concept by ID
exports.getMainConceptById = (0, index_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const mainConcept = await prisma_1.default.mainConcept.findUnique({
        where: { id },
        include: {
            subjects: {
                include: {
                    subject: {
                        select: {
                            title: true,
                            description: true,
                        },
                    },
                },
                orderBy: {
                    order: 'asc',
                },
            },
        },
    });
    if (!mainConcept) {
        return (0, apiResponse_1.sendResponse)(res, 'MAIN_CONCEPT_NOT_FOUND', {
            error: 'Main concept not found',
        });
    }
    return (0, apiResponse_1.sendResponse)(res, 'MAIN_CONCEPT_FETCHED', {
        data: mainConcept,
    });
});
// Create a new main concept
exports.createMainConcept = (0, index_1.catchAsync)(async (req, res) => {
    const { name, description, order, roadmapId } = req.body;
    const mainConcept = await prisma_1.default.mainConcept.create({
        data: {
            name,
            description,
            order: order || 0,
            roadmaps: {
                connect: { id: roadmapId },
            },
        },
        include: {
            subjects: {
                include: {
                    subject: true,
                },
            },
        },
    });
    return (0, apiResponse_1.sendResponse)(res, 'MAIN_CONCEPT_CREATED', {
        data: mainConcept,
    });
});
// Update a main concept
exports.updateMainConcept = (0, index_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const { name, description, order } = req.body;
    const mainConcept = await prisma_1.default.mainConcept.findUnique({
        where: { id },
    });
    if (!mainConcept) {
        return (0, apiResponse_1.sendResponse)(res, 'MAIN_CONCEPT_NOT_FOUND', {
            error: 'Main concept not found',
        });
    }
    const updatedMainConcept = await prisma_1.default.mainConcept.update({
        where: { id },
        data: {
            name,
            description,
            order: order || mainConcept.order,
        },
        include: {
            subjects: {
                include: {
                    subject: true,
                },
            },
        },
    });
    return (0, apiResponse_1.sendResponse)(res, 'MAIN_CONCEPT_UPDATED', {
        data: updatedMainConcept,
    });
});
// Delete a main concept
exports.deleteMainConcept = (0, index_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const mainConcept = await prisma_1.default.mainConcept.findUnique({
        where: { id },
    });
    if (!mainConcept) {
        return (0, apiResponse_1.sendResponse)(res, 'MAIN_CONCEPT_NOT_FOUND', {
            error: 'Main concept not found',
        });
    }
    await prisma_1.default.mainConcept.delete({
        where: { id },
    });
    return (0, apiResponse_1.sendResponse)(res, 'MAIN_CONCEPT_DELETED', {
        data: { id },
    });
});
// Get subjects in a main concept
exports.getSubjectsInMainConcept = (0, index_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const mainConcept = await prisma_1.default.mainConcept.findUnique({
        where: { id },
        include: {
            subjects: {
                include: {
                    subject: {
                        select: {
                            title: true,
                            description: true,
                        },
                    },
                },
                orderBy: {
                    order: 'asc',
                },
            },
        },
    });
    if (!mainConcept) {
        return (0, apiResponse_1.sendResponse)(res, 'MAIN_CONCEPT_NOT_FOUND', {
            error: 'Main concept not found',
        });
    }
    return (0, apiResponse_1.sendResponse)(res, 'SUBJECTS_FETCHED', {
        data: mainConcept.subjects,
    });
});
//# sourceMappingURL=mainConceptController.js.map