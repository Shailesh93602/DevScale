"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const emailService_1 = require("../utils/emailService");
const config_1 = require("../config");
const logger_1 = __importDefault(require("../utils/logger"));
const prisma = new client_1.PrismaClient();
class AuthService {
    static async register(data) {
        // Check for existing user
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email: data.email }, { username: data.username }],
            },
        });
        if (existingUser) {
            throw new errorHandler_1.AppError(`User with this ${existingUser.email === data.email ? 'email' : 'username'} already exists`, 400);
        }
        // Create verification token
        const verificationToken = jsonwebtoken_1.default.sign({ email: data.email }, config_1.JWT_SECRET, {
            expiresIn: '24h',
        });
        // Create user
        const user = await prisma.user.create({
            data: {
                ...data,
                experience_level: 'beginner',
                skills: [],
            },
        });
        // Send verification email
        await (0, emailService_1.sendVerificationEmail)(user.email, verificationToken);
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ id: user.id }, config_1.JWT_SECRET, {
            expiresIn: config_1.JWT_EXPIRES_IN,
        });
        return { user, token };
    }
    static async syncUserProfile(userData) {
        try {
            return await prisma.user.upsert({
                where: { id: userData.id },
                update: {
                    email: userData.email,
                    username: userData.username,
                    full_name: userData.full_name,
                    avatar_url: userData.avatar_url,
                    experience_level: userData.experience_level,
                },
                create: {
                    ...userData,
                    experience_level: userData.experience_level,
                    skills: userData.skills || [],
                },
            });
        }
        catch (error) {
            logger_1.default.error('Failed to sync user profile', error);
            throw new errorHandler_1.AppError('Failed to sync user profile', 500);
        }
    }
    static generateAuthToken(userId) {
        return jsonwebtoken_1.default.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '15d',
        });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=authService.js.map