import { logger } from "../helpers/logger.js";
import {
  getQuestionsFromDB,
  submitQuestionsToDB,
} from "../services/questionService.js";

export const getQuestions = async (req, res) => {
  try {
    const questions = await getQuestionsFromDB();
    res.status(200).json({ success: true, questions });
  } catch (error) {
    logger.error("Error fetching questions:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const submitQuestions = async (req, res) => {
  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid questions data" });
    }

    await submitQuestionsToDB(questions);
    res
      .status(201)
      .json({ success: true, message: "Questions submitted successfully" });
  } catch (error) {
    logger.error("Error submitting questions:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
