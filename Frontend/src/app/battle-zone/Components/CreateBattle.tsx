import { difficulties, lengths } from '@/constants';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface ISubject {
  id: string;
  name: string;
}

interface ITopic {
  id: string;
  title: string;
}

export default function CreateBattle({
  handleClose,
}: {
  handleClose: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [topics, setTopics] = useState<ITopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(
    difficulties.MEDIUM,
  );
  const [selectedLength, setSelectedLength] = useState<string>(lengths.MEDIUM);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [createBattle] = useAxiosPost<{
    success?: boolean;
    message?: string;
    data?: {
      id: string;
    };
  }>('/api/v1/api/battles/create');
  const [getSubjects] = useAxiosGet<{ data: ISubject[] }>('/api/subjects');
  const [getTopicsBySubjectId] = useAxiosGet<{ data: ITopic[] }>(
    '/api/subjects/{{subjectId}}/topics',
  );

  const handleCreate = async () => {
    if (!title || !description || !selectedTopic || !date || !time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await createBattle({
        title,
        description,
        topic_id: selectedTopic,
        difficulty: selectedDifficulty.toLowerCase(),
        length: selectedLength.toLowerCase(),
        start_time: combineDateTime(date, time),
        end_time: calculateEndTime(date, time),
        max_participants: 10, // Default value
        points_per_question: 10, // Default value
        time_per_question: 30, // Default value
        total_questions: 10, // Default value
        type: 'SCHEDULED',
      });

      if (!response.data) {
        throw new Error('No response data received');
      }

      const data = response.data;
      if (data.success && data.data?.id) {
        toast.success(data.message || 'Battle created successfully!');
        handleClose();
      } else {
        throw new Error(data.message || 'Failed to create battle');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Something went wrong, please try again.';
      toast.error(errorMessage);
      console.error('Battle creation error:', error);
    }
  };

  // Helper function to combine date and time
  const combineDateTime = (dateStr: string, timeStr: string): string => {
    if (!dateStr || !timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const date = new Date(dateStr);
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    return date.toISOString();
  };

  // Helper function to calculate end time
  const calculateEndTime = (dateStr: string, timeStr: string): string => {
    const startTime = new Date(combineDateTime(dateStr, timeStr));
    // Default battle duration: 1 hour
    startTime.setHours(startTime.getHours() + 1);
    return startTime.toISOString();
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      const response = await getSubjects();
      setSubjects(response?.data?.data || []);
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchTopics = async () => {
      const response = await getTopicsBySubjectId(
        {},
        { subjectId: selectedSubject },
      );

      setTopics(response?.data?.data || []);
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
