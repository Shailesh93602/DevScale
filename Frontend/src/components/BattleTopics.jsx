import React from "react";

const BattleTopics = ({ topics, selectedTopic, onChange }) => {
  return (
    <div className="flex flex-wrap gap-1 mb-4">
      {topics.map((topic) => (
        <button
          key={topic}
          onClick={() => onChange(topic)}
          className={`py-2 px-4 rounded-3xl ${
            selectedTopic === topic
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          }`}
        >
          {topic}
        </button>
      ))}
    </div>
  );
};

export default BattleTopics;
