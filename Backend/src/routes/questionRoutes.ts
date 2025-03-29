import { BaseRouter } from './BaseRouter';
import QuestionController from '../controllers/questionControllers';

export class QuestionRoutes extends BaseRouter {
  private readonly questionController: QuestionController;

  constructor() {
    super();
    this.questionController = new QuestionController();
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    this.router.get('/', this.questionController.getQuestions);
    this.router.post('/submit', this.questionController.submitQuestions);
    this.router.post('/create', this.questionController.createQuestion);
    this.router.put('/update/:id', this.questionController.updateQuestion);
    this.router.delete('/delete/:id', this.questionController.deleteQuestion);
  }
}

export default new QuestionRoutes().getRouter();
