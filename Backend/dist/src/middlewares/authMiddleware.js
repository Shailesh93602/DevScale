"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authMiddleware = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const errorHandler_1 = require("../utils/errorHandler");
const logger_1 = __importDefault(require("../utils/logger"));
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('🚀 ------------------🚀');
    console.log('🚀 ~ token:', token);
    console.log('🚀 ------------------🚀');
    if (!token) {
        return next((0, errorHandler_1.createAppError)('Authorization token required', 401));
    }
    try {
        const { data: { user }, error, } = await supabase.auth.getUser(token);
        console.log('🚀 ----------------🚀');
        console.log('🚀 ~ user:', user);
        console.log('🚀 ----------------🚀');
        if (error || !user) {
            return next((0, errorHandler_1.createAppError)('Invalid authentication token', 401));
        }
        req.user = user;
        next();
    }
    catch (error) {
        logger_1.default.error('Authentication failed', error);
        next((0, errorHandler_1.createAppError)('Authentication failed', 401));
    }
};
exports.authMiddleware = authMiddleware;
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next((0, errorHandler_1.createAppError)('Unauthorized', 401));
        }
        const userRole = req.user.user_metadata?.role || 'user';
        if (!allowedRoles.includes(userRole)) {
            return next((0, errorHandler_1.createAppError)('Insufficient permissions', 403));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
//# sourceMappingURL=authMiddleware.js.map