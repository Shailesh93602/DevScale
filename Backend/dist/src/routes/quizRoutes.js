"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const quizController_js_1 = require("../controllers/quizController.js");
const router = express_1.default.Router();
router.post('/create', quizController_js_1.createQuiz);
router.post('/submit', quizController_js_1.submitQuiz);
exports.default = router;
//# sourceMappingURL=quizRoutes.js.map