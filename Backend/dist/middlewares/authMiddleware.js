"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const prisma_1 = __importDefault(require("../prisma"));
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'No token provided' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const { email } = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        const user = await prisma_1.default.user.findFirst({ where: { email } });
        if (!user) {
            res.status(403).json({ success: false, message: 'User not found' });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Token verification error:', error);
        res
            .status(401)
            .json({ success: false, message: 'Invalid or expired token' });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=authMiddleware.js.map