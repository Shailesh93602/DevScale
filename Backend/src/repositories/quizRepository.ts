import { Prisma, Quiz, Question, QuizSubmission } from '@prisma/client';
import { QuizType } from '../constants/enums';
import BaseRepository from './baseRepository.js';
import { QuizData, QuizSubmissionData, TestCase } from '../types/index.js';
import { executeCode } from '../utils/codeExecutor';
import logger from '../utils/logger.js';
import { createAppError } from '../utils/errorHandler.js';

import prisma from '../lib/prisma.js';

export default class QuizRepository extends BaseRepository<
  Quiz,
  typeof prisma.quiz
> {
  constructor() {
    super(prisma.quiz);
  }

  async createQuiz(data: QuizData): Promise<Quiz> {
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

  async submitQuiz(data: QuizSubmissionData): Promise<QuizSubmission> {
    const quiz = await prisma.quiz.findUnique({
      where: { id: data.quiz_id },
      include: { questions: true },
    });

    if (!quiz) throw createAppError('Quiz not found', 404);

    if (!Array.isArray(data.answers)) {
      throw createAppError('answers must be an array', 400);
    }

    let totalScore = 0;
    const results = [];
    const graded = new Set<string>();

    for (const answer of data.answers) {
      const question = quiz.questions.find((q) => q.id === answer?.question_id);
      // One answer per question: a repeated question_id must not score twice.
      if (!question || graded.has(question.id)) continue;
      graded.add(question.id);

      const { isCorrect, score } = await this.calculateAnswerScore(
        answer.answer,
        question
      );

      totalScore += score;
      results.push({ question_id: question.id, is_correct: isCorrect, score });
    }

    const submission = await prisma.quizSubmission.create({
      data: {
        user_id: data.user_id,
        quiz_id: data.quiz_id,
        score: totalScore,
        time_spent: data.time_spent,
        is_passed: QuizRepository.isPassed(totalScore, quiz),
        results,
      },
      include: { quiz: true },
    });

    await this.updateProgress(data.user_id, quiz, submission.is_passed);
    return submission;
  }

  /** passing_score is a percentage of the quiz's total points, not raw points. */
  static isPassed(
    totalScore: number,
    quiz: { passing_score: number; questions: Array<{ points: number }> }
  ): boolean {
    const maxScore = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    return maxScore > 0 && (totalScore * 100) / maxScore >= quiz.passing_score;
  }

  async getQuizzesByLevel(type: QuizType, id: string): Promise<Quiz[]> {
    return prisma.quiz.findMany({
      where: {
        type,
        OR: [{ topic_id: id }, { subject_id: id }, { main_concept_id: id }],
      },
      include: { _count: { select: { submissions: true } } },
    });
  }

  async getQuizPerformance(quiz_id: string) {
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

  private async calculateAnswerScore(
    userAnswer: string,
    question: Question
  ): Promise<{ isCorrect: boolean; score: number }> {
    let isCorrect = false;

    if (question.type === 'coding') {
      const testResults = await this.evaluateCode(
        userAnswer,
        Array.isArray(question.test_cases)
          ? (question.test_cases as unknown as TestCase[])
          : undefined
      );
      isCorrect = testResults.every((r) => r.passed);
    } else {
      isCorrect = userAnswer === question.correct_answer;
    }

    return {
      isCorrect,
      score: isCorrect ? question.points : 0,
    };
  }

  private async evaluateCode(
    code: string,
    testCases?: TestCase[]
  ): Promise<Array<{ passed: boolean; input: string; output: string }>> {
    if (!testCases) return [];

    const results = [];
    for (const testCase of testCases) {
      try {
        const { output } = await executeCode({
          code,
          language: 'javascript',
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

  // UserProgress is keyed by (user, topic) only. A subject- or concept-level
  // quiz has no row it can honestly write to (topic_id would be null or a
  // non-topic id), so only topic quizzes record progress.
  private async updateProgress(
    user_id: string,
    quiz: Quiz,
    passed: boolean
  ): Promise<void> {
    if (!passed || !quiz.topic_id) return;
    await this.updateTopicProgress(user_id, quiz.topic_id);
  }

  private async updateTopicProgress(
    user_id: string,
    topic_id: string
  ): Promise<void> {
    await prisma.userProgress.upsert({
      where: { user_id_topic_id: { user_id, topic_id } },
      update: { is_completed: true, completed_at: new Date() },
      create: {
        user_id,
        topic_id,
        is_completed: true,
        completed_at: new Date(),
      },
    });
  }
}
