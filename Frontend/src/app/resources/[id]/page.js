"use client";
import { fetchData } from "@/app/services/fetchData";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  FaBook,
  FaVideo,
  FaRegComments,
  FaPuzzlePiece,
  FaLightbulb,
} from "react-icons/fa";

const Resource = ({ params }) => {
  const { id } = params;
  const [resource, setResource] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("Introduction");

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await fetchData("GET", "/resources/" + id);
        const data = response.data;
        if (data.success) {
          setResource(data.resource);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error("Something went wrong, Please try again!");
      }
    };
    fetchResource();
  }, []);

  if (!resource) {
    return <div className="text-center mt-10">Resource not found.</div>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="w-full md:w-1/4 p-5 bg-gray-100 dark:bg-gray-800 h-full md:sticky top-0 border-r dark:border-gray-700 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Topics
        </h2>
        <ul className="space-y-2">
          {resource.map((res, index) => (
            <li
              key={index}
              className={`cursor-pointer p-2 rounded transition duration-300 ${
                selectedTopic === res.topic
                  ? "bg-blue-600 text-white dark:bg-blue-500"
                  : "hover:bg-gray-300 dark:hover:bg-gray-700"
              }`}
              onClick={() => setSelectedTopic(res.topic)}
            >
              {res.topic}
            </li>
          ))}
        </ul>
      </div>

      <div className="w-full md:w-3/4 p-5 bg-white dark:bg-gray-900 text-black dark:text-white shadow-lg overflow-y-auto">
        {resource.map(
          (res, index) =>
            selectedTopic === res.topic && (
              <div key={index} className="mb-6">
                <h2 className="text-3xl font-bold mb-4 border-b pb-2 border-gray-300 dark:border-gray-700">
                  {res.topic}
                </h2>
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2 flex items-center text-blue-600 dark:text-blue-400">
                    <FaBook className="mr-2" />
                    Definition
                  </h3>
                  <p className="text-lg">{res.definition}</p>
                </div>
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2 flex items-center text-blue-600 dark:text-blue-400">
                    <FaLightbulb className="mr-2" />
                    Explanation
                  </h3>
                  <p className="text-lg">{res.explanation}</p>
                </div>
                {res.types && (
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-2 text-blue-600 dark:text-blue-400">
                      Types
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {res.types.map((type) => (
                        <li key={type}>{type}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2 text-blue-600 dark:text-blue-400">
                    Examples
                  </h3>
                  {res.examples.map((example, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-semibold">{example.description}</p>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg mb-2 overflow-x-auto">
                        {example.code}
                      </pre>
                      <p>{example.explanation}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2 text-blue-600 dark:text-blue-400">
                    Images
                  </h3>
                  {res.images.map((image, idx) => (
                    <div key={idx} className="mb-4">
                      <img
                        src={image.url}
                        alt={image.description}
                        className="w-full mb-2 rounded-lg shadow"
                      />
                      <p>{image.description}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2 text-blue-600 dark:text-blue-400">
                    Additional Resources
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    {res.additional_resources.map((resource, idx) => (
                      <li key={idx}>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {resource.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2 text-blue-600 dark:text-blue-400">
                    Quizzes
                  </h3>
                  {res.quizzes.map((quiz, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-semibold">{quiz.question}</p>
                      <ul className="list-disc list-inside space-y-1">
                        {quiz.options.map((option, optionIdx) => (
                          <li key={optionIdx}>{option}</li>
                        ))}
                      </ul>
                      <p>
                        <span className="font-semibold">Answer:</span>{" "}
                        {quiz.answer}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2 text-blue-600 dark:text-blue-400">
                    Exercises
                  </h3>
                  {res.exercises.map((exercise, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-semibold">{exercise.description}</p>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg mb-2 overflow-x-auto">
                        {exercise.solution}
                      </pre>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2 text-blue-600 dark:text-blue-400">
                    Discussion Links
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    {res.discussion_links.map((link, idx) => (
                      <li key={idx}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {link.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2 text-blue-600 dark:text-blue-400">
                    Video Tutorials
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    {res.video_tutorials.map((video, idx) => (
                      <li key={idx}>
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {video.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2 text-blue-600 dark:text-blue-400">
                    Common Mistakes
                  </h3>
                  {res.common_mistakes?.map((mistake, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-semibold">{mistake.mistake}</p>
                      <p>{mistake.explanation}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2 text-blue-600 dark:text-blue-400">
                    Real-World Applications
                  </h3>
                  {res.real_world_applications?.map((application, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-semibold">{application.application}</p>
                      <p>{application.explanation}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2 text-blue-600 dark:text-blue-400">
                    Interactive Diagrams
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    {res.interactive_diagrams.map((diagram, idx) => (
                      <li key={idx}>
                        <a
                          href={diagram.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {diagram.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2 text-blue-600 dark:text-blue-400">
                    User Feedback
                  </h3>
                  {res.user_feedback.map((feedback, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-semibold">Rating: {feedback.rating}</p>
                      {feedback.comments.map((comment, commentIdx) => (
                        <div key={commentIdx} className="mb-2">
                          <p className="font-semibold">{comment.user}</p>
                          <p>{comment.comment}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default Resource;
