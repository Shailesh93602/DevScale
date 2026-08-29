import { Request, Response } from 'express';
import AdminDashboardRepository from '../repositories/adminDashboardRepository.js';
import RoadmapRepository from '../repositories/roadmapRepository.js';
import { catchAsync } from '../utils/catchAsync.js';
import { createAppError } from '../utils/createAppError.js';
import UserRepository from '../repositories/userRepository.js';
import SystemConfigRepository from '../repositories/systemConfigRepository.js';
import AdminAuditLogRepository from '../repositories/adminAuditLogRepository.js';
import { withAudit, recordActionBestEffort } from '../services/auditTrail.js';
import logger from '../utils/logger.js';
import { sendResponse } from '../utils/apiResponse.js';
import prisma from '../lib/prisma.js';

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

  // Roles list (for the user-management role picker)
  getRoles = catchAsync(async (_req: Request, res: Response) => {
    const roles = await prisma.role.findMany({
      select: { id: true, name: true, description: true },
      orderBy: { name: 'asc' },
    });
    sendResponse(res, 'ROLES_FETCHED', { data: roles });
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

    // BEST-EFFORT, and it says so rather than implying a guarantee it does not
    // have: updateUserRole also writes the Supabase app_metadata claim, an
    // external call that cannot join a database transaction. Since the role
    // change has already happened and cannot be rolled back, an audit failure
    // must be logged loudly rather than turned into a 500 that invites a retry.
    await recordActionBestEffort(
      {
        admin_id: req.user.id,
        action: 'UPDATE_USER_ROLE',
        entity: 'USER',
        entity_id: userId,
        details: { roleId },
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      },
      logger
    );

    sendResponse(res, 'USER_UPDATED', { data: user });
  });

  deleteUser = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;

    // ATOMIC. This is a hard delete, and it previously ran as two independent
    // writes: the delete committed, then the audit insert could throw a 500 —
    // telling the admin the deletion had failed when the user was already gone.
    // Now the pair commits together or not at all, so the 500 is TRUE and
    // retrying is safe.
    await withAudit(
      {
        admin_id: req.user.id,
        action: 'DELETE_USER',
        entity: 'USER',
        entity_id: userId,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      },
      (tx) => tx.user.delete({ where: { id: userId } })
    );

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

    // BEST-EFFORT: the write is already committed by the repository, so there
    // is nothing to roll back and failing the response would misreport it.
    await recordActionBestEffort(
      {
        admin_id: req.user.id,
        action: 'UPDATE_CONFIG',
        entity: 'SYSTEM_CONFIG',
        entity_id: key,
        details: { category, value },
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      },
      logger
    );

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

    // Previously unaudited. It is a privileged mutation, so it belongs in the
    // trail regardless of how routine it looks — an audit trail with holes in
    // it answers "did anyone do X" with "not that I recorded", which is not an
    // answer.
    await recordActionBestEffort(
      {
        admin_id: req.user.id,
        action: 'ALLOCATE_RESOURCES',
        entity: 'RESOURCE',
        entity_id: String(
          (req.body as { resourceId?: string })?.resourceId ?? 'unknown'
        ),
        details: req.body as Record<string, unknown>,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      },
      logger
    );

    sendResponse(res, 'RESOURCES_ALLOCATED', { data: allocation });
  });

  // Reporting
  generateCustomReport = catchAsync(async (req: Request, res: Response) => {
    const report = await this.adminDashboardRepo.generateCustomReport(req.body);

    // Previously unaudited. A report is read-shaped, but it is a BULK EXPORT of
    // user data — which is exactly the action a trail is asked about later
    // ("who pulled the user list, and when"). Recorded before the response is
    // written, since the CSV branch ends the response.
    await recordActionBestEffort(
      {
        admin_id: req.user.id,
        action: 'GENERATE_REPORT',
        entity: 'REPORT',
        entity_id: String((req.body as { type?: string })?.type ?? 'custom'),
        // The metric list and output format, NOT the whole body.
        //
        // auditTrail.ts states the rule and this call site was breaking it:
        // `filters` is a caller-supplied object that can name columns and
        // values, so dumping the body copied whatever an admin filtered BY —
        // an email, a name — into a table retained for a year. What a reader
        // of the trail needs is which report was pulled, and when.
        details: {
          metrics: (req.body as { metrics?: string[] })?.metrics,
          format: (req.body as { format?: string })?.format ?? 'json',
        },
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      },
      logger
    );
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

    // ATOMIC, for the same reason as deleteUser — destructive and irreversible.
    await withAudit(
      {
        admin_id: req.user.id,
        action: 'DELETE_ROADMAP',
        entity: 'ROADMAP',
        entity_id: roadmapId,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      },
      (tx) => tx.roadmap.delete({ where: { id: roadmapId } })
    );

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

    // BEST-EFFORT: the moderation write is already committed.
    await recordActionBestEffort(
      {
        admin_id: moderatorId,
        action: `MODERATION_${action.toUpperCase()}`,
        entity: 'CONTENT',
        entity_id: contentId,
        details: { reason },
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      },
      logger
    );

    sendResponse(res, 'CONTENT_MODERATED', { data: content });
  });
}
