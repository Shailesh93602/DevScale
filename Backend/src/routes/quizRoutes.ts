import { BaseRouter } from './BaseRouter';
import QuizController from '../controllers/quizController';

export class QuizRouter extends BaseRouter {
  private readonly quizController: QuizController;

  constructor() {
    super();
    this.quizController = new QuizController();
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    this.router.post('/create', this.quizController.createQuiz);
    this.router.post('/submit', this.quizController.submitQuiz);
  }
}

export default new QuizRouter().getRouter();
