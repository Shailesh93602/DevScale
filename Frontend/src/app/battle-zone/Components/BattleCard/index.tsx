import { format, parse } from "date-fns";
import React from "react";

const capitalize = (s: string) => {
  return s?.charAt(0)?.toUpperCase() + s?.slice(1);
};

export default function BattleCard(props: {
  battle: {
    title: string;
    description: string;
    Topic: { title: string };
    difficulty: string;
    length: string;
    date: string;
    time: string;
  };
}) {
  const { title, description, Topic, difficulty, length, date, time } =
    props.battle;
  return (
    <div className="bg-light shadow-md rounded-lg p-4 text-center">
      <h2 className="text-xl font-bold">{capitalize(title)}</h2>
      <p>{capitalize(description)}</p>
      <p>
        <strong>Topic:</strong>
        {capitalize(Topic?.title)}
      </p>
      <p>
        <strong>Difficulty:</strong> {capitalize(difficulty)}
      </p>
      <p>
        <strong>Length:</strong> {capitalize(length)}
      </p>
      <p>
        <strong>Date:</strong> {format(new Date(date), "yyyy-MM-dd")}
      </p>
      <p>
        <strong>Time:</strong>{" "}
        {format(parse(time, "HH:mm:ss", new Date()), "HH:mm")}
      </p>
    </div>
  );
}
