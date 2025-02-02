import { PrismaClient } from '@prisma/client';
import { topics } from '../../resources/topics';

const prisma = new PrismaClient();

const seedTopics = async () => {
  try {
    for (const topicData of topics) {
      const subject = await prisma.subject.findFirst({
        where: { name: topicData.subject },
      });

      if (subject) {
        await prisma.topic.upsert({
          where: { title: topicData.name },
          update: {
            description: topicData.description,
            subjectId: subject.id,
          },
          create: {
            title: topicData.name,
            description: topicData.description,
            subjectId: subject.id,
          },
        });
      } else {
        console.error(
          `Subject "${topicData.subject}" not found for topic "${topicData.name}"`
        );
      }
    }

    console.log('Topics seeded successfully');
  } catch (error) {
    console.error('Error seeding topics:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seedTopics();
