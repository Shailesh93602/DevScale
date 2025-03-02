"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("../utils/logger"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
async function sendEmail(options) {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            ...options,
        });
        logger_1.default.info('Email sent successfully', { to: options.to });
    }
    catch (error) {
        logger_1.default.error('Failed to send email:', error);
        throw error;
    }
}
//# sourceMappingURL=email.js.map