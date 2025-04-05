"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const bull_1 = __importDefault(require("bull"));
const config_1 = require("../config");
const logger_1 = __importDefault(require("./logger"));
const prisma_1 = __importDefault(require("@/lib/prisma"));
// Create email queue
const emailQueue = new bull_1.default('email-queue', config_1.REDIS_URL);
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: config_1.MAIL_ADDRESS,
        pass: config_1.MAIL_PASSWORD,
    },
});
const sendEmail = async (data) => {
    // Add email to queue
    await emailQueue.add(data, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
    });
};
exports.sendEmail = sendEmail;
// Process email queue
emailQueue.process(async (job) => {
    const { to, subject, html, attachments } = job.data;
    try {
        const info = await transporter.sendMail({
            from: config_1.MAIL_ADDRESS,
            to,
            subject,
            html,
            attachments,
        });
        logger_1.default.info(`Email sent: ${info.messageId}`);
        await trackEmailDelivery(to, subject, 'delivered');
    }
    catch (error) {
        logger_1.default.error('Error sending email:', error);
        await trackEmailDelivery(to, subject, 'failed');
        throw error;
    }
});
// Track email delivery status
const trackEmailDelivery = async (to, subject, status) => {
    try {
        await prisma_1.default.emailLog.create({
            data: {
                recipient: to,
                subject,
                status,
                sent_at: new Date(),
            },
        });
    }
    catch (error) {
        logger_1.default.error('Error tracking email delivery:', error);
    }
};
// Handle failed jobs
emailQueue.on('failed', (job, error) => {
    logger_1.default.error(`Job ${job.id} failed:`, error);
});
const sendVerificationEmail = async (to, token) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const mailOptions = {
        from: config_1.MAIL_ADDRESS,
        to,
        subject: 'Verify your email address',
        html: `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `,
    };
    try {
        await transporter.sendMail(mailOptions);
        logger_1.default.info(`Verification email sent to ${to}`);
    }
    catch (error) {
        logger_1.default.error('Error sending verification email:', error);
        throw error;
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
//# sourceMappingURL=emailService.js.map