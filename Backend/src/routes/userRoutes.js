import express from 'express';
import { getProfile, insertProfile, updateProfile } from '../controllers/userControllers.js';

const router = express.Router();

router.get('/profile', getProfile);
router.post('/profile', insertProfile);
router.put('/profile', updateProfile);

export default router;
