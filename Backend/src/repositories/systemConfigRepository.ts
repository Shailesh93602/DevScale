import { PrismaClient, Prisma } from '@prisma/client';
import { createAppError } from '../utils/errorHandler';
import { getCache, setCache, deleteCache } from '@/services/cacheService';
import BaseRepository from './baseRepository';

import prisma from '@/lib/prisma';

export default class SystemConfigRepository extends BaseRepository<
  PrismaClient['systemConfig']
> {
  constructor() {
    super(prisma.systemConfig);
  }

  async getConfig(key: string): Promise<Prisma.JsonValue> {
    const cached = await getCache(`config:${key}`);
    if (cached) return cached;

    const config = await this.findUnique({ where: { key } });

    if (!config) {
      throw createAppError(`Configuration '${key}' not found`, 404);
    }

    await setCache(`config:${key}`, config.value, { ttl: 3600 });
    return config.value;
  }

  async setConfig(data: {
    key: string;
    value: Prisma.JsonValue;
    category: string;
    description?: string;
  }) {
    const validatedValue: Prisma.InputJsonValue =
      data.value === null
        ? Prisma.JsonNull
        : JSON.parse(JSON.stringify(data.value));
    const createData = {
      ...data,
      value: validatedValue,
    };

    const config = await this.upsert({
      where: { key: data.key },
      update: {
        value: validatedValue,
        category: data.category,
        description: data.description,
      },
      create: createData,
    });

    await deleteCache(`config:${data.key}`);
    return config;
  }

  async getNotificationSettings() {
    const settings = await this.findMany({
      where: { category: 'notifications' },
    });
    return settings.reduce(
      (acc, setting) => ({
        ...acc,
        [setting.key]: setting.value,
      }),
      {}
    );
  }

  async updateNotificationSettings(settings: Record<string, Prisma.JsonValue>) {
    const updates = Object.entries(settings).map(([key, value]) =>
      this.setConfig({
        key,
        value,
        category: 'notifications',
      })
    );

    await Promise.all(updates);
  }
}
