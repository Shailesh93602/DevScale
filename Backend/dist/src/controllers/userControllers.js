"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const apiResponse_1 = require("../utils/apiResponse");
const userRepository_1 = __importDefault(require("../repositories/userRepository"));
const errorHandler_1 = require("@/utils/errorHandler");
const userRoadmapRepository_1 = __importDefault(require("@/repositories/userRoadmapRepository"));
class UserController {
    userRepo;
    userRoadmapRepo;
    constructor() {
        this.userRepo = new userRepository_1.default();
        this.userRoadmapRepo = new userRoadmapRepository_1.default();
    }
    getProfile = (0, utils_1.catchAsync)(async (req, res) => {
        const user = await this.userRepo.findUnique({ where: { id: req.user.id } });
        if (!user) {
            return (0, apiResponse_1.sendResponse)(res, 'USER_NOT_CREATED');
        }
        (0, apiResponse_1.sendResponse)(res, 'PROFILE_FETCHED', {
            data: { user: (0, utils_1.parse)(user) },
        });
    });
    getUserProgress = (0, utils_1.catchAsync)(async (req, res) => {
        // TODO: Implement logic to fetch user progress
        (0, apiResponse_1.sendResponse)(res, 'PROGRESS_FETCHED', {
            data: { progress: 0 },
        });
    });
    getUserRoadmap = (0, utils_1.catchAsync)(async (req, res) => {
        const user_id = req.user.id;
        const userRoadmap = await this.userRepo.findUnique({
            where: {
                id: user_id,
            },
            include: {
                user_roadmaps: {
                    include: {
                        roadmap: true,
                    },
                },
            },
        });
        if (!userRoadmap) {
            throw (0, errorHandler_1.createAppError)('You are not enrolled in any roadmap', 404);
        }
        (0, apiResponse_1.sendResponse)(res, 'ROADMAP_FETCHED', {
            data: { userRoadmap },
        });
    });
    insertUserRoadmap = (0, utils_1.catchAsync)(async (req, res) => {
        const userRoadmap = await this.userRoadmapRepo.create({
            data: {
                user_id: req.user.id,
                roadmap_id: req.body.roadmap_id,
            },
        });
        (0, apiResponse_1.sendResponse)(res, 'ROADMAP_ENROLLED', { data: userRoadmap });
    });
    deleteUserRoadmap = (0, utils_1.catchAsync)(async (req, res) => {
        const user_id = req.user.id;
        const { id } = req.params;
        await this.userRoadmapRepo.delete({ where: { id, user_id } });
        (0, apiResponse_1.sendResponse)(res, 'ROADMAP_REMOVED');
    });
    upsertUser = (0, utils_1.catchAsync)(async (req, res) => {
        const user = await this.userRepo.upsertUserProfile({
            supabase_id: req.user.id,
            ...req.body,
        });
        (0, apiResponse_1.sendResponse)(res, 'USER_UPDATED', { data: { user } });
    });
    checkUsername = (0, utils_1.catchAsync)(async (req, res) => {
        const { username } = req.query;
        if (!username || typeof username !== 'string') {
            throw (0, errorHandler_1.createAppError)('Invalid username', 400);
        }
        const isAvailable = await this.userRepo.findFirst({ where: { username } });
        (0, apiResponse_1.sendResponse)(res, 'USERNAME_AVAILABILITY_CHECKED', {
            data: { isAvailable: !isAvailable },
        });
    });
}
exports.default = UserController;
//# sourceMappingURL=userControllers.js.map