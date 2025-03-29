"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthCheckRoutes = void 0;
const BaseRouter_1 = require("./BaseRouter");
const config_1 = require("../config");
class HealthCheckRoutes extends BaseRouter_1.BaseRouter {
    initializeRoutes() {
        this.router.get('/', (req, res) => {
            res.json({
                status: 'ok',
                environment: config_1.NODE_ENV,
                timestamp: new Date().toISOString(),
            });
        });
    }
}
exports.HealthCheckRoutes = HealthCheckRoutes;
exports.default = new HealthCheckRoutes().getRouter();
//# sourceMappingURL=healthCheck.js.map