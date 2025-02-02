import { Request, Response } from 'express';
import prisma from '../prisma';
import { catchAsync } from '../utils/index';

export const getSubjectsInMainConcept = catchAsync(
  async (req: Request, res: Response) => {
    const { mainConceptId } = req.params;

    if (isNaN(Number(mainConceptId))) {
      return res.status(400).json({ message: 'Invalid mainConceptId' });
    }

    const mainConcept = await prisma.mainConcept.findUnique({
      where: { id: mainConceptId },
      include: {
        subjects: {
          select: {
            id: true,
            name: true,
            description: true,
          },
          orderBy: {
            created_at: 'asc',
          },
        },
      },
    });

    if (!mainConcept) {
      return res.status(404).json({ message: 'Main Concept not found' });
    }

    res.status(200).json(mainConcept.subjects);
  }
);
