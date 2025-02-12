"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = getConfig;
exports.setConfig = setConfig;
exports.getConfigsByCategory = getConfigsByCategory;
exports.createEmailTemplate = createEmailTemplate;
exports.updateEmailTemplate = updateEmailTemplate;
exports.getEmailTemplate = getEmailTemplate;
exports.setFeatureFlag = setFeatureFlag;
exports.isFeatureEnabled = isFeatureEnabled;
exports.getNotificationSettings = getNotificationSettings;
exports.updateNotificationSettings = updateNotificationSettings;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const cacheService_1 = require("./cacheService");
const prisma = new client_1.PrismaClient();
async function getConfig(key) {
    const cached = await (0, cacheService_1.getCache)(`config:${key}`);
    if (cached)
        return cached;
    const config = await prisma.systemConfig.findUnique({ where: { key } });
    if (!config) {
        throw (0, errorHandler_1.createAppError)(`Configuration '${key}' not found`, 404);
    }
    await (0, cacheService_1.setCache)(`config:${key}`, config.value, { ttl: 3600 });
    return config.value;
}
async function setConfig(data) {
    const validatedValue = data.value === null
        ? client_1.Prisma.JsonNull
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
    await (0, cacheService_1.deleteCache)(`config:${data.key}`);
    return config;
}
async function getConfigsByCategory(category) {
    return prisma.systemConfig.findMany({ where: { category } });
}
async function createEmailTemplate(data) {
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
async function updateEmailTemplate(id, data) {
    const template = await prisma.emailTemplate.update({
        where: { id },
        data,
    });
    return template;
}
async function getEmailTemplate(name) {
    const template = await prisma.emailTemplate.findUnique({
        where: { name },
    });
    if (!template) {
        throw (0, errorHandler_1.createAppError)(`Email template '${name}' not found`, 404);
    }
    return template;
}
async function setFeatureFlag(data) {
    const flag = await prisma.featureFlag.upsert({
        where: { name: data.name },
        update: {
            isEnabled: data.isEnabled,
            description: data.description,
            rules: data.rules,
        },
        create: {
            name: data.name,
            isEnabled: data.isEnabled,
            description: data.description,
            rules: data.rules,
        },
    });
    await (0, cacheService_1.deleteCache)(`feature:${data.name}`);
    return flag;
}
async function isFeatureEnabled(name, context) {
    const cached = await (0, cacheService_1.getCache)(`feature:${name}`);
    if (cached !== null)
        return cached;
    const flag = await prisma.featureFlag.findUnique({
        where: { name },
    });
    if (!flag) {
        return false;
    }
    let isEnabled = flag.isEnabled;
    if (isEnabled && context && flag.rules) {
        isEnabled = evaluateFeatureRules(flag.rules, context);
    }
    await (0, cacheService_1.setCache)(`feature:${name}`, isEnabled, { ttl: 300 });
    return isEnabled;
}
async function getNotificationSettings() {
    const settings = await getConfigsByCategory('notifications');
    return settings.reduce((acc, setting) => ({
        ...acc,
        [setting.key]: setting.value,
    }), {});
}
async function updateNotificationSettings(settings) {
    const updates = Object.entries(settings).map(([key, value]) => setConfig({
        key,
        value,
        category: 'notifications',
    }));
    await Promise.all(updates);
}
function evaluateFeatureRules(rules, context) {
    if (typeof rules !== 'object' || rules === null) {
        return true;
    }
    const ruleObject = rules;
    const isArray = (value) => Array.isArray(value);
    if ('userGroups' in ruleObject && 'userGroup' in context) {
        const groups = ruleObject.userGroups;
        return (isArray(groups) &&
            typeof context.userGroup === 'string' &&
            groups.includes(context.userGroup));
    }
    if ('percentage' in ruleObject && 'userId' in context) {
        const percent = ruleObject.percentage;
        return (typeof percent === 'number' &&
            typeof context.userId === 'string' &&
            hashString(context.userId) % 100 < percent);
    }
    return true;
}
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}
//# sourceMappingURL=systemConfigService.js.map