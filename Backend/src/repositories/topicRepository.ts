import { Topic } from '@prisma/client';
import BaseRepository from './baseRepository.js';

import prisma from '../lib/prisma.js';

export default class TopicRepository extends BaseRepository< Topic, typeof prisma.topic > {
  constructor() {
    super(prisma.topic);
  }

  async getTopicsBySubjectId(subject_id: string) {
    return await this.findMany({
      where: {
        subjects: {
          some: {
            subject_id,
          },
        },
      },
      select: {
        id: true,
        order: true,
        title: true,
        description: true,
        created_at: true,
        subjects: {
          select: {
            subject_id: true,
            subject: true,
          },
        },
      },
    });
  }

  async getTopicsWithoutSubject(): Promise<Topic[]> {
    return await this.findMany({
      where: {
        subjects: {
          none: {},
        },
      },
    });
  }
}
