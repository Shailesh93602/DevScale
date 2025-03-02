"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUsername = exports.upsertUser = exports.deleteUserRoadmap = exports.insertUserRoadmap = exports.getUserRoadmap = exports.getUserProgress = exports.getProfile = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const utils_1 = require("../utils");
const apiResponse_1 = require("../utils/apiResponse");
const userService = __importStar(require("../services/userService"));
exports.getProfile = (0, utils_1.catchAsync)(async (req, res) => {
    const user = await prisma_1.default.user.findUnique({
        where: { supabase_id: req.user.id },
    });
    if (!user) {
        return (0, apiResponse_1.sendResponse)(res, 'USER_NOT_CREATED');
    }
    (0, apiResponse_1.sendResponse)(res, 'PROFILE_FETCHED', {
        data: { user: (0, utils_1.parse)(user) },
    });
});
exports.getUserProgress = (0, utils_1.catchAsync)(async (req, res) => {
    const user_id = req.user.id;
    // TODO: implement this method
    const roadmaps = await prisma_1.default.roadmap.findMany({
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
                                                            progress: {
                                                                where: { user_id },
                                                                select: { id: true, status: true },
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
    (0, apiResponse_1.sendResponse)(res, 'PROGRESS_FETCHED', {
        data: { roadmaps },
    });
});
exports.getUserRoadmap = (0, utils_1.catchAsync)(async (req, res) => {
    const user_id = req.user.id;
    const userRoadmap = await prisma_1.default.userRoadmap.findFirst({
        where: { user_id },
    });
    if (!userRoadmap) {
        return res
            .status(200)
            .json({ success: true, message: 'No roadmap found for the user' });
    }
    res.status(200).json({ success: true, userRoadmap });
});
exports.insertUserRoadmap = (0, utils_1.catchAsync)(async (req, res) => {
    const user_id = req.user?.id;
    if (!user_id) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const isRoadmapExists = await prisma_1.default.userRoadmap.findFirst({
        where: { user_id },
    });
    if (isRoadmapExists) {
        return res.status(400).json({
            success: false,
            message: 'You already added a Roadmap, please remove existing Roadmap to add another Roadmap',
        });
    }
    const { roadmap_id, topic_id } = req.body;
    const userRoadmap = await prisma_1.default.userRoadmap.create({
        data: {
            user_id,
            roadmap_id,
            topic_id,
        },
    });
    res.status(200).json({
        success: true,
        message: 'User roadmap inserted successfully',
        userRoadmap,
    });
});
exports.deleteUserRoadmap = (0, utils_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const result = await prisma_1.default.userRoadmap.delete({
        where: { id },
    });
    if (!result) {
        return res
            .status(404)
            .json({ success: false, message: 'User roadmap not found' });
    }
    res
        .status(200)
        .json({ success: true, message: 'User roadmap deleted successfully' });
});
exports.upsertUser = (0, utils_1.catchAsync)(async (req, res) => {
    const { id: supabase_id, email } = req.user;
    const updateData = req.body;
    const user = await userService.upsertUserProfile({
        supabase_id,
        email,
        ...updateData,
        graduation_year: updateData.graduation_year
            ? parseInt(updateData.graduation_year)
            : undefined,
        skills: Array.isArray(updateData.skills)
            ? updateData.skills
            : [updateData.skills],
    });
    return (0, apiResponse_1.sendResponse)(res, user ? 'USER_UPDATED' : 'USER_CREATED', {
        data: { user: (0, utils_1.parse)(user) },
    });
});
exports.checkUsername = (0, utils_1.catchAsync)(async (req, res) => {
    const { username } = req.params;
    const isAvailable = await prisma_1.default.user.findFirst({
        where: { username },
    });
    (0, apiResponse_1.sendResponse)(res, 'USERNAME_CHECKED', {
        data: { available: !isAvailable },
    });
});
//# sourceMappingURL=userControllers.js.map