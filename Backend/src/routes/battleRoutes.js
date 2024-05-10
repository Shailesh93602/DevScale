import express from 'express';
import { createChallenge, getBattle, getBattles } from '../controllers/battleControllers.js';

const router = express.Router();

router.get('/', getBattles);
router.get('/:id', getBattle);
router.post('/challenge', createChallenge);

export default router;
