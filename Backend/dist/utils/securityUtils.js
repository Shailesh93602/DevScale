"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.performSecurityAudit = exports.validatePassword = exports.sanitizeHtml = exports.generateSecureToken = exports.comparePasswords = exports.hashPassword = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const logger_1 = __importDefault(require("./logger"));
const errorHandler_1 = require("./errorHandler");
const hashPassword = async (password) => {
    return bcrypt_1.default.hash(password, 12);
};
exports.hashPassword = hashPassword;
const comparePasswords = async (candidatePassword, hashedPassword) => {
    return bcrypt_1.default.compare(candidatePassword, hashedPassword);
};
exports.comparePasswords = comparePasswords;
const generateSecureToken = (length = 32) => {
    return crypto_1.default.randomBytes(length).toString('hex');
};
exports.generateSecureToken = generateSecureToken;
const sanitizeHtml = (input) => {
    const entities = new Map([
        ['&', '&amp;'],
        ['<', '&lt;'],
        ['>', '&gt;'],
        ['"', '&quot;'],
        ["'", '&#39;'],
    ]);
    return input.replace(/[&<>"']/g, (char) => entities.get(char) || char).trim();
};
exports.sanitizeHtml = sanitizeHtml;
const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return (password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumbers &&
        hasSpecialChar);
};
exports.validatePassword = validatePassword;
const performSecurityAudit = async () => {
    try {
        if (process.env.NODE_ENV === 'test')
            return;
        const securityConfig = {
            helmet: process.env.USE_HELMET === 'true',
            csrf: process.env.CSRF_PROTECTION === 'true',
            rateLimit: process.env.RATE_LIMIT === 'true',
            secureHeaders: process.env.SECURE_HEADERS === 'true',
            xssProtection: process.env.XSS_PROTECTION === 'true',
        };
        const missingProtections = Object.entries(securityConfig)
            .filter(([, enabled]) => !enabled)
            .map(([protection]) => protection);
        if (missingProtections.length > 0) {
            logger_1.default.warn('Security protections missing:', missingProtections);
        }
    }
    catch (error) {
        logger_1.default.error('Security audit failed:', error);
        throw (0, errorHandler_1.createAppError)('Security audit failed', 500, { auditError: true });
    }
};
exports.performSecurityAudit = performSecurityAudit;
//# sourceMappingURL=securityUtils.js.map