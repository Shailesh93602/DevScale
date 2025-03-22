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
  getRoadmapCategories,
  getMainConceptsInRoadmap,
} from '../controllers/roadMapControllers';

const router = Router();

router.use(authMiddleware);

router.get('/categories', getRoadmapCategories);
// Public routes
router.get('/', getAllRoadmaps);
router.get('/:id', getRoadMap);
router.get('/:id/main-concepts', getMainConceptsInRoadmap);

// Protected routes
router.post(
  '/',
  authorizeRoles('admin', 'instructor'),
  validateRequest(createRoadmapValidation),
  createRoadMap
);

router.post('/enroll', validateRequest(enrollRoadmapValidation), enrollRoadMap);

router.put(
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
