import React from "react";
import { FiPlayCircle } from "react-icons/fi";

const CourseCard = ({
  title,
  description,
  thumbnail,
  chapters,
  items,
  completed,
}) => (
  <div className="relative bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 transform hover:scale-105">
    <img
      src={thumbnail}
      alt="Course Thumbnail"
      className="rounded-lg w-full mb-4 object-cover"
    />
    <div className="space-y-2">
      <h4 className="text-xl font-bold text-gray-900">{title}</h4>
      <p className="text-sm text-gray-500">{description}</p>
      <div className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg">
        <FiPlayCircle size={24} />
      </div>
      <ProgressCircle completed={completed} />
    </div>
    <div className="mt-4 flex items-center text-gray-700">
      <span className="mr-4">{chapters} Chapters</span>
      <span>{items} Items</span>
    </div>
    <div className="mt-1 text-xs text-gray-500">{completed}% Completed</div>
  </div>
);

const ProgressCircle = ({ completed }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completed / 100) * circumference;

  return (
    <div className="relative mt-4 w-16 h-16">
      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
        <circle
          className="text-gray-300"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50%"
          cy="50%"
        />
        <circle
          className="text-indigo-600"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50%"
          cy="50%"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
        {completed}%
      </div>
    </div>
  );
};

export default CourseCard;
