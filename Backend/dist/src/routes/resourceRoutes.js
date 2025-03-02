"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const resourceController_js_1 = require("../controllers/resourceController.js");
const paginationMiddleware_js_1 = __importDefault(require("../middlewares/paginationMiddleware.js"));
const router = express_1.default.Router();
router.get('/', paginationMiddleware_js_1.default, resourceController_js_1.getResources);
router.get('/:id', resourceController_js_1.getResource);
router.post('/create-subject', resourceController_js_1.createSubjects);
router.post('/delete-subjects', resourceController_js_1.deleteSubjects);
router.get('/details/:id', resourceController_js_1.getResourceDetails);
router.post('/create', resourceController_js_1.createResource);
router.post('/save/:id', resourceController_js_1.saveResource);
exports.default = router;
//# sourceMappingURL=resourceRoutes.js.map