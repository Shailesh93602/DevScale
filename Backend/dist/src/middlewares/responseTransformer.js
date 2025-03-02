"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.camelCaseResponse = exports.sanitizeResponse = exports.transformResponse = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const transformResponse = (options) => {
    return (req, res, next) => {
        try {
            // Skip transform based on condition
            if (options.condition && !options.condition(req)) {
                return next();
            }
            // Store original send function
            const originalSend = res.json;
            // Override send function to transform response
            res.json = function (body) {
                const transformedBody = options.transform(body);
                return originalSend.call(this, transformedBody);
            };
            next();
        }
        catch (error) {
            logger_1.default.error('Response transform failed:', error);
            next();
        }
    };
};
exports.transformResponse = transformResponse;
// Common transformers
exports.sanitizeResponse = (0, exports.transformResponse)({
    transform: (data) => {
        const sanitize = (obj) => {
            if (!obj || typeof obj !== 'object')
                return obj;
            if (Array.isArray(obj)) {
                return obj.map(sanitize);
            }
            const sanitized = {};
            for (const [key, value] of Object.entries(obj)) {
                if (key.startsWith('_') || key === 'password')
                    continue;
                sanitized[key] = sanitize(value);
            }
            return sanitized;
        };
        return sanitize(data);
    },
});
exports.camelCaseResponse = (0, exports.transformResponse)({
    transform: (data) => {
        const toCamelCase = (str) => str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        const convert = (obj) => {
            if (!obj || typeof obj !== 'object')
                return obj;
            if (Array.isArray(obj)) {
                return obj.map(convert);
            }
            const converted = {};
            for (const [key, value] of Object.entries(obj)) {
                converted[toCamelCase(key)] = convert(value);
            }
            return converted;
        };
        return convert(data);
    },
});
//# sourceMappingURL=responseTransformer.js.map