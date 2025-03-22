import { Router } from 'express';
import {
  getChallenges,
  getChallengeLeaderboard,
  getChallenge,
  createNewChallenge,
  submitChallengeAttempt,
  updateExistingChallenge,
} from '../controllers/challengeController';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createChallengeValidation,
  submitChallengeValidation,
} from '../validations/challengeValidation';

const router = Router();

router.use(authMiddleware);

// Public routes
router.get('/', getChallenges);
router.get('/leaderboard', getChallengeLeaderboard);
router.get('/:id', getChallenge);

// Protected routes
router.post(
  '/',
  authorizeRoles('admin', 'instructor'),
  validateRequest(createChallengeValidation),
  createNewChallenge
);

router.patch(
  '/:id',
  authorizeRoles('admin', 'instructor'),
  validateRequest(createChallengeValidation),
  updateExistingChallenge
);

router.post(
  '/:challengeId/submit',
  validateRequest(submitChallengeValidation),
  submitChallengeAttempt
);

export default router;
