import React from 'react';
import { Button } from '@/components/ui/button';

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
    <div className="mb-4 flex flex-wrap gap-2">
      {topics.map((topic) => (
        <Button
          key={topic}
          onClick={() => onChange(topic)}
          variant={selectedTopic === topic ? 'default' : 'secondary'}
          className="rounded-full"
        >
          {topic}
        </Button>
      ))}
    </div>
  );
};

export default BattleTopics;
