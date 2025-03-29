"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubjectRoutes = void 0;
const BaseRouter_1 = require("./BaseRouter");
const subjectController_1 = __importDefault(require("../controllers/subjectController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
class SubjectRoutes extends BaseRouter_1.BaseRouter {
    subjectController;
    constructor() {
        super();
        this.subjectController = new subjectController_1.default();
        this.router.use(authMiddleware_1.authMiddleware);
    }
    initializeRoutes() {
        this.router.get('/', this.subjectController.getAllSubjects);
        this.router.get('/:id/topics', this.subjectController.getTopicsInSubject);
    }
}
exports.SubjectRoutes = SubjectRoutes;
//# sourceMappingURL=subjectRoutes.js.map