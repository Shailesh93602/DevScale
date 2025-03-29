import SupportController from '../controllers/supportController';
import { authMiddleware } from '../middlewares/authMiddleware';
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
      // requirePermission('tickets', 'update'),
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
      // requirePermission('help', 'create'),
      this.supportController.createHelpArticle
    );

    this.router.get(
      '/help-articles/search',
      this.supportController.searchHelpArticles
    );
  }
}

export default new SupportRoutes().getRouter();
