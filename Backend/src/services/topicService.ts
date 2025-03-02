import { PrismaClient, SubjectTopic, Topic } from '@prisma/client';

const prisma = new PrismaClient();

export async function createTopic(data: {
  title: string;
  description: string;
  order: number;
}): Promise<Topic> {
  return await prisma.topic.create({
    data,
  });
}

export async function getTopics(): Promise<Topic[]> {
  return await prisma.topic.findMany();
}

export async function getTopicById(id: string): Promise<Topic | null> {
  return await prisma.topic.findUnique({
    where: {
      id,
    },
  });
}

export async function updateTopic(
  id: string,
  data: {
    title: string;
    description: string;
    order: number;
  }
): Promise<Topic> {
  return await prisma.topic.update({
    where: {
      id,
    },
    data,
  });
}

// get topics by subject id
export async function getTopicsBySubjectId(
  subject_id: string
): Promise<SubjectTopic[]> {
  return await prisma.subjectTopic.findMany({
    where: {
      subject_id,
    },
    select: {
      id: true,
      order: true,
      created_at: true,
      subject_id: true,
      topic_id: true,
      topic: {
        select: {
          id: true,
          title: true,
          description: true,
        },
      },
    },
  });
}

export async function deleteTopic(id: string): Promise<void> {
  await prisma.topic.delete({
    where: {
      id,
    },
  });
}

// get all topics that are not associated with any subject
export async function getTopicsWithoutSubject(): Promise<Topic[]> {
  return await prisma.topic.findMany({
    where: {
      subjects: {
        none: {},
      },
    },
  });
}
