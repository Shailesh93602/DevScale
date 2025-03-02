import express from 'express';
import {
  deleteUserRoadmap,
  getProfile,
  getUserProgress,
  getUserRoadmap,
  insertUserRoadmap,
  upsertUser,
  checkUsername,
} from '../controllers/userControllers';
import { userInsertionSchema } from '../validations/userValidations';
import { validateRequest } from '../middlewares/validateRequest';

const router = express.Router();

router.get('/me', getProfile);
router.put('/me', validateRequest(userInsertionSchema), upsertUser);
router.get('/progress', getUserProgress);
router.get('/roadmap', getUserRoadmap);
router.post('/roadmap', insertUserRoadmap);
router.delete('/roadmap/:id', deleteUserRoadmap);
router.get('/check-username', checkUsername);

export default router;
