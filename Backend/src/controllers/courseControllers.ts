import { Request, Response } from 'express';
import { catchAsync } from '../utils';
import { sendResponse } from '../utils/apiResponse';

import prisma from '../lib/prisma';

export default class CourseController {
  public getCourses = catchAsync(async (req: Request, res: Response) => {
    const courses = await prisma.course.findMany({
      orderBy: { created_at: 'asc' },
    });
    return sendResponse(res, 'COURSES_FETCHED', { data: courses });
  });

  public getCourse = catchAsync(async (req: Request, res: Response) => {
    const courseId = req.params.id;
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return sendResponse(res, 'COURSE_NOT_FOUND');
    }

    return sendResponse(res, 'COURSE_FETCHED', { data: course });
  });

  public enrollCourse = catchAsync(async (req: Request, res: Response) => {
    const courseId = req.params.id;
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

    // Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        user_id_course_id: {
          user_id: userId,
          course_id: courseId,
        },
      },
    });

    if (existingEnrollment) {
      return sendResponse(res, 'COURSE_ALREADY_ENROLLED', {
        data: existingEnrollment,
      });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        user_id: userId,
        course_id: courseId,
        status: 'ENROLLED',
        progress: 0,
      },
    });

    return sendResponse(res, 'COURSE_ENROLLED', {
      data: enrollment,
    });
  });

  public getUserEnrollments = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user?.id;

      if (!userId) {
        return sendResponse(res, 'UNAUTHORIZED');
      }

      const enrollments = await prisma.enrollment.findMany({
        where: { user_id: userId },
        include: {
          course: true,
        },
        orderBy: { enrollment_date: 'desc' },
      });

      return sendResponse(res, 'ENROLLMENTS_FETCHED', {
        data: enrollments,
      });
    }
  );

  public updateEnrollmentProgress = catchAsync(
    async (req: Request, res: Response) => {
      const enrollmentId = req.params.enrollmentId;
      const { progress } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return sendResponse(res, 'UNAUTHORIZED');
      }

      const enrollment = await prisma.enrollment.findFirst({
        where: {
          id: enrollmentId,
          user_id: userId,
        },
      });

      if (!enrollment) {
        return sendResponse(res, 'ENROLLMENT_NOT_FOUND');
      }

      const status = progress >= 100 ? 'COMPLETED' : 'IN_PROGRESS';
      const completionDate =
        progress >= 100 ? new Date() : enrollment.completion_date;

      const updatedEnrollment = await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          progress,
          status,
          completion_date: completionDate,
        },
      });

      return sendResponse(res, 'ENROLLMENT_UPDATED', {
        data: updatedEnrollment,
      });
    }
  );
}
