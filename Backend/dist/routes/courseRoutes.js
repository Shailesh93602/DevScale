"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courseControllers_js_1 = require("../controllers/courseControllers.js");
const router = express_1.default.Router();
router.get('/', courseControllers_js_1.getCourses);
router.get('/:id', courseControllers_js_1.getCourse);
router.post('/enroll', courseControllers_js_1.enrollCourse);
exports.default = router;
//# sourceMappingURL=courseRoutes.js.map