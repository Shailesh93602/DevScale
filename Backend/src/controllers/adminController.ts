import { Request, Response } from 'express';
import AdminDashboardRepository from '../repositories/adminDashboardRepository';
import { catchAsync } from '../utils/catchAsync';
import { createAppError } from '../utils/createAppError';
import UserRepository from '@/repositories/userRepository';
import SystemConfigRepository from '@/repositories/systemConfigRepository';
import { sendResponse } from '@/utils/apiResponse';

export default class AdminController {
  private readonly adminDashboardRepo: AdminDashboardRepository;
  private readonly userRepo: UserRepository;
  private readonly systemConfigRepo: SystemConfigRepository;

  constructor() {
    this.adminDashboardRepo = new AdminDashboardRepository();
    this.userRepo = new UserRepository();
    this.systemConfigRepo = new SystemConfigRepository();
  }

  // Dashboard and Metrics
  getDashboardMetrics = catchAsync(async (req: Request, res: Response) => {
    const metrics = await this.adminDashboardRepo.getDashboardMetrics();
    sendResponse(res, 'METRICS_FETCHED', { data: metrics });
  });

  // User Management
  searchUsers = catchAsync(async (req: Request, res: Response) => {
    const users = await this.userRepo.searchUsers(req.query);
    sendResponse(res, 'USERS_FETCHED', { data: users });
  });

  updateUserRole = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { roleId } = req.body;
    const user = await this.userRepo.updateUserRole(userId, roleId);
    sendResponse(res, 'USER_UPDATED', { data: user });
  });

  // Configuration Management
  setConfig = catchAsync(async (req: Request, res: Response) => {
    const { category, key, value } = req.body;
    const config = await this.systemConfigRepo.setConfig({
      category,
      key,
      value,
    });
    sendResponse(res, 'CONFIG_UPDATED', { data: config });
  });

  getConfigsByCategory = catchAsync(async (req: Request, res: Response) => {
    const { category } = req.params;
    const configs = await this.systemConfigRepo.findFirst({
      where: { category },
    });
    sendResponse(res, 'CONFIGS_FETCHED', { data: configs });
  });

  // Resource Allocation
  allocateResources = catchAsync(async (req: Request, res: Response) => {
    const allocation = await this.adminDashboardRepo.allocateResources(
      req.body
    );
    sendResponse(res, 'RESOURCES_ALLOCATED', { data: allocation });
  });

  // Reporting
  generateCustomReport = catchAsync(async (req: Request, res: Response) => {
    const report = await this.adminDashboardRepo.generateCustomReport(req.body);
    if (req.body.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=report.csv');
      res.send(report);
    } else {
      sendResponse(res, 'REPORT_GENERATED', { data: report });
    }
  });

  // Auditing and Logging
  getSystemAuditLogs = catchAsync(async (req: Request, res: Response) => {
    const logs = await this.adminDashboardRepo.getSystemAuditLogs();
    sendResponse(res, 'AUDIT_LOGS_FETCHED', { data: logs });
  });

  // Content Moderation
  getContentModerationQueue = catchAsync(
    async (req: Request, res: Response) => {
      const queue = await this.adminDashboardRepo.getContentModerationQueue();
      sendResponse(res, 'MODERATION_QUEUE_FETCHED', { data: queue });
    }
  );

  moderateContentItem = catchAsync(async (req: Request, res: Response) => {
    const { contentId } = req.params;
    const { action, reason } = req.body;
    const moderatorId = req.user?.id;

    if (!moderatorId) {
      throw createAppError('Unauthorized: Moderator ID is required', 401);
    }

    const content = await this.adminDashboardRepo.moderateContentItem(
      contentId,
      action,
      reason,
      moderatorId
    );
    sendResponse(res, 'CONTENT_MODERATED', { data: content });
  });
}
