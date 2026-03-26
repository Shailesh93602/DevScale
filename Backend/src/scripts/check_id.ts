import prisma from '../lib/prisma';

async function main() {
  const id = '10c86f30-c94e-4139-b7ee-af69d104dfde';
  const subject = await prisma.subject.findUnique({ where: { id } });
  console.log('Subject:', subject);

  const roadmapMainConcept = await prisma.roadmapMainConcept.findUnique({
    where: { id },
  });
  console.log('RoadmapMainConcept:', roadmapMainConcept);

  const mainConceptSubject = await prisma.mainConceptSubject.findUnique({
    where: { id },
  });
  console.log('MainConceptSubject:', mainConceptSubject);

  const roadmapTopic = await prisma.roadmapTopic.findUnique({ where: { id } });
  console.log('RoadmapTopic:', roadmapTopic);

  const topic = await prisma.topic.findUnique({ where: { id } });
  console.log('Topic:', topic);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
