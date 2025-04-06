import { Request, Response } from 'express';
import { catchAsync } from '../utils/index';
import QuizRepository from '@/repositories/quizRepository';
import QuizQuestionsRepository from '@/repositories/quizQuestionsRepository';
import { Prisma } from '@prisma/client';
import QuizAnswerRepository from '@/repositories/quizAnswerRepository';
import QuizSubmissionRepository from '@/repositories/quizSubmissionRepository';
import { sendResponse } from '@/utils/apiResponse';
import { createAppError } from '@/utils/errorHandler';

export default class QuizController {
  private readonly quizRepo: QuizRepository;
  private readonly quizQuestionRepo: QuizQuestionsRepository;
  private readonly quizAnswerRepo: QuizAnswerRepository;
  private readonly quizSubmissionRepo: QuizSubmissionRepository;

  constructor() {
    this.quizRepo = new QuizRepository();
    this.quizQuestionRepo = new QuizQuestionsRepository();
    this.quizAnswerRepo = new QuizAnswerRepository();
    this.quizSubmissionRepo = new QuizSubmissionRepository();
  }

  public createQuiz = catchAsync(async (req: Request, res: Response) => {
    const { topic_id, passing_score, questions, type } = req.body;

    const quiz = await this.quizRepo.create({
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

      await this.quizQuestionRepo.createMany({ data: quizQuestions });
    }

    sendResponse(res, 'QUIZ_CREATED', {
      data: {
        quiz,
      },
    });
  });

  public submitQuiz = catchAsync(async (req: Request, res: Response) => {
    const user_id = req.user?.id;
    const { quiz_id, answers } = req.body;

    const quiz = (await this.quizRepo.findUnique({
      where: { id: quiz_id },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    })) as Prisma.QuizInclude;

    if (!quiz) {
      throw createAppError('Quiz not found', 404);
    }

    let score = 0;

    for (const submittedAnswer of answers) {
      const question =
        quiz.questions && Array.isArray(quiz.questions)
          ? quiz.questions.find((q) => q.id === submittedAnswer.question_id)
          : null;

      if (question && question.correct_answer === submittedAnswer.answer) {
        score += 1;
      }
    }

    const completed =
      score >= (quiz as { passing_score: number }).passing_score;

    const submission = await this.quizSubmissionRepo.create({
      data: {
        user_id: user_id ?? '',
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

    await this.quizAnswerRepo.createMany({ data: submissionAnswers });

    sendResponse(res, 'QUIZ_SUBMITTED', {
      data: {
        submission,
        completed,
      },
    });
  });

  public getUserProgress = catchAsync(async (req: Request, res: Response) => {
    const { user_id } = req.params;

    const progress = await this.quizSubmissionRepo.findMany({
      where: { user_id },
      include: {
        quiz: {
          include: {
            topic: {
              select: {
                title: true,
                subjects: {
                  select: {
                    subject_id: true,
                    subject: {
                      select: {
                        title: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    sendResponse(res, 'USER_PROGRESS_FETCHED', {
      data: {
        progress,
      },
    });
  });
}
