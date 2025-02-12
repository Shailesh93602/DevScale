import { Request, Response } from 'express';
import prisma from '../prisma';
import { catchAsync } from '../utils/index';

export const getAllSubjects = catchAsync(
  async (req: Request, res: Response) => {
    const subjects = await prisma.subject.findMany({
      include: {
        mainConcept: {
          select: {
            id: true,
            name: true,
          },
          // orderBy: {
          //   createdAt: 'asc',
          // },
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });
    res.status(200).json(subjects);
  }
);

export const getTopicsInSubject = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        topics: {
          select: {
            id: true,
            title: true,
            description: true,
          },
          orderBy: {
            created_at: 'asc',
          },
          include: {
            articles: {
              select: {
                id: true,
                title: true,
                content: true,
              },
              where: {
                status: 'APPROVED',
              },
              orderBy: {
                created_at: 'asc',
              },
            },
          },
        },
      },
    });

    if (subject) {
      res.status(200).json(subject.topics);
    } else {
      res.status(404).json({ message: 'Subject not found' });
    }
  }
);
