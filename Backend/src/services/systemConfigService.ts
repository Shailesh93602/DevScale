import { PrismaClient, Prisma } from '@prisma/client';
import { createAppError } from '../utils/errorHandler';
import { getCache, setCache, deleteCache } from './cacheService';
import { JsonValue } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

interface ConfigData {
  key: string;
  value: Prisma.JsonValue;
  category: string;
  description?: string;
}

interface EmailTemplateData {
  name: string;
  subject: string;
  content: string;
  variables: string[];
}

interface FeatureFlagData {
  name: string;
  description?: string;
  is_enabled: boolean;
  rules?: Record<string, Prisma.JsonValue>;
}

export async function getConfig(key: string) {
  const cached = await getCache(`config:${key}`);
  if (cached) return cached;

  const config = await prisma.systemConfig.findUnique({ where: { key } });

  if (!config) {
    throw createAppError(`Configuration '${key}' not found`, 404);
  }

  await setCache(`config:${key}`, config.value, { ttl: 3600 });
  return config.value;
}

export async function setConfig(data: ConfigData) {
  const validatedValue: Prisma.InputJsonValue =
    data.value === null
      ? Prisma.JsonNull
      : JSON.parse(JSON.stringify(data.value));
  const createData = {
    ...data,
    value: validatedValue,
  };

  const config = await prisma.systemConfig.upsert({
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

export async function getConfigsByCategory(category: string) {
  return prisma.systemConfig.findMany({ where: { category } });
}

export async function createEmailTemplate(data: EmailTemplateData) {
  const template = await prisma.emailTemplate.create({
    data: {
      name: data.name,
      subject: data.subject,
      content: data.content,
      variables: data.variables,
    },
  });

  return template;
}

export async function updateEmailTemplate(
  id: string,
  data: Partial<EmailTemplateData>
) {
  const template = await prisma.emailTemplate.update({
    where: { id },
    data,
  });

  return template;
}

export async function getEmailTemplate(name: string) {
  const template = await prisma.emailTemplate.findUnique({
    where: { name },
  });

  if (!template) {
    throw createAppError(`Email template '${name}' not found`, 404);
  }

  return template;
}

export async function setFeatureFlag(data: FeatureFlagData) {
  const flag = await prisma.featureFlag.upsert({
    where: { name: data.name },
    update: {
      is_enabled: data.is_enabled,
      description: data.description,
      rules: data.rules,
    },
    create: {
      name: data.name,
      is_enabled: data.is_enabled,
      description: data.description,
      rules: data.rules,
    },
  });

  await deleteCache(`feature:${data.name}`);
  return flag;
}

export async function isFeatureEnabled(
  name: string,
  context?: Record<string, Prisma.JsonValue>
) {
  const cached = await getCache(`feature:${name}`);
  if (cached !== null) return cached;

  const flag = await prisma.featureFlag.findUnique({
    where: { name },
  });

  if (!flag) {
    return false;
  }

  let is_enabled = flag.is_enabled;

  if (is_enabled && context && flag.rules) {
    is_enabled = evaluateFeatureRules(flag.rules as Prisma.JsonValue, context);
  }

  await setCache(`feature:${name}`, is_enabled, { ttl: 300 });
  return is_enabled;
}

export async function getNotificationSettings() {
  const settings = await getConfigsByCategory('notifications');
  return settings.reduce(
    (acc, setting) => ({
      ...acc,
      [setting.key]: setting.value,
    }),
    {}
  );
}

export async function updateNotificationSettings(
  settings: Record<string, Prisma.JsonValue>
) {
  const updates = Object.entries(settings).map(([key, value]) =>
    setConfig({
      key,
      value,
      category: 'notifications',
    })
  );

  await Promise.all(updates);
}

function evaluateFeatureRules(
  rules: Prisma.JsonValue,
  context: Record<string, Prisma.JsonValue>
): boolean {
  if (typeof rules !== 'object' || rules === null) {
    return true;
  }

  const ruleObject = rules as Record<string, JsonValue>;

  const isArray = (value: JsonValue): value is JsonValue[] =>
    Array.isArray(value);

  if ('userGroups' in ruleObject && 'userGroup' in context) {
    const groups = ruleObject.userGroups;
    return (
      isArray(groups) &&
      typeof context.userGroup === 'string' &&
      groups.includes(context.userGroup)
    );
  }

  if ('percentage' in ruleObject && 'userId' in context) {
    const percent = ruleObject.percentage;
    return (
      typeof percent === 'number' &&
      typeof context.userId === 'string' &&
      hashString(context.userId) % 100 < percent
    );
  }

  return true;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
