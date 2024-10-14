"use client";
import React, { useEffect, useState } from "react";
import { fetchData } from "@/app/services/fetchData";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes, FaBook, FaQuestionCircle } from "react-icons/fa";

const sanitizeContent = (content) => {
  return DOMPurify.sanitize(content);
};

const Resource = ({ params }) => {
  const { id } = params;
  const [resource, setResource] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [activeTab, setActiveTab] = useState("content");

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await fetchData("GET", "/resources/" + id);
        const data = response.data;
        if (data.success) {
          setResource(data.resource.topics);
          if (data.resource.topics.length > 0) {
            setSelectedTopic(data.resource.topics[0]);
          }
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error("Something went wrong, Please try again!");
      }
    };

    fetchResource();
  }, [id]);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (selectedTopic) {
        try {
          const response = await fetchData(
            "GET",
            `/topics/${selectedTopic.id}/quiz`
          );
          const data = response.data;
          if (data) {
            setQuiz(data);
          } else {
            setQuiz(null);
          }
        } catch (error) {
          toast.error("Failed to fetch quiz. Please try again!");
          setQuiz(null);
        }
      }
    };
    fetchQuiz();
  }, [selectedTopic]);

  const handleAnswerSelect = (questionId, selectedAnswer) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: selectedAnswer,
    }));
  };

  const handleSubmitQuiz = async () => {
    const answers = Object.entries(userAnswers).map(([questionId, answer]) => ({
      questionId: parseInt(questionId),
      answer,
    }));

    try {
      const response = await fetchData("POST", "/quiz/submit", {
        quizId: quiz.id,
        answers,
      });
      const data = response.data;

      if (data.success) {
        toast.success("Quiz submitted successfully!");
        if (data.completed) {
          toast.success("You have passed the quiz!");
        } else {
          toast.info("You did not pass the quiz.");
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error submitting quiz. Please try again!");
    }
  };

  const renderQuiz = () => {
    if (!quiz) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 transition-all duration-300 hover:shadow-2xl"
      >
        <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200 border-b pb-2 border-gray-200 dark:border-gray-700">
          Quiz: {selectedTopic.title}
        </h2>
        {quiz.questions.map((question, index) => (
          <div key={index} className="mb-6">
            <p className="font-semibold mb-2 text-lg text-gray-700 dark:text-gray-300">{`${
              index + 1
            }. ${question.question}`}</p>
            <ul className="list-none pl-5">
              {question.options.map((option, optionIndex) => (
                <li key={optionIndex} className="mb-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option.answerText}
                      checked={userAnswers[question.id] === option.answerText}
                      onChange={() =>
                        handleAnswerSelect(question.id, option.answerText)
                      }
                      className="mr-2 focus:ring-2 focus:ring-blue-500 text-blue-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      {option.answerText}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <button
          onClick={handleSubmitQuiz}
          className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Submit Quiz
        </button>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900">
      <button
        className="md:hidden fixed top-4 right-4 z-20 bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? (
          <FaTimes className="w-6 h-6" />
        ) : (
          <FaBars className="w-6 h-6" />
        )}
      </button>
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: sidebarOpen ? 0 : "-100%" }}
        transition={{ duration: 0.3 }}
        className={`w-full md:w-3/12 lg:w-2/12 bg-white dark:bg-gray-800 p-5 overflow-y-auto fixed inset-y-0 left-0 z-10 md:relative md:translate-x-0 shadow-lg`}
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200 border-b pb-2 border-gray-200 dark:border-gray-700">
          Topics
        </h2>
        <ul className="space-y-2">
          {resource.map((topic, index) => (
            <motion.li
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`cursor-pointer p-3 rounded-lg transition duration-300 ${
                selectedTopic?.id === topic.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-md"
              }`}
              onClick={() => {
                setSelectedTopic(topic);
                setSidebarOpen(false);
              }}
            >
              {topic.title}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <div className="w-full md:w-9/12 lg:w-10/12 p-5 md:p-10 overflow-y-auto">
        {selectedTopic && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 transition-all duration-300 hover:shadow-2xl"
          >
            <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-gray-200 border-b pb-2 border-gray-200 dark:border-gray-700">
              {selectedTopic.title}
            </h1>
            <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700">
              <button
                className={`mr-4 py-2 px-4 focus:outline-none ${
                  activeTab === "content"
                    ? "border-b-2 border-blue-500 text-blue-500"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
                onClick={() => setActiveTab("content")}
              >
                <FaBook className="inline-block mr-2" /> Content
              </button>
              <button
                className={`py-2 px-4 focus:outline-none ${
                  activeTab === "quiz"
                    ? "border-b-2 border-blue-500 text-blue-500"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
                onClick={() => setActiveTab("quiz")}
              >
                <FaQuestionCircle className="inline-block mr-2" /> Quiz
              </button>
            </div>
            <AnimatePresence mode="wait">
              {activeTab === "content" ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeContent(
                      selectedTopic.Articles[0]?.content || ""
                    ),
                  }}
                ></motion.div>
              ) : (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {renderQuiz()}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Resource;
