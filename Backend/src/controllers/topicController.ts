import { Request, Response } from 'express';
import prisma from '../prisma';
import { catchAsync } from '../utils/index';
import { sendResponse } from '../utils/apiResponse';

export const getUnpublishedTopics = catchAsync(
  async (req: Request, res: Response) => {
    const topics = await prisma.topic.findMany({
      where: {
        id: {
          in: await prisma.$queryRaw`SELECT DISTINCT "Topics"."id"
                            FROM "Topics"
                            LEFT JOIN "Articles" ON "Articles"."topicId" = "Topics"."id"
                            WHERE "Articles"."status" IS NULL OR "Articles"."status" = 'rejected'`,
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    return sendResponse(res, 'TOPICS_FETCHED', { data: topics });
  }
);

export const getArticlesForTopic = catchAsync(
  async (req: Request, res: Response) => {
    const { topicId } = req.params;

    const topic = await prisma.topic.findUnique({
      where: {
        id: String(topicId),
      },
      include: {
        articles: {
          where: {
            OR: [{ status: 'APPROVED' }, { status: 'PENDING' }],
          },
          orderBy: {
            created_at: 'desc',
          },
        },
      },
    });

    if (!topic) {
      return sendResponse(res, 'TOPIC_NOT_FOUND');
    }

    return sendResponse(res, 'ARTICLES_FETCHED', { data: topic.articles });
  }
);

export const getQuizByTopicId = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const quiz = await prisma.quiz.findFirst({
      where: { topic_id: id },
      include: {
        questions: {
          include: {
            options: {
              orderBy: {
                created_at: 'asc',
              },
            },
          },
          orderBy: {
            created_at: 'asc',
          },
        },
      },
    });

    if (!quiz) {
      return sendResponse(res, 'QUIZ_NOT_FOUND');
    }

    return sendResponse(res, 'QUIZ_FETCHED', { data: quiz });
  }
);

export const submitQuiz = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { topic_id, answers } = req.body;

  const quiz = await prisma.quiz.findFirst({
    where: { topic_id },
    include: { questions: true },
  });

  if (!quiz) {
    return sendResponse(res, 'QUIZ_NOT_FOUND');
  }

  let score = 0;
  quiz.questions.forEach((question, index) => {
    if (question.correct_answer === answers[index]) {
      score += 1;
    }
  });

  const passing_score =
    quiz.passing_score || Math.ceil(quiz.questions.length * 0.7);
  const is_passed = score >= passing_score;

  if (is_passed) {
    await prisma.userProgress.update({
      where: {
        user_id_topic_id: {
          user_id: userId,
          topic_id: topic_id,
        },
      },
      data: { is_completed: true },
    });
  }

  return sendResponse(res, is_passed ? 'QUIZ_PASSED' : 'QUIZ_FAILED', {
    data: { score, is_passed },
  });
});

export const getArticleByTopicId = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const article = await prisma.article.findFirst({
      where: {
        topic_id: id,
        status: 'APPROVED',
      },
    });

    if (!article) {
      return sendResponse(res, 'ARTICLE_NOT_FOUND');
    }

    return sendResponse(res, 'ARTICLE_FETCHED', { data: article });
  }
);
