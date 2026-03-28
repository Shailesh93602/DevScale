import { Request, Response } from 'express';
import AdminDashboardRepository from '../repositories/adminDashboardRepository.js';
import RoadmapRepository from '../repositories/roadmapRepository.js';
import { catchAsync } from '../utils/catchAsync.js';
import { createAppError } from '../utils/createAppError.js';
import UserRepository from '../repositories/userRepository.js';
import SystemConfigRepository from '../repositories/systemConfigRepository.js';
import AdminAuditLogRepository from '../repositories/adminAuditLogRepository.js';
import { sendResponse } from '../utils/apiResponse.js';

export default class AdminController {
  private readonly adminDashboardRepo: AdminDashboardRepository;
  private readonly userRepo: UserRepository;
  private readonly roadmapRepo: RoadmapRepository;
  private readonly systemConfigRepo: SystemConfigRepository;
  private readonly auditLogRepo: AdminAuditLogRepository;

  constructor() {
    this.adminDashboardRepo = new AdminDashboardRepository();
    this.userRepo = new UserRepository();
    this.roadmapRepo = new RoadmapRepository();
    this.systemConfigRepo = new SystemConfigRepository();
    this.auditLogRepo = new AdminAuditLogRepository();
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

    // Audit Log
    await this.auditLogRepo.logAdminAction({
      admin_id: req.user.id,
      action: 'UPDATE_USER_ROLE',
      entity: 'USER',
      entity_id: userId,
      details: { roleId },
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    });

    sendResponse(res, 'USER_UPDATED', { data: user });
  });

  deleteUser = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    await this.userRepo.deleteUser(userId);

    // Audit Log
    await this.auditLogRepo.logAdminAction({
      admin_id: req.user.id,
      action: 'DELETE_USER',
      entity: 'USER',
      entity_id: userId,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    });

    sendResponse(res, 'USER_DELETED');
  });

  // Configuration Management
  setConfig = catchAsync(async (req: Request, res: Response) => {
    const { category, key, value } = req.body;
    const config = await this.systemConfigRepo.setConfig({
      category,
      key,
      value,
    });

    // Audit Log
    await this.auditLogRepo.logAdminAction({
      admin_id: req.user.id,
      action: 'UPDATE_CONFIG',
      entity: 'SYSTEM_CONFIG',
      entity_id: key,
      details: { category, value },
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
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

  deleteRoadmap = catchAsync(async (req: Request, res: Response) => {
    const { roadmapId } = req.params;
    await this.roadmapRepo.delete({ where: { id: roadmapId } });

    // Audit Log
    await this.auditLogRepo.logAdminAction({
      admin_id: req.user.id,
      action: 'DELETE_ROADMAP',
      entity: 'ROADMAP',
      entity_id: roadmapId,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    });

    sendResponse(res, 'ROADMAP_DELETED');
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

    // Audit Log
    await this.auditLogRepo.logAdminAction({
      admin_id: moderatorId,
      action: `MODERATION_${action.toUpperCase()}`,
      entity: 'CONTENT',
      entity_id: contentId,
      details: { reason },
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    });

    sendResponse(res, 'CONTENT_MODERATED', { data: content });
  });
}
