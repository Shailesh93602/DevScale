import { PrismaClient } from '@prisma/client';
import { subjects } from '../../resources/subjects';

const prisma = new PrismaClient();

const seedSubjects = async () => {
  try {
    console.log('Seeding subjects...');
    let order = 1;
    for (const subject of subjects) {
      const existing = await prisma.subject.findFirst({
        where: { title: subject.name },
      });
      if (!existing) {
        await prisma.subject.create({
          data: {
            title: subject.name,
            description: subject.description,
            order: order++,
          },
        });
      } else {
        await prisma.subject.update({
          where: { id: existing.id },
          data: {
            description: subject.description,
            order: order++,
          },
        });
      }
    }

    console.log('Subjects seeded successfully');
  } catch (error) {
    console.error('Error seeding subjects:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seedSubjects();
