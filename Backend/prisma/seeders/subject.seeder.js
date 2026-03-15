"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const subjects_1 = require("../../resources/subjects");
const prisma = new client_1.PrismaClient();
const seedSubjects = async () => {
    try {
        console.log('Seeding subjects...');
        let order = 1;
        for (const subject of subjects_1.subjects) {
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
            }
            else {
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
    }
    catch (error) {
        console.error('Error seeding subjects:', error);
    }
    finally {
        await prisma.$disconnect();
    }
};
seedSubjects();
//# sourceMappingURL=subject.seeder.js.map