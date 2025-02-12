import { body } from 'express-validator';
import { ExperienceLevel } from '@prisma/client';

export const updateProfileValidation = [
  body('full_name')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters long'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('github_url').optional().isURL().withMessage('Invalid GitHub URL'),
  body('linkedin_url').optional().isURL().withMessage('Invalid LinkedIn URL'),
  body('website').optional().isURL().withMessage('Invalid website URL'),
  body('graduation_year')
    .optional()
    .isInt({ min: 1950, max: 2030 })
    .withMessage('Invalid graduation year'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('experience_level')
    .optional()
    .isIn(Object.values(ExperienceLevel))
    .withMessage('Invalid experience level'),
];
