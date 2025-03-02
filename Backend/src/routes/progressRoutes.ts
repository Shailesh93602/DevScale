import { Router } from 'express';
import {
  getProgress,
  updateProgress,
} from '../controllers/userProgressController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { updateProgressValidation } from '../validations/progressValidation';

const router = Router();

router.use(authMiddleware);

router.get('/', getProgress);
router.post(
  '/update',
  validateRequest(updateProgressValidation),
  updateProgress
);

export default router;
