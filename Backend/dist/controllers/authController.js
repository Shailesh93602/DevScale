"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.resetPassword = exports.forgotPassword = exports.logout = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const express_validator_1 = require("express-validator");
const dotenv_1 = require("dotenv");
const client_1 = require("@prisma/client");
const index_1 = require("../utils/index");
const config_1 = require("../config");
(0, dotenv_1.config)();
const prisma = new client_1.PrismaClient();
const sendResetEmail = async (email, resetLink) => {
    const transporter = nodemailer_1.default.createTransport({
        service: 'Gmail',
        auth: {
            user: config_1.MAIL_ADDRESS,
            pass: config_1.MAIL_PASSWORD,
        },
    });
    const mailOptions = {
        from: config_1.MAIL_ADDRESS,
        to: email,
        subject: 'Password Reset',
        text: `Click the following link to reset your password: ${resetLink}`,
    };
    await transporter.sendMail(mailOptions);
};
exports.register = (0, index_1.catchAsync)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Invalid Payload',
            errors: errors.array(),
        });
    }
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: 'User already exists',
        });
    }
    await prisma.user.create({
        data: {
            username,
            email,
            password: hashedPassword,
        },
    });
    res.status(201).json({
        success: true,
        message: 'Registered Successfully!',
    });
});
exports.login = (0, index_1.catchAsync)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Invalid Payload' });
    }
    const { username, password } = req.body;
    const user = await prisma.user.findFirst({
        where: {
            OR: [{ email: username }, { username }],
        },
    });
    if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
        return res.status(401).json({
            success: false,
            message: 'Incorrect email or password',
        });
    }
    const token = jsonwebtoken_1.default.sign({ email: user.email }, config_1.ACCESS_TOKEN_SECRET, {
        expiresIn: '15d',
    });
    res.cookie('token', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
        success: true,
        message: 'Logged in successfully!',
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
        },
    });
});
exports.logout = (0, index_1.catchAsync)(async (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Logged out successfully!' });
});
exports.forgotPassword = (0, index_1.catchAsync)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res
            .status(400)
            .json({ success: false, message: 'Invalid Payload' });
    }
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'Cannot find user',
        });
    }
    const resetToken = jsonwebtoken_1.default.sign({ email }, config_1.RESET_TOKEN_SECRET, {
        expiresIn: '1h',
    });
    const resetLink = `http://localhost:3000/resetPassword?token=${resetToken}`;
    await sendResetEmail(email, resetLink);
    res.status(200).json({
        success: true,
        message: 'Password reset link sent to your email',
    });
});
exports.resetPassword = (0, index_1.catchAsync)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Invalid Payload' });
    }
    const { token, password } = req.body;
    const decoded = jsonwebtoken_1.default.verify(token, config_1.RESET_TOKEN_SECRET);
    const user = await prisma.user.findUnique({
        where: { email: decoded.email },
    });
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    await prisma.user.update({
        where: { email: decoded.email },
        data: { password: hashedPassword },
    });
    res
        .status(200)
        .json({ success: true, message: 'Password updated successfully' });
});
exports.getAllUsers = (0, index_1.catchAsync)(async (req, res) => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            email: true,
        },
        orderBy: { created_at: 'asc' },
    });
    res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users,
    });
});
//# sourceMappingURL=authController.js.map