import { Router } from 'express';
import { RoadmapController } from '../controllers/roadmapController';
import {
  authenticateUser,
  authorizeRoles,
} from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createRoadmapValidation,
  updateSubjectsOrderValidation,
} from '../validations/roadmapValidation';

const router = Router();

router.use(authenticateUser);

// Public routes
router.get('/', RoadmapController.getAllRoadmaps);
router.get('/:id', RoadmapController.getRoadmap);

// Protected routes
router.post(
  '/',
  authorizeRoles('admin', 'instructor'),
  validateRequest(createRoadmapValidation),
  RoadmapController.createRoadmap
);

router.patch(
  '/:id',
  authorizeRoles('admin', 'instructor'),
  validateRequest(createRoadmapValidation),
  RoadmapController.updateRoadmap
);

router.delete('/:id', authorizeRoles('admin'), RoadmapController.deleteRoadmap);

router.patch(
  '/:id/subjects-order',
  authorizeRoles('admin', 'instructor'),
  validateRequest(updateSubjectsOrderValidation),
  RoadmapController.updateSubjectsOrder
);

export default router;
