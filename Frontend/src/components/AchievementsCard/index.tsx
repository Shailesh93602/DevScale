'use client';
import React from 'react';
import { Progress } from '@/components/ui/progress';

const AchievementsCard = ({
  title,
  description,
  value,
}: {
  title: string;
  description: string;
  value: number;
}) => {
  const imageClass = value !== 100 ? 'filter grayscale' : '';

  let level;
  if (value >= 90) {
    level = 'complete';
  } else if (value >= 70) {
    level = 'Level 2';
  } else if (value >= 50) {
    level = 'Level 1';
  } else {
    level = 'Level 0';
  }

  return (
    <div className="transform cursor-pointer rounded-lg bg-white p-6 shadow-lg transition duration-300 ease-in-out hover:scale-105 hover:bg-gray-100">
      <div className="flex items-center space-x-4">
        <div
          className={`bg-blue-500 flex h-12 w-12 items-center justify-center rounded-full text-white ${imageClass}`}
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

        <div className="flex flex-1 flex-col">
          <h2 className="mb-2 text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600">{description}</p>

          <div className="mt-4">
            <Progress value={value} />
          </div>
        </div>
        <div className="text-blue-500 mt-2 text-sm">{level}</div>
      </div>
    </div>
  );
};

export default AchievementsCard;
