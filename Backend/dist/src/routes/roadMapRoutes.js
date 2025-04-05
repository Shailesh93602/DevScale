"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoadMapRoutes = void 0;
const BaseRouter_1 = require("./BaseRouter");
const roadMapControllers_1 = __importDefault(require("../controllers/roadMapControllers"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validateRequest_1 = require("../middlewares/validateRequest");
const roadmapValidation_1 = require("../validations/roadmapValidation");
class RoadMapRoutes extends BaseRouter_1.BaseRouter {
    roadMapController;
    constructor() {
        super();
        this.roadMapController = new roadMapControllers_1.default();
    }
    initializeRoutes() {
        // Categories
        this.router.get('/categories', authMiddleware_1.authMiddleware, this.bindRoute(this.roadMapController.getRoadmapCategories));
        // Public routes
        this.router.get('/', authMiddleware_1.authMiddleware, this.bindRoute(this.roadMapController.getAllRoadmaps));
        this.router.get('/:id', authMiddleware_1.authMiddleware, this.bindRoute(this.roadMapController.getRoadMap));
        this.router.get('/:id/main_concepts', authMiddleware_1.authMiddleware, this.bindRoute(this.roadMapController.getMainConceptsInRoadmap));
        // Social interaction routes
        this.router.post('/:id/like', authMiddleware_1.authMiddleware, this.bindRoute(this.roadMapController.likeRoadmap));
        this.router.post('/:id/bookmark', authMiddleware_1.authMiddleware, this.bindRoute(this.roadMapController.bookmarkRoadmap));
        // Protected routes
        this.router.post('/', authMiddleware_1.authMiddleware, 
        // authorizeRoles('admin', 'instructor'),
        (0, validateRequest_1.validateRequest)(roadmapValidation_1.createRoadmapValidation), this.bindRoute(this.roadMapController.createRoadMap));
        this.router.post('/enroll', authMiddleware_1.authMiddleware, (0, validateRequest_1.validateRequest)(roadmapValidation_1.enrollRoadmapValidation), this.bindRoute(this.roadMapController.enrollRoadMap));
        this.router.put('/:id', authMiddleware_1.authMiddleware, 
        // authorizeRoles('admin', 'instructor'),
        (0, validateRequest_1.validateRequest)(roadmapValidation_1.createRoadmapValidation), this.bindRoute(this.roadMapController.updateRoadMap));
        this.router.delete('/:id', authMiddleware_1.authMiddleware, (0, authMiddleware_1.authorizeRoles)('admin'), this.bindRoute(this.roadMapController.deleteRoadMap));
        this.router.patch('/:id/subjects-order', authMiddleware_1.authMiddleware, 
        // authorizeRoles('admin', 'instructor'),
        (0, validateRequest_1.validateRequest)(roadmapValidation_1.updateSubjectsOrderValidation), this.bindRoute(this.roadMapController.updateSubjectsOrder));
    }
    bindRoute(routeHandler) {
        return (req, res, next) => {
            return routeHandler.call(this.roadMapController, req, res, next);
        };
    }
}
exports.RoadMapRoutes = RoadMapRoutes;
exports.default = new RoadMapRoutes().getRouter();
//# sourceMappingURL=roadMapRoutes.js.map