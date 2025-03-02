import { PrismaClient, Subject } from '@prisma/client';

const prisma = new PrismaClient();

// create a subject
export async function createSubject(data: {
  name: string;
  description: string;
  icon: string;
  color: string;
  title: string;
  order: number;
}): Promise<Subject> {
  return await prisma.subject.create({
    data,
  });
}

// get all subjects
export async function getSubjects(): Promise<Subject[]> {
  return await prisma.subject.findMany();
}

// get a subject by id
export async function getSubjectById(id: string): Promise<Subject | null> {
  return await prisma.subject.findUnique({
    where: {
      id,
    },
  });
}

// update a subject
export async function updateSubject(
  id: string,
  data: {
    name: string;
    description: string;
    icon: string;
    color: string;
    title: string;
    order: number;
  }
): Promise<Subject> {
  return await prisma.subject.update({
    where: {
      id,
    },
    data,
  });
}
