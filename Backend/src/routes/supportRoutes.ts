import SupportController from '../controllers/supportController';
import { authMiddleware } from '../middlewares/authMiddleware';
// The import that was commented out alongside its call sites. Restored, on a
// permission catalogue that now exists.
import { requirePermission } from '../middlewares/rbacMiddleware';
import { Action, Resource } from '../constants/permissions';
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
      // Originally `// requirePermission('tickets','update')`, commented out —
      // and it had to be, because the permission catalogue was four bare verbs,
      // so the lookup for `tickets:update` found nothing and refused everyone.
      // Gated on the role first as an interim fix; now restored to the guard
      // that was always intended, on a catalogue that exists.
      //
      // requirePermission REPLACES the role check here rather than layering on
      // top of it: layering would mean a support volunteer granted
      // tickets:update still hit a 403 from the role gate, which is exactly the
      // case the override system exists to serve. MODERATOR and ADMIN hold this
      // permission by default, so nobody who could do it before loses access.
      requirePermission(Resource.TICKETS, Action.UPDATE),
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
      requirePermission(Resource.HELP, Action.CREATE),
      this.supportController.createHelpArticle
    );

    this.router.get(
      '/help-articles/search',
      this.supportController.searchHelpArticles
    );
  }
}

export default new SupportRoutes().getRouter();
