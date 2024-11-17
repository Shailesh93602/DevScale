import { format, parse } from "date-fns";
import React from "react";

export default function BattleCard(props) {
  const { title, description, Topic, difficulty, length, date, time } =
    props.battle;
  return (
    <li className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      <p className="text-gray-700 dark:text-gray-300">{description}</p>
      <p className="text-gray-700 dark:text-gray-300">
        <strong>Topic:</strong> {Topic.title}
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        <strong>Difficulty:</strong> {difficulty}
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        <strong>Length:</strong> {length}
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        <strong>Date:</strong> {format(new Date(date), "yyyy-MM-dd")}
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        <strong>Time:</strong>{" "}
        {format(parse(time, "HH:mm:ss", new Date()), "HH:mm")}
      </p>
    </li>
  );
}
