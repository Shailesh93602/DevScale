import { BaseRouter } from './BaseRouter';
import RoadMapController from '../controllers/roadMapControllers';
import {
  authMiddleware,
  authorizeRoles,
  optionalAuthMiddleware,
} from '../middlewares/authMiddleware';
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
      keyPrefix: 'rate-limit-roadmap',
    });
  }

  protected initializeRoutes(): void {
    // Categories
    this.router.get(
      '/categories',
      authMiddleware,
      this.bindRoute(this.roadMapController.getRoadmapCategories)
    );

    // Public routes — no auth required for listing
    this.router.get(
      '/',
      validateQuery(roadmapQueryValidation),
      this.roadmapLimiter,
      (req: Request, res: Response, next: NextFunction) => {
        const cacheMiddleware = cacheResponse({ duration: 60 });
        cacheMiddleware(req, res, next).catch(next);
      },
      this.bindRoute(this.roadMapController.getAllRoadmaps)
    );

    // Roadmap detail is readable signed out (owner's decision, 2026-09-03).
    // optionalAuthMiddleware rather than none: the controller passes
    // req.user?.id through so a signed-in reader still gets isLiked /
    // isBookmarked / progress, and the cache key below already had an 'anon'
    // branch that was unreachable while authMiddleware sat in front of it.
    this.router.get(
      '/:id',
      optionalAuthMiddleware,
      (req: Request, res: Response, next: NextFunction) => {
        const cacheMiddleware = cacheResponse({
          duration: 120,
          key: (r) => `roadmap:detail:${r.params.id}:${r.user?.id || 'anon'}`,
        });
        cacheMiddleware(req, res, next).catch(next);
      },
      this.bindRoute(this.roadMapController.getRoadMap)
    );

    this.router.get(
      '/:id/main-concepts',
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

    // Comment routes. Reading is public alongside the roadmap itself; the
    // controller only consults `req.user?.id` inside an `if (userId)` to mark
    // the caller's own likes, so an anonymous request gets isLiked=false
    // everywhere rather than a leak. Writing stays authenticated.
    this.router.get(
      '/:id/comments',
      optionalAuthMiddleware,
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
      // Was commented out. authMiddleware runs at the router level, so these
      // were authenticated but not authorised — any signed-in student could
      // create, edit or reorder a career roadmap. ADMIN/MODERATOR because
      // INSTRUCTOR has never existed; the seeded roles are ADMIN, MODERATOR
      // and STUDENT, so 'instructor' gated nothing and implied a role model
      // the app does not have.
      authorizeRoles('ADMIN', 'MODERATOR'),
      validateRequest(createRoadmapValidation),
      this.bindRoute(this.roadMapController.createRoadmap)
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
      authorizeRoles('ADMIN', 'MODERATOR'),
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
      authorizeRoles('ADMIN', 'MODERATOR'),
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
