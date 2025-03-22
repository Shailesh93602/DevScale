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
} from '../validations/adminValidations';
import { catchAsync } from '../utils';
import { sendResponse } from '../utils/apiResponse';

// Dashboard Controllers
export const getDashboardMetricsHandler = catchAsync(
  async (req: Request, res: Response) => {
    const metrics = await getDashboardMetrics();
    sendResponse(res, 'METRICS_FETCHED', { data: metrics });
  }
);

// User Management Controllers
export const searchUsersController = catchAsync(
  async (req: Request, res: Response) => {
    validateRequest(userSearchSchema, 'query');
    const users = await searchUsers(req.query);
    sendResponse(res, 'USERS_FETCHED', { data: users });
  }
);

export const updateUserRoleController = catchAsync(
  async (req: Request, res: Response) => {
    const { userId, roleId } = req.body;
    const user = await updateUserRole(userId, roleId);
    sendResponse(res, 'USER_ROLE_UPDATED', { data: user });
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
    sendResponse(res, 'PENDING_CONTENT_FETCHED', { data: content });
  }
);

export const moderateContent = catchAsync(
  async (req: Request, res: Response) => {
    const { content_id, content_type, status, moderations } = req.body;
    const result = await moderateContentService({
      content_id,
      content_type,
      status,
      moderator_id: req.user?.id,
      moderations,
    });
    sendResponse(res, 'CONTENT_MODERATED', { data: result });
  }
);

// System Configuration Controllers
export const updateConfig = catchAsync(async (req: Request, res: Response) => {
  validateRequest(configUpdateSchema, req.body);
  const config = await setConfig(req.body);
  sendResponse(res, 'CONFIG_UPDATED', { data: config });
});

export const getConfigsByCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { category } = req.params;
    const configs = await getConfigsByCategoryService(category);
    sendResponse(res, 'CONFIGS_FETCHED', { data: configs });
  }
);

// Resource Management Controllers
export const allocateResources = catchAsync(
  async (req: Request, res: Response) => {
    validateRequest(resourceAllocationSchema, req.body);
    const { resourceType, resourceId, allocation } = req.body;
    await allocateResourcesService(resourceType, resourceId, allocation);
    sendResponse(res, 'RESOURCES_ALLOCATED');
  }
);

// Analytics Controllers
export const generateReport = catchAsync(
  async (req: Request, res: Response) => {
    validateRequest(reportConfigSchema, req.body);
    const report = await generateCustomReport(req.body);
    sendResponse(res, 'REPORT_GENERATED', { data: report });
  }
);

// Audit System Controllers
export const getAuditLogs = catchAsync(async (req: Request, res: Response) => {
  const logs = await getAdminAuditLogs(
    req.query,
    Number(req.query.page),
    Number(req.query.limit)
  );
  sendResponse(res, 'AUDIT_LOGS_FETCHED', { data: logs });
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
