import db from "../models/index.js";
import { roadmaps } from "../../resources/roadmaps/roadmap.js";

const quizzes = [
  {
    topicName: "HTML Basics",
    passingMarks: 60,
    questions: [
      {
        question: "What does HTML stand for?",
        options: [
          { answerText: "Hyper Text Markup Language", isCorrect: true },
          { answerText: "Home Tool Markup Language", isCorrect: false },
          {
            answerText: "Hyperlinks and Text Markup Language",
            isCorrect: false,
          },
        ],
      },
      {
        question: "Which is the correct HTML tag for the largest heading?",
        options: [
          { answerText: "<heading>", isCorrect: false },
          { answerText: "<h6>", isCorrect: false },
          { answerText: "<h1>", isCorrect: true },
        ],
      },
    ],
  },
  {
    topicName: "HTML Document Structure",
    passingMarks: 50,
    questions: [
      {
        question: "Which tag is used to define the document type in HTML5?",
        options: [
          { answerText: "<!DOCTYPE>", isCorrect: true },
          { answerText: "<html>", isCorrect: false },
          { answerText: "<meta>", isCorrect: false },
        ],
      },
      {
        question: "Which part of the HTML document contains the metadata?",
        options: [
          { answerText: "<head>", isCorrect: true },
          { answerText: "<body>", isCorrect: false },
          { answerText: "<title>", isCorrect: false },
        ],
      },
    ],
  },
];

const seedQuizzes = async () => {
  try {
    await db.sequelize.authenticate();

    for (const quizData of quizzes) {
      const [topic] = await db.Topic.findOrCreate({
        where: { title: quizData.topicName },
        defaults: { title: quizData.topicName },
      });

      const [quiz] = await db.Quiz.findOrCreate({
        where: {
          topicId: topic.id,
          passingScore: quizData.passingMarks,
        },
      });

      for (const questionData of quizData.questions) {
        const [question] = await db.QuizQuestion.findOrCreate({
          where: {
            quizId: quiz.id,
            question: questionData.question,
          },
        });

        for (const option of questionData.options) {
          await db.QuizOption.findOrCreate({
            where: {
              quizQuestionId: question.id,
              answerText: option.answerText,
              isCorrect: option.isCorrect,
            },
          });
        }
      }
    }

    console.log("Quizzes seeded or updated successfully!");
  } catch (error) {
    console.error("Error seeding quizzes:", error);
  } finally {
    await db.sequelize.close();
  }
};

seedQuizzes();
