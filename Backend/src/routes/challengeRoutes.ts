import { Router } from 'express';
import { ChallengeController } from '../controllers/challengeController';
import {
  authenticateUser,
  authorizeRoles,
} from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createChallengeValidation,
  submitChallengeValidation,
} from '../validations/challengeValidation';

const router = Router();

router.use(authenticateUser);

// Public routes
router.get('/', ChallengeController.getAllChallenges);
router.get('/leaderboard', ChallengeController.getLeaderboard);
router.get('/:id', ChallengeController.getChallenge);

// Protected routes
router.post(
  '/',
  authorizeRoles('admin', 'instructor'),
  validateRequest(createChallengeValidation),
  ChallengeController.createChallenge
);

router.patch(
  '/:id',
  authorizeRoles('admin', 'instructor'),
  validateRequest(createChallengeValidation),
  ChallengeController.updateChallenge
);

router.post(
  '/:challengeId/submit',
  validateRequest(submitChallengeValidation),
  ChallengeController.submitChallenge
);

export default router;
