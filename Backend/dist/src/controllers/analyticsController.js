"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const apiResponse_1 = require("../utils/apiResponse");
const userRepository_1 = __importDefault(require("@/repositories/userRepository"));
const userProgressRepository_1 = __importDefault(require("@/repositories/userProgressRepository"));
const resourceRepository_1 = __importDefault(require("@/repositories/resourceRepository"));
const challengeRepository_1 = require("@/repositories/challengeRepository");
const errorHandler_1 = require("@/utils/errorHandler");
const prisma_1 = __importDefault(require("@/lib/prisma"));
class AnalyticsController {
    defaultStartDate;
    userRepo;
    userProgressRepo;
    resourceRepo;
    challengeRepo;
    constructor() {
        this.defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
        this.userRepo = new userRepository_1.default();
        this.userProgressRepo = new userProgressRepository_1.default();
        this.resourceRepo = new resourceRepository_1.default();
        this.challengeRepo = new challengeRepository_1.ChallengeRepository();
    }
    getUserAnalytics = (0, utils_1.catchAsync)(async (req, res) => {
        const { userId } = req.params;
        const analytics = await this.userProgressRepo.getUserAnalytics(userId);
        (0, apiResponse_1.sendResponse)(res, 'USER_ANALYTICS_FETCHED', { data: analytics });
    });
    getCurrentUserAnalytics = (0, utils_1.catchAsync)(async (req, res) => {
        const userId = req.user.id;
        const analytics = await this.userProgressRepo.getUserAnalytics(userId);
        (0, apiResponse_1.sendResponse)(res, 'USER_ANALYTICS_FETCHED', { data: analytics });
    });
    getPlatformAnalytics = (0, utils_1.catchAsync)(async (req, res) => {
        const startDate = req.query.startDate
            ? new Date(req.query.startDate)
            : this.defaultStartDate;
        const endDate = req.query.endDate
            ? new Date(req.query.endDate)
            : new Date();
        const [userGrowth, contentEngagement, challengeCompletion, resourceUsage,] = await Promise.all([
            this.userRepo.groupBy({
                by: ['created_at'],
                where: {
                    created_at: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                _count: true,
                orderBy: {
                    created_at: 'asc',
                },
            }),
            this.resourceRepo.groupBy({
                by: ['type'],
                where: {
                    created_at: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                _count: true,
                _avg: {
                    rating: true,
                },
                orderBy: {
                    type: 'asc',
                },
            }),
            this.challengeRepo.groupBy({
                by: ['status'],
                where: {
                    created_at: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                _count: true,
                orderBy: {
                    status: 'asc',
                },
            }),
            this.resourceRepo.groupBy({
                by: ['type'],
                where: {
                    created_at: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                _count: true,
                orderBy: {
                    type: 'asc',
                },
            }),
        ]);
        (0, apiResponse_1.sendResponse)(res, 'PLATFORM_ANALYTICS_FETCHED', {
            data: {
                userGrowth,
                contentEngagement,
                challengeCompletion,
                resourceUsage,
            },
        });
    });
    generateReport = (0, utils_1.catchAsync)(async (req, res) => {
        const { reportType } = req.params;
        const filters = {
            startDate: req.query.startDate
                ? new Date(req.query.startDate)
                : this.defaultStartDate,
            endDate: req.query.endDate
                ? new Date(req.query.endDate)
                : new Date(),
            userId: req.query.userId,
            type: req.query.type,
            status: req.query.status?.toUpperCase(),
        };
        let reportData;
        switch (reportType) {
            case 'user_activity':
                // TODO: update this method if required in future
                reportData = await prisma_1.default.userActivityLog.findMany({
                    where: {
                        timestamp: {
                            gte: filters.startDate,
                            lte: filters.endDate,
                        },
                        user_id: filters.userId,
                    },
                    include: {
                        user: {
                            select: {
                                username: true,
                                email: true,
                            },
                        },
                    },
                });
                break;
            case 'resource_usage':
                reportData = await this.resourceRepo.findMany({
                    where: {
                        created_at: {
                            gte: filters.startDate,
                            lte: filters.endDate,
                        },
                        type: filters.type,
                        user_id: filters.userId,
                    },
                    include: {
                        user: {
                            select: {
                                username: true,
                                email: true,
                            },
                        },
                    },
                });
                break;
            case 'challenge_submissions':
                reportData = await this.challengeRepo.findMany({
                    where: {
                        created_at: {
                            gte: filters.startDate,
                            lte: filters.endDate,
                        },
                        status: filters.status,
                    },
                });
                break;
            default:
                throw (0, errorHandler_1.createAppError)('Invalid report type', 400);
        }
        (0, apiResponse_1.sendResponse)(res, 'REPORT_GENERATED', { data: reportData });
    });
}
exports.default = AnalyticsController;
//# sourceMappingURL=analyticsController.js.map