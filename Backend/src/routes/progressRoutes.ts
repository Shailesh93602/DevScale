import { Router } from 'express';
import {
  getProgress,
  updateProgress,
} from '../controllers/userProgressController';
import { authenticateUser } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { updateProgressValidation } from '../validations/progressValidation';

const router = Router();

router.use(authenticateUser);

router.get('/', getProgress);
router.post(
  '/update',
  validateRequest(updateProgressValidation),
  updateProgress
);

export default router;
