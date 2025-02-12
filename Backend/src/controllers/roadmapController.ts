import { Request, Response } from 'express';
import { RoadmapService } from '../services/roadmapService';
import { createAppError } from '../middlewares/errorHandler';
import logger from '../utils/logger';

export class RoadmapController {
  static async createRoadmap(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) throw createAppError('User not found', 404);

      const roadmap = await RoadmapService.createRoadmap({
        ...req.body,
        createdBy: userId,
      });

      res.status(201).json({
        status: 'success',
        data: { roadmap },
      });
    } catch (error) {
      logger.error('Error creating roadmap:', error);
      throw createAppError('Failed to create roadmap', 400);
    }
  }

  static async updateRoadmap(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const roadmap = await RoadmapService.updateRoadmap(id, req.body);

      res.status(200).json({
        status: 'success',
        data: { roadmap },
      });
    } catch (error) {
      logger.error('Error updating roadmap:', error);
      throw createAppError('Failed to update roadmap', 400);
    }
  }

  static async getRoadmap(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const roadmap = await RoadmapService.getRoadmap(id);

      res.status(200).json({
        status: 'success',
        data: { roadmap },
      });
    } catch (error) {
      logger.error('Error fetching roadmap:', error);
      throw createAppError('Failed to fetch roadmap', 400);
    }
  }

  static async getAllRoadmaps(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const roadmaps = await RoadmapService.getAllRoadmaps(userId);

      res.status(200).json({
        status: 'success',
        data: { roadmaps },
      });
    } catch (error) {
      logger.error('Error fetching roadmaps:', error);
      throw createAppError('Failed to fetch roadmaps', 400);
    }
  }

  static async deleteRoadmap(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await RoadmapService.deleteRoadmap(id);

      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting roadmap:', error);
      throw createAppError('Failed to delete roadmap', 400);
    }
  }

  static async updateSubjectsOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { subjectOrders } = req.body;

      await RoadmapService.updateSubjectsOrder(id, subjectOrders);

      res.status(200).json({
        status: 'success',
        message: 'Subject order updated successfully',
      });
    } catch (error) {
      logger.error('Error updating subject order:', error);
      throw createAppError('Failed to update subject order', 400);
    }
  }
}
