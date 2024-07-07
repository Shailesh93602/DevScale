"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Resource = ({ params }) => {
  const { id } = params;
  const [resource, setResource] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("Arrays");

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_BASE_URL + "/resources/" + id,
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        );
        const json = await response.json();
        if (json.success) {
          setResource(json.resource);
          toast.success(json.message);
        } else {
          toast.error(json.message);
        }
      } catch (error) {
        console.error("Error fetching resource:", error);
      }
    };
    fetchResource();
  }, []);
  if (!resource) {
    return <div className="text-center mt-10">Resource not found.</div>;
  }

  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-1/4 p-5 bg-gray-200 dark:bg-gray-800  h-max overflow-y-auto border-r dark:border-gray-900">
        <h2 className="text-xl font-semibold mb-4">Topics</h2>
        <ul className="space-y-2">
          {resource.map((resource, index) => (
            <li
              key={index}
              className={`cursor-pointer p-2 rounded ${
                selectedTopic === resource.topic ? "bg-blue-500 text-white" : ""
              }`}
              onClick={() => setSelectedTopic(resource.topic)}
            >
              {resource.topic}
            </li>
          ))}
        </ul>
      </div>

      <div className="w-full md:w-3/4 p-5 bg-blue-50 dark:bg-gray-800 text-black dark:text-white ml-0 md:ml-1/4">
        {resource.map(
          (resource, index) =>
            selectedTopic === resource.topic && (
              <div
                key={index}
                className="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg shadow-md mb-6"
              >
                <h2 className="text-2xl font-bold mb-4">{resource.topic}</h2>
                <p className="text-lg mb-4">
                  <span className="font-semibold">Definition:</span>{" "}
                  {resource.definition}
                </p>
                <p className="text-lg mb-4">
                  <span className="font-semibold">Explanation:</span>{" "}
                  {resource.explanation}
                </p>

                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">Examples:</h3>
                  {resource.examples.map((example, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-semibold">{example.description}</p>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg mb-2">
                        {example.code}
                      </pre>
                      <p>{example.explanation}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">Images:</h3>
                  {resource.images.map((image, idx) => (
                    <div key={idx} className="mb-4">
                      <img
                        src={image.url}
                        alt={image.description}
                        className="w-full mb-2 rounded-lg"
                      />
                      <p>{image.description}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">
                    Additional Resources:
                  </h3>
                  <ul className="list-disc list-inside">
                    {resource.additional_resources.map((resource, idx) => (
                      <li key={idx}>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {resource.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">Quizzes:</h3>
                  {resource.quizzes.map((quiz, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-semibold">{quiz.question}</p>
                      <ul className="list-disc list-inside">
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
                  <h3 className="text-xl font-semibold mb-2">Exercises:</h3>
                  {resource.exercises.map((exercise, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-semibold">{exercise.description}</p>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg mb-2">
                        {exercise.solution}
                      </pre>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">
                    Discussion Links:
                  </h3>
                  <ul className="list-disc list-inside">
                    {resource.discussion_links.map((link, idx) => (
                      <li key={idx}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {link.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">
                    Video Tutorials:
                  </h3>
                  <ul className="list-disc list-inside">
                    {resource.video_tutorials.map((video, idx) => (
                      <li key={idx}>
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {video.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">
                    Common Mistakes:
                  </h3>
                  {resource.common_mistakes?.map((mistake, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-semibold">{mistake.mistake}</p>
                      <p>{mistake.explanation}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">
                    Real-World Applications:
                  </h3>
                  {resource.real_world_applications?.map((application, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-semibold">{application.application}</p>
                      <p>{application.description}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">
                    Interactive Diagrams:
                  </h3>
                  <ul className="list-disc list-inside">
                    {resource.interactive_diagrams.map((diagram, idx) => (
                      <li key={idx}>
                        <a
                          href={diagram.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {diagram.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">User Feedback:</h3>
                  {resource.user_feedback.map((feedback, idx) => (
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
