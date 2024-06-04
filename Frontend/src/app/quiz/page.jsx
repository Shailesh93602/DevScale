"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

const questions = [
  {
    questionText: "What is the capital of France?",
    answerOptions: [
      { answerText: "New York", isCorrect: false },
      { answerText: "London", isCorrect: false },
      { answerText: "Paris", isCorrect: true },
      { answerText: "Dublin", isCorrect: false },
    ],
  },
  {
    questionText: "Who is CEO of Tesla?",
    answerOptions: [
      { answerText: "Jeff Bezos", isCorrect: false },
      { answerText: "Elon Musk", isCorrect: true },
      { answerText: "Bill Gates", isCorrect: false },
      { answerText: "Tony Stark", isCorrect: false },
    ],
  },
];

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  const handleAnswerOptionClick = (isCorrect) => {
    if (isCorrect) {
      setScore(score + 1);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-xl p-8 bg-white shadow-lg rounded-lg">
        {showScore ? (
          <motion.div
            className="score-section text-center text-2xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            You scored {score} out of {questions.length}
          </motion.div>
        ) : (
          <>
            <motion.div
              className="question-section mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="question-count text-xl font-medium">
                <span>Question {currentQuestion + 1}</span>/{questions.length}
              </div>
              <div className="question-text mt-4 text-lg">
                {questions[currentQuestion].questionText}
              </div>
            </motion.div>
            <motion.div
              className="answer-section grid gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {questions[currentQuestion].answerOptions.map(
                (answerOption, index) => (
                  <motion.button
                    key={index}
                    onClick={() =>
                      handleAnswerOptionClick(answerOption.isCorrect)
                    }
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="py-2 px-4 bg-blue-500 text-white rounded-lg focus:outline-none shadow-md"
                  >
                    {answerOption.answerText}
                  </motion.button>
                )
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default Quiz;
