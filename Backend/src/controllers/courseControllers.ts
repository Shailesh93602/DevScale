import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { catchAsync } from '../utils';
import { sendResponse } from '../utils/apiResponse';

const prisma = new PrismaClient();

export const getCourses = catchAsync(async (req: Request, res: Response) => {
  const courses = await prisma.course.findMany({
    orderBy: { created_at: 'asc' },
  });
  return sendResponse(res, 'COURSES_FETCHED', { data: { courses } });
});

export const getCourse = catchAsync(async (req: Request, res: Response) => {
  const courseId = req.params.id;
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    return sendResponse(res, 'COURSE_NOT_FOUND');
  }

  return sendResponse(res, 'COURSE_FETCHED', { data: { course } });
});

export const enrollCourse = catchAsync(async (req: Request, res: Response) => {
  // TODO: implement this method
  // const courseId = req.params.id;
  // const userId = req.user.id;

  // const enrollment = await prisma.enrollment.findFirst({
  //   where: { userId, courseId },
  // });

  // if (enrollment) {
  //   return sendResponse(res, 'COURSE_ALREADY_ENROLLED');
  // }

  // await prisma.enrollment.create({
  //   data: { userId, courseId },
  // });

  return sendResponse(res, 'COURSE_ENROLLED');
});
