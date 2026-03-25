import React from 'react';

const BattleTopics = ({
  topics,
  selectedTopic,
  onChange,
}: {
  topics: string[];
  selectedTopic: string;
  onChange: (topic: string) => void;
}) => {
  return (
    <div className="mb-4 flex flex-wrap gap-1">
      {topics.map((topic) => (
        <button
          key={topic}
          onClick={() => onChange(topic)}
          className={`rounded-3xl px-4 py-2 ${
            selectedTopic === topic
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`}
        >
          {topic}
        </button>
      ))}
    </div>
  );
};

export default BattleTopics;
