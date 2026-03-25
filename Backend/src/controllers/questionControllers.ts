import { Request, Response } from 'express';
import { catchAsync } from '../utils';
import { createAppError } from '../utils/errorHandler';
import Joi from 'joi';
import QuizQuestionsRepository from '@/repositories/quizQuestionsRepository';
import { sendResponse } from '@/utils/apiResponse';

// Validation schemas
const createQuestionSchema = Joi.object({
  text: Joi.string().required(),
  type: Joi.string().valid('multiple_choice', 'coding').required(),
  options: Joi.array()
    .items(Joi.string())
    .when('type', {
      is: 'multiple_choice',
      then: Joi.array().min(2).required(),
      otherwise: Joi.forbidden(),
    }),
  correctAnswer: Joi.string().required(),
  points: Joi.number().min(1).required(),
  quiz_id: Joi.string().required(),
});

const updateQuestionSchema = createQuestionSchema.keys({
  text: Joi.string(),
  points: Joi.number().min(1),
});

export default class QuestionController {
  private readonly quizQuestionsRepo: QuizQuestionsRepository;
  constructor() {
    this.quizQuestionsRepo = new QuizQuestionsRepository();
  }

  // Get all questions
  public getQuestions = catchAsync(async (req: Request, res: Response) => {
    const questions = await this.quizQuestionsRepo.findMany({
      include: {
        options: true,
      },
      orderBy: { created_at: 'asc' },
    });

    sendResponse(res, 'QUESTIONS_FETCHED', { data: questions });
  });

  // Create new question
  public createQuestion = catchAsync(async (req: Request, res: Response) => {
    const { error, value } = createQuestionSchema.validate(req.body);

    if (error) {
      throw createAppError(error.details[0].message, 400);
    }

    const question = await this.quizQuestionsRepo.create({
      data: {
        question: value.text,
        type: value.type,
        quiz_id: value.quizId,
        options: value.options
          ? {
              create: value.options.map((option: string) => ({
                text: option,
                isCorrect: option === value.correctAnswer,
              })),
            }
          : undefined,
      },
      include: {
        options: true,
      },
    });

    sendResponse(res, 'QUESTION_CREATED', { data: question });
  });

  // Update existing question
  public updateQuestion = catchAsync(async (req: Request, res: Response) => {
    const questionId = req.params.id;
    const { error, value } = updateQuestionSchema.validate(req.body);

    if (error) {
      throw createAppError(error.details[0].message, 400);
    }

    const question = await this.quizQuestionsRepo.update({
      where: { id: questionId },
      data: {
        question: value.text,
        type: value.type,
        options: value.options
          ? {
              deleteMany: {},
              create: value.options.map((option: string) => ({
                text: option,
                isCorrect: option === value.correctAnswer,
              })),
            }
          : undefined,
      },
      include: {
        options: true,
      },
    });

    sendResponse(res, 'QUESTION_UPDATED', { data: question });
  });

  // Delete question
  public deleteQuestion = catchAsync(async (req: Request, res: Response) => {
    const questionId = req.params.id;

    await this.quizQuestionsRepo.delete({
      where: { id: questionId },
    });

    sendResponse(res, 'QUESTION_DELETED', { data: null });
  });

  // Submit multiple questions (existing implementation)
  public submitQuestions = catchAsync(async (req: Request, res: Response) => {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      throw createAppError('Invalid questions data', 400);
    }

    const questionData = questions.map((question) => ({
      question: question.text,
      type: question.type,
      correctAnswer: question.correctAnswer,
      points: question.points,
      quiz_id: question.quizId,
      options: question.options
        ? {
            create: question.options.map((option: string) => ({
              text: option,
              isCorrect: option === question.correctAnswer,
            })),
          }
        : undefined,
      testCases: question.testCases
        ? {
            create: question.testCases,
          }
        : undefined,
    }));

    await this.quizQuestionsRepo.createMany({
      data: questionData,
      skipDuplicates: true,
    });

    sendResponse(res, 'QUESTIONS_SUBMITTED', { data: null });
  });
}
