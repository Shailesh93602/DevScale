import { PrismaClient } from '@prisma/client';
import { roadmaps } from '../../resources/roadmaps';

const prisma = new PrismaClient();

const seedRoadMaps = async () => {
  try {
    for (const roadmapData of roadmaps) {
      const roadmap = await prisma.roadMap.upsert({
        where: { title: roadmapData.title },
        update: { description: roadmapData.description },
        create: {
          title: roadmapData.title,
          description: roadmapData.description,
        },
      });

      for (const subjectName of roadmapData.subjects) {
        const subject = await prisma.subject.upsert({
          where: { name: subjectName },
          update: { description: `${subjectName} description` },
          create: {
            name: subjectName,
            description: `${subjectName} description`,
          },
        });

        await prisma.roadMapSubject.upsert({
          where: {
            roadMapId_subjectId: {
              roadMapId: roadmap.id,
              subjectId: subject.id,
            },
          },
          update: {},
          create: {
            roadMapId: roadmap.id,
            subjectId: subject.id,
          },
        });
      }
    }

    console.log('Roadmaps and subjects seeded successfully');
  } catch (error) {
    console.error('Error seeding roadmaps and subjects:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seedRoadMaps();
