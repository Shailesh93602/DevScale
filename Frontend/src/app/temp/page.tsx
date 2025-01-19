"use client";
import { useState } from "react";

const ProgressTracker = () => {
  const chapters = 10;
  const items = 100;
  const [completedChapters, setCompletedChapters] = useState(5);
  const [completedItems, setCompletedItems] = useState(25);

  const totalProgress = Math.round(
    ((completedChapters + completedItems) / (chapters + items)) * 100
  );

  return (
    <div className="progress-tracker">
      <h3 className="text-xl font-bold">Progress Tracker</h3>
      <p>
        Chapters: {completedChapters}/{chapters}
      </p>
      <p>
        Items: {completedItems}/{items}
      </p>
      <div className="progress-bar">
        <div className="progress" style={{ width: `${totalProgress}%` }}>
          {totalProgress}%
        </div>
      </div>
      <button onClick={() => setCompletedChapters(completedChapters + 1)}>
        Complete Chapter
      </button>
      <button onClick={() => setCompletedItems(completedItems + 1)}>
        Complete Item
      </button>
    </div>
  );
};

export default ProgressTracker;
