import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const mainConceptSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  order: z.number().optional(),
  roadmapId: z.string().min(1, 'Roadmap ID is required'),
});

export const validateMainConcept = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    mainConceptSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors,
      });
    }
    next(error);
  }
};
