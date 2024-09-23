"use client";
import React, { useEffect, useState } from "react";
import { fetchData } from "@/app/services/fetchData";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";
import { FaBars, FaTimes } from "react-icons/fa";

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
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200 border-b pb-2 border-gray-200 dark:border-gray-700">
          Quiz: {selectedTopic.title}
        </h2>
        {quiz.questions.map((question, index) => (
          <div key={index} className="mb-6">
            <p className="font-semibold mb-2 text-lg">{`${index + 1}. ${
              question.question
            }`}</p>
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
                      className="mr-2"
                    />
                    <span>{option.answerText}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <button
          onClick={handleSubmitQuiz}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
        >
          Submit Quiz
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
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
      <div
        className={`w-full md:w-3/12 lg:w-2/12 bg-white dark:bg-gray-800 p-5 overflow-y-auto transition-all duration-300 ease-in-out ${
          sidebarOpen ? "fixed inset-0 z-10" : "hidden"
        } md:relative md:translate-x-0 md:block shadow-lg`}
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200 border-b pb-2 border-gray-200 dark:border-gray-700">
          Topics
        </h2>
        <ul className="space-y-2">
          {resource.map((topic, index) => (
            <li
              key={index}
              className={`cursor-pointer p-3 rounded-lg transition duration-300 ${
                selectedTopic?.id === topic.id
                  ? "bg-blue-600 text-white shadow-md transform scale-105"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-md"
              }`}
              onClick={() => {
                setSelectedTopic(topic);
              }}
            >
              {topic.title}
            </li>
          ))}
        </ul>
      </div>

      <div className="w-full md:w-9/12 lg:w-10/12 p-5 md:p-10 overflow-y-auto">
        {selectedTopic && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200 border-b pb-2 border-gray-200 dark:border-gray-700">
              {selectedTopic.title}
            </h2>
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: sanitizeContent(
                  selectedTopic.Articles[0]?.content || ""
                ),
              }}
            ></div>
          </div>
        )}
        {renderQuiz()}
      </div>
    </div>
  );
};

export default Resource;
