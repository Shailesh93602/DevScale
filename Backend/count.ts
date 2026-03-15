import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const roadmaps = await prisma.roadmap.count();
    const topics = await prisma.topic.count();
    const articles = await prisma.article.count();
    console.log(`✅ Seeded Data -> Roadmaps: ${roadmaps}, Topics: ${topics}, Articles: ${articles}`);
    process.exit(0);
}
check();
