"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyPassportStrategy = void 0;
const passport_jwt_1 = require("passport-jwt");
const dotenv_1 = require("dotenv");
const passport_1 = __importDefault(require("passport"));
const config_1 = require("../config");
const prisma_1 = __importDefault(require("../prisma"));
(0, dotenv_1.config)();
const cookieExtractor = function (req) {
    let token = null;
    if (req?.cookies) {
        token = req.cookies.token;
    }
    if (!token) {
        token = req.headers.authorization?.split(' ')[1];
    }
    if (!token) {
        token = req.headers.authorization;
    }
    return token;
};
const applyPassportStrategy = () => {
    const options = {
        secretOrKey: '',
        jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    };
    options.secretOrKey = config_1.JWT_SECRET;
    let jwt = null;
    try {
        jwt = passport_jwt_1.ExtractJwt.fromExtractors([cookieExtractor]);
    }
    catch (error) {
        console.error('Error creating JWT strategy:', error);
        return null;
    }
    options.jwtFromRequest = jwt;
    passport_1.default.use(new passport_jwt_1.Strategy(options, async (payload, done) => {
        const user = await prisma_1.default.user.findFirst({
            where: { email: payload.email },
        });
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    }));
};
exports.applyPassportStrategy = applyPassportStrategy;
//# sourceMappingURL=passport.js.map