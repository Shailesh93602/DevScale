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
class UserRoutes extends BaseRouter_1.BaseRouter {
    userController;
    constructor() {
        super();
        this.userController = new userControllers_1.default();
    }
    initializeRoutes() {
        this.router.get('/me', this.userController.getProfile);
        this.router.put('/me', (0, validateRequest_1.validateRequest)(userValidations_1.userInsertionSchema), this.userController.upsertUser);
        this.router.get('/progress', this.userController.getUserProgress);
        this.router.get('/roadmap', this.userController.getUserRoadmap);
        this.router.post('/roadmap', this.userController.insertUserRoadmap);
        this.router.delete('/roadmap/:id', this.userController.deleteUserRoadmap);
        this.router.get('/check-username', this.userController.checkUsername);
    }
}
exports.UserRoutes = UserRoutes;
//# sourceMappingURL=userRoutes.js.map