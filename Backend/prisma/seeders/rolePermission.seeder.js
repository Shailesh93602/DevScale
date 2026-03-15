"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./../../src/constants/index");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const rolePermissions = [
    // Admin Role Permissions - Full access
    {
        roleName: index_1.RoleEnum.SUPER_ADMIN,
        features: [
            index_1.FeatureEnum.USER,
            index_1.FeatureEnum.ROLE,
            index_1.FeatureEnum.PERMISSION,
            index_1.FeatureEnum.FEATURE,
            index_1.FeatureEnum.ROLE_PERMISSION,
            index_1.FeatureEnum.ROADMAP,
            index_1.FeatureEnum.MAIN_CONCEPT,
            index_1.FeatureEnum.SUBJECT,
            index_1.FeatureEnum.TOPIC,
            index_1.FeatureEnum.QUIZ,
            index_1.FeatureEnum.CHALLENGE,
            index_1.FeatureEnum.ARTICLE,
            index_1.FeatureEnum.FORUM,
            index_1.FeatureEnum.MENTORSHIP,
            index_1.FeatureEnum.ANALYTICS,
            index_1.FeatureEnum.COURSE,
            index_1.FeatureEnum.COURSE_MODULE,
            index_1.FeatureEnum.COURSE_ENROLLMENT,
            index_1.FeatureEnum.COURSE_PROGRESS,
            index_1.FeatureEnum.COURSE_DISCUSSION,
            index_1.FeatureEnum.COURSE_ASSESSMENT,
            index_1.FeatureEnum.COURSE_QUIZ,
            index_1.FeatureEnum.COURSE_CHALLENGE,
            index_1.FeatureEnum.COURSE_DISCOVERY,
            index_1.FeatureEnum.COURSE_SURVEY,
            index_1.FeatureEnum.RESOURCE,
            index_1.FeatureEnum.RESOURCE_VERSION,
            index_1.FeatureEnum.RESOURCE_DOWNLOAD,
            index_1.FeatureEnum.RESOURCE_MEDIA,
            index_1.FeatureEnum.RESOURCE_MEDIA_FILE,
            index_1.FeatureEnum.RESOURCE_MEDIA_VIDEO,
            index_1.FeatureEnum.RESOURCE_MEDIA_AUDIO,
            index_1.FeatureEnum.RESOURCE_MEDIA_IMAGE,
            index_1.FeatureEnum.RESOURCE_MEDIA_DOCUMENT,
            index_1.FeatureEnum.RESOURCE_MEDIA_OTHER,
            index_1.FeatureEnum.CONTENT,
            index_1.FeatureEnum.CONTENT_MODERATION,
            index_1.FeatureEnum.BATTLE,
            index_1.FeatureEnum.CHAT,
            index_1.FeatureEnum.DAILY_TOPIC,
            index_1.FeatureEnum.JOB,
            index_1.FeatureEnum.LEADERBOARD,
            index_1.FeatureEnum.NOTIFICATION,
            index_1.FeatureEnum.PLACEMENT,
            index_1.FeatureEnum.QUESTION,
            index_1.FeatureEnum.SUPPORT,
        ],
        permissions: [
            index_1.PermissionEnum.CREATE,
            index_1.PermissionEnum.READ,
            index_1.PermissionEnum.UPDATE,
            index_1.PermissionEnum.DELETE,
        ],
    },
    // Moderator Role Permissions - Limited access
    {
        roleName: index_1.RoleEnum.ADMIN,
        features: [
            index_1.FeatureEnum.USER,
            index_1.FeatureEnum.ROLE,
            index_1.FeatureEnum.PERMISSION,
            index_1.FeatureEnum.FEATURE,
            index_1.FeatureEnum.ROLE_PERMISSION,
            index_1.FeatureEnum.ROADMAP,
            index_1.FeatureEnum.MAIN_CONCEPT,
            index_1.FeatureEnum.SUBJECT,
            index_1.FeatureEnum.TOPIC,
            index_1.FeatureEnum.QUIZ,
            index_1.FeatureEnum.CHALLENGE,
            index_1.FeatureEnum.ARTICLE,
            index_1.FeatureEnum.FORUM,
            index_1.FeatureEnum.MENTORSHIP,
            index_1.FeatureEnum.ANALYTICS,
            index_1.FeatureEnum.COURSE,
            index_1.FeatureEnum.COURSE_MODULE,
            index_1.FeatureEnum.COURSE_ENROLLMENT,
            index_1.FeatureEnum.COURSE_PROGRESS,
            index_1.FeatureEnum.COURSE_DISCUSSION,
            index_1.FeatureEnum.COURSE_ASSESSMENT,
            index_1.FeatureEnum.COURSE_QUIZ,
            index_1.FeatureEnum.COURSE_CHALLENGE,
            index_1.FeatureEnum.COURSE_DISCOVERY,
            index_1.FeatureEnum.COURSE_SURVEY,
            index_1.FeatureEnum.RESOURCE,
            index_1.FeatureEnum.RESOURCE_VERSION,
            index_1.FeatureEnum.RESOURCE_DOWNLOAD,
            index_1.FeatureEnum.RESOURCE_MEDIA,
            index_1.FeatureEnum.RESOURCE_MEDIA_FILE,
            index_1.FeatureEnum.RESOURCE_MEDIA_VIDEO,
            index_1.FeatureEnum.RESOURCE_MEDIA_AUDIO,
            index_1.FeatureEnum.RESOURCE_MEDIA_IMAGE,
            index_1.FeatureEnum.RESOURCE_MEDIA_DOCUMENT,
            index_1.FeatureEnum.RESOURCE_MEDIA_OTHER,
            index_1.FeatureEnum.CONTENT,
            index_1.FeatureEnum.CONTENT_MODERATION,
            index_1.FeatureEnum.BATTLE,
            index_1.FeatureEnum.CHAT,
            index_1.FeatureEnum.DAILY_TOPIC,
            index_1.FeatureEnum.JOB,
            index_1.FeatureEnum.LEADERBOARD,
            index_1.FeatureEnum.NOTIFICATION,
            index_1.FeatureEnum.PLACEMENT,
            index_1.FeatureEnum.QUESTION,
        ],
        permissions: [index_1.PermissionEnum.READ, index_1.PermissionEnum.UPDATE],
    },
    // Student Role Permissions - Basic access
    {
        roleName: 'STUDENT',
        permissions: ['READ'],
    },
];
const seedRolePermissions = async () => {
    try {
        for (const rp of rolePermissions) {
            // Get role
            const role = await prisma.role.findUnique({
                where: { name: rp.roleName },
            });
            if (!role) {
                console.log(`Role ${rp.roleName} not found`);
                continue;
            }
            // Get permissions
            const permissions = await prisma.permission.findMany({
                where: {
                    name: {
                        in: rp.permissions,
                    },
                },
            });
            // Create role-permission connections
            for (const permission of permissions) {
                await prisma.rolePermission.upsert({
                    where: {
                        role_id_permission_id: {
                            role_id: role.id,
                            permission_id: permission.id,
                        },
                    },
                    update: {},
                    create: {
                        role_id: role.id,
                        permission_id: permission.id,
                    },
                });
            }
        }
        console.log('Role permissions seeded successfully');
    }
    catch (error) {
        console.error('Error seeding role permissions:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
};
seedRolePermissions();
//# sourceMappingURL=rolePermission.seeder.js.map