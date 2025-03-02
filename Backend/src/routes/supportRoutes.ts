import { Router } from 'express';
import {
  updateTicketStatus,
  addTicketResponse,
  createTicket,
  createBugReport,
  createFeatureRequest,
  voteFeatureRequest,
  createHelpArticle,
  searchHelpArticles,
} from '../controllers/supportController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requirePermission } from '../middlewares/rbacMiddleware';

const router = Router();

// Support Ticket Routes
router.post('/tickets', authMiddleware, createTicket);

router.patch(
  '/tickets/:ticketId/status',
  authMiddleware,
  requirePermission('tickets', 'update'),
  updateTicketStatus
);

router.post('/tickets/:ticketId/responses', authMiddleware, addTicketResponse);

// Bug Report Routes
router.post('/bug-reports', authMiddleware, createBugReport);

// Feature Request Routes
router.post('/feature-requests', authMiddleware, createFeatureRequest);

router.post(
  '/feature-requests/:requestId/vote',
  authMiddleware,
  voteFeatureRequest
);

// Help Center Routes
router.post(
  '/help-articles',
  authMiddleware,
  requirePermission('help', 'create'),
  createHelpArticle
);

router.get('/help-articles/search', searchHelpArticles);

export default router;
