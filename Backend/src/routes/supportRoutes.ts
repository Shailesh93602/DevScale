import SupportController from '../controllers/supportController';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
// import { requirePermission } from '../middlewares/rbacMiddleware';
import { BaseRouter } from './BaseRouter';

export class SupportRoutes extends BaseRouter {
  private readonly supportController: SupportController;

  constructor() {
    super();
    this.supportController = new SupportController();
  }

  protected initializeRoutes(): void {
    // Support Ticket Routes
    this.router.post(
      '/tickets',
      authMiddleware,
      this.supportController.createTicket
    );

    this.router.patch(
      '/tickets/:ticketId/status',
      authMiddleware,
      // Was `// requirePermission('tickets','update')` — commented out, and the
      // repository updates by ticket_id with no ownership filter while setting
      // assigned_to to the caller, so any user could hijack and close any
      // ticket. requirePermission is dead code (no live call sites), so the
      // guard is the role check the rest of the app actually uses.
      authorizeRoles('ADMIN', 'MODERATOR'),
      this.supportController.updateTicketStatus
    );

    this.router.post(
      '/tickets/:ticketId/responses',
      authMiddleware,
      this.supportController.addTicketResponse
    );

    // Bug Report Routes
    this.router.post(
      '/bug-reports',
      authMiddleware,
      this.supportController.createBugReport
    );

    // Feature Request Routes
    this.router.post(
      '/feature-requests',
      authMiddleware,
      this.supportController.createFeatureRequest
    );

    this.router.post(
      '/feature-requests/:requestId/vote',
      authMiddleware,
      this.supportController.voteFeatureRequest
    );

    // Help Center Routes
    this.router.post(
      '/help-articles',
      authMiddleware,
      // Same story: help-centre articles are published content.
      authorizeRoles('ADMIN', 'MODERATOR'),
      this.supportController.createHelpArticle
    );

    this.router.get(
      '/help-articles/search',
      this.supportController.searchHelpArticles
    );
  }
}

export default new SupportRoutes().getRouter();
