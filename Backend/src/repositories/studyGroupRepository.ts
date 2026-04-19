import { StudyGroup, GroupRole } from '@prisma/client';
import { createAppError } from '../utils/errorHandler.js';
import BaseRepository from './baseRepository.js';

import prisma from '../lib/prisma.js';

export default class StudyGroupRepository extends BaseRepository<
  StudyGroup,
  typeof prisma.studyGroup
> {
  constructor() {
    super(prisma.studyGroup);
  }

  async join(
    groupId: string,
    userId: string,
    role: GroupRole = GroupRole.member
  ): Promise<void> {
    const group = (await this.findUnique({
      where: { id: groupId },
      include: { _count: { select: { members: true } } },
    })) as StudyGroup & { _count: { members: number } };

    if (!group) throw createAppError('Study group not found', 404);
    if (group.max_members && group._count.members >= group.max_members) {
      throw createAppError('Study group is full', 400);
    }

    await prisma.studyGroupMember.create({
      data: { user_id: userId, study_group_id: groupId, role },
    });
  }

  async getAll(filters?: {
    topic_id?: string;
    search?: string;
  }): Promise<StudyGroup[]> {
    return this.findMany({
      where: {
        topic_id: filters?.topic_id,
        name: filters?.search
          ? { contains: filters.search, mode: 'insensitive' }
          : undefined,
      },
      include: { topic: true, _count: { select: { members: true } } },
      orderBy: { created_at: 'desc' },
    });
  }

  async getById(id: string): Promise<StudyGroup> {
    const group = await this.findUnique({
      where: { id },
      include: { topic: true, members: true },
    });

    if (!group) throw createAppError('Study group not found', 404);
    return group;
  }

  async removeMember(groupId: string, userId: string): Promise<void> {
    await prisma.studyGroupMember.delete({
      where: {
        user_id_study_group_id: { user_id: userId, study_group_id: groupId },
      },
    });
  }

  async updateMemberRole(
    groupId: string,
    userId: string,
    role: GroupRole
  ): Promise<void> {
    await prisma.studyGroupMember.update({
      where: {
        user_id_study_group_id: { user_id: userId, study_group_id: groupId },
      },
      data: { role },
    });
  }
}
