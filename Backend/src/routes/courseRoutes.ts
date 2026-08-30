import { BaseRouter } from './BaseRouter';
import CourseController from '../controllers/courseControllers';
import { authMiddleware } from '../middlewares/authMiddleware';

export class CourseRoutes extends BaseRouter {
  private readonly courseController: CourseController;

  constructor() {
    super();
    this.courseController = new CourseController();
  }

  protected initializeRoutes(): void {
    this.router.get('/', this.courseController.getCourses);
    this.router.get('/:id', this.courseController.getCourse);
    // Enrolling is self-service (it writes the caller's own enrolment), so the
    // guard is authentication, not a role — but it had NEITHER: this router
    // applied no auth middleware anywhere.
    this.router.post(
      '/enroll',
      authMiddleware,
      this.courseController.enrollCourse
    );
  }
}

export default new CourseRoutes().getRouter();
