import { fetchData } from "@/app/services/fetchData";
import { difficulties, lengths } from "@/constants";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function CreateBattle({ handleClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState(
    difficulties.MEDIUM
  );
  const [selectedLength, setSelectedLength] = useState(lengths.MEDIUM);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleCreate = async () => {
    try {
      const response = await fetchData("POST", "/battles/create", {
        title,
        description,
        topicId: selectedTopic,
        difficulty: selectedDifficulty.toLowerCase(),
        length: selectedLength.toLowerCase(),
        date,
        time,
      });
      console.log(response);
      if (!response.data) {
        return;
      }

      const data = response.data;
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message || "Something went wrong, please try again.");
      }
      handleCLose();
    } catch (error) {
      toast.error(error.message || "Something went wrong, Please try again!");
    }
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      const response = await fetchData("GET", "/subjects");
      setSubjects(response.data || []);
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchTopics = async () => {
      const response = await fetchData(
        "GET",
        `/subjects/${selectedSubject}/topics`
      );
      setTopics(response.data || []);
    };
    if (selectedSubject) fetchTopics();
    else setTopics([]);
  }, [selectedSubject]);

  return (
    <div className="relative max-w-lg w-full bg-white dark:bg-gray-900 shadow-lg rounded-lg p-6">
      <input
        type="text"
        placeholder="Battle Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-4 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <textarea
        placeholder="Battle Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows="4"
        className="w-full mb-4 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />

      <select
        value={selectedSubject}
        onChange={(e) => setSelectedSubject(e.target.value)}
        className="w-full mb-4 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        className="w-full mb-4 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        className="w-full mb-4 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        className="w-full mb-4 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {Object.values(lengths)?.map((length) => (
          <option key={length} value={length}>
            {length}
          </option>
        ))}
      </select>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="date"
          name="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="time"
          name="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        onClick={handleCreate}
        className="w-full py-3 mt-6 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
      >
        Create Battle
      </button>
    </div>
  );
}
