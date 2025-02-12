import { PrismaClient, StudyGroup, GroupRole } from '@prisma/client';
import { createAppError } from '../utils/errorHandler';

const prisma = new PrismaClient();

interface StudyGroupData {
  name: string;
  description: string;
  topicId: string;
  maxMembers?: number;
  isPrivate?: boolean;
  createdBy: string;
}

export const createStudyGroup = async (
  data: StudyGroupData
): Promise<StudyGroup> => {
  try {
    return await prisma.studyGroup.create({
      data: {
        ...data,
        members: {
          create: {
            userId: data.createdBy,
            role: GroupRole.admin,
          },
        },
      },
      include: { topic: true, members: true },
    });
  } catch (error) {
    throw createAppError(
      'Failed to create study group',
      500,
      error as Record<string, unknown>
    );
  }
};

export const joinStudyGroup = async (
  groupId: string,
  userId: string,
  role: GroupRole = GroupRole.member
): Promise<void> => {
  const group = await prisma.studyGroup.findUnique({
    where: { id: groupId },
    include: { _count: { select: { members: true } } },
  });

  if (!group) throw createAppError('Study group not found', 404);
  if (group.maxMembers && group._count.members >= group.maxMembers) {
    throw createAppError('Study group is full', 400);
  }

  await prisma.studyGroupMember.create({
    data: { userId, studyGroupId: groupId, role },
  });
};

export const getStudyGroups = async (filters?: {
  topicId?: string;
  search?: string;
}): Promise<StudyGroup[]> => {
  return prisma.studyGroup.findMany({
    where: {
      topicId: filters?.topicId,
      name: filters?.search
        ? { contains: filters.search, mode: 'insensitive' }
        : undefined,
    },
    include: { topic: true, _count: { select: { members: true } } },
    orderBy: { created_at: 'desc' },
  });
};

export const getStudyGroup = async (id: string): Promise<StudyGroup> => {
  const group = await prisma.studyGroup.findUnique({
    where: { id },
    include: { topic: true, members: true },
  });

  if (!group) throw createAppError('Study group not found', 404);
  return group;
};

export const updateStudyGroup = async (
  id: string,
  data: Partial<StudyGroupData>
): Promise<StudyGroup> => {
  return prisma.studyGroup.update({
    where: { id },
    data,
    include: { topic: true, members: true },
  });
};

export const removeStudyGroupMember = async (
  groupId: string,
  userId: string
): Promise<void> => {
  await prisma.studyGroupMember.delete({
    where: { userId_studyGroupId: { userId, studyGroupId: groupId } },
  });
};

export const updateStudyGroupMemberRole = async (
  groupId: string,
  userId: string,
  role: GroupRole
): Promise<void> => {
  await prisma.studyGroupMember.update({
    where: { userId_studyGroupId: { userId, studyGroupId: groupId } },
    data: { role },
  });
};
