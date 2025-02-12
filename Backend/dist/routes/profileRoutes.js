"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const profileController_1 = require("../controllers/profileController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validateRequest_1 = require("../middlewares/validateRequest");
const profileValidation_1 = require("../validations/profileValidation");
const upload = (0, multer_1.default)({ dest: 'uploads/' });
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateUser);
router.get('/', profileController_1.ProfileController.getProfile);
router.patch('/', upload.single('avatar'), (0, validateRequest_1.validate)(profileValidation_1.updateProfileValidation), profileController_1.ProfileController.updateProfile);
exports.default = router;
//# sourceMappingURL=profileRoutes.js.map