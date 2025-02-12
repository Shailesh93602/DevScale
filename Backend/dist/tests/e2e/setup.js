"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const testServer_1 = require("./testServer");
const prisma = new client_1.PrismaClient();
beforeAll(async () => {
    // Start test server
    await (0, testServer_1.startTestServer)();
    // Clean database
    await prisma.$executeRaw `TRUNCATE TABLE "User" CASCADE`;
    await prisma.$executeRaw `TRUNCATE TABLE "Article" CASCADE`;
    await prisma.$executeRaw `TRUNCATE TABLE "Challenge" CASCADE`;
    // Seed test data
    await seedTestData();
});
afterAll(async () => {
    await prisma.$disconnect();
});
async function seedTestData() {
    // Create test users
    await prisma.user.createMany({
        data: [
            {
                id: 'test-user-1',
                email: 'test1@example.com',
                username: 'testuser1',
            },
            {
                id: 'test-user-2',
                email: 'test2@example.com',
                username: 'testuser2',
            },
        ],
    });
    // Create test content
    await prisma.article.createMany({
        data: [
            {
                id: 'test-article-1',
                title: 'Test Article 1',
                content: 'Test content 1',
                authorId: 'test-user-1',
            },
        ],
    });
}
//# sourceMappingURL=setup.js.map