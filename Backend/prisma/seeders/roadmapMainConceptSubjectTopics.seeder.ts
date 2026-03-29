import { PrismaClient } from '@prisma/client';
import { roadmapCategories, roadmaps, RoadmapData } from '../../resources/roadmaps/roadmap';

const prisma = new PrismaClient();
const admin = 'admin@eduscale.io';

const seedDatabase = async () => {
  try {
    console.log('Starting seed process for Roadmaps...');
    const user = await prisma.user.findFirst({
      where: { email: admin },
    });

    if (!user) {
      throw new Error('Admin user not found');
    }

    const categoriesMap = new Map<string, string>();
    for (const category of roadmapCategories) {
      const dbCategory = await prisma.roadmapCategory.upsert({
        where: { name: category },
        update: {},
        create: {
          name: category,
        },
      });
      categoriesMap.set(category, dbCategory.id);
    }

    const categoriesWithRoadmaps = new Set<string>();

    // Cache to avoid slow repeated searches
    const existingSubjectTopics = await prisma.subjectTopic.findMany({
      include: { topic: true }
    });

    const topicCache = new Map<string, (typeof existingSubjectTopics)[number]['topic']>();
    for (const st of existingSubjectTopics) {
      topicCache.set(`${st.subject_id}_${st.topic.title}`, st.topic);
    }

    const seedRoadmapData = async (roadmapData: RoadmapData, categoryName: string) => {
      const category_id = categoriesMap.get(categoryName);

      console.log(`- Upserting roadmap: ${roadmapData.title}`);
      const roadmap = await prisma.roadmap.upsert({
        where: { title: roadmapData.title },
        update: {
          tags: roadmapData.tags,
          description: roadmapData.description,
          category_id,
          is_public: true,
          popularity: 200,
        },
        create: {
          title: roadmapData.title,
          description: roadmapData.description,
          user_id: user.id,
          tags: roadmapData.tags,
          category_id,
          is_public: true,
          popularity: 200,
        },
      });

      for (const [mcIndex, mainConceptData] of roadmapData.mainConcepts.entries()) {
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

        for (const [sIndex, subjectData] of mainConceptData.subjects.entries()) {
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

          // Insert all topics for this subject sequentially to avoid connection pool exhaustion
          for (let tIndex = 0; tIndex < subjectData.topics.length; tIndex++) {
            const topicData = subjectData.topics[tIndex];
            const cacheKey = `${subject.id}_${topicData.name}`;
            let topic = topicCache.get(cacheKey);

            if (!topic) {
              topic = await prisma.topic.create({
                data: {
                  title: topicData.name,
                  description: topicData.description,
                  order: topicData.order,
                },
              });
              topicCache.set(cacheKey, topic);
            }

            await prisma.subjectTopic.upsert({
              where: {
                subject_id_topic_id: {
                  subject_id: subject.id,
                  topic_id: topic.id,
                },
              },
              update: { order: tIndex + 1 },
              create: {
                subject_id: subject.id,
                topic_id: topic.id,
                order: tIndex + 1,
              },
            });

            await prisma.roadmapTopic.upsert({
              where: {
                roadmap_id_topic_id: {
                  roadmap_id: roadmap.id,
                  topic_id: topic.id,
                },
              },
              update: { order: tIndex + 1 },
              create: {
                roadmap_id: roadmap.id,
                topic_id: topic.id,
                order: tIndex + 1,
              },
            });
          }
        }
      }
    };

    // Seed ALL existing roadmaps completely
    for (const roadmapData of roadmaps) {
      let matchedCategory = roadmapCategories.find((c) => roadmapData.tags.includes(c)) || roadmapCategories[0];
      // Workaround for 'Full Stack Web Development' -> FullStack
      if (roadmapData.title.toLowerCase().includes('data science')) {
        matchedCategory = 'DataAnalysis';
      }
      categoriesWithRoadmaps.add(matchedCategory);
      console.log(`Seeding roadmap: ${roadmapData.title} with category ${matchedCategory}`);
      await seedRoadmapData(roadmapData, matchedCategory);
    }

    // Seed dummies for missing categories
    for (const category of roadmapCategories) {
      if (!categoriesWithRoadmaps.has(category)) {
        const dummyRoadmap: RoadmapData = {
          title: `${category} Developer Masterclass`,
          description: `Comprehensive guide and roadmap for mastering ${category}.`,
          tags: category,
          mainConcepts: [
            {
              name: `Introduction to ${category}`,
              description: `Basic fundamentals of ${category} development.`,
              order: 1,
              subjects: [
                {
                  name: `${category} Basics`,
                  description: `Core concepts of ${category}.`,
                  order: 1,
                  topics: [
                    {
                      name: `Getting Started with ${category}`,
                      description: `Setting up your environment for ${category}.`,
                      order: 1,
                    },
                    {
                      name: `First project in ${category}`,
                      description: `Build your "Hello World" in ${category}.`,
                      order: 2,
                    }
                  ]
                }
              ]
            },
            {
              name: `Advanced ${category}`,
              description: `Advanced topics in ${category} development.`,
              order: 2,
              subjects: [
                {
                  name: `${category} Architecture`,
                  description: `Building scalable apps in ${category}.`,
                  order: 1,
                  topics: [
                    {
                      name: `Design Patterns in ${category}`,
                      description: `Common patterns and practices.`,
                      order: 1,
                    },
                    {
                      name: `Performance Tuning in ${category}`,
                      description: `Optimize your ${category} applications.`,
                      order: 2,
                    }
                  ]
                }
              ]
            }
          ]
        };

        categoriesWithRoadmaps.add(category);
        await seedRoadmapData(dummyRoadmap, category);
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
