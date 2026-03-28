import { PrismaClient, Notification } from '@prisma/client';
import BaseRepository from './baseRepository.js';

import prisma from '../lib/prisma.js';

export default class NotificationRepository extends BaseRepository<
  PrismaClient['notification']
> {
  constructor() {
    super(prisma.notification);
  }

  async getNotifications(user_id: string, include_read = false) {
    return await this.findMany({
      where: {
        user_id: user_id,
        is_read: include_read ? undefined : false,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    return await this.update({
      where: { id },
      data: {
        is_read: true,
      },
    });
  }

  async markAllAsRead(user_id: string): Promise<void> {
    await this.updateMany({
      where: {
        user_id,
        is_read: false,
      },
      data: {
        is_read: true,
      },
    });
  }
}
