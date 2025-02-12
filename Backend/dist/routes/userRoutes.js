"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userControllers_1 = require("../controllers/userControllers");
const userValidators_1 = require("../validators/userValidators");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
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
router.get('/', authMiddleware_1.authenticateUser, userControllers_1.getProfile);
router.put('/', userValidators_1.userInsertionValidator, userControllers_1.upsertUser);
router.get('/progress', userControllers_1.getUserProgress);
router.get('/roadmap', userControllers_1.getUserRoadmap);
router.post('/roadmap', userControllers_1.insertUserRoadmap);
router.delete('/roadmap/:id', userControllers_1.deleteUserRoadmap);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map