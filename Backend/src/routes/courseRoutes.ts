import { BaseRouter } from './BaseRouter';
import CourseController from '../controllers/courseControllers';

export class CourseRoutes extends BaseRouter {
  private readonly courseController: CourseController;

  constructor() {
    super();
    this.courseController = new CourseController();
  }

  protected initializeRoutes(): void {
    this.router.get('/', this.courseController.getCourses);
    this.router.get('/:id', this.courseController.getCourse);
    this.router.post('/enroll', this.courseController.enrollCourse);
  }
}

export default new CourseRoutes().getRouter();
