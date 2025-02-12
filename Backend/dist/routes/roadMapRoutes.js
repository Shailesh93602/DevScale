"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roadmapController_1 = require("../controllers/roadmapController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validateRequest_1 = require("../middlewares/validateRequest");
const roadmapValidation_1 = require("../validations/roadmapValidation");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateUser);
// Public routes
router.get('/', roadmapController_1.RoadmapController.getAllRoadmaps);
router.get('/:id', roadmapController_1.RoadmapController.getRoadmap);
// Protected routes
router.post('/', (0, authMiddleware_1.authorizeRoles)('admin', 'instructor'), (0, validateRequest_1.validateRequest)(roadmapValidation_1.createRoadmapValidation), roadmapController_1.RoadmapController.createRoadmap);
router.patch('/:id', (0, authMiddleware_1.authorizeRoles)('admin', 'instructor'), (0, validateRequest_1.validateRequest)(roadmapValidation_1.createRoadmapValidation), roadmapController_1.RoadmapController.updateRoadmap);
router.delete('/:id', (0, authMiddleware_1.authorizeRoles)('admin'), roadmapController_1.RoadmapController.deleteRoadmap);
router.patch('/:id/subjects-order', (0, authMiddleware_1.authorizeRoles)('admin', 'instructor'), (0, validateRequest_1.validateRequest)(roadmapValidation_1.updateSubjectsOrderValidation), roadmapController_1.RoadmapController.updateSubjectsOrder);
exports.default = router;
//# sourceMappingURL=roadMapRoutes.js.map