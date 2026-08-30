import { BaseRouter } from './BaseRouter';
import JobController from '../controllers/jobControllers';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';

export class JobRoutes extends BaseRouter {
  private readonly jobController: JobController;

  constructor() {
    super();
    this.jobController = new JobController();
    this.router.use(authMiddleware);
  }

  protected initializeRoutes(): void {
    this.router.get('/', this.jobController.getJobs);
    this.router.get('/:id', this.jobController.getJob);
    // Job postings are platform content, not user content: the controller has
    // no ownership check, so update/:id and delete/:id act on ANY job by id.
    // Router-level authMiddleware made these authenticated but not authorised.
    this.router.post(
      '/create',
      authorizeRoles('ADMIN'),
      this.jobController.createJob
    );
    this.router.put(
      '/update/:id',
      authorizeRoles('ADMIN'),
      this.jobController.updateJob
    );
    this.router.delete(
      '/delete/:id',
      authorizeRoles('ADMIN'),
      this.jobController.deleteJob
    );
  }
}

export default new JobRoutes().getRouter();
