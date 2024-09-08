"use client";
import { fetchData } from "@/app/services/fetchData";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";
import { FaBars, FaTimes } from "react-icons/fa";

const sanitizeContent = (content) => {
  return DOMPurify.sanitize(content);
};

const dsaQuiz = {
  questions: [
    {
      text: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
      correctAnswer: 1, // Index of the correct answer
    },
    {
      text: "Which data structure uses LIFO (Last In First Out) principle?",
      options: ["Queue", "Stack", "Linked List", "Tree"],
      correctAnswer: 1,
    },
    {
      text: "What is the worst-case time complexity of quicksort?",
      options: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
      correctAnswer: 2,
    },
    {
      text: "Which of the following is not a linear data structure?",
      options: ["Array", "Queue", "Stack", "Tree"],
      correctAnswer: 3,
    },
    {
      text: "What is the time complexity of inserting an element at the end of an array?",
      options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
      correctAnswer: 0,
    },
    {
      text: "Which traversal of a binary tree visits the root node last?",
      options: ["Inorder", "Preorder", "Postorder", "Level order"],
      correctAnswer: 2,
    },
    {
      text: "What is the primary advantage of using a hash table?",
      options: [
        "Ordered data",
        "Constant-time average case for search and insert",
        "Easy to implement",
        "Low memory usage",
      ],
      correctAnswer: 1,
    },
    {
      text: "Which sorting algorithm is considered the fastest for small datasets?",
      options: ["Merge Sort", "Quick Sort", "Insertion Sort", "Heap Sort"],
      correctAnswer: 2,
    },
    {
      text: "What is the time complexity of finding an element in a balanced binary search tree?",
      options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
      correctAnswer: 2,
    },
    {
      text: "Which data structure is most suitable for implementing a priority queue?",
      options: ["Array", "Linked List", "Stack", "Heap"],
      correctAnswer: 3,
    },
  ],
};

const Resource = ({ params }) => {
  const { id } = params;
  const [resource, setResource] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("Introduction");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await fetchData("GET", "/resources/" + id);
        console.log(
          "🚀 ~ file: page.js:84 ~ fetchResource ~ response:",
          response
        );
        const data = response.data;
        if (data.success) {
          setResource(data.resource.topics);
          setQuiz(data.resource.quiz);
          if (data.resource.topics.length > 0) {
            setSelectedTopic(data.resource.topics[0].title);
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

  const toggleSolution = () => {
    setShowSolution(!showSolution);
  };

  const renderQuiz = () => {
    //write now we passing static Interview questions but i also make condtition in api check i set setQuiz if the quiz data is coming from backend then we render the quiz component in last otherwise we only show the resources

    // if (!quiz) return null;

    return (
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200 border-b pb-2 border-gray-200 dark:border-gray-700">
          DSA Quiz
        </h2>
        {dsaQuiz.questions.map((question, index) => (
          <div key={index} className="mb-6">
            <p className="font-semibold mb-2 text-lg">{`${index + 1}. ${
              question.text
            }`}</p>
            <ul className="list-none pl-5">
              {question.options.map((option, optionIndex) => (
                <li key={optionIndex} className="mb-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={optionIndex}
                      className="mr-2"
                    />
                    <span>{option}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300">
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
          {resource.map((res, index) => (
            <li
              key={index}
              className={`cursor-pointer p-3 rounded-lg transition duration-300 ${
                selectedTopic === res.title
                  ? "bg-blue-600 text-white shadow-md transform scale-105"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-md"
              }`}
              onClick={() => {
                setSelectedTopic(res.title);
                setSidebarOpen(false);
              }}
            >
              {res.title}
              {/* {progress.find((p) => p.topicId === res.id)?.isCompleted && (
                <span className="text-green-500 ml-2">&#10003;</span>
              )} */}
            </li>
          ))}

          {/* when the quiz data is coming dynamically from backend then we make condition here if quiz? then show the component otherwise not  */}
          {true && (
            <li
              className={`cursor-pointer p-3 rounded-lg transition duration-300 ${
                selectedTopic === "Quiz"
                  ? "bg-blue-600 text-white shadow-md transform scale-105"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-md"
              }`}
              onClick={() => {
                setSelectedTopic("Quiz");
                setSidebarOpen(false);
              }}
            >
              Quiz
            </li>
          )}
        </ul>
      </div>

      {/* Main content */}
      <div className="w-full md:w-9/12 lg:w-10/12 p-5 md:p-10 overflow-y-auto">
        {selectedTopic === "Quiz"
          ? renderQuiz()
          : resource.map(
              (res, index) =>
                selectedTopic === res.title && (
                  <div
                    key={index}
                    className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 transition-all duration-300 hover:shadow-2xl"
                  >
                    <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200 border-b pb-2 border-gray-200 dark:border-gray-700">
                      {res.title}
                    </h2>
                    <div
                      className="prose dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeContent(res?.Articles[0]?.content),
                      }}
                    ></div>
                  </div>
                )
            )}
      </div>
    </div>
  );
};

export default Resource;
