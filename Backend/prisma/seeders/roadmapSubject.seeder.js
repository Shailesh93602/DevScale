"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const roadmapSubjects_1 = require("../../resources/roadmapSubjects");
const prisma = new client_1.PrismaClient();
const seedRoadMapSubjects = async () => {
    try {
        for (const roadmapSubject of roadmapSubjects_1.roadmapSubjects) {
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
    }
    catch (error) {
        console.error('Error seeding RoadMapSubjects:', error);
    }
    finally {
        await prisma.$disconnect();
    }
};
seedRoadMapSubjects();
//# sourceMappingURL=roadmapSubject.seeder.js.map