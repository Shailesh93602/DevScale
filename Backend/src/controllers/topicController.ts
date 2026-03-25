import { Request, Response } from 'express';
import { catchAsync } from '../utils/index';
import { sendResponse } from '../utils/apiResponse';
import TopicRepository from '../repositories/topicRepository';
import { Prisma } from '@prisma/client';

export default class TopicController {
  private readonly topicRepo: TopicRepository;

  constructor() {
    this.topicRepo = new TopicRepository();
  }

  public getAllTopics = catchAsync(async (req: Request, res: Response) => {
    const topics = await this.topicRepo.findMany();
    return sendResponse(res, 'TOPICS_FETCHED', { data: topics });
  });

  public getUnpublishedTopics = catchAsync(
    async (req: Request, res: Response) => {
      const topics = await this.topicRepo.findMany();
      return sendResponse(res, 'TOPICS_FETCHED', { data: topics });
    }
  );

  public getArticlesForTopic = catchAsync(
    async (req: Request, res: Response) => {
      const { topicId } = req.params;
      const topic = (await this.topicRepo.findUnique({
        where: { id: topicId },
        include: { articles: true },
      })) as Prisma.TopicInclude;

      if (!topic) {
        return sendResponse(res, 'TOPIC_NOT_FOUND');
      }

      return sendResponse(res, 'ARTICLES_FETCHED', { data: topic.articles });
    }
  );

  public getQuizByTopicId = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const quiz = await this.topicRepo.findUnique({ where: { id } });

    if (!quiz) {
      return sendResponse(res, 'QUIZ_NOT_FOUND');
    }

    return sendResponse(res, 'QUIZ_FETCHED', { data: quiz });
  });

  public submitQuiz = catchAsync(async (req: Request, res: Response) => {
    // const userId = req.user.id;
    // const { topic_id, answers } = req.body;

    // TODO: implement this function
    // const result = await this.topicRepo.submitQuiz(userId, topic_id, answers);
    return sendResponse(
      res,
      // result.is_passed
      req.user.id ? 'QUIZ_PASSED' : 'QUIZ_FAILED'
      // {
      // data: result,
      // }
    );
  });

  public getArticleByTopicId = catchAsync(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const topic = (await this.topicRepo.findUnique({
        where: { id },
        include: { articles: true },
      })) as Prisma.TopicInclude;

      if (!topic?.articles) {
        return sendResponse(res, 'ARTICLE_NOT_FOUND');
      }

      return sendResponse(res, 'ARTICLE_FETCHED', { data: topic.articles });
    }
  );
}
