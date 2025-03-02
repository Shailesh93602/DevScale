"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityAuditLog = exports.sqlInjectionPrevention = exports.validateInput = exports.securityHeaders = exports.csrfProtection = exports.sanitizeData = exports.parameterProtection = exports.xssProtection = void 0;
const helmet_1 = __importDefault(require("helmet"));
const xss_clean_1 = __importDefault(require("xss-clean"));
const hpp_1 = __importDefault(require("hpp"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const csurf_1 = __importDefault(require("csurf"));
const errorHandler_1 = require("../utils/errorHandler");
const logger_1 = __importDefault(require("../utils/logger"));
// XSS Protection middleware
exports.xssProtection = (0, xss_clean_1.default)();
// Parameter Pollution Protection
exports.parameterProtection = (0, hpp_1.default)({
    whitelist: ['sort', 'page', 'limit', 'fields'], // Allow these query params to be duplicated
});
// Data Sanitization
exports.sanitizeData = (0, express_mongo_sanitize_1.default)();
// CSRF Protection
exports.csrfProtection = (0, csurf_1.default)({ cookie: true });
// Custom Security Headers
exports.securityHeaders = (0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", process.env.API_URL || ''],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: 'same-site' },
    dnsPrefetchControl: true,
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: true,
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
});
// Input Validation Middleware
const validateInput = (schema) => {
    return (req, res, next) => {
        try {
            const { error } = schema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true,
            });
            if (error) {
                const errors = error.details.map((err) => err.message);
                throw (0, errorHandler_1.createAppError)('Validation failed', 400, { errors });
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validateInput = validateInput;
// SQL Injection Prevention
const sqlInjectionPrevention = (req, res, next) => {
    const sqlInjectionPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)|(['"])/gi;
    const checkForSQLInjection = (obj) => {
        for (const key in obj) {
            if (typeof obj[key] === 'string' && sqlInjectionPattern.test(obj[key])) {
                return true;
            }
            else if (typeof obj[key] === 'object') {
                return checkForSQLInjection(obj[key]);
            }
        }
        return false;
    };
    if (checkForSQLInjection(req.body) ||
        checkForSQLInjection(req.query) ||
        checkForSQLInjection(req.params)) {
        logger_1.default.warn('SQL Injection attempt detected', {
            ip: req.ip,
            path: req.path,
            body: req.body,
            query: req.query,
            params: req.params,
        });
        throw (0, errorHandler_1.createAppError)('Invalid input detected', 400);
    }
    next();
};
exports.sqlInjectionPrevention = sqlInjectionPrevention;
// Security Audit Logging
const securityAuditLog = (req, res, next) => {
    const auditData = {
        timestamp: new Date(),
        ip: req.ip,
        method: req.method,
        path: req.path,
        headers: req.headers,
        body: req.body,
        user: req.user?.id || 'anonymous',
    };
    logger_1.default.info('Security audit log', auditData);
    next();
};
exports.securityAuditLog = securityAuditLog;
//# sourceMappingURL=securityMiddleware.js.map