import { BaseRouter } from './BaseRouter';
import RoadMapController from '../controllers/roadMapControllers';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
import { validateRequest, validateQuery } from '../middlewares/validateRequest';
import {
  createRoadmapValidation,
  enrollRoadmapValidation,
  updateSubjectsOrderValidation,
  addCommentValidation,
  roadmapQueryValidation,
} from '../validations/roadmapValidation';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { createRateLimiter } from '../middlewares/rateLimiter';
import { cacheResponse } from '../middlewares/cacheControl';

export class RoadMapRoutes extends BaseRouter {
  private readonly roadMapController: RoadMapController;
  private readonly roadmapLimiter: ReturnType<typeof createRateLimiter>;

  constructor() {
    super();
    this.roadMapController = new RoadMapController();
    this.roadmapLimiter = createRateLimiter({
      windowMs: 60 * 1000, // 1 minute
      max: 30, // 30 requests per minute
      message: 'Too many roadmap requests, please try again later',
    });
  }

  protected initializeRoutes(): void {
    // Categories
    this.router.get(
      '/categories',
      authMiddleware,
      this.bindRoute(this.roadMapController.getRoadmapCategories)
    );

    // Public routes
    this.router.get(
      '/',
      authMiddleware,
      validateQuery(roadmapQueryValidation),
      this.roadmapLimiter,
      (req: Request, res: Response, next: NextFunction) => {
        const cacheMiddleware = cacheResponse({ duration: 60 });
        cacheMiddleware(req, res, next).catch(next);
      },
      this.bindRoute(this.roadMapController.getAllRoadmaps)
    );

    this.router.get(
      '/:id',
      authMiddleware,
      this.bindRoute(this.roadMapController.getRoadMap)
    );

    this.router.get(
      '/:id/main_concepts',
      authMiddleware,
      this.bindRoute(this.roadMapController.getMainConceptsInRoadmap)
    );

    // Social interaction routes
    this.router.post(
      '/:id/like',
      authMiddleware,
      this.bindRoute(this.roadMapController.likeRoadmap)
    );

    this.router.post(
      '/:id/bookmark',
      authMiddleware,
      this.bindRoute(this.roadMapController.bookmarkRoadmap)
    );

    // Comment routes
    this.router.get(
      '/:id/comments',
      authMiddleware,
      this.bindRoute(this.roadMapController.getRoadmapComments)
    );

    this.router.post(
      '/:id/comments',
      authMiddleware,
      validateRequest(addCommentValidation),
      this.bindRoute(this.roadMapController.addComment)
    );

    this.router.post(
      '/:roadmapId/comments/:commentId/like',
      authMiddleware,
      this.bindRoute(this.roadMapController.toggleCommentLike)
    );

    // Protected routes
    this.router.post(
      '/',
      authMiddleware,
      // authorizeRoles('admin', 'instructor'),
      validateRequest(createRoadmapValidation),
      this.bindRoute(this.roadMapController.createRoadMap)
    );

    this.router.post(
      '/enroll',
      authMiddleware,
      validateRequest(enrollRoadmapValidation),
      this.bindRoute(this.roadMapController.enrollRoadMap)
    );

    this.router.put(
      '/:id',
      authMiddleware,
      // authorizeRoles('admin', 'instructor'),
      validateRequest(createRoadmapValidation),
      this.bindRoute(this.roadMapController.updateRoadMap)
    );

    this.router.delete(
      '/:id',
      authMiddleware,
      authorizeRoles('admin'),
      this.bindRoute(this.roadMapController.deleteRoadMap)
    );

    this.router.patch(
      '/:id/subjects-order',
      authMiddleware,
      // authorizeRoles('admin', 'instructor'),
      validateRequest(updateSubjectsOrderValidation),
      this.bindRoute(this.roadMapController.updateSubjectsOrder)
    );
  }

  private bindRoute(
    routeHandler: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<void> | void
  ): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      return routeHandler.call(this.roadMapController, req, res, next);
    };
  }
}

export default new RoadMapRoutes().getRouter();
