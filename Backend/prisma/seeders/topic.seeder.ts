import { PrismaClient } from '@prisma/client';
import { topics } from '../../resources/topics';

const prisma = new PrismaClient();

const seedTopics = async () => {
  try {
    console.log('Seeding topics...');
    let order = 1;
    for (const topicData of topics) {
      const subject = await prisma.subject.findFirst({
        where: { title: topicData.subject },
      });

      if (subject) {
        const existingTopic = await prisma.topic.findFirst({
          where: { title: topicData.name },
        });

        let topic;
        if (!existingTopic) {
          topic = await prisma.topic.create({
            data: {
              title: topicData.name,
              description: topicData.description,
              order: order++,
            },
          });
        } else {
          topic = await prisma.topic.update({
            where: { id: existingTopic.id },
            data: {
              description: topicData.description,
              order: order++,
            },
          });
        }

        // Map topic to subject via SubjectTopic
        const existingMapping = await prisma.subjectTopic.findFirst({
          where: { subject_id: subject.id, topic_id: topic.id }
        });

        if (!existingMapping) {
          await prisma.subjectTopic.create({
            data: {
              subject_id: subject.id,
              topic_id: topic.id,
              order: order++,
            }
          });
        }
      } else {
        console.error(`Subject "${topicData.subject}" not found for topic "${topicData.name}"`);
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
