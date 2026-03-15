"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./../../src/constants");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const features = [
    {
        name: constants_1.FeatureEnum.USER,
        description: 'User registration, authentication, and profile management',
    },
];
const seedFeatures = async () => {
    try {
        for (const feature of features) {
            await prisma.feature.upsert({
                where: { name: feature.name },
                update: { description: feature.description },
                create: feature,
            });
        }
        console.log(`Seeded ${features.length} features`);
    }
    catch (error) {
        console.error('Error seeding features:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
};
seedFeatures();
//# sourceMappingURL=feature.seeder.js.map