"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userControllers_js_1 = require("../controllers/userControllers.js");
const userValidators_js_1 = require("../validators/userValidators.js");
const uploadMiddleware_js_1 = __importDefault(require("../middlewares/uploadMiddleware.js"));
const router = express_1.default.Router();
router.get('/', userControllers_js_1.getProfile);
router.post('/register', userValidators_js_1.userInsertionValidator, userControllers_js_1.insertProfile);
router.put('/update', uploadMiddleware_js_1.default, userControllers_js_1.updateProfile);
router.get('/progress', userControllers_js_1.getUserProgress);
router.get('/roadmap', userControllers_js_1.getUserRoadmap);
router.post('/roadmap', userControllers_js_1.insertUserRoadmap);
router.delete('/roadmap/:id', userControllers_js_1.deleteUserRoadmap);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map