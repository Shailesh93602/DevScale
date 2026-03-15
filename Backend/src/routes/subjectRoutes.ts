import { BaseRouter } from './BaseRouter';
import SubjectController from '../controllers/subjectController';
import { authMiddleware } from '../middlewares/authMiddleware';

export class SubjectRoutes extends BaseRouter {
  private readonly subjectController: SubjectController;

  constructor() {
    super();
    this.subjectController = new SubjectController();
    this.router.use(authMiddleware);
  }

  protected initializeRoutes(): void {
    this.router.get('/', this.subjectController.getAllSubjects);
    this.router.get('/:id/topics', this.subjectController.getTopicsInSubject);
  }
}
