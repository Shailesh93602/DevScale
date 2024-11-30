import { format, parse } from "date-fns";
import React from "react";

export default function BattleCard(props) {
  const { title, description, Topic, difficulty, length, date, time } =
    props.battle;
  return (
    <li className="bg-light shadow-md rounded-lg p-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <p>{description}</p>
      <p>
        <strong>Topic:</strong> {Topic.title}
      </p>
      <p>
        <strong>Difficulty:</strong> {difficulty}
      </p>
      <p>
        <strong>Length:</strong> {length}
      </p>
      <p>
        <strong>Date:</strong> {format(new Date(date), "yyyy-MM-dd")}
      </p>
      <p>
        <strong>Time:</strong>{" "}
        {format(parse(time, "HH:mm:ss", new Date()), "HH:mm")}
      </p>
    </li>
  );
}
