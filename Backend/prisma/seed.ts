import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // 1. Base reference data
  await import('./seeders/role.seeder.js');
  await import('./seeders/permission.seeder.js');
  await import('./seeders/feature.seeder.js');

  // 2. Role-permission mappings
  await import('./seeders/rolePermission.seeder.js');

  // 2.5 Seed users
  await import('./seeders/user.seeder.js');

  // 3. Content data
  await import('./seeders/subject.seeder.js');
  await import('./seeders/topic.seeder.js');
  await import('./seeders/masterChallenge.seeder.js');
  // await import('./seeders/quiz.seeder.js');

  // Note: roadmap and roadmapSubject seeders omitted since the schema was refactored.
  // We use roadmapMainConceptSubjectTopics instead.
  await import('./seeders/masterRoadmap.seeder.js');

  console.log('\n✅ Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
