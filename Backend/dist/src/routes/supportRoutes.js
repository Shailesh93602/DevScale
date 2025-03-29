"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportRoutes = void 0;
const supportController_1 = __importDefault(require("../controllers/supportController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
// import { requirePermission } from '../middlewares/rbacMiddleware';
const BaseRouter_1 = require("./BaseRouter");
class SupportRoutes extends BaseRouter_1.BaseRouter {
    supportController;
    constructor() {
        super();
        this.supportController = new supportController_1.default();
    }
    initializeRoutes() {
        // Support Ticket Routes
        this.router.post('/tickets', authMiddleware_1.authMiddleware, this.supportController.createTicket);
        this.router.patch('/tickets/:ticketId/status', authMiddleware_1.authMiddleware, 
        // requirePermission('tickets', 'update'),
        this.supportController.updateTicketStatus);
        this.router.post('/tickets/:ticketId/responses', authMiddleware_1.authMiddleware, this.supportController.addTicketResponse);
        // Bug Report Routes
        this.router.post('/bug-reports', authMiddleware_1.authMiddleware, this.supportController.createBugReport);
        // Feature Request Routes
        this.router.post('/feature-requests', authMiddleware_1.authMiddleware, this.supportController.createFeatureRequest);
        this.router.post('/feature-requests/:requestId/vote', authMiddleware_1.authMiddleware, this.supportController.voteFeatureRequest);
        // Help Center Routes
        this.router.post('/help-articles', authMiddleware_1.authMiddleware, 
        // requirePermission('help', 'create'),
        this.supportController.createHelpArticle);
        this.router.get('/help-articles/search', this.supportController.searchHelpArticles);
    }
}
exports.SupportRoutes = SupportRoutes;
exports.default = new SupportRoutes().getRouter();
//# sourceMappingURL=supportRoutes.js.map