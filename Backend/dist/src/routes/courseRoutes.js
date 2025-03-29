"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseRoutes = void 0;
const BaseRouter_1 = require("./BaseRouter");
const courseControllers_1 = __importDefault(require("../controllers/courseControllers"));
class CourseRoutes extends BaseRouter_1.BaseRouter {
    courseController;
    constructor() {
        super();
        this.courseController = new courseControllers_1.default();
    }
    initializeRoutes() {
        this.router.get('/', this.courseController.getCourses);
        this.router.get('/:id', this.courseController.getCourse);
        this.router.post('/enroll', this.courseController.enrollCourse);
    }
}
exports.CourseRoutes = CourseRoutes;
exports.default = new CourseRoutes().getRouter();
//# sourceMappingURL=courseRoutes.js.map