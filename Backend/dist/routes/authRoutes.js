"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const profileController_js_1 = require("../controllers/profileController.js");
const authMiddleware_js_1 = require("../middlewares/authMiddleware.js");
const authController_js_1 = require("../controllers/authController.js");
const router = express_1.default.Router();
router.post('/register', authController_js_1.register);
router.post('/login', authController_js_1.login);
router.post('/logout', authMiddleware_js_1.authMiddleware, authController_js_1.logout);
router.post('/profile', authMiddleware_js_1.authMiddleware, profileController_js_1.insertProfile);
router.get('/profile', authMiddleware_js_1.authMiddleware, profileController_js_1.getProfile);
router.put('/profile', authMiddleware_js_1.authMiddleware, profileController_js_1.updateProfile);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map