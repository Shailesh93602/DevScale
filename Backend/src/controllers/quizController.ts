import { Request, Response } from 'express';
import prisma from '../prisma';
import { catchAsync } from '../utils/index';

export const createQuiz = catchAsync(async (req: Request, res: Response) => {
  const { topic_id, passing_score, questions, type } = req.body;

  const quiz = await prisma.quiz.create({
    data: {
      topic_id,
      passing_score,
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
  const user_id = req.user?.id;
  const { quiz_id, answers } = req.body;

  const quiz = await prisma.quiz.findUnique({
    where: { id: quiz_id },
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
      (q) => q.id === submittedAnswer.question_id
    );

    if (question && question.correct_answer === submittedAnswer.answer) {
      score += 1;
    }
  }

  const completed = score >= quiz.passing_score;

  const submission = await prisma.quizSubmission.create({
    data: {
      user_id,
      quiz_id,
      score,
      time_spent: 0,
      is_passed: completed,
      results: score,
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
    const { user_id } = req.params;

    const progress = await prisma.quizSubmission.findMany({
      where: { user_id },
      include: {
        quiz: {
          include: {
            topic: {
              select: {
                title: true,
                subject_id: true,
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
