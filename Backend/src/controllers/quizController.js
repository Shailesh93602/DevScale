import db from "../../db/models/index.js";

export const createQuiz = async (req, res) => {
  try {
    const { topicId, passingScore } = req.body;

    const quiz = await db.Quiz.create({
      topicId,
      passingScore,
    });

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
    const { userId, topicId, score } = req.body;

    const quiz = await db.Quiz.findOne({ where: { topicId } });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const completed = score >= quiz.passingScore;

    const progress = await db.UserProgress.create({
      userId,
      topicId,
      score,
      completed,
    });

    res.status(201).json({
      success: true,
      message: "Quiz submitted successfully",
      progress,
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

    const progress = await db.UserProgress.findAll({
      where: { userId },
      include: {
        model: db.Topic,
        attributes: ["name", "subjectId"],
      },
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
