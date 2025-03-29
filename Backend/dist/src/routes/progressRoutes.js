"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressRoutes = void 0;
const BaseRouter_1 = require("./BaseRouter");
const userProgressController_1 = __importDefault(require("../controllers/userProgressController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validateRequest_1 = require("../middlewares/validateRequest");
const progressValidation_1 = require("../validations/progressValidation");
class ProgressRoutes extends BaseRouter_1.BaseRouter {
    progressController;
    constructor() {
        super();
        this.progressController = new userProgressController_1.default();
        this.router.use(authMiddleware_1.authMiddleware);
    }
    initializeRoutes() {
        this.router.get('/', this.progressController.getProgress);
        this.router.post('/update', (0, validateRequest_1.validateRequest)(progressValidation_1.updateProgressValidation), this.progressController.updateProgress);
    }
}
exports.ProgressRoutes = ProgressRoutes;
exports.default = new ProgressRoutes().getRouter();
//# sourceMappingURL=progressRoutes.js.map