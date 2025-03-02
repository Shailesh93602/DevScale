"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subjectController_js_1 = require("../controllers/subjectController.js");
const router = express_1.default.Router();
router.get('/', subjectController_js_1.getAllSubjects);
router.get('/:id/topics', subjectController_js_1.getTopicsInSubject);
exports.default = router;
//# sourceMappingURL=subjectRoutes.js.map