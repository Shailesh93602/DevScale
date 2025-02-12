import { Request, Response } from 'express';
import {
  getDashboardMetrics,
  searchUsers,
  updateUserRole,
} from '../services/adminDashboardService';
import {
  getPendingContent,
  moderateContent as moderateContentService,
} from '../services/contentModerationService';
import {
  setConfig,
  getConfigsByCategory as getConfigsByCategoryService,
} from '../services/systemConfigService';
import { allocateResources as allocateResourcesService } from '../services/adminResourceService';
import { generateCustomReport } from '../services/adminReportingService';
import { getAdminAuditLogs } from '../services/auditService';
import { validateRequest } from '../middlewares/validateRequest';
import {
  userSearchSchema,
  configUpdateSchema,
  resourceAllocationSchema,
  reportConfigSchema,
} from '../validators/adminValidators';
import { catchAsync } from '../utils';

// Dashboard Controllers
export const getDashboardMetricsHandler = catchAsync(
  async (req: Request, res: Response) => {
    const metrics = await getDashboardMetrics();
    res.json({ success: true, data: metrics });
  }
);

// User Management Controllers
export const searchUsersController = catchAsync(
  async (req: Request, res: Response) => {
    validateRequest(userSearchSchema, 'query');
    const users = await searchUsers(req.query);
    res.json({ success: true, data: users });
  }
);

export const updateUserRoleController = catchAsync(
  async (req: Request, res: Response) => {
    const { userId, roleId } = req.body;
    const user = await updateUserRole(userId, roleId);
    res.json({ success: true, data: user });
  }
);

// Content Moderation Controllers
export const getPendingContentHandler = catchAsync(
  async (req: Request, res: Response) => {
    const content = await getPendingContent(
      req.query.type as string,
      Number(req.query.page),
      Number(req.query.limit)
    );
    res.json({ success: true, data: content });
  }
);

export const moderateContent = catchAsync(
  async (req: Request, res: Response) => {
    const { contentId, contentType, status, moderationNotes } = req.body;
    const result = await moderateContentService({
      contentId,
      contentType,
      status,
      moderatorId: req.user!.id,
      moderationNotes,
    });
    res.json({ success: true, data: result });
  }
);

// System Configuration Controllers
export const updateConfig = catchAsync(async (req: Request, res: Response) => {
  validateRequest(configUpdateSchema, req.body);
  const config = await setConfig(req.body);
  res.json({ success: true, data: config });
});

export const getConfigsByCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { category } = req.params;
    const configs = await getConfigsByCategoryService(category);
    res.json({ success: true, data: configs });
  }
);

// Resource Management Controllers
export const allocateResources = catchAsync(
  async (req: Request, res: Response) => {
    validateRequest(resourceAllocationSchema, req.body);
    const { resourceType, resourceId, allocation } = req.body;
    await allocateResourcesService(resourceType, resourceId, allocation);
    res.json({ success: true });
  }
);

// Analytics Controllers
export const generateReport = catchAsync(
  async (req: Request, res: Response) => {
    validateRequest(reportConfigSchema, req.body);
    const report = await generateCustomReport(req.body);
    res.json({ success: true, data: report });
  }
);

// Audit System Controllers
export const getAuditLogs = catchAsync(async (req: Request, res: Response) => {
  const logs = await getAdminAuditLogs(
    req.query,
    Number(req.query.page),
    Number(req.query.limit)
  );
  res.json({ success: true, data: logs });
});

// Export all handlers
export const adminControllers = {
  getDashboardMetricsHandler,
  searchUsers,
  updateUserRole,
  getPendingContent: getPendingContentHandler,
  moderateContent,
  updateConfig,
  getConfigsByCategory,
  allocateResources,
  generateReport,
  getAuditLogs,
};
