import { BaseRouter } from './BaseRouter';
import JobController from '../controllers/jobControllers';
import { authMiddleware } from '@/middlewares/authMiddleware';

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
    this.router.post('/create', this.jobController.createJob);
    this.router.put('/update/:id', this.jobController.updateJob);
    this.router.delete('/delete/:id', this.jobController.deleteJob);
  }
}

export default new JobRoutes().getRouter();
