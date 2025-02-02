import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { catchAsync } from '../utils';

const prisma = new PrismaClient();

export const getJobs = catchAsync(async (req: Request, res: Response) => {
  const jobs = await prisma.job.findMany({
    orderBy: { created_at: 'asc' },
  });
  res.status(200).json({ success: true, jobs });
});

export const getJob = catchAsync(async (req: Request, res: Response) => {
  const jobId = req.params.id;
  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }
  res.status(200).json({ success: true, job });
});

export const createJob = catchAsync(async (req: Request, res: Response) => {
  const { title, description, company, location } = req.body;
  if (!title || !description || !company || !location) {
    return res.status(400).json({ success: false, message: 'Invalid payload' });
  }

  await prisma.job.create({
    data: { title, description, company, location },
  });
  res.status(201).json({ success: true, message: 'Job created successfully!' });
});

export const updateJob = catchAsync(async (req: Request, res: Response) => {
  const jobId = req.params.id;
  const { title, description, company, location } = req.body;

  if (!title || !description || !company || !location) {
    return res.status(400).json({ success: false, message: 'Invalid payload' });
  }

  const updatedJob = await prisma.job.update({
    where: { id: jobId },
    data: { title, description, company, location },
  });
  if (!updatedJob) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }
  res.status(200).json({ success: true, message: 'Job updated successfully!' });
});

export const deleteJob = catchAsync(async (req: Request, res: Response) => {
  const jobId = req.params.id;
  const deletedJob = await prisma.job.delete({
    where: { id: jobId },
  });
  if (!deletedJob) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }
  res.status(200).json({ success: true, message: 'Job deleted successfully!' });
});
