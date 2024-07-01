"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";

const majorTopics = ["DSA", "OOPs", "JavaScript", "Python", "Java"];
const difficulties = ["easy", "medium", "hard"];
const lengths = ["short", "medium", "long"];

export default function CreateBattlePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMajorTopic, setSelectedMajorTopic] = useState(majorTopics[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(difficulties[0]);
  const [selectedLength, setSelectedLength] = useState(lengths[0]);
  const router = useRouter();

  const handleCreate = async () => {
    try {
      const response = await fetch(
        "https://mrengineersapi.vercel.app/battles/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token"),
          },
          body: JSON.stringify({
            title,
            description,
            topic: selectedMajorTopic,
            difficulty: selectedDifficulty.toLowerCase(),
            length: selectedLength.toLocaleLowerCase(),
          }),
        }
      );
      if (!response.ok) {
        console.error("Failed to create battle");
      }

      const json = await response.json();
      console.log(json);
      if (json.success) {
        toast.success(json.message);
        router.push("/battle-zone");
      } else {
        toast.error(json.message);
      }
    } catch (error) {
      console.error("Error creating battle:", error);
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
          startDate={new Date()}
          className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Input
          type="time"
          name="time"
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
