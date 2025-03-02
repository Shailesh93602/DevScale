"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const challengeController_1 = require("../controllers/challengeController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validateRequest_1 = require("../middlewares/validateRequest");
const challengeValidation_1 = require("../validations/challengeValidation");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authMiddleware);
// Public routes
router.get('/', challengeController_1.ChallengeController.getAllChallenges);
router.get('/leaderboard', challengeController_1.ChallengeController.getLeaderboard);
router.get('/:id', challengeController_1.ChallengeController.getChallenge);
// Protected routes
router.post('/', (0, authMiddleware_1.authorizeRoles)('admin', 'instructor'), (0, validateRequest_1.validateRequest)(challengeValidation_1.createChallengeValidation), challengeController_1.ChallengeController.createChallenge);
router.patch('/:id', (0, authMiddleware_1.authorizeRoles)('admin', 'instructor'), (0, validateRequest_1.validateRequest)(challengeValidation_1.createChallengeValidation), challengeController_1.ChallengeController.updateChallenge);
router.post('/:challengeId/submit', (0, validateRequest_1.validateRequest)(challengeValidation_1.submitChallengeValidation), challengeController_1.ChallengeController.submitChallenge);
exports.default = router;
//# sourceMappingURL=challengeRoutes.js.map