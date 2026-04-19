import {
  Prisma,
  Quiz,
  Question,
  QuizSubmission,
  QuizType,
} from '@prisma/client';
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

    let totalScore = 0;
    const results = [];

    for (const answer of data.answers) {
      const question = quiz.questions.find((q) => q.id === answer.question_id);
      if (!question) continue;

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
        is_passed: totalScore >= quiz.passing_score,
        results,
      },
      include: { quiz: true },
    });

    await this.updateProgress(data.user_id, quiz, submission.is_passed);
    return submission;
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

  private async updateProgress(
    user_id: string,
    quiz: Quiz,
    passed: boolean
  ): Promise<void> {
    if (!passed) return;
    try {
      if (quiz.topic_id) {
        await this.updateTopicProgress(user_id, quiz.topic_id);
      } else if (quiz.subject_id) {
        await this.updateSubjectProgress(
          user_id,
          quiz.subject_id,
          quiz.topic_id
        );
      } else if (quiz.main_concept_id) {
        await this.updateConceptProgress(user_id, quiz.main_concept_id);
      }
    } catch (error) {
      logger.error('Error updating progress:', error);
    }
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

  private async updateSubjectProgress(
    user_id: string,
    subject_id: string,
    topic_id: string | null
  ): Promise<void> {
    await prisma.userProgress.upsert({
      where: {
        user_id_topic_id: {
          user_id,
          topic_id: topic_id as string,
        },
      },
      update: { is_completed: true, completed_at: new Date() },
      create: {
        user_id,
        subject_id,
        topic_id,
        is_completed: true,
        completed_at: new Date(),
      },
    });
  }

  private async updateConceptProgress(
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
        topic_id,
        is_completed: true,
        completed_at: new Date(),
      },
    });
  }
}
