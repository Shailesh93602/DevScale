import { PrismaClient, Job, JobType } from '@prisma/client';
import { createAppError } from '../utils/errorHandler';

const prisma = new PrismaClient();

interface JobData {
  title: string;
  description: string;
  company: string;
  location?: string;
  salary?: number;
  job_type?: JobType;
  posted_date?: Date;
  application_deadline?: Date;
}

export const createJob = async (data: JobData): Promise<Job> => {
  return prisma.job.create({
    data: {
      ...data,
      posted_date: data.posted_date || new Date(),
    },
  });
};

export const updateJob = async (
  id: string,
  data: Partial<JobData>
): Promise<Job> => {
  return prisma.job.update({
    where: { id },
    data,
  });
};

export const getJob = async (id: string): Promise<Job> => {
  const job = await prisma.job.findUnique({
    where: { id },
  });

  if (!job) {
    throw createAppError('Job not found', 404);
  }

  return job;
};

export const getJobs = async (filters?: {
  job_type?: JobType;
  location?: string;
  min_salary?: number;
  search?: string;
}) => {
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
};

export const deleteJob = async (id: string): Promise<void> => {
  await prisma.job.delete({
    where: { id },
  });
};
