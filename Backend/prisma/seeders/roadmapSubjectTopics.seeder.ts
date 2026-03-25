import { PrismaClient } from '@prisma/client';
import { roadmapCategories, roadmaps } from '../../resources/roadmaps/roadmap';

const prisma = new PrismaClient();
const admin = 'shailesh@EduScales.com';

const seedDatabase = async () => {
  try {
    await prisma.$transaction(async (prismaTransaction) => {
      const user = await prismaTransaction.user.findFirst({
        where: { email: admin },
      });

      if (!user) {
        throw new Error('Admin user not found');
      }

      // seed roadmap categories
      for (const category of roadmapCategories) {
        await prismaTransaction.roadmapCategory.upsert({
          where: { name: category },
          update: {},
          create: {
            name: category,
          },
        });
      }

      for (const roadmapData of roadmaps) {
        // Create or update roadmap
        const roadmap = await prismaTransaction.roadmap.upsert({
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
          // Create or update main concept
          const mainConcept = await prismaTransaction.mainConcept.upsert({
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

          // Connect main concept to roadmap
          await prismaTransaction.roadmapMainConcept.upsert({
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
            // Create or update subject
            const subject = await prismaTransaction.subject.upsert({
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

            // Connect subject to main concept
            await prismaTransaction.mainConceptSubject.upsert({
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
              // Find existing topic for this subject
              const existingTopic = await prismaTransaction.topic.findFirst({
                where: {
                  title: topicData.name,
                  subjects: {
                    some: {
                      subject_id: subject.id,
                    },
                  },
                },
              });

              // Create new topic or use existing one
              const topic =
                existingTopic ||
                (await prismaTransaction.topic.create({
                  data: {
                    title: topicData.name,
                    description: topicData.description,
                    order: topicData.order,
                  },
                }));

              // Connect topic to subject if not already connected
              const existingSubjectTopic =
                await prismaTransaction.subjectTopic.findUnique({
                  where: {
                    subject_id_topic_id: {
                      subject_id: subject.id,
                      topic_id: topic.id,
                    },
                  },
                });

              if (!existingSubjectTopic) {
                await prismaTransaction.subjectTopic.create({
                  data: {
                    subject_id: subject.id,
                    topic_id: topic.id,
                    order: tIndex + 1,
                  },
                });
              }

              // Connect topic to roadmap if not already connected
              const existingRoadmapTopic =
                await prismaTransaction.roadmapTopic.findUnique({
                  where: {
                    roadmap_id_topic_id: {
                      roadmap_id: roadmap.id,
                      topic_id: topic.id,
                    },
                  },
                });

              if (!existingRoadmapTopic) {
                await prismaTransaction.roadmapTopic.create({
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
    });

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seedDatabase();
