import db from "../../db/models/index.js";
import { Op, Sequelize } from "sequelize";
import { logger } from "../helpers/logger.js";

export const getUnpublishedTopics = async (req, res) => {
  try {
    const topics = await db.Topic.findAll({
      where: {
        id: {
          [Op.in]: Sequelize.literal(`(
            SELECT DISTINCT \`Topics\`.\`id\`
            FROM \`Topics\`
            LEFT JOIN \`Articles\` ON \`Articles\`.\`topicId\` = \`Topics\`.\`id\`
            WHERE \`Articles\`.\`status\` IS NULL
            OR \`Articles\`.\`status\` != 'approved'
          )`),
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Unpublished topics retrieved successfully",
      topics,
    });
  } catch (error) {
    logger.error("Error retrieving unpublished topics:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getArticlesForTopic = async (req, res) => {
  const { topicId } = req.params;
  try {
    const topic = await db.Topic.findByPk(topicId, {
      include: [
        {
          model: db.Article,
          attributes: ["id", "title", "content"],
          where: { status: "approved" },
          required: false,
        },
      ],
    });
    if (topic) {
      res.status(200).json(topic.Articles);
    } else {
      res.status(404).json({ message: "Topic not found" });
    }
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getQuizByTopicId = async (req, res) => {
  const { topicId } = req.params;

  try {
    const quiz = await db.Quiz.findOne({
      where: { topicId },
      include: [{ model: db.Question, as: "questions" }],
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    return res.status(200).json(quiz);
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const submitQuiz = async (req, res) => {
  const { userId } = req.user;
  const { topicId, answers } = req.body;

  try {
    const quiz = await db.Quiz.findOne({
      where: { topicId },
      include: [{ model: db.Question, as: "questions" }],
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (question.correctAnswer === answers[index]) {
        score += 1;
      }
    });

    const passingScore =
      quiz.passingScore || Math.ceil(quiz.questions.length * 0.7);

    const isPassed = score >= passingScore;

    if (isPassed) {
      await db.UserProgress.update(
        { isCompleted: true },
        { where: { userId, topicId } }
      );
    }

    return res.status(200).json({
      message: isPassed ? "Quiz passed!" : "Quiz failed",
      score,
      isPassed,
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
