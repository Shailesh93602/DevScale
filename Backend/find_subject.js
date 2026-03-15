const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  const id = '10c86f30-c94e-4139-b7ee-af69d104dfde';
  
  const mcs = await prisma.mainConceptSubject.findUnique({
    where: { id },
    include: {
      subject: true
    }
  });
  
  if (mcs) {
    console.log("Original ID in DB:", mcs.id);
    console.log("Actual Subject ID:", mcs.subject.id);
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
