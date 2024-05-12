import express from 'express';
import { getProfile, insertProfile, updateProfile } from '../controllers/userControllers.js';

const router = express.Router();

router.get('/', getProfile);
router.post('/register', insertProfile);
router.put('/update', updateProfile);

export default router;
