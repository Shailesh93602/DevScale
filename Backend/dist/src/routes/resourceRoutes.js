"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceRoutes = void 0;
const BaseRouter_1 = require("./BaseRouter");
const resourceController_1 = __importDefault(require("../controllers/resourceController"));
const paginationMiddleware_1 = __importDefault(require("../middlewares/paginationMiddleware"));
const authMiddleware_1 = require("@/middlewares/authMiddleware");
class ResourceRoutes extends BaseRouter_1.BaseRouter {
    resourceController;
    constructor() {
        super();
        this.resourceController = new resourceController_1.default();
        this.router.use(authMiddleware_1.authMiddleware);
    }
    initializeRoutes() {
        this.router.get('/', paginationMiddleware_1.default, this.resourceController.getResources);
        this.router.get('/:id', this.resourceController.getResource);
        this.router.post('/create-subject', this.resourceController.createSubjects);
        this.router.post('/delete-subjects', this.resourceController.deleteSubjects);
        this.router.get('/details/:id', this.resourceController.getResourceDetails);
        this.router.post('/create', this.resourceController.createResource);
        this.router.post('/save/:id', this.resourceController.saveResource);
    }
}
exports.ResourceRoutes = ResourceRoutes;
//# sourceMappingURL=resourceRoutes.js.map