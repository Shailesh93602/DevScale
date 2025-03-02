"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userProgressController_1 = require("../controllers/userProgressController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validateRequest_1 = require("../middlewares/validateRequest");
const progressValidation_1 = require("../validations/progressValidation");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authMiddleware);
router.get('/', userProgressController_1.getProgress);
router.post('/update', (0, validateRequest_1.validateRequest)(progressValidation_1.updateProgressValidation), userProgressController_1.updateProgress);
exports.default = router;
//# sourceMappingURL=progressRoutes.js.map