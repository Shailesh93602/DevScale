"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mainConceptController_js_1 = require("../controllers/mainConceptController.js");
const router = express_1.default.Router();
router.get('/:id/subjects', mainConceptController_js_1.getSubjectsInMainConcept);
exports.default = router;
//# sourceMappingURL=mainConceptRoutes.js.map