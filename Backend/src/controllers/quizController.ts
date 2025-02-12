import { Request, Response } from 'express';
import prisma from '../prisma';
import { catchAsync } from '../utils/index';

export const createQuiz = catchAsync(async (req: Request, res: Response) => {
  const { topicId, passingScore, questions, type } = req.body;

  const quiz = await prisma.quiz.create({
    data: {
      topicId,
      passingScore,
      title: 'Quiz',
      description: 'Quiz',
      type,
    },
  });

  if (questions && questions.length > 0) {
    const quizQuestions = questions.map((question: { question: string }) => ({
      quizId: quiz.id,
      question: question.question,
    }));

    await prisma.quizQuestion.createMany({ data: quizQuestions });
  }

  res.status(201).json({
    success: true,
    message: 'Quiz created successfully',
    quiz,
  });
});

export const submitQuiz = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { quizId, answers } = req.body;

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  });

  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: 'Quiz not found',
    });
  }

  let score = 0;

  for (const submittedAnswer of answers) {
    const question = quiz.questions.find(
      (q) => q.id === submittedAnswer.questionId
    );

    if (question && question.correctAnswer === submittedAnswer.answer) {
      score += 1;
    }
  }

  const completed = score >= quiz.passingScore;

  const submission = await prisma.quizSubmission.create({
    data: {
      userId,
      quizId,
      score,
      timeSpent: 0,
      isPassed: completed,
      results: score,
      user: { connect: { id: userId } },
      quiz: { connect: { id: quizId } },
    },
  });

  const submissionAnswers = answers.map(
    (answer: { questionId: number; answer: string }) => ({
      submissionId: submission.id,
      questionId: answer.questionId,
      answer: answer.answer,
    })
  );

  await prisma.quizAnswer.createMany({ data: submissionAnswers });

  res.status(201).json({
    success: true,
    message: 'Quiz submitted successfully',
    submission,
    completed,
  });
});

export const getUserProgress = catchAsync(
  async (req: Request, res: Response) => {
    const { userId } = req.params;

    const progress = await prisma.quizSubmission.findMany({
      where: { userId },
      include: {
        quiz: {
          include: {
            topic: {
              select: {
                title: true,
                subjectId: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      progress,
    });
  }
);
