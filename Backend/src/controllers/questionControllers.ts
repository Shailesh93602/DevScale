import { Request, Response } from 'express';
import prisma from '../prisma';
import { catchAsync } from '../utils';
import { createAppError } from '../utils/errorHandler';
import Joi from 'joi';

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

// Get all questions
export const getQuestions = catchAsync(async (req: Request, res: Response) => {
  const questions = await prisma.quizQuestion.findMany({
    include: {
      options: true,
    },
    orderBy: { created_at: 'asc' },
  });

  res.status(200).json({ success: true, data: questions });
});

// Create new question
export const createQuestion = catchAsync(
  async (req: Request, res: Response) => {
    const { error, value } = createQuestionSchema.validate(req.body);

    if (error) {
      throw createAppError(error.details[0].message, 400);
    }

    const question = await prisma.quizQuestion.create({
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

    res.status(201).json({ success: true, data: question });
  }
);

// Update existing question
export const updateQuestion = catchAsync(
  async (req: Request, res: Response) => {
    const questionId = req.params.id;
    const { error, value } = updateQuestionSchema.validate(req.body);

    if (error) {
      throw createAppError(error.details[0].message, 400);
    }

    const question = await prisma.quizQuestion.update({
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

    res.status(200).json({ success: true, data: question });
  }
);

// Delete question
export const deleteQuestion = catchAsync(
  async (req: Request, res: Response) => {
    const questionId = req.params.id;

    await prisma.quizQuestion.delete({
      where: { id: questionId },
    });

    res.status(204).json({ success: true, data: null });
  }
);

// Submit multiple questions (existing implementation)
export const submitQuestions = catchAsync(
  async (req: Request, res: Response) => {
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

    await prisma.quizQuestion.createMany({
      data: questionData,
      skipDuplicates: true,
    });

    res
      .status(201)
      .json({ success: true, message: 'Questions submitted successfully' });
  }
);
