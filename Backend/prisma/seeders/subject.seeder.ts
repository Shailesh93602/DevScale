import { PrismaClient } from '@prisma/client';
import { subjects } from '../../resources/subjects';

const prisma = new PrismaClient();

const seedSubjects = async () => {
  try {
    for (const subject of subjects) {
      await prisma.subject.upsert({
        where: { name: subject.name },
        update: subject,
        create: subject,
      });
    }

    console.log('Subjects seeded successfully');
  } catch (error) {
    console.error('Error seeding subjects:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seedSubjects();
