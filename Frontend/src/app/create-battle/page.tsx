'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Input } from '@/components/ui/input';
import { fetchData } from '@/app/services/fetchData';

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

  const handleCreate = async () => {
    try {
      const response = await fetchData('POST', '/battles/create', {
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
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mx-auto max-w-lg bg-white p-6 dark:bg-gray-800">
      <div className="rounded-lg bg-blue-50 p-6 shadow-md dark:bg-gray-900">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
          Create New Battle
        </h1>
        <input
          type="text"
          placeholder="Battle Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4 w-full rounded-md border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
        <textarea
          placeholder="Battle Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mb-4 w-full rounded-md border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        ></textarea>
        <select
          value={selectedMajorTopic}
          onChange={(e) => setSelectedMajorTopic(e.target.value)}
          className="mb-4 w-full rounded-md border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          {majorTopics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="mb-4 w-full rounded-md border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          {difficulties.map((difficulty) => (
            <option key={difficulty} value={difficulty}>
              {difficulty}
            </option>
          ))}
        </select>
        <select
          value={selectedLength}
          onChange={(e) => setSelectedLength(e.target.value)}
          className="mb-4 w-full rounded-md border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
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
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mb-4 w-full rounded-md border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
        <Input
          type="time"
          name="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="mb-4 w-full rounded-md border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
        <button
          onClick={handleCreate}
          className="w-full rounded-md bg-blue-500 px-4 py-2 text-white transition duration-200 hover:bg-blue-600"
        >
          Create Battle
        </button>
      </div>
    </div>
  );
}
