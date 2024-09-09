import db from "../config/database.js";

export const getQuestionsFromDB = async () => {
  try {
    const [questions] = await db.query("SELECT * FROM questions");
    return questions;
  } catch (error) {
    console.error("Error fetching questions from the database:", error);
    throw new Error("Database Error: Unable to fetch questions");
  }
};

export const submitQuestionsToDB = async (userId, answers) => {
  try {
    const queries = answers.map((answer) => {
      return db.query(
        "INSERT INTO user_answers (user_id, question_id, answer) VALUES (?, ?, ?)",
        [userId, answer.questionId, answer.answer]
      );
    });

    await Promise.all(queries);
    return true;
  } catch (error) {
    console.error("Error submitting answers to the database:", error);
    throw new Error("Database Error: Unable to submit answers");
  }
};
