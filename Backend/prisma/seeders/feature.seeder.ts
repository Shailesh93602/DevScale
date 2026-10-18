import { FeatureEnum } from '../../src/constants/rbacEnums';
import { runIfEntryPoint } from './runSeeder.js';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const features = [
  {
    name: FeatureEnum.USER,
    description: 'User registration, authentication, and profile management',
  },
];

const seedFeatures = async () => {
  try {
    for (const feature of features) {
      await prisma.feature.upsert({
        where: { name: feature.name },
        update: { description: feature.description },
        create: feature,
      });
    }
    console.log(`Seeded ${features.length} features`);
  } catch (error) {
    console.error('Error seeding features:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export default seedFeatures;
runIfEntryPoint('feature.seeder', seedFeatures);
