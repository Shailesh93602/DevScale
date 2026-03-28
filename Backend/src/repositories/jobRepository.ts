import { PrismaClient, JobType } from '@prisma/client';
import BaseRepository from './baseRepository.js';

import prisma from '../lib/prisma.js';

export default class JobRepository extends BaseRepository< Job, typeof prisma.job > {
  constructor() {
    super(prisma.job);
  }

  async getAll(filters?: {
    job_type?: JobType;
    location?: string;
    min_salary?: number;
    search?: string;
  }) {
    return prisma.job.findMany({
      where: {
        job_type: filters?.job_type,
        location: filters?.location
          ? { contains: filters.location, mode: 'insensitive' }
          : undefined,
        salary: filters?.min_salary ? { gte: filters.min_salary } : undefined,
        OR: filters?.search
          ? [
              { title: { contains: filters.search, mode: 'insensitive' } },
              { company: { contains: filters.search, mode: 'insensitive' } },
              {
                description: { contains: filters.search, mode: 'insensitive' },
              },
            ]
          : undefined,
      },
      orderBy: {
        posted_date: 'desc',
      },
    });
  }
}
