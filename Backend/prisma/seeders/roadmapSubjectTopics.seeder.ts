import { PrismaClient } from '@prisma/client';
import { roadmaps } from '../../resources/roadmaps/roadmap';

const prisma = new PrismaClient();

const seedDatabase = async () => {
  try {
    await prisma.$transaction(async (prismaTransaction: PrismaClient) => {
      for (const roadmapData of roadmaps) {
        const roadmap = await prismaTransaction.roadMap.upsert({
          where: { title: roadmapData.title },
          update: {
            description: roadmapData.description,
          },
          create: {
            title: roadmapData.title,
            description: roadmapData.description,
          },
        });

        for (const mainConceptData of roadmapData.mainConcepts) {
          const mainConcept = await prismaTransaction.mainConcept.upsert({
            where: { name: mainConceptData.name },
            update: {
              description: mainConceptData.description,
              roadmapId: roadmap.id,
            },
            create: {
              name: mainConceptData.name,
              description: mainConceptData.description,
              roadmapId: roadmap.id,
            },
          });

          for (const subjectData of mainConceptData.subjects) {
            const subject = await prismaTransaction.subject.upsert({
              where: { name: subjectData.name },
              update: {
                description: subjectData.description,
                mainConceptId: mainConcept.id,
              },
              create: {
                name: subjectData.name,
                description: subjectData.description,
                mainConceptId: mainConcept.id,
              },
            });

            for (const topicData of subjectData.topics) {
              await prismaTransaction.topic.upsert({
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
            }
          }
        }
      }
    });

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seedDatabase();
