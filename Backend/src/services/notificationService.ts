import { PrismaClient, Notification, NotificationType } from '@prisma/client';
import { sendEmail } from '../utils/emailService';
import logger from '../utils/logger';

const prisma = new PrismaClient();

interface NotificationData {
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
}

export class NotificationService {
  static async createNotification(
    data: NotificationData
  ): Promise<Notification> {
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
    } catch (error) {
      logger.error('Failed to send email notification:', error);
    }

    return notification;
  }

  static async getNotifications(user_id: string, include_read = false) {
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

  static async markAsRead(id: string): Promise<Notification> {
    const notification = await prisma.notification.update({
      where: { id },
      data: {
        is_read: true,
      },
    });

    return notification;
  }

  static async markAllAsRead(user_id: string): Promise<void> {
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

  static async deleteNotification(id: string): Promise<void> {
    await prisma.notification.delete({
      where: { id },
    });
  }

  private static async sendEmailNotification(
    notification: Notification & {
      user: { email: string; username: string };
    }
  ): Promise<void> {
    const emailTemplate = await this.getEmailTemplate(notification.type);
    const emailContent = this.processTemplate(emailTemplate, {
      username: notification?.user?.username,
      title: notification.title,
      message: notification.message,
      link: notification.link ?? undefined,
    });

    await sendEmail({
      to: notification.user.email,
      subject: notification.title,
      html: emailContent,
    });
  }

  private static async getEmailTemplate(
    type: NotificationType
  ): Promise<string> {
    // In a real application, these templates would be stored in files
    const templates: Record<NotificationType, string> = {
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

  private static processTemplate(
    template: string,
    data: Record<string, string | undefined>
  ): string {
    let processed = template;
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, value ?? '');
    }
    return processed;
  }
}
