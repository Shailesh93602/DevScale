import { BaseRouter } from './BaseRouter';
import { authMiddleware } from '../middlewares/authMiddleware';
import TopicController from '../controllers/topicController';

export class TopicRoutes extends BaseRouter {
  private readonly topicController: TopicController;

  constructor() {
    super();
    this.topicController = new TopicController();
    this.router.use(authMiddleware);
  }

  protected initializeRoutes(): void {
    this.router.get('/', this.topicController.getAllTopics);
    this.router.get('/:id/articles', this.topicController.getArticlesForTopic);
    this.router.get('/:id/article', this.topicController.getArticlesForTopic);
    this.router.get('/:id/quiz', this.topicController.getQuizByTopicId);
    this.router.post('/quiz/submit', this.topicController.submitQuiz);
    this.router.get('/unpublished', this.topicController.getUnpublishedTopics);
  }
}
