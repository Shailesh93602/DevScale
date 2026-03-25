import { PrismaClient } from '@prisma/client';
import { roadmapCategories, roadmaps } from '../../resources/roadmaps/roadmap';

const prisma = new PrismaClient();
const admin = 'shailesh@EduScales.com';

const seedDatabase = async () => {
  try {
    const user = await prisma.user.findFirst({
      where: { email: admin },
    });

    if (!user) {
      throw new Error('Admin user not found');
    }

    for (const category of roadmapCategories) {
      await prisma.roadmapCategory.upsert({
        where: { name: category },
        update: {},
        create: {
          name: category,
        },
      });
    }

    for (const roadmapData of roadmaps) {
      const roadmap = await prisma.roadmap.upsert({
        where: { title: roadmapData.title },
        update: {
          tags: roadmapData.tags,
          description: roadmapData.description,
        },
        create: {
          title: roadmapData.title,
          description: roadmapData.description,
          user_id: user.id,
        },
      });

      for (const [
        mcIndex,
        mainConceptData,
      ] of roadmapData.mainConcepts.entries()) {
        const mainConcept = await prisma.mainConcept.upsert({
          where: { name: mainConceptData.name },
          update: {
            description: mainConceptData.description,
            order: mainConceptData.order,
          },
          create: {
            name: mainConceptData.name,
            description: mainConceptData.description,
            order: mainConceptData.order,
          },
        });

        await prisma.roadmapMainConcept.upsert({
          where: {
            roadmap_id_main_concept_id: {
              roadmap_id: roadmap.id,
              main_concept_id: mainConcept.id,
            },
          },
          update: {
            order: mcIndex + 1,
          },
          create: {
            roadmap_id: roadmap.id,
            main_concept_id: mainConcept.id,
            order: mcIndex + 1,
          },
        });

        for (const [
          sIndex,
          subjectData,
        ] of mainConceptData.subjects.entries()) {
          const subject = await prisma.subject.upsert({
            where: { title: subjectData.name },
            update: {
              description: subjectData.description,
              order: subjectData.order,
            },
            create: {
              title: subjectData.name,
              description: subjectData.description,
              order: subjectData.order,
            },
          });

          await prisma.mainConceptSubject.upsert({
            where: {
              main_concept_id_subject_id: {
                main_concept_id: mainConcept.id,
                subject_id: subject.id,
              },
            },
            update: {
              order: sIndex + 1,
            },
            create: {
              main_concept_id: mainConcept.id,
              subject_id: subject.id,
              order: sIndex + 1,
            },
          });

          for (const [tIndex, topicData] of subjectData.topics.entries()) {
            const existingTopic = await prisma.topic.findFirst({
              where: {
                title: topicData.name,
                subjects: {
                  some: {
                    subject_id: subject.id,
                  },
                },
              },
            });

            const topic =
              existingTopic ||
              (await prisma.topic.create({
                data: {
                  title: topicData.name,
                  description: topicData.description,
                  order: topicData.order,
                },
              }));

            const existingSubjectTopic = await prisma.subjectTopic.findUnique({
              where: {
                subject_id_topic_id: {
                  subject_id: subject.id,
                  topic_id: topic.id,
                },
              },
            });

            if (!existingSubjectTopic) {
              await prisma.subjectTopic.create({
                data: {
                  subject_id: subject.id,
                  topic_id: topic.id,
                  order: tIndex + 1,
                },
              });
            }

            const existingRoadmapTopic = await prisma.roadmapTopic.findUnique({
              where: {
                roadmap_id_topic_id: {
                  roadmap_id: roadmap.id,
                  topic_id: topic.id,
                },
              },
            });

            if (!existingRoadmapTopic) {
              await prisma.roadmapTopic.create({
                data: {
                  roadmap_id: roadmap.id,
                  topic_id: topic.id,
                  order: tIndex + 1,
                },
              });
            }
          }
        }
      }
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seedDatabase();
