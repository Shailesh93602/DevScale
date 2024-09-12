import db from "../../db/models/index.js";
import { logger } from "../helpers/logger.js";

export const createQuiz = async (req, res) => {
  try {
    const { topicId, passingMarks, questions } = req.body;

    const quiz = await db.Quiz.create({
      topicId,
      passingMarks,
    });

    if (questions && questions.length > 0) {
      const quizQuestions = questions.map((question) => ({
        quizId: quiz.id,
        question: question.question,
      }));

      await db.QuizQuestion.bulkCreate(quizQuestions);
    }

    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      quiz,
    });
  } catch (error) {
    logger.error("Error creating quiz:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { quizId, answers } = req.body;

    const quiz = await db.Quiz.findByPk(quizId, {
      include: {
        model: db.QuizQuestion,
        include: [db.QuizAnswer],
      },
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    let score = 0;

    for (const submittedAnswer of answers) {
      const question = quiz.QuizQuestions.find(
        (q) => q.id === submittedAnswer.questionId
      );

      if (question && question.correctAnswer === submittedAnswer.answer) {
        score += 1;
      }
    }

    const completed = score >= quiz.passingMarks;

    const submission = await db.QuizSubmission.create({
      userId,
      quizId,
      score,
    });

    const submissionAnswers = answers.map((answer) => ({
      submissionId: submission.id,
      questionId: answer.questionId,
      answer: answer.answer,
    }));

    await db.QuizAnswer.bulkCreate(submissionAnswers);

    res.status(201).json({
      success: true,
      message: "Quiz submitted successfully",
      submission,
      completed,
    });
  } catch (error) {
    logger.error("Error submitting quiz:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    const progress = await db.QuizSubmission.findAll({
      where: { userId },
      include: [
        {
          model: db.Quiz,
          include: {
            model: db.Topic,
            attributes: ["name", "subjectId"],
          },
        },
      ],
    });

    res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    logger.error("Error retrieving user progress:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
