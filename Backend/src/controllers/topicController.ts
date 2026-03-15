import { Request, Response } from 'express';
import { catchAsync } from '../utils/index';
import { sendResponse } from '../utils/apiResponse';
import TopicRepository from '../repositories/topicRepository';
import QuizRepository from '../repositories/quizRepository';
import { Prisma } from '@prisma/client';

export default class TopicController {
  private readonly topicRepo: TopicRepository;
  private readonly quizRepo: QuizRepository;

  constructor() {
    this.topicRepo = new TopicRepository();
    this.quizRepo = new QuizRepository();
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
      const { id } = req.params;
      const topic = (await this.topicRepo.findUnique({
        where: { id },
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
    const topic = (await this.topicRepo.findUnique({
      where: { id },
      include: {
        quizzes: {
          include: {
            questions: {
              include: {
                options: true
              }
            }
          }
        }
      },
    })) as any;

    if (!topic || !topic.quizzes || topic.quizzes.length === 0) {
      return sendResponse(res, 'QUIZ_NOT_FOUND');
    }

    return sendResponse(res, 'QUIZ_FETCHED', { data: topic.quizzes[0] });
  });

  public submitQuiz = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { quiz_id, answers, time_spent } = req.body;

    const result = await this.quizRepo.submitQuiz({
      user_id: userId,
      quiz_id,
      answers,
      time_spent,
    });

    return sendResponse(res, result.is_passed ? 'QUIZ_PASSED' : 'QUIZ_FAILED', {
      data: result,
    });
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
