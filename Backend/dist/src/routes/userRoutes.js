"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const userControllers_1 = __importDefault(require("../controllers/userControllers"));
const userValidations_1 = require("../validations/userValidations");
const validateRequest_1 = require("../middlewares/validateRequest");
const BaseRouter_1 = require("./BaseRouter");
const authMiddleware_1 = require("../middlewares/authMiddleware");
class UserRoutes extends BaseRouter_1.BaseRouter {
    userController;
    constructor() {
        super();
        this.userController = new userControllers_1.default();
    }
    initializeRoutes() {
        this.router.get('/me', authMiddleware_1.authMiddleware, this.userController.getProfile);
        this.router.put('/me', authMiddleware_1.authMiddleware, (0, validateRequest_1.validateRequest)(userValidations_1.userInsertionSchema), this.userController.upsertUser);
        this.router.get('/progress', authMiddleware_1.authMiddleware, this.userController.getUserProgress);
        this.router.get('/roadmap', authMiddleware_1.authMiddleware, this.userController.getUserRoadmap);
        this.router.post('/roadmap', authMiddleware_1.authMiddleware, this.userController.insertUserRoadmap);
        this.router.delete('/roadmap/:id', authMiddleware_1.authMiddleware, this.userController.deleteUserRoadmap);
        this.router.get('/check-username', authMiddleware_1.authMiddleware, this.userController.checkUsername);
    }
}
exports.UserRoutes = UserRoutes;
//# sourceMappingURL=userRoutes.js.map