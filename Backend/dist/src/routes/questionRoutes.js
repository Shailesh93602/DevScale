"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const questionControllers_js_1 = require("../controllers/questionControllers.js");
const router = express_1.default.Router();
router.get('/', questionControllers_js_1.getQuestions);
router.post('/submit', questionControllers_js_1.submitQuestions);
exports.default = router;
//# sourceMappingURL=questionRoutes.js.map