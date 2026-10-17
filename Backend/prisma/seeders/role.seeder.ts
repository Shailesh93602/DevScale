import { PrismaClient } from '@prisma/client';
import { runIfEntryPoint } from './runSeeder.js';

const prisma = new PrismaClient();

const roles = [
  {
    name: 'STUDENT',
  },
  {
    name: 'ADMIN',
  },
  {
    name: 'MODERATOR',
  },
];

const seedRoles = async () => {
  try {
    for (const role of roles) {
      await prisma.role.upsert({
        where: { name: role.name },
        update: {}, // No updates needed since we only have name field
        create: role,
      });
    }
    console.log(`Seeded ${roles.length} roles`);
  } catch (error) {
    console.error('Error seeding roles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export default seedRoles;
runIfEntryPoint('role.seeder', seedRoles);
