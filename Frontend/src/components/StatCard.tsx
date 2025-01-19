import React, { ReactNode } from "react";

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
    className={`p-6 bg-${color}-500 text-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:scale-105`}
  >
    <h3 className="text-xl font-semibold">{title}</h3>
    <div className="mt-2">{content}</div>
    {Boolean(progress) && (
      <div className="mt-4">
        <div className="h-2 bg-gray-300 rounded-full">
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
