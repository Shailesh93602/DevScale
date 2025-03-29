"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookRoutes = void 0;
const webhookController_1 = require("../controllers/webhookController");
const BaseRouter_1 = require("./BaseRouter");
class WebhookRoutes extends BaseRouter_1.BaseRouter {
    webhookController;
    constructor() {
        super();
        this.webhookController = new webhookController_1.WebhookController();
    }
    initializeRoutes() {
        this.router.post('/user-created', this.webhookController.handleUserCreated);
    }
}
exports.WebhookRoutes = WebhookRoutes;
//# sourceMappingURL=webhookRoutes.js.map