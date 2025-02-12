import { PrismaClient } from '@prisma/client';
import logger from '../../utils/logger';

const prisma = new PrismaClient();

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  entity: string;
  id: string;
  field: string;
  error: string;
}

async function validateData(): Promise<ValidationResult> {
  const errors: ValidationError[] = [];

  try {
    // Validate user data
    const users = await prisma.user.findMany();

    for (const user of users) {
      // Check required fields
      if (!user.email) {
        errors.push({
          entity: 'User',
          id: user.id,
          field: 'email',
          error: 'Missing email',
        });
      }

      // Check email format
      if (user.email && !user.email.includes('@')) {
        errors.push({
          entity: 'User',
          id: user.id,
          field: 'email',
          error: 'Invalid email format',
        });
      }
    }

    // Validate roadmap data
    const roadmaps = await prisma.roadmap.findMany();
    for (const roadmap of roadmaps) {
      if (!roadmap.title) {
        errors.push({
          entity: 'Roadmap',
          id: roadmap.id,
          field: 'title',
          error: 'Missing title',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  } catch (error) {
    logger.error('Error during data validation:', error);
    throw error;
  }
}

export { validateData, ValidationResult, ValidationError };
