"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roadMapControllers_js_1 = require("../controllers/roadMapControllers.js");
const router = express_1.default.Router();
router.get('/', roadMapControllers_js_1.getAllRoadmaps);
router.get('/:id', roadMapControllers_js_1.getRoadMap);
router.get('/mainConcepts/:id', roadMapControllers_js_1.getMainConceptsInRoadmap);
router.post('/create', roadMapControllers_js_1.createRoadMap);
router.put('/update/:id', roadMapControllers_js_1.updateRoadMap);
router.delete('/delete/:id', roadMapControllers_js_1.deleteRoadMap);
exports.default = router;
//# sourceMappingURL=roadMapRoutes.js.map