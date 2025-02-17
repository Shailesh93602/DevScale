import { fetchData } from '@/app/services/fetchData';
import { difficulties, lengths } from '@/constants';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function CreateBattle({
  handleClose,
}: {
  handleClose: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [topics, setTopics] = useState<{ id: string; title: string }[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(
    difficulties.MEDIUM,
  );
  const [selectedLength, setSelectedLength] = useState<string>(lengths.MEDIUM);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleCreate = async () => {
    try {
      const response = await fetchData('POST', '/battles/create', {
        title,
        description,
        topicId: selectedTopic,
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
      } else {
        toast.error(data.message || 'Something went wrong, please try again.');
      }
      handleClose();
    } catch (error) {
      toast.error(
        (error as { message: string }).message ??
          'Something went wrong, Please try again!',
      );
    }
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      const response = await fetchData('GET', '/subjects');
      setSubjects(response.data || []);
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchTopics = async () => {
      const response = await fetchData(
        'GET',
        `/subjects/${selectedSubject}/topics`,
      );
      setTopics(response.data || []);
    };
    if (selectedSubject) fetchTopics();
    else setTopics([]);
  }, [selectedSubject]);

  return (
    <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
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
        rows={4}
        className="mb-4 w-full resize-none rounded-md border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
      />

      <select
        value={selectedSubject}
        onChange={(e) => setSelectedSubject(e.target.value)}
        className="mb-4 w-full rounded-md border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
      >
        <option value="">Select Subject</option>
        {subjects?.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.name}
          </option>
        ))}
      </select>
      <select
        value={selectedTopic}
        onChange={(e) => setSelectedTopic(e.target.value)}
        className="mb-4 w-full rounded-md border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
      >
        <option value="">Select Topic</option>
        {topics?.map((topic) => (
          <option key={topic.id} value={topic.id}>
            {topic.title}
          </option>
        ))}
      </select>
      <select
        value={selectedDifficulty}
        onChange={(e) => setSelectedDifficulty(e.target.value)}
        className="mb-4 w-full rounded-md border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
      >
        {Object.values(difficulties)?.map((difficulty) => (
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
        {Object.values(lengths)?.map((length) => (
          <option key={length} value={length}>
            {length}
          </option>
        ))}
      </select>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input
          type="date"
          name="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
        <input
          type="time"
          name="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>
      <button
        onClick={handleCreate}
        className="mt-6 w-full rounded-md bg-blue-500 py-3 text-white transition duration-200 hover:bg-blue-600"
      >
        Create Battle
      </button>
    </div>
  );
}
