"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAlreadyLoggedIn = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const prisma_1 = __importDefault(require("../prisma"));
const isAlreadyLoggedIn = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return next();
        }
        const decodedToken = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        const { email } = decodedToken;
        if (!email) {
            return next();
        }
        const user = await prisma_1.default.user.findFirst({ where: { email } });
        if (!user) {
            return next();
        }
        req.user = user;
    }
    catch (error) {
        console.log(error);
        next();
    }
};
exports.isAlreadyLoggedIn = isAlreadyLoggedIn;
//# sourceMappingURL=isAlreadyLoggedIn.js.map