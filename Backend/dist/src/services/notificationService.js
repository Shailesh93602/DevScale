"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const client_1 = require("@prisma/client");
const emailService_1 = require("../utils/emailService");
const logger_1 = __importDefault(require("../utils/logger"));
const prisma = new client_1.PrismaClient();
class NotificationService {
    static async createNotification(data) {
        const notification = await prisma.notification.create({
            data,
            include: {
                user: {
                    select: {
                        email: true,
                        username: true,
                    },
                },
            },
        });
        // Send email notification if user has email notifications enabled
        try {
            await this.sendEmailNotification(notification);
        }
        catch (error) {
            logger_1.default.error('Failed to send email notification:', error);
        }
        return notification;
    }
    static async getNotifications(user_id, include_read = false) {
        const notifications = await prisma.notification.findMany({
            where: {
                user_id: user_id,
                is_read: include_read ? undefined : false,
            },
            orderBy: {
                created_at: 'desc',
            },
        });
        return notifications;
    }
    static async markAsRead(id) {
        const notification = await prisma.notification.update({
            where: { id },
            data: {
                is_read: true,
            },
        });
        return notification;
    }
    static async markAllAsRead(user_id) {
        await prisma.notification.updateMany({
            where: {
                user_id,
                is_read: false,
            },
            data: {
                is_read: true,
            },
        });
    }
    static async deleteNotification(id) {
        await prisma.notification.delete({
            where: { id },
        });
    }
    static async sendEmailNotification(notification) {
        const emailTemplate = await this.getEmailTemplate(notification.type);
        const emailContent = this.processTemplate(emailTemplate, {
            username: notification?.user?.username,
            title: notification.title,
            message: notification.message,
            link: notification.link ?? undefined,
        });
        await (0, emailService_1.sendEmail)({
            to: notification.user.email,
            subject: notification.title,
            html: emailContent,
        });
    }
    static async getEmailTemplate(type) {
        // In a real application, these templates would be stored in files
        const templates = {
            system: `
        <h1>System Notification</h1>
        <p>Hello {{username}},</p>
        <p>{{message}}</p>
        {{#if link}}<a href="{{link}}">View Details</a>{{/if}}
      `,
            achievement: `
        <h1>🎉 Achievement Unlocked!</h1>
        <p>Congratulations {{username}}!</p>
        <p>{{message}}</p>
        {{#if link}}<a href="{{link}}">View Achievement</a>{{/if}}
      `,
            mention: `
        <h1>You've been mentioned</h1>
        <p>Hi {{username}},</p>
        <p>{{message}}</p>
        {{#if link}}<a href="{{link}}">View Mention</a>{{/if}}
      `,
            comment: `
        <h1>New Comment</h1>
        <p>Hi {{username}},</p>
        <p>{{message}}</p>
        {{#if link}}<a href="{{link}}">View Comment</a>{{/if}}
      `,
            follow: `
        <h1>New Follower</h1>
        <p>Hi {{username}},</p>
        <p>{{message}}</p>
        {{#if link}}<a href="{{link}}">View Follower</a>{{/if}}
      `,
            project: `
        <h1>Project Update</h1>
        <p>Hi {{username}},</p>
        <p>{{message}}</p>
        {{#if link}}<a href="{{link}}">View Project</a>{{/if}}
      `,
            challenge: `
        <h1>Challenge Update</h1>
        <p>Hi {{username}},</p>
        <p>{{message}}</p>
        {{#if link}}<a href="{{link}}">View Challenge</a>{{/if}}
      `,
            course: `
        <h1>Course Update</h1>
        <p>Hi {{username}},</p>
        <p>{{message}}</p>
        {{#if link}}<a href="{{link}}">View Course</a>{{/if}}
      `,
            mentorship: `
        <h1>Mentorship Update</h1>
        <p>Hi {{username}},</p>
        <p>{{message}}</p>
        {{#if link}}<a href="{{link}}">View Mentorship</a>{{/if}}
      `,
        };
        return templates[type] || templates.system;
    }
    static processTemplate(template, data) {
        let processed = template;
        for (const [key, value] of Object.entries(data)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            processed = processed.replace(regex, value ?? '');
        }
        return processed;
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notificationService.js.map