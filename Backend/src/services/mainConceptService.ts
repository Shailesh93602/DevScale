import { PrismaClient, Prisma } from '@prisma/client';
import { createAppError } from '../utils/errorHandler';

const prisma = new PrismaClient();

// Create main concept
export const createMainConcept = async (
  data: Prisma.MainConceptCreateInput
) => {
  try {
    const mainConcept = await prisma.mainConcept.create({
      data,
    });
    return mainConcept;
  } catch (error) {
    throw createAppError(
      'Failed to create main concept',
      500,
      error as Record<string, unknown>
    );
  }
};

// Get main concept by id
export const getMainConceptById = async (id: string) => {
  try {
    const mainConcept = await prisma.mainConcept.findUnique({
      where: { id },
      include: {
        subjects: true,
      },
    });
    return mainConcept;
  } catch (error) {
    throw createAppError(
      'Failed to get main concept by id',
      500,
      error as Record<string, unknown>
    );
  }
};

// Update main concept
export const updateMainConcept = async (
  id: string,
  data: Prisma.MainConceptUpdateInput
) => {
  try {
    const mainConcept = await prisma.mainConcept.update({
      where: { id },
      data,
    });
    return mainConcept;
  } catch (error) {
    throw createAppError(
      'Failed to update main concept',
      500,
      error as Record<string, unknown>
    );
  }
};

// Delete main concept
export const deleteMainConcept = async (id: string) => {
  try {
    const mainConcept = await prisma.mainConcept.delete({
      where: { id },
    });
    return mainConcept;
  } catch (error) {
    throw createAppError(
      'Failed to delete main concept',
      500,
      error as Record<string, unknown>
    );
  }
};

// Get all main concepts
export const getAllMainConcepts = async () => {
  try {
    const mainConcepts = await prisma.mainConcept.findMany();
    return mainConcepts;
  } catch (error) {
    throw createAppError(
      'Failed to get all main concepts',
      500,
      error as Record<string, unknown>
    );
  }
};
