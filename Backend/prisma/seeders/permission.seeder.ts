import { PrismaClient } from '@prisma/client';
import { runIfEntryPoint } from './runSeeder.js';

const prisma = new PrismaClient();

const permissions = [
  {
    key: 'create',
    name: 'CREATE',
    description: 'Allows creation of resources',
  },
  {
    key: 'read',
    name: 'READ',
    description: 'Allows viewing of resources',
  },
  {
    key: 'update',
    name: 'UPDATE',
    description: 'Allows modification of resources',
  },
  {
    key: 'delete',
    name: 'DELETE',
    description: 'Allows deletion of resources',
  },
];

const seedPermissions = async () => {
  try {
    for (const permission of permissions) {
      await prisma.permission.upsert({
        where: { name: permission.name },
        update: { description: permission.description },
        create: permission,
      });
    }
    console.log(`Seeded ${permissions.length} permissions`);
  } catch (error) {
    console.error('Error seeding permissions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export default seedPermissions;
runIfEntryPoint('permission.seeder', seedPermissions);
