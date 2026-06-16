import { BaseRouter } from './BaseRouter';
import QuizController from '../controllers/quizController';
import { authMiddleware } from '../middlewares/authMiddleware';

export class QuizRouter extends BaseRouter {
  private readonly quizController: QuizController;

  constructor() {
    super();
    this.quizController = new QuizController();
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    // submitQuiz reads req.user.id and 401s without it — the route MUST run
    // authMiddleware first (it didn't, so /quiz/submit always 401'd, breaking
    // the resource-page quiz submit). Matches the /topics/quiz/submit guard.
    this.router.post('/submit', authMiddleware, this.quizController.submitQuiz);
  }
}

export default new QuizRouter().getRouter();
