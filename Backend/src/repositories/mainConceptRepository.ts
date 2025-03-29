import { Prisma, MainConcept, PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository';

const prisma = new PrismaClient();

export class MainConceptRepository extends BaseRepository<
  PrismaClient['mainConcept']
> {
  constructor() {
    super(prisma.mainConcept);
  }

  async getMainConceptWithSubjects(id: string): Promise<MainConcept | null> {
    return this.findUnique({
      where: { id },
      include: {
        subjects: {
          include: {
            subject: true,
          },
        },
      },
    });
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
