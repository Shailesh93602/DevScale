import { PrismaClient } from '@prisma/client';
import { quizzes } from '../../resources/quizzes';

const prisma = new PrismaClient();

const seedQuizzes = async () => {
  try {
    for (const quizData of quizzes) {
      const topic = await prisma.topic.upsert({
        where: { title: quizData.topicName },
        update: { title: quizData.topicName },
        create: { title: quizData.topicName },
      });

      const quiz = await prisma.quiz.upsert({
        where: {
          topicId_passingScore: {
            topicId: topic.id,
            passingScore: quizData.passingMarks,
          },
        },
        update: {},
        create: {
          topicId: topic.id,
          passingScore: quizData.passingMarks,
        },
      });

      for (const questionData of quizData.questions) {
        const question = await prisma.quizQuestion.upsert({
          where: {
            quizId_question: {
              quizId: quiz.id,
              question: questionData.question,
            },
          },
          update: {},
          create: {
            quizId: quiz.id,
            question: questionData.question,
          },
        });

        for (const option of questionData.options) {
          await prisma.quizOption.upsert({
            where: {
              quizQuestionId_answerText: {
                quizQuestionId: question.id,
                answerText: option.answerText,
              },
            },
            update: { isCorrect: option.isCorrect },
            create: {
              quizQuestionId: question.id,
              answerText: option.answerText,
              isCorrect: option.isCorrect,
            },
          });
        }
      }
    }

    console.log('Quizzes seeded or updated successfully!');
  } catch (error) {
    console.error('Error seeding quizzes:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seedQuizzes();
