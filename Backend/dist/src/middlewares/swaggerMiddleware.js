"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serveSwaggerJson = exports.setupSwaggerDocs = exports.serveSwaggerDocs = void 0;
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("../config/swagger");
exports.serveSwaggerDocs = swagger_ui_express_1.default.serve;
exports.setupSwaggerDocs = swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'MR Engineers API Documentation',
});
const serveSwaggerJson = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swagger_1.swaggerSpec);
};
exports.serveSwaggerJson = serveSwaggerJson;
//# sourceMappingURL=swaggerMiddleware.js.map