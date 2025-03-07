import { Router } from 'express';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createRoadmapValidation,
  enrollRoadmapValidation,
  updateSubjectsOrderValidation,
} from '../validations/roadmapValidation';
import {
  getAllRoadmaps,
  getRoadMap,
  createRoadMap,
  updateRoadMap,
  deleteRoadMap,
  updateSubjectsOrder,
  enrollRoadMap,
} from '../controllers/roadMapControllers';

const router = Router();

router.use(authMiddleware);

// Public routes
router.get('/', getAllRoadmaps);
router.get('/:id', getRoadMap);

// Protected routes
router.post(
  '/',
  authorizeRoles('admin', 'instructor'),
  validateRequest(createRoadmapValidation),
  createRoadMap
);

router.post('/enroll', validateRequest(enrollRoadmapValidation), enrollRoadMap);

router.patch(
  '/:id',
  authorizeRoles('admin', 'instructor'),
  validateRequest(createRoadmapValidation),
  updateRoadMap
);

router.delete('/:id', authorizeRoles('admin'), deleteRoadMap);

router.patch(
  '/:id/subjects-order',
  authorizeRoles('admin', 'instructor'),
  validateRequest(updateSubjectsOrderValidation),
  updateSubjectsOrder
);

export default router;
