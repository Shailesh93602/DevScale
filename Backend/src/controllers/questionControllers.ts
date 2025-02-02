import { Request, Response } from 'express';
import prisma from '../prisma';
import { catchAsync } from '../utils/index';

export const getQuestions = catchAsync(async (req: Request, res: Response) => {
  const questions = await prisma.quizQuestion.findMany({
    orderBy: { created_at: 'asc' },
  });

  res.status(200).json({ success: true, questions });
});

export const submitQuestions = catchAsync(
  async (req: Request, res: Response) => {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid questions data' });
    }

    // TODO: implement this method

    // const questionData = questions.map((question: { text: string }) => ({
    // text: question.text,
    // }));

    // await prisma.quizQuestion.createMany({ data: questionData });

    res
      .status(201)
      .json({ success: true, message: 'Questions submitted successfully' });
  }
);
