"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userControllers_1 = require("../controllers/userControllers");
const userValidations_1 = require("../validations/userValidations");
const validateRequest_1 = require("../middlewares/validateRequest");
const router = express_1.default.Router();
router.get('/me', userControllers_1.getProfile);
router.put('/me', (0, validateRequest_1.validateRequest)(userValidations_1.userInsertionSchema), userControllers_1.upsertUser);
router.get('/progress', userControllers_1.getUserProgress);
router.get('/roadmap', userControllers_1.getUserRoadmap);
router.post('/roadmap', userControllers_1.insertUserRoadmap);
router.delete('/roadmap/:id', userControllers_1.deleteUserRoadmap);
router.get('/check-username', userControllers_1.checkUsername);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map