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
  <div className="relative bg-lightSecondary rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 transform hover:scale-105">
    <img
      src={thumbnail}
      alt="Course Thumbnail"
      className="rounded-lg w-[400px] h-[150px] mb-4 object-cover"
    />

    <div className="space-y-2">
      <h4 className="text-xl font-bold">{title}</h4>
      <p className="text-sm text-grayText">{description}</p>
      <div className="absolute top-0 right-2 flex items-center justify-center w-12 h-12 bg-primary text-white rounded-full shadow-lg">
        <FiPlayCircle size={24} />
      </div>
      <ProgressCircle completed={completed} size={24} />
    </div>
    <div className="mt-4 flex items-center">
      <span className="mr-4">{chapters} Chapters</span>
      <span>{items} Items</span>
    </div>
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
          className="text-primary"
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
      <div className="absolute inset-0 flex items-center justify-center text-primary">
        {completed}%
      </div>
    </div>
  );
};

export default CourseCard;
