"use client";
import { fetchData } from "@/app/services/fetchData";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";
import { FaBars, FaTimes } from "react-icons/fa";

const sanitizeContent = (content) => {
  return DOMPurify.sanitize(content);
};

const Resource = ({ params }) => {
  const { id } = params;
  const [resource, setResource] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("Introduction");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await fetchData("GET", "/resources/" + id);
        const data = response.data;
        if (data.success) {
          setResource(data.resource.topics);
          if (data.resource.topics.length > 0) {
            setSelectedTopic(data.resource.topics[0].name);
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

  if (!resource.length) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
                selectedTopic === res.name
                  ? "bg-blue-600 text-white shadow-md transform scale-105"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-md"
              }`}
              onClick={() => {
                setSelectedTopic(res.name);
                setSidebarOpen(false);
              }}
            >
              {res.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Main content */}
      <div className="w-full md:w-9/12 lg:w-10/12 p-5 md:p-10 overflow-y-auto">
        {resource.map(
          (res, index) =>
            selectedTopic === res.name && (
              <div
                key={index}
                className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 transition-all duration-300 hover:shadow-2xl"
              >
                <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200 border-b pb-2 border-gray-200 dark:border-gray-700">
                  {res.name}
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
