"use client";
import { fetchData } from "@/app/services/fetchData";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";

const sanitizeContent = (content) => {
  return DOMPurify.sanitize(content);
};

const Resource = ({ params }) => {
  const { id } = params;
  const [resource, setResource] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("Introduction");

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await fetchData("GET", "/resources/" + id);
        const data = response.data;
        console.log("🚀 ~ file: page.js:23 ~ fetchResource ~ data:", data);
        if (data.success) {
          setResource(data.resource.topics);
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
    <div className="flex flex-col md:flex-row min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="w-full md:w-1/4 p-5 bg-gray-100 dark:bg-gray-800 h-full md:sticky top-0 border-r dark:border-gray-700 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Topics
        </h2>
        <ul className="space-y-2">
          {resource.map((res, index) => (
            <li
              key={index}
              className={`cursor-pointer p-2 rounded transition duration-300 ${
                selectedTopic === res.name
                  ? "bg-blue-600 text-white dark:bg-blue-500"
                  : "hover:bg-gray-300 dark:hover:bg-gray-700"
              }`}
              onClick={() => setSelectedTopic(res.name)}
            >
              {res.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="w-full md:w-3/4 p-5 bg-gray-50 dark:bg-gray-900 text-black dark:text-white shadow-lg overflow-y-auto">
        {resource.map(
          (res, index) =>
            selectedTopic === res.name && (
              <div key={index} className="mb-6">
                <h2 className="text-3xl font-bold mb-4 border-b pb-2 border-gray-300 dark:border-gray-700">
                  {res.name}
                </h2>
                <div
                  className="mb-4"
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
