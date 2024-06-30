"use client";
import React from "react";
import { Progress } from "@/components/ui/progress";

const AchievementsCard = ({ title, description, value }) => {
  const isCompleted = value === 100;
  const imageClass = value !== 100 ? "filter grayscale" : "";

  let level;
  if (value >= 90) {
    level = "complete";
  } else if (value >= 70) {
    level = "Level 2";
  } else if (value >= 50) {
    level = "Level 1";
  } else {
    level = "Level 0";
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 transition duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-100 cursor-pointer">
      <div className="flex items-center space-x-4">
        <div
          className={`w-12 h-12 flex items-center justify-center bg-blue-500 text-white rounded-full ${imageClass}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M6.293 6.293a1 1 0 0 1 1.414 0L10 8.586l2.293-2.293a1 1 0 1 1 1.414 1.414L11.414 10l2.293 2.293a1 1 0 0 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 0-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div className="flex flex-col flex-1">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">{description}</p>

          <div className="mt-4">
            <Progress value={value} />
          </div>
        </div>
        <div className="text-sm text-blue-500 mt-2">{level}</div>
      </div>
    </div>
  );
};

export default AchievementsCard;
