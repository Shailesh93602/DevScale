"use client";
import React, { useEffect, useState } from "react";
import { fetchData } from "@/app/services/fetchData";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes, FaBook, FaQuestionCircle } from "react-icons/fa";

const sanitizeContent = (content: string) => {
  return DOMPurify.sanitize(content);
};

export default function Resources({
  resource,
}: {
  resource: { id: string; title: string; Articles: { content: string }[] }[];
}) {
  const [selectedTopic, setSelectedTopic] = useState<{
    id: string;
    title: string;
    Articles: { content: string }[];
  }>(resource?.[0] ?? undefined);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quiz, setQuiz] = useState<{
    id: string;
    questions?: {
      id: string;
      question: string;
      options: { id: string; answerText: string }[];
    }[];
  } | null>(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [activeTab, setActiveTab] = useState("content");

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
          console.error(error);
        }
      }
    };
    fetchQuiz();
  }, [selectedTopic]);

  const handleAnswerSelect = (questionId: string, selectedAnswer: string) => {
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
        quizId: quiz?.id,
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
      console.error(error);
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
          Quiz: {selectedTopic?.title}
        </h2>
        {quiz?.questions?.map((question, index) => (
          <div key={question.id} className="mb-6">
            <p className="font-semibold mb-2 text-lg text-gray-700 dark:text-gray-300">{`${
              index + 1
            }. ${question.question}`}</p>
            <ul className="list-none pl-5">
              {question?.options?.map((option) => (
                <li key={option.id} className="mb-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option.answerText}
                      checked={
                        userAnswers[question.id as keyof object] ===
                        option.answerText
                      }
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
    <div className="flex flex-col md:flex-row">
      <button
        className="md:hidden fixed top-4 right-4 z-20 bg-primary text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:bg-primary2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-opacity-50"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? (
          <FaTimes className="w-6 h-6" />
        ) : (
          <FaBars className="w-6 h-6" />
        )}
      </button>
      <motion.div
        initial={{ x: "0" }}
        animate={{ x: sidebarOpen || window.innerWidth >= 768 ? 0 : "-100%" }}
        transition={{ duration: 0.3 }}
        className={`w-full md:w-3/12 lg:w-2/12 bg-lightSecondary p-5 overflow-y-auto fixed inset-y-0 left-0 z-10 shadow-lg overflow-y-scroll max-h-screen ${
          window.innerWidth >= 768 ? "relative translate-x-0" : ""
        }`}
      >
        <h2 className="text-2xl font-bold mb-6 border-b pb-2 border-border">
          Topics
        </h2>
        <ul className="space-y-2">
          {resource.map((topic) => (
            <motion.li
              key={topic.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`cursor-pointer p-3 rounded-lg transition duration-300 hover:bg-primary2 hover:text-white ${
                selectedTopic?.id === topic.id
                  ? "bg-primary text-white shadow-md"
                  : "hover:shadow-md"
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
            className="mb-8 rounded-lg shadow-xl p-8 transition-all duration-300 hover:shadow-2xl bg-lightSecondary"
          >
            <h1 className="text-4xl font-bold mb-6  border-b pb-2 border-border">
              {selectedTopic.title}
            </h1>
            <div className="flex mb-4 border-b border-border">
              <button
                className={`mr-4 py-2 px-4 focus:outline-none hover:text-primary2 ${
                  activeTab === "content"
                    ? "border-b-2 border-primary text-primary"
                    : "text-grayText"
                }`}
                onClick={() => setActiveTab("content")}
              >
                <FaBook className="inline-block mr-2" /> Content
              </button>
              <button
                className={`py-2 px-4 focus:outline-none hover:text-primary2 ${
                  activeTab === "quiz"
                    ? "border-b-2 border-primary text-primary"
                    : "text-grayText"
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
}
