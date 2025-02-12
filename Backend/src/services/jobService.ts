import { PrismaClient, Job, JobType } from '@prisma/client';
import { createAppError } from '../utils/errorHandler';

const prisma = new PrismaClient();

interface JobData {
  title: string;
  description: string;
  company: string;
  location?: string;
  salary?: number;
  jobType?: JobType;
  postedDate?: Date;
  applicationDeadline?: Date;
}

export const createJob = async (data: JobData): Promise<Job> => {
  return prisma.job.create({
    data: {
      ...data,
      postedDate: data.postedDate || new Date(),
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
  jobType?: JobType;
  location?: string;
  minSalary?: number;
  search?: string;
}) => {
  return prisma.job.findMany({
    where: {
      jobType: filters?.jobType,
      location: filters?.location
        ? { contains: filters.location, mode: 'insensitive' }
        : undefined,
      salary: filters?.minSalary ? { gte: filters.minSalary } : undefined,
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
      postedDate: 'desc',
    },
  });
};

export const deleteJob = async (id: string): Promise<void> => {
  await prisma.job.delete({
    where: { id },
  });
};
