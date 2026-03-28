import { Prisma, SystemConfig } from '@prisma/client';
import { createAppError } from '../utils/errorHandler.js';
import { getCache, setCache, deleteCache } from '../services/cacheService.js';
import BaseRepository from './baseRepository.js';

import prisma from '../lib/prisma.js';

export default class SystemConfigRepository extends BaseRepository< SystemConfig, typeof prisma.systemConfig > {
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
    const validatedValue = (data.value === null
      ? Prisma.JsonNull
      : structuredClone(data.value)) as Prisma.InputJsonValue;
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
