"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validateRequest_1 = require("../middlewares/validateRequest");
const roadmapValidation_1 = require("../validations/roadmapValidation");
const roadMapControllers_1 = require("../controllers/roadMapControllers");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authMiddleware);
router.get('/categories', roadMapControllers_1.getRoadmapCategories);
// Public routes
router.get('/', roadMapControllers_1.getAllRoadmaps);
router.get('/:id', roadMapControllers_1.getRoadMap);
router.get('/:id/main-concepts', roadMapControllers_1.getMainConceptsInRoadmap);
// Protected routes
router.post('/', (0, authMiddleware_1.authorizeRoles)('admin', 'instructor'), (0, validateRequest_1.validateRequest)(roadmapValidation_1.createRoadmapValidation), roadMapControllers_1.createRoadMap);
router.post('/enroll', (0, validateRequest_1.validateRequest)(roadmapValidation_1.enrollRoadmapValidation), roadMapControllers_1.enrollRoadMap);
router.put('/:id', (0, authMiddleware_1.authorizeRoles)('admin', 'instructor'), (0, validateRequest_1.validateRequest)(roadmapValidation_1.createRoadmapValidation), roadMapControllers_1.updateRoadMap);
router.delete('/:id', (0, authMiddleware_1.authorizeRoles)('admin'), roadMapControllers_1.deleteRoadMap);
router.patch('/:id/subjects-order', (0, authMiddleware_1.authorizeRoles)('admin', 'instructor'), (0, validateRequest_1.validateRequest)(roadmapValidation_1.updateSubjectsOrderValidation), roadMapControllers_1.updateSubjectsOrder);
exports.default = router;
//# sourceMappingURL=roadMapRoutes.js.map