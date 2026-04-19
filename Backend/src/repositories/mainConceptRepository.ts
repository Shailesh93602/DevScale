import { Prisma, MainConcept } from '@prisma/client';
import BaseRepository from './baseRepository.js';

import prisma from '../lib/prisma.js';

export class MainConceptRepository extends BaseRepository<
  MainConcept,
  typeof prisma.mainConcept
> {
  constructor() {
    super(prisma.mainConcept);
  }

  async getMainConceptWithSubjects(
    id: string
  ): Promise<Prisma.MainConceptGetPayload<{
    include: { subjects: { include: { subject: true } } };
  }> | null> {
    const result = await this.findUnique({
      where: { id },
      include: {
        subjects: {
          include: {
            subject: true,
          },
        },
      },
    });
    return result as Prisma.MainConceptGetPayload<{
      include: { subjects: { include: { subject: true } } };
    }> | null;
  }

  async createWithSubjects(
    data: Omit<Prisma.MainConceptCreateInput, 'subjects'> & {
      subjectId: string;
    }
  ): Promise<MainConcept> {
    const { subjectId, ...mainConceptData } = data;
    return this.create({
      data: {
        ...mainConceptData,
        subjects: {
          create: {
            order: 1,
            subject: {
              connect: { id: subjectId },
            },
          },
        },
      },
    });
  }

  async getMainConceptById(id: string): Promise<MainConcept | null> {
    return this.findUnique({
      where: { id },
      include: { subjects: true },
    });
  }

  async updateMainConcept(
    id: string,
    data: Prisma.MainConceptUpdateInput
  ): Promise<MainConcept> {
    return this.update({ where: { id }, data });
  }

  async deleteMainConcept(id: string): Promise<MainConcept> {
    return this.delete({ where: { id } });
  }
}
