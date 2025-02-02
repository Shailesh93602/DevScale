import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await import('./seeders/subject.seeder');
  await import('./seeders/roadmap.seeder');
  await import('./seeders/roadmapSubject.seeder');
  await import('./seeders/quiz.seeder');
  await import('./seeders/challenge.seeder');
  await import('./seeders/topic.seeder');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
