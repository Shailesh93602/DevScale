import db from "../models/index.js";
import { roadmaps } from "../../resources/roadmaps/roadmap.js";

const quizzes = [
  {
    topicName: "HTML Basics",
    passingMarks: 60,
    questions: [
      {
        question: "What does HTML stand for?",
        answers: [
          { answer: "Hyper Text Markup Language", isCorrect: true },
          { answer: "Home Tool Markup Language", isCorrect: false },
          { answer: "Hyperlinks and Text Markup Language", isCorrect: false },
        ],
      },
      {
        question: "Which is the correct HTML tag for the largest heading?",
        answers: [
          { answer: "<heading>", isCorrect: false },
          { answer: "<h6>", isCorrect: false },
          { answer: "<h1>", isCorrect: true },
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
        answers: [
          { answer: "<!DOCTYPE>", isCorrect: true },
          { answer: "<html>", isCorrect: false },
          { answer: "<meta>", isCorrect: false },
        ],
      },
      {
        question: "Which part of the HTML document contains the metadata?",
        answers: [
          { answer: "<head>", isCorrect: true },
          { answer: "<body>", isCorrect: false },
          { answer: "<title>", isCorrect: false },
        ],
      },
    ],
  },
  // Add more quizzes here for each topic
];

const seedQuizzes = async () => {
  try {
    await db.connect;
    await db.sequelize.authenticate();

    for (const quizData of quizzes) {
      const topic = await db.Topic.findOne({
        where: { title: quizData.topicName },
      });

      if (!topic) {
        console.error(`Topic not found: ${quizData.topicName}`);
        continue;
      }

      const quiz = await db.Quiz.create({
        topicId: topic.id,
        passingScore: quizData.passingMarks,
      });

      for (const questionData of quizData.questions) {
        const question = await db.QuizQuestion.create({
          quizId: quiz.id,
          question: questionData.question,
        });

        for (const answerData of questionData.answers) {
          await db.QuizAnswer.create({
            questionId: question.id,
            answer: answerData.answer,
            isCorrect: answerData.isCorrect,
          });
        }
      }
    }

    console.log("Quizzes seeded successfully");
  } catch (error) {
    console.error("Error seeding quizzes:", error);
  } finally {
    await db.sequelize.close();
  }
};

seedQuizzes();
