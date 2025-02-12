"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swaggerMiddleware_1 = require("./middlewares/swaggerMiddleware");
const versionMiddleware_1 = require("./middlewares/versionMiddleware");
const securityMiddleware_1 = require("./middlewares/securityMiddleware");
const app = (0, express_1.default)();
// API versioning
app.use(versionMiddleware_1.checkApiVersion);
// Swagger documentation
if (process.env.NODE_ENV !== 'production') {
    app.use('/api-docs', swaggerMiddleware_1.serveSwaggerDocs, swaggerMiddleware_1.setupSwaggerDocs);
    app.get('/api-docs.json', swaggerMiddleware_1.serveSwaggerJson);
}
// Security Middleware
app.use(securityMiddleware_1.securityHeaders);
app.use(securityMiddleware_1.xssProtection);
app.use(securityMiddleware_1.parameterProtection);
app.use(securityMiddleware_1.sanitizeData);
app.use(securityMiddleware_1.sqlInjectionPrevention);
app.use(securityMiddleware_1.securityAuditLog);
// CSRF protection for non-GET requests
app.use(securityMiddleware_1.csrfProtection);
// ... rest of your app configuration
//# sourceMappingURL=app.js.map