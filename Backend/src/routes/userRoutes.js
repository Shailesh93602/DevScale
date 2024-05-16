import express from 'express';
import { getProfile, insertProfile, updateProfile } from '../controllers/userControllers.js';
import { userInsertionValidator } from '../validators/userValidators.js';

const router = express.Router();

router.get('/', getProfile);
router.post('/register', userInsertionValidator, insertProfile);
router.put('/update', updateProfile);

export default router;
