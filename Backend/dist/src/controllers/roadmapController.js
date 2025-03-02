"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoadmapController = void 0;
const roadmapService_1 = require("../services/roadmapService");
const errorHandler_1 = require("../middlewares/errorHandler");
const logger_1 = __importDefault(require("../utils/logger"));
class RoadmapController {
    static async createRoadmap(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw (0, errorHandler_1.createAppError)('User not found', 404);
            const roadmap = await roadmapService_1.RoadmapService.createRoadmap({
                ...req.body,
                createdBy: userId,
            });
            res.status(201).json({
                status: 'success',
                data: { roadmap },
            });
        }
        catch (error) {
            logger_1.default.error('Error creating roadmap:', error);
            throw (0, errorHandler_1.createAppError)('Failed to create roadmap', 400);
        }
    }
    static async updateRoadmap(req, res) {
        try {
            const { id } = req.params;
            const roadmap = await roadmapService_1.RoadmapService.updateRoadmap(id, req.body);
            res.status(200).json({
                status: 'success',
                data: { roadmap },
            });
        }
        catch (error) {
            logger_1.default.error('Error updating roadmap:', error);
            throw (0, errorHandler_1.createAppError)('Failed to update roadmap', 400);
        }
    }
    static async getRoadmap(req, res) {
        try {
            const { id } = req.params;
            const roadmap = await roadmapService_1.RoadmapService.getRoadmap(id);
            res.status(200).json({
                status: 'success',
                data: { roadmap },
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching roadmap:', error);
            throw (0, errorHandler_1.createAppError)('Failed to fetch roadmap', 400);
        }
    }
    static async getAllRoadmaps(req, res) {
        try {
            const userId = req.user?.id;
            const roadmaps = await roadmapService_1.RoadmapService.getAllRoadmaps(userId);
            res.status(200).json({
                status: 'success',
                data: { roadmaps },
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching roadmaps:', error);
            throw (0, errorHandler_1.createAppError)('Failed to fetch roadmaps', 400);
        }
    }
    static async deleteRoadmap(req, res) {
        try {
            const { id } = req.params;
            await roadmapService_1.RoadmapService.deleteRoadmap(id);
            res.status(204).send();
        }
        catch (error) {
            logger_1.default.error('Error deleting roadmap:', error);
            throw (0, errorHandler_1.createAppError)('Failed to delete roadmap', 400);
        }
    }
    static async updateSubjectsOrder(req, res) {
        try {
            const { id } = req.params;
            const { subjectOrders } = req.body;
            await roadmapService_1.RoadmapService.updateSubjectsOrder(id, subjectOrders);
            res.status(200).json({
                status: 'success',
                message: 'Subject order updated successfully',
            });
        }
        catch (error) {
            logger_1.default.error('Error updating subject order:', error);
            throw (0, errorHandler_1.createAppError)('Failed to update subject order', 400);
        }
    }
}
exports.RoadmapController = RoadmapController;
//# sourceMappingURL=roadmapController.js.map