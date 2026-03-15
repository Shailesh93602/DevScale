const { PrismaClient } = require('@prisma/client');

async function main() {
    const prisma = new PrismaClient();
    const id = '10c86f30-c94e-4139-b7ee-af69d104dfde';
    console.log('--- Subject ---')
    console.log(await prisma.subject.findUnique({ where: { id } }));
    console.log('--- RoadmapMainConcept ---')
    console.log(await prisma.roadmapMainConcept.findUnique({ where: { id } }));
    console.log('--- MainConceptSubject ---')
    console.log(await prisma.mainConceptSubject.findUnique({ where: { id } }));
    console.log('--- RoadmapTopic ---')
    console.log(await prisma.roadmapTopic.findUnique({ where: { id } }));
    console.log('--- Topic ---')
    console.log(await prisma.topic.findUnique({ where: { id } }));

    await prisma.$disconnect();
}

main().catch(console.error);
