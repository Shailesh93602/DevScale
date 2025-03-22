import { createAppError } from './../utils/errorHandler';
import { Request, Response, RequestHandler } from 'express';
import { catchAsync } from '../utils';
import {
  getUserAnalytics,
  getPlatformAnalytics,
  generateReport,
} from '../services/analyticsService';
import { sendResponse } from '../utils/apiResponse';

export const getUserAnalyticsController = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const analyticsData = await getUserAnalytics(userId);
    sendResponse(res, 'USER_ANALYTICS_FETCHED', { data: analyticsData });
  }
);

export const getCurrentUserAnalyticsController = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const analyticsData = await getUserAnalytics(userId);
    sendResponse(res, 'USER_ANALYTICS_FETCHED', { data: analyticsData });
  }
);

export const getPlatformAnalyticsController: RequestHandler = async (
  req,
  res
) => {
  try {
    const { startDate, endDate } = validateDateRange(
      req.query.startDate?.toString(),
      req.query.endDate?.toString()
    );

    const analytics = await getPlatformAnalytics(startDate, endDate);
    sendResponse(res, 'PLATFORM_ANALYTICS_FETCHED', { data: analytics });
  } catch (error) {
    createAppError(error as string, 500);
  }
};

// Add validation helper
const validateDateRange = (start?: string, end?: string) => {
  const startDate = start ? new Date(start) : undefined;
  const endDate = end ? new Date(end) : undefined;

  if (
    (startDate && isNaN(startDate.getTime())) ||
    (endDate && isNaN(endDate.getTime()))
  ) {
    throw createAppError('Invalid date format', 400);
  }

  return { startDate, endDate };
};

export const generateReportController = catchAsync(
  async (req: Request, res: Response) => {
    const reportData = await generateReport('user', req.params.userId);
    sendResponse(res, 'REPORT_FETCHED', { data: reportData });
  }
);
