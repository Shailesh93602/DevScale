import { Request, Response } from 'express';
import prisma from '../prisma';
import { catchAsync } from '../utils/index';

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

    res.status(200).json({
      success: true,
      message: 'Unpublished topics retrieved successfully',
      topics,
    });
  }
);

export const getArticlesForTopic = catchAsync(
  async (req: Request, res: Response) => {
    const { topicId } = req.params;

    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        articles: {
          where: {
            OR: [{ status: 'approved' }, { status: 'pending' }],
          },
          orderBy: {
            created_at: 'desc',
          },
        },
      },
    });

    if (topic) {
      res.status(200).json(topic.articles);
    } else {
      res.status(404).json({ message: 'Topic not found' });
    }
  }
);

export const getQuizByTopicId = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const quiz = await prisma.quiz.findFirst({
      where: { topicId: id },
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
      return res.status(404).json({ message: 'Quiz not found' });
    }

    return res.status(200).json(quiz);
  }
);

export const submitQuiz = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { topicId, answers } = req.body;

  const quiz = await prisma.quiz.findFirst({
    where: { topicId },
    include: { questions: true },
  });

  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }

  let score = 0;
  quiz.questions.forEach((question, index) => {
    if (question.correctAnswer === answers[index]) {
      score += 1;
    }
  });

  const passingScore =
    quiz.passingScore || Math.ceil(quiz.questions.length * 0.7);
  const isPassed = score >= passingScore;

  if (isPassed) {
    await prisma.userProgress.update({
      where: {
        userId_topicId: {
          userId: userId,
          topicId,
        },
      },
      data: { isCompleted: true },
    });
  }

  return res.status(200).json({
    message: isPassed ? 'Quiz passed!' : 'Quiz failed',
    score,
    isPassed,
  });
});
