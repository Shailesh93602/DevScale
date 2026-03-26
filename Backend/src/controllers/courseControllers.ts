import { Request, Response } from 'express';
import { catchAsync } from '../utils';
import { sendResponse } from '../utils/apiResponse';

import prisma from '@/lib/prisma';

export default class CourseController {
  public getCourses = catchAsync(async (req: Request, res: Response) => {
    const courses = await prisma.course.findMany({
      orderBy: { created_at: 'asc' },
    });
    return sendResponse(res, 'COURSES_FETCHED', { data: { courses } });
  });

  public getCourse = catchAsync(async (req: Request, res: Response) => {
    const courseId = req.params.id;
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return sendResponse(res, 'COURSE_NOT_FOUND');
    }

    return sendResponse(res, 'COURSE_FETCHED', { data: { course } });
  });

  public enrollCourse = catchAsync(async (req: Request, res: Response) => {
    const { id: courseId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return sendResponse(res, 'UNAUTHORIZED');
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return sendResponse(res, 'COURSE_NOT_FOUND');
    }

    // Create or find enrollment
    const enrollment = await prisma.courseEnrollment.upsert({
      where: {
        user_id_course_id: {
          user_id: userId,
          course_id: courseId,
        },
      },
      update: {}, // If already enrolled, do nothing
      create: {
        user_id: userId,
        course_id: courseId,
      },
    });

    return sendResponse(res, 'COURSE_ENROLLED', { data: { enrollment } });
  });
}
