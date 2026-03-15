const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  const id = '10c86f30-c94e-4139-b7ee-af69d104dfde';
  console.log('--- SubjectTopic ---')
  console.log(await prisma.subjectTopic.findUnique({ where: { id: {subject_id: 'some_id', topic_id: 'some_id'} } }).catch(() => null));
  console.log('--- Checking Any Topics by that id ---')
  console.log(await prisma.topic.findUnique({ where: { id } }));
  console.log('--- Checking Subject by that id ---')
  console.log(await prisma.subject.findUnique({ where: { id } }));
  
  await prisma.$disconnect();
}

main().catch(console.error);
