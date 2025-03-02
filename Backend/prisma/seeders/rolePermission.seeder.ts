import {
  RoleEnum,
  FeatureEnum,
  PermissionEnum,
} from './../../src/constants/index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rolePermissions = [
  // Admin Role Permissions - Full access
  {
    roleName: RoleEnum.SUPER_ADMIN,
    features: [
      FeatureEnum.USER,
      FeatureEnum.ROLE,
      FeatureEnum.PERMISSION,
      FeatureEnum.FEATURE,
      FeatureEnum.ROLE_PERMISSION,
      FeatureEnum.ROADMAP,
      FeatureEnum.MAIN_CONCEPT,
      FeatureEnum.SUBJECT,
      FeatureEnum.TOPIC,
      FeatureEnum.QUIZ,
      FeatureEnum.CHALLENGE,
      FeatureEnum.ARTICLE,
      FeatureEnum.FORUM,
      FeatureEnum.MENTORSHIP,
      FeatureEnum.ANALYTICS,
      FeatureEnum.COURSE,
      FeatureEnum.COURSE_MODULE,
      FeatureEnum.COURSE_ENROLLMENT,
      FeatureEnum.COURSE_PROGRESS,
      FeatureEnum.COURSE_DISCUSSION,
      FeatureEnum.COURSE_ASSESSMENT,
      FeatureEnum.COURSE_QUIZ,
      FeatureEnum.COURSE_CHALLENGE,
      FeatureEnum.COURSE_DISCOVERY,
      FeatureEnum.COURSE_SURVEY,
      FeatureEnum.RESOURCE,
      FeatureEnum.RESOURCE_VERSION,
      FeatureEnum.RESOURCE_DOWNLOAD,
      FeatureEnum.RESOURCE_MEDIA,
      FeatureEnum.RESOURCE_MEDIA_FILE,
      FeatureEnum.RESOURCE_MEDIA_VIDEO,
      FeatureEnum.RESOURCE_MEDIA_AUDIO,
      FeatureEnum.RESOURCE_MEDIA_IMAGE,
      FeatureEnum.RESOURCE_MEDIA_DOCUMENT,
      FeatureEnum.RESOURCE_MEDIA_OTHER,
      FeatureEnum.CONTENT,
      FeatureEnum.CONTENT_MODERATION,
      FeatureEnum.BATTLE,
      FeatureEnum.CHAT,
      FeatureEnum.DAILY_TOPIC,
      FeatureEnum.JOB,
      FeatureEnum.LEADERBOARD,
      FeatureEnum.NOTIFICATION,
      FeatureEnum.PLACEMENT,
      FeatureEnum.QUESTION,
      FeatureEnum.SUPPORT,
    ],
    permissions: [
      PermissionEnum.CREATE,
      PermissionEnum.READ,
      PermissionEnum.UPDATE,
      PermissionEnum.DELETE,
    ],
  },

  // Moderator Role Permissions - Limited access
  {
    roleName: RoleEnum.ADMIN,
    features: [
      FeatureEnum.USER,
      FeatureEnum.ROLE,
      FeatureEnum.PERMISSION,
      FeatureEnum.FEATURE,
      FeatureEnum.ROLE_PERMISSION,
      FeatureEnum.ROADMAP,
      FeatureEnum.MAIN_CONCEPT,
      FeatureEnum.SUBJECT,
      FeatureEnum.TOPIC,
      FeatureEnum.QUIZ,
      FeatureEnum.CHALLENGE,
      FeatureEnum.ARTICLE,
      FeatureEnum.FORUM,
      FeatureEnum.MENTORSHIP,
      FeatureEnum.ANALYTICS,
      FeatureEnum.COURSE,
      FeatureEnum.COURSE_MODULE,
      FeatureEnum.COURSE_ENROLLMENT,
      FeatureEnum.COURSE_PROGRESS,
      FeatureEnum.COURSE_DISCUSSION,
      FeatureEnum.COURSE_ASSESSMENT,
      FeatureEnum.COURSE_QUIZ,
      FeatureEnum.COURSE_CHALLENGE,
      FeatureEnum.COURSE_DISCOVERY,
      FeatureEnum.COURSE_SURVEY,
      FeatureEnum.RESOURCE,
      FeatureEnum.RESOURCE_VERSION,
      FeatureEnum.RESOURCE_DOWNLOAD,
      FeatureEnum.RESOURCE_MEDIA,
      FeatureEnum.RESOURCE_MEDIA_FILE,
      FeatureEnum.RESOURCE_MEDIA_VIDEO,
      FeatureEnum.RESOURCE_MEDIA_AUDIO,
      FeatureEnum.RESOURCE_MEDIA_IMAGE,
      FeatureEnum.RESOURCE_MEDIA_DOCUMENT,
      FeatureEnum.RESOURCE_MEDIA_OTHER,
      FeatureEnum.CONTENT,
      FeatureEnum.CONTENT_MODERATION,
      FeatureEnum.BATTLE,
      FeatureEnum.CHAT,
      FeatureEnum.DAILY_TOPIC,
      FeatureEnum.JOB,
      FeatureEnum.LEADERBOARD,
      FeatureEnum.NOTIFICATION,
      FeatureEnum.PLACEMENT,
      FeatureEnum.QUESTION,
    ],
    permissions: [PermissionEnum.READ, PermissionEnum.UPDATE],
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
  } catch (error) {
    console.error('Error seeding role permissions:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seedRolePermissions();
