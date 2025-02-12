import { Router } from 'express';
import {updateTicketStatus, addTicketResponse, createTicket, createBugReport, createFeatureRequest, voteFeatureRequest, createHelpArticle, searchHelpArticles} from '../controllers/supportController';
import { authenticateUser } from '../middlewares/authMiddleware';
import { requirePermission } from '../middlewares/rbacMiddleware';

const router = Router();

// Support Ticket Routes
router.post('/tickets', authenticateUser, createTicket);

router.patch(
  '/tickets/:ticketId/status',
  authenticateUser,
  requirePermission('tickets', 'update'),
  updateTicketStatus
);

router.post(
  '/tickets/:ticketId/responses',
  authenticateUser,
  addTicketResponse
);

// Bug Report Routes
router.post(
  '/bug-reports',
  authenticateUser,
  createBugReport
);

// Feature Request Routes
router.post(
  '/feature-requests',
  authenticateUser,
  createFeatureRequest
);

router.post(
  '/feature-requests/:requestId/vote',
  authenticateUser,
  voteFeatureRequest
);

// Help Center Routes
router.post(
  '/help-articles',
  authenticateUser,
  requirePermission('help', 'create'),
  createHelpArticle
);

router.get('/help-articles/search', searchHelpArticles);

export default router;
