'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAxiosPost } from '@/hooks/useAxios';

const majorTopics = ['DSA', 'OOPs', 'JavaScript', 'Python', 'Java'];
const difficulties = ['easy', 'medium', 'hard'];
const lengths = ['short', 'medium', 'long'];

export default function CreateBattlePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMajorTopic, setSelectedMajorTopic] = useState(majorTopics[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(difficulties[0]);
  const [selectedLength, setSelectedLength] = useState(lengths[0]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const router = useRouter();
  const [createBattle] = useAxiosPost<{
    success?: boolean;
    message?: string;
  }>('/battles/create');

  const handleCreate = async () => {
    try {
      const response = await createBattle({
        title,
        description,
        topic: selectedMajorTopic,
        difficulty: selectedDifficulty.toLowerCase(),
        length: selectedLength.toLowerCase(),
        date,
        time,
      });
      if (!response.data) {
        return;
      }

      const data = response.data;
      if (data.success) {
        toast.success(data.message);
        router.push('/battle-zone');
      }
    } catch {
      toast.error('Failed to create battle. Please try again.');
    }
  };

  return (
    <div className="mx-auto max-w-lg bg-background p-6">
      <div className="rounded-lg bg-card p-6 shadow-md">
        <h1 className="mb-6 text-3xl font-bold text-foreground">
          Create New Battle
        </h1>
        <input
          type="text"
          placeholder="Battle Title"
          aria-label="Battle Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4 w-full rounded-md border border-input bg-background p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <textarea
          placeholder="Battle Description"
          aria-label="Battle Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mb-4 w-full rounded-md border border-input bg-background p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        ></textarea>
        <select
          value={selectedMajorTopic}
          aria-label="Select Major Topic"
          onChange={(e) => setSelectedMajorTopic(e.target.value)}
          className="mb-4 w-full rounded-md border border-input bg-background p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {majorTopics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
        <select
          value={selectedDifficulty}
          aria-label="Select Difficulty"
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="mb-4 w-full rounded-md border border-input bg-background p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {difficulties.map((difficulty) => (
            <option key={difficulty} value={difficulty}>
              {difficulty}
            </option>
          ))}
        </select>
        <select
          value={selectedLength}
          aria-label="Select Length"
          onChange={(e) => setSelectedLength(e.target.value)}
          className="mb-4 w-full rounded-md border border-input bg-background p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {lengths.map((length) => (
            <option key={length} value={length}>
              {length}
            </option>
          ))}
        </select>
        <Input
          type="date"
          name="date"
          aria-label="Battle Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mb-4 w-full rounded-md border border-input bg-background p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Input
          type="time"
          name="time"
          aria-label="Battle Time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="mb-4 w-full rounded-md border border-input bg-background p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button onClick={handleCreate} className="w-full">
          Create Battle
        </Button>
      </div>
    </div>
  );
}
