import express from 'express';
import {
  deleteUserRoadmap,
  getProfile,
  getUserProgress,
  getUserRoadmap,
  insertUserRoadmap,
  upsertUser,
} from '../controllers/userControllers';
import { userInsertionValidator } from '../validators/userValidators';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     description: Retrieve a list of all users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authMiddleware, getProfile);
router.put('/me', userInsertionValidator, upsertUser);
router.get('/progress', getUserProgress);
router.get('/roadmap', getUserRoadmap);
router.post('/roadmap', insertUserRoadmap);
router.delete('/roadmap/:id', deleteUserRoadmap);

export default router;
