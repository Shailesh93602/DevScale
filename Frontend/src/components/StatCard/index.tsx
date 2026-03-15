import React, { ReactNode } from 'react';

const StatCard = ({
  title,
  content,
  progress,
  color,
}: {
  title: string;
  content: ReactNode;
  progress?: number;
  color: string;
}) => (
  <div
    className={`p-6 bg-${color}-500 transform rounded-lg text-white shadow-md transition-shadow duration-300 hover:scale-105 hover:shadow-xl`}
  >
    <h3 className="text-xl font-semibold">{title}</h3>
    <div className="mt-2">{content}</div>
    {Boolean(progress) && (
      <div className="mt-4">
        <div className="h-2 rounded-full bg-gray-300">
          <div
            className={`h-full bg-${color}-700 rounded-full`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    )}
  </div>
);

export default StatCard;
