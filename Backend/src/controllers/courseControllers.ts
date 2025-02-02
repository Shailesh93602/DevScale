import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { catchAsync } from '../utils';

const prisma = new PrismaClient();

export const getCourses = catchAsync(async (req: Request, res: Response) => {
  const courses = await prisma.course.findMany({
    orderBy: { created_at: 'asc' },
  });
  res.status(200).json({ success: true, courses });
});

export const getCourse = catchAsync(async (req: Request, res: Response) => {
  const courseId = req.params.id;
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });
  if (!course) {
    return res
      .status(404)
      .json({ success: false, message: 'Course not found' });
  }
  res.status(200).json({ success: true, course });
});

export const enrollCourse = catchAsync(async (req: Request, res: Response) => {
  // TODO: implement this method

  // const courseId = req.params.id;
  // const userId = req.user.id;

  // const enrollment = await prisma.enrollment.findFirst({
  //   where: { userId, courseId },
  // });

  // if (enrollment) {
  //   return res
  //     .status(400)
  //     .json({ success: false, message: 'Already enrolled in this course' });
  // }

  // await prisma.enrollment.create({
  //   data: { userId, courseId },
  // });

  res
    .status(201)
    .json({ success: true, message: 'Enrolled in course successfully!' });
});
