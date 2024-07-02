import React from "react";

export default function BattleCard({ battle }) {
  return (
    <li className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        {battle.title}
      </h2>
      <p className="text-gray-700 dark:text-gray-300">{battle.description}</p>
      <p className="text-gray-700 dark:text-gray-300">
        <strong>Topic:</strong> {battle.topic}
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        <strong>Difficulty:</strong> {battle.difficulty}
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        <strong>Length:</strong> {battle.length}
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        <strong>Date:</strong> {battle.date}
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        <strong>Time:</strong> {battle.time}
      </p>
    </li>
  );
}
