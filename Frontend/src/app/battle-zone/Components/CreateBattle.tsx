import { difficulties, lengths } from '@/constants';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';

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
  const [createBattle] = useAxiosPost<{ id: string }>(
    '/api/v1/api/battles/create',
  );
  const [getSubjects] = useAxiosGet<ISubject[]>('/api/subjects');
  const [getTopicsBySubjectId] = useAxiosGet<ITopic[]>(
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

      if (response.success && response.data?.id) {
        toast.success(response.message || 'Battle created successfully!');
        handleClose();
      } else {
        throw new Error(response.message || 'Failed to create battle');
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
      setSubjects(response?.data || []);
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchTopics = async () => {
      const response = await getTopicsBySubjectId(
        {},
        { subjectId: selectedSubject },
      );

      setTopics(response?.data || []);
    };
    if (selectedSubject) fetchTopics();
    else setTopics([]);
  }, [selectedSubject]);

  return (
    <div className="relative w-full max-w-lg rounded-lg bg-card p-6 shadow-lg">
      <input
        type="text"
        placeholder="Battle Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-4 w-full rounded-md border border-input bg-background p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <textarea
        placeholder="Battle Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        className="mb-4 w-full resize-none rounded-md border border-input bg-background p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <select
        value={selectedSubject}
        onChange={(e) => setSelectedSubject(e.target.value)}
        className="mb-4 w-full rounded-md border border-input bg-background p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
        className="mb-4 w-full rounded-md border border-input bg-background p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
        className="mb-4 w-full rounded-md border border-input bg-background p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
        className="mb-4 w-full rounded-md border border-input bg-background p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
          className="w-full rounded-md border border-input bg-background p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="time"
          name="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full rounded-md border border-input bg-background p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <Button onClick={handleCreate} className="mt-6 w-full py-6 text-lg">
        Create Battle
      </Button>
    </div>
  );
}
