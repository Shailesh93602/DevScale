"use client";
import React, { useEffect, useState } from "react";
import { fetchData } from "@/app/services/fetchData";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";
import { FaBars, FaTimes } from "react-icons/fa";
import { TextField, IconButton, Button, Box } from "@mui/material";
import { Edit, Save, Visibility, VisibilityOff } from "@mui/icons-material";

const sanitizeContent = (content) => {
  return DOMPurify.sanitize(content);
};

const Resource = ({ params }) => {
  const { id } = params;
  const [resource, setResource] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await fetchData("GET", "/resources/" + id);
        const data = response.data;
        if (data.success) {
          setResource(data.resource.topics);
          if (data.resource.topics.length > 0) {
            setSelectedTopic(data.resource.topics[0]);
            setEditedTitle(data.resource.topics[0].title);
            setEditedContent(
              data.resource.topics[0].Articles[0]?.content || ""
            );
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
          if (data.success) {
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
    if (!quiz) {
      fetchQuiz();
    }
  }, [selectedTopic]);

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

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleSave = () => {};

  // you can do api calling like this just add the endpoints

  // const handleSave = async () => {
  //   try {
  //     const response = await fetchData("PUT", `/topics/${selectedTopic.id}`, {
  //       title: editedTitle,
  //       content: editedContent,
  //     });
  //     const data = response.data;
  //     if (data.success) {
  //       toast.success("Resource updated successfully!");
  //       setSelectedTopic({
  //         ...selectedTopic,
  //         title: editedTitle,
  //         Articles: [{ ...selectedTopic.Articles[0], content: editedContent }],
  //       });
  //       setIsEditMode(false);
  //     } else {
  //       toast.error(data.message);
  //     }
  //   } catch (error) {
  //     toast.error("Failed to update resource. Please try again!");
  //   }
  // };

  const handleCancel = () => {
    setEditedTitle(selectedTopic.title);
    setEditedContent(selectedTopic.Articles[0]?.content || "");
    setIsEditMode(false);
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
                setEditedTitle(topic.title);
                setEditedContent(topic.Articles[0]?.content || "");
                setIsEditMode(false);
                setSidebarOpen(false);
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
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              {isEditMode ? (
                <TextField
                  fullWidth
                  variant="outlined"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="mb-4"
                />
              ) : (
                <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200 border-b pb-2 border-gray-200 dark:border-gray-700">
                  {selectedTopic.title}
                </h2>
              )}
              <Box>
                {isEditMode ? (
                  <>
                    <IconButton onClick={handleSave} color="primary">
                      <Save />
                    </IconButton>
                    <IconButton onClick={handleCancel} color="secondary">
                      <VisibilityOff />
                    </IconButton>
                  </>
                ) : (
                  <IconButton onClick={handleEdit} color="primary">
                    <Edit />
                  </IconButton>
                )}
              </Box>
            </Box>
            {isEditMode ? (
              <TextField
                fullWidth
                multiline
                rows={10}
                variant="outlined"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
              />
            ) : (
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: sanitizeContent(
                    selectedTopic.Articles[0]?.content || ""
                  ),
                }}
              ></div>
            )}
          </div>
        )}
        {renderQuiz()}
      </div>
    </div>
  );
};

export default Resource;
