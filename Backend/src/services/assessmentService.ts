import {
  PrismaClient,
  Quiz,
  QuizSubmission,
  QuizType,
  Prisma,
} from '@prisma/client';
import { createAppError } from '../middlewares/errorHandler';
import { executeCode } from '../utils/codeExecutor';
import logger from '../utils/logger';

const prisma = new PrismaClient();

interface QuizData {
  title: string;
  description: string;
  type: QuizType;
  timeLimit?: number;
  passingScore: number;
  questions: QuestionData[];
  topicId?: string;
  subjectId?: string;
  conceptId?: string;
}

interface QuestionData {
  question: string;
  type: 'multiple_choice' | 'coding';
  options?: string[];
  correctAnswer: string;
  points: number;
  testCases?: TestCase[];
}

interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

interface SubmissionData {
  userId: string;
  quizId: string;
  answers: Answer[];
  timeSpent: number;
}

interface Answer {
  questionId: string;
  answer: string;
}

export async function createQuiz(data: QuizData): Promise<Quiz> {
  return prisma.quiz.create({
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      timeLimit: data.timeLimit,
      passingScore: data.passingScore,
      topicId: data.topicId,
      subjectId: data.subjectId,
      conceptId: data.conceptId,
      questions: {
        create: data.questions.map((q) => ({
          question: q.question,
          type: q.type,
          options: q.options
            ? {
                create: q.options.map((option) => ({
                  text: option,
                  isCorrect: option === q.correctAnswer,
                })),
              }
            : undefined,
          correctAnswer: q.correctAnswer,
          points: q.points,
          testCases: q.testCases
            ? (q.testCases as unknown as Prisma.InputJsonValue)
            : Prisma.DbNull,
        })),
      },
    },
    include: { questions: true },
  });
}

export async function submitQuiz(
  data: SubmissionData
): Promise<QuizSubmission> {
  const quiz = await prisma.quiz.findUnique({
    where: { id: data.quizId },
    include: { questions: true },
  });

  if (!quiz) throw createAppError('Quiz not found', 404);

  let totalScore = 0;
  const results = [];

  for (const answer of data.answers) {
    const question = quiz.questions.find((q) => q.id === answer.questionId);
    if (!question) continue;

    let isCorrect = false;
    let score = 0;

    if (question.type === 'coding') {
      const testResults = await evaluateCode(
        answer.answer,
        Array.isArray(question.testCases)
          ? (question.testCases as unknown as TestCase[])
          : undefined
      );
      isCorrect = testResults.every((r) => r.passed);
      score = isCorrect ? question.points : 0;
    } else {
      isCorrect = answer.answer === question.correctAnswer;
      score = isCorrect ? question.points : 0;
    }

    totalScore += score;
    results.push({ questionId: question.id, isCorrect, score });
  }

  const submission = await prisma.quizSubmission.create({
    data: {
      userId: data.userId,
      quizId: data.quizId,
      score: totalScore,
      timeSpent: data.timeSpent,
      isPassed: totalScore >= quiz.passingScore,
      results,
    },
    include: { quiz: true },
  });

  await updateProgress(data.userId, quiz, submission.isPassed);
  return submission;
}

export async function getQuizzesByLevel(
  type: QuizType,
  id: string
): Promise<Quiz[]> {
  return prisma.quiz.findMany({
    where: {
      type,
      OR: [{ topicId: id }, { subjectId: id }, { conceptId: id }],
    },
    include: { _count: { select: { submissions: true } } },
  });
}

export async function getQuizPerformance(quizId: string) {
  const submissions = await prisma.quizSubmission.findMany({
    where: {
      quizId,
    },
    include: {
      user: {
        select: {
          username: true,
          avatar_url: true,
        },
      },
    },
    orderBy: {
      score: 'desc',
    },
  });

  const totalSubmissions = submissions.length;
  const passedSubmissions = submissions.filter((s) => s.isPassed).length;
  const averageScore =
    submissions.reduce((acc, s) => acc + s.score, 0) / totalSubmissions;

  return {
    submissions,
    stats: {
      totalSubmissions,
      passedSubmissions,
      passRate: totalSubmissions
        ? (passedSubmissions / totalSubmissions) * 100
        : 0,
      averageScore,
    },
  };
}

async function evaluateCode(
  code: string,
  testCases?: TestCase[]
): Promise<Array<{ passed: boolean; input: string; output: string }>> {
  if (!testCases) return [];

  const results = [];
  for (const testCase of testCases) {
    try {
      const { output } = await executeCode({
        code,
        language: 'javascript', // Add language detection or parameter
        input: testCase.input,
      });

      results.push({
        passed: output.trim() === testCase.expectedOutput.trim(),
        input: testCase.isHidden ? '[Hidden]' : testCase.input,
        output: output.trim(),
      });
    } catch (error) {
      logger.error('Code execution error:', error);
      results.push({
        passed: false,
        input: testCase.isHidden ? '[Hidden]' : testCase.input,
        output: 'Execution error',
      });
    }
  }

  return results;
}

async function updateProgress(
  userId: string,
  quiz: Quiz,
  passed: boolean
): Promise<void> {
  if (!passed) return;
  try {
    if (quiz.topicId) {
      await updateTopicProgress(userId, quiz.topicId);
    } else if (quiz.subjectId) {
      await updateSubjectProgress(userId, quiz.subjectId, quiz.topicId);
    } else if (quiz.conceptId) {
      await updateConceptProgress(userId, quiz.conceptId);
    }
  } catch (error) {
    logger.error('Error updating progress:', error);
  }
}

async function updateTopicProgress(
  userId: string,
  topicId: string
): Promise<void> {
  await prisma.userProgress.upsert({
    where: { userId_topicId: { userId, topicId } },
    update: { isCompleted: true, completedAt: new Date() },
    create: {
      userId,
      topicId,
      subjectId: '',
      isCompleted: true,
      completedAt: new Date(),
    },
  });
}

async function updateSubjectProgress(
  userId: string,
  subjectId: string,
  topicId: string | null
): Promise<void> {
  await prisma.userProgress.upsert({
    where: {
      userId_topicId: {
        userId,
        topicId: topicId ?? '',
      },
    },
    update: { isCompleted: true, completedAt: new Date() },
    create: {
      userId,
      subjectId,
      topicId: topicId ?? '',
      isCompleted: true,
      completedAt: new Date(),
    },
  });
}

async function updateConceptProgress(
  userId: string,
  topicId: string
): Promise<void> {
  await prisma.userProgress.upsert({
    where: {
      userId_topicId: {
        userId,
        topicId,
      },
    },
    update: {
      isCompleted: true,
      completedAt: new Date(),
    },
    create: {
      userId,
      subjectId: '',
      topicId,
      isCompleted: true,
      completedAt: new Date(),
    },
  });
}
