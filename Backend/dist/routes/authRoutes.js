"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
router.post('/sync-user', authMiddleware_1.validateSupabaseJWT, authController_1.syncUser);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map