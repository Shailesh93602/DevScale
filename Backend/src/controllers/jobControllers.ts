import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { catchAsync } from '../utils';
import { sendResponse } from '../utils/apiResponse';

const prisma = new PrismaClient();

export const getJobs = catchAsync(async (req: Request, res: Response) => {
  const jobs = await prisma.job.findMany({
    orderBy: { created_at: 'asc' },
  });
  return sendResponse(res, 'JOBS_FETCHED', { data: { jobs } });
});

export const getJob = catchAsync(async (req: Request, res: Response) => {
  const jobId = req.params.id;
  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    return sendResponse(res, 'JOB_NOT_FOUND');
  }

  return sendResponse(res, 'JOB_FETCHED', { data: { job } });
});

export const createJob = catchAsync(async (req: Request, res: Response) => {
  const { title, description, company, location } = req.body;

  if (!title || !description || !company || !location) {
    return sendResponse(res, 'INVALID_PAYLOAD');
  }

  const job = await prisma.job.create({
    data: { title, description, company, location },
  });

  return sendResponse(res, 'JOB_CREATED', { data: { job } });
});

export const updateJob = catchAsync(async (req: Request, res: Response) => {
  const jobId = req.params.id;
  const { title, description, company, location } = req.body;

  if (!title || !description || !company || !location) {
    return sendResponse(res, 'INVALID_PAYLOAD');
  }

  const updatedJob = await prisma.job.update({
    where: { id: jobId },
    data: { title, description, company, location },
  });

  if (!updatedJob) {
    return sendResponse(res, 'JOB_NOT_FOUND');
  }

  return sendResponse(res, 'JOB_UPDATED', { data: { job: updatedJob } });
});

export const deleteJob = catchAsync(async (req: Request, res: Response) => {
  const jobId = req.params.id;
  const deletedJob = await prisma.job.delete({
    where: { id: jobId },
  });

  if (!deletedJob) {
    return sendResponse(res, 'JOB_NOT_FOUND');
  }

  return sendResponse(res, 'JOB_DELETED');
});
