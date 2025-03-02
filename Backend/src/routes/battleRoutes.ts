import express from 'express';
import {
  createBattle,
  getBattle,
  getBattles,
} from '../controllers/battleControllers.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { createBattleValidationSchema } from '../validations/battleValidations.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getBattles);
router.get('/:id', getBattle);
router.post(
  '/create',
  authMiddleware,
  validateRequest(createBattleValidationSchema),
  createBattle
);

export default router;
