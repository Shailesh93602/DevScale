"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supportController_1 = require("../controllers/supportController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const rbacMiddleware_1 = require("../middlewares/rbacMiddleware");
const router = (0, express_1.Router)();
// Support Ticket Routes
router.post('/tickets', authMiddleware_1.authenticateUser, supportController_1.createTicket);
router.patch('/tickets/:ticketId/status', authMiddleware_1.authenticateUser, (0, rbacMiddleware_1.requirePermission)('tickets', 'update'), supportController_1.updateTicketStatus);
router.post('/tickets/:ticketId/responses', authMiddleware_1.authenticateUser, supportController_1.addTicketResponse);
// Bug Report Routes
router.post('/bug-reports', authMiddleware_1.authenticateUser, supportController_1.createBugReport);
// Feature Request Routes
router.post('/feature-requests', authMiddleware_1.authenticateUser, supportController_1.createFeatureRequest);
router.post('/feature-requests/:requestId/vote', authMiddleware_1.authenticateUser, supportController_1.voteFeatureRequest);
// Help Center Routes
router.post('/help-articles', authMiddleware_1.authenticateUser, (0, rbacMiddleware_1.requirePermission)('help', 'create'), supportController_1.createHelpArticle);
router.get('/help-articles/search', supportController_1.searchHelpArticles);
exports.default = router;
//# sourceMappingURL=supportRoutes.js.map