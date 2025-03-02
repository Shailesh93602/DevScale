import { Router } from 'express';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
import {
  getPlatformAnalyticsController,
  getUserAnalyticsController,
  getCurrentUserAnalyticsController,
  generateReportController,
} from '../controllers/analyticsController';
import { query } from 'express-validator';
import { validateRequest } from '../middlewares/validateRequest';
import Joi from 'joi';

const router = Router();

router.use(authMiddleware);

// User analytics routes
router.get(
  '/user/:userId',
  authorizeRoles('admin', 'instructor'),
  getUserAnalyticsController
);

router.get('/user/me', getCurrentUserAnalyticsController);

// Platform analytics routes
router.get(
  '/platform',
  authorizeRoles('admin'),
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    validateRequest(
      Joi.object({
        startDate: Joi.date().iso(),
        endDate: Joi.date().iso().min(Joi.ref('startDate')),
      }),
      'query'
    ),
  ],
  getPlatformAnalyticsController
);

// Report generation
router.post(
  '/reports',
  authorizeRoles('admin'),
  validateRequest(
    Joi.object({
      type: Joi.string().valid('user', 'platform').required(),
      userId: Joi.string().when('type', {
        is: 'user',
        then: Joi.string().required(),
      }),
      startDate: Joi.date().iso().when('type', {
        is: 'platform',
        then: Joi.required(),
      }),
      endDate: Joi.date().iso().min(Joi.ref('startDate')),
    }),
    'body'
  ),
  generateReportController
);

export default router;
