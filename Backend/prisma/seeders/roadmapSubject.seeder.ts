import { PrismaClient } from '@prisma/client';
import { roadmapSubjects } from '../../resources/roadmapSubjects';

const prisma = new PrismaClient();

const seedRoadMapSubjects = async () => {
  try {
    for (const roadmapSubject of roadmapSubjects) {
      const roadmap = await prisma.roadMap.findUnique({
        where: { title: roadmapSubject.roadmapTitle },
      });

      if (roadmap) {
        for (const subjectName of roadmapSubject.subjectNames) {
          const subject = await prisma.subject.findUnique({
            where: { name: subjectName },
          });

          if (subject) {
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
      }
    }

    console.log('RoadMapSubjects seeded successfully');
  } catch (error) {
    console.error('Error seeding RoadMapSubjects:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seedRoadMapSubjects();
