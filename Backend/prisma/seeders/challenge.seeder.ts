import { PrismaClient } from '@prisma/client';
import { challenges } from '../../resources/challenges/index';

const prisma = new PrismaClient();

const seedChallenges = async () => {
  try {
    for (const challengeData of challenges) {
      await prisma.challenge.upsert({
        where: { title: challengeData.title },
        update: {
          description: challengeData.description,
          difficulty: challengeData.difficulty,
          inputFormat: challengeData.inputFormat,
          outputFormat: challengeData.outputFormat,
          exampleInput: challengeData.exampleInput,
          exampleOutput: challengeData.exampleOutput,
          constraints: challengeData.constraints,
          functionSignature: challengeData.functionSignature,
        },
        create: {
          title: challengeData.title,
          description: challengeData.description,
          difficulty: challengeData.difficulty,
          inputFormat: challengeData.inputFormat,
          outputFormat: challengeData.outputFormat,
          exampleInput: challengeData.exampleInput,
          exampleOutput: challengeData.exampleOutput,
          constraints: challengeData.constraints,
          functionSignature: challengeData.functionSignature,
        },
      });
    }

    console.log('Challenges seeded successfully');
  } catch (error) {
    console.error('Error seeding challenges:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seedChallenges();
