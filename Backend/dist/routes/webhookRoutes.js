"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webhookController_1 = require("../controllers/webhookController");
const router = (0, express_1.Router)();
router.post('/user-created', webhookController_1.WebhookController.handleUserCreated);
exports.default = router;
//# sourceMappingURL=webhookRoutes.js.map