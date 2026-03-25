import { Request, Response } from 'express';
import { catchAsync } from '../utils';
import { sendResponse } from '../utils/apiResponse';
import JobRepository from '@/repositories/jobRepository';

export default class JobController {
  private readonly jobRepo: JobRepository;
  constructor() {
    this.jobRepo = new JobRepository();
  }

  public getJobs = catchAsync(async (req: Request, res: Response) => {
    const jobs = await this.jobRepo.findMany({
      orderBy: { created_at: 'asc' },
    });
    return sendResponse(res, 'JOBS_FETCHED', { data: { jobs } });
  });

  public getJob = catchAsync(async (req: Request, res: Response) => {
    const jobId = req.params.id;
    const job = await this.jobRepo.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return sendResponse(res, 'JOB_NOT_FOUND');
    }

    return sendResponse(res, 'JOB_FETCHED', { data: { job } });
  });

  public createJob = catchAsync(async (req: Request, res: Response) => {
    const { title, description, company, location } = req.body;

    if (!title || !description || !company || !location) {
      return sendResponse(res, 'INVALID_PAYLOAD');
    }

    const job = await this.jobRepo.create({
      data: { title, description, company, location },
    });

    return sendResponse(res, 'JOB_CREATED', { data: { job } });
  });

  public updateJob = catchAsync(async (req: Request, res: Response) => {
    const jobId = req.params.id;
    const { title, description, company, location } = req.body;

    if (!title || !description || !company || !location) {
      return sendResponse(res, 'INVALID_PAYLOAD');
    }

    const updatedJob = await this.jobRepo.update({
      where: { id: jobId },
      data: { title, description, company, location },
    });

    if (!updatedJob) {
      return sendResponse(res, 'JOB_NOT_FOUND');
    }

    return sendResponse(res, 'JOB_UPDATED', { data: { job: updatedJob } });
  });

  public deleteJob = catchAsync(async (req: Request, res: Response) => {
    const jobId = req.params.id;
    const deletedJob = await this.jobRepo.delete({
      where: { id: jobId },
    });

    if (!deletedJob) {
      return sendResponse(res, 'JOB_NOT_FOUND');
    }

    return sendResponse(res, 'JOB_DELETED');
  });
}
