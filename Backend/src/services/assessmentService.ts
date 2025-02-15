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
  time_limit?: number;
  passing_score: number;
  questions: QuestionData[];
  topic_id?: string;
  subject_id?: string;
  main_concept_id?: string;
}

interface QuestionData {
  question: string;
  type: 'multiple_choice' | 'coding';
  options?: string[];
  correct_answer: string;
  points: number;
  test_cases?: TestCase[];
}

interface TestCase {
  input: string;
  expected_output: string;
  is_hidden?: boolean;
}

interface SubmissionData {
  user_id: string;
  quiz_id: string;
  answers: Answer[];
  time_spent: number;
}

interface Answer {
  question_id: string;
  answer: string;
}

export async function createQuiz(data: QuizData): Promise<Quiz> {
  return prisma.quiz.create({
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      time_limit: data.time_limit,
      passing_score: data.passing_score,
      topic_id: data.topic_id,
      subject_id: data.subject_id,
      main_concept_id: data.main_concept_id,
      questions: {
        create: data.questions.map((q) => ({
          question: q.question,
          type: q.type,
          options: q.options
            ? {
                create: q.options.map((option) => ({
                  text: option,
                  is_correct: option === q.correct_answer,
                })),
              }
            : undefined,
          correct_answer: q.correct_answer,
          points: q.points,
          test_cases: q.test_cases
            ? (q.test_cases as unknown as Prisma.InputJsonValue)
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
    where: { id: data.quiz_id },
    include: { questions: true },
  });

  if (!quiz) throw createAppError('Quiz not found', 404);

  let totalScore = 0;
  const results = [];

  for (const answer of data.answers) {
    const question = quiz.questions.find((q) => q.id === answer.question_id);
    if (!question) continue;

    let isCorrect = false;
    let score = 0;

    if (question.type === 'coding') {
      const testResults = await evaluateCode(
        answer.answer,
        Array.isArray(question.test_cases)
          ? (question.test_cases as unknown as TestCase[])
          : undefined
      );
      isCorrect = testResults.every((r) => r.passed);
      score = isCorrect ? question.points : 0;
    } else {
      isCorrect = answer.answer === question.correct_answer;
      score = isCorrect ? question.points : 0;
    }

    totalScore += score;
    results.push({ question_id: question.id, is_correct: isCorrect, score });
  }

  const submission = await prisma.quizSubmission.create({
    data: {
      user_id: data.user_id,
      quiz_id: data.quiz_id,
      score: totalScore,
      time_spent: data.time_spent,
      is_passed: totalScore >= quiz.passing_score,
      results,
    },
    include: { quiz: true },
  });

  await updateProgress(data.user_id, quiz, submission.is_passed);
  return submission;
}

export async function getQuizzesByLevel(
  type: QuizType,
  id: string
): Promise<Quiz[]> {
  return prisma.quiz.findMany({
    where: {
      type,
      OR: [{ topic_id: id }, { subject_id: id }, { main_concept_id: id }],
    },
    include: { _count: { select: { submissions: true } } },
  });
}

export async function getQuizPerformance(quiz_id: string) {
  const submissions = await prisma.quizSubmission.findMany({
    where: {
      quiz_id: quiz_id,
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
  const passedSubmissions = submissions.filter((s) => s.is_passed).length;
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
        passed: output.trim() === testCase.expected_output.trim(),
        input: testCase.is_hidden ? '[Hidden]' : testCase.input,
        output: output.trim(),
      });
    } catch (error) {
      logger.error('Code execution error:', error);
      results.push({
        passed: false,
        input: testCase.is_hidden ? '[Hidden]' : testCase.input,
        output: 'Execution error',
      });
    }
  }

  return results;
}

async function updateProgress(
  user_id: string,
  quiz: Quiz,
  passed: boolean
): Promise<void> {
  if (!passed) return;
  try {
    if (quiz.topic_id) {
      await updateTopicProgress(user_id, quiz.topic_id);
    } else if (quiz.subject_id) {
      await updateSubjectProgress(user_id, quiz.subject_id, quiz.topic_id);
    } else if (quiz.main_concept_id) {
      await updateConceptProgress(user_id, quiz.main_concept_id);
    }
  } catch (error) {
    logger.error('Error updating progress:', error);
  }
}

async function updateTopicProgress(
  user_id: string,
  topic_id: string
): Promise<void> {
  await prisma.userProgress.upsert({
    where: { user_id_topic_id: { user_id, topic_id } },
    update: { is_completed: true, completed_at: new Date() },
    create: {
      user_id,
      topic_id,
      subject_id: '',
      is_completed: true,
      completed_at: new Date(),
    },
  });
}

async function updateSubjectProgress(
  user_id: string,
  subject_id: string,
  topic_id: string | null
): Promise<void> {
  await prisma.userProgress.upsert({
    where: {
      user_id_topic_id: {
        user_id,
        topic_id: topic_id ?? '',
      },
    },
    update: { is_completed: true, completed_at: new Date() },
    create: {
      user_id,
      subject_id,
      topic_id: topic_id ?? '',
      is_completed: true,
      completed_at: new Date(),
    },
  });
}

async function updateConceptProgress(
  user_id: string,
  topic_id: string
): Promise<void> {
  await prisma.userProgress.upsert({
    where: {
      user_id_topic_id: {
        user_id,
        topic_id,
      },
    },
    update: {
      is_completed: true,
      completed_at: new Date(),
    },
    create: {
      user_id,
      subject_id: '',
      topic_id,
      is_completed: true,
      completed_at: new Date(),
    },
  });
}
