"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { fetchData } from "@/utils/fetchData";

const majorTopics = ["DSA", "OOPs", "JavaScript", "Python", "Java"];
const difficulties = ["easy", "medium", "hard"];
const lengths = ["short", "medium", "long"];

export default function CreateBattlePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMajorTopic, setSelectedMajorTopic] = useState(majorTopics[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(difficulties[0]);
  const [selectedLength, setSelectedLength] = useState(lengths[0]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const router = useRouter();

  const handleCreate = async () => {
    try {
      const response = await fetchData(
        "POST",
        "/battles/create",
        JSON.stringify({
          title,
          description,
          topic: selectedMajorTopic,
          difficulty: selectedDifficulty.toLowerCase(),
          length: selectedLength.toLowerCase(),
          date,
          time,
        })
      );
      if (!response.data) {
        console.log(
          "🚀 ~ file: page.jsx:38 ~ handleCreate ~ data:",
          response.data
        );
        return;
      }

      const data = response.data;
      if (data.success) {
        toast.success(data.message);
        router.push("/battle-zone");
      } else {
        console.log(
          "🚀 ~ file: page.jsx:52 ~ handleCreate ~ message:",
          data.message
        );
      }
    } catch (error) {
      console.log("🚀 ~ file: page.jsx:53 ~ handleCreate ~ error:", error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 mx-auto p-6 max-w-lg">
      <div className="bg-blue-50 dark:bg-gray-900 shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Create New Battle
        </h1>
        <input
          type="text"
          placeholder="Battle Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          placeholder="Battle Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
        <select
          value={selectedMajorTopic}
          onChange={(e) => setSelectedMajorTopic(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Input
          type="time"
          name="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleCreate}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
        >
          Create Battle
        </button>
      </div>
    </div>
  );
}
