"use client";
import { useEffect, useState } from "react";
import BattleTopics from "../../components/BattleTopics";
import BattleCard from "../../components/BattleCard";
import { useRouter } from "next/navigation";

export default function BattleZonePage() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedLength, setSelectedLength] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [battles, setBattles] = useState([]);
  const [filteredBattles, setFilteredBattles] = useState(battles);
  const topics = ["DSA", "Sorting Algorithms", "C", "JavaScript"];
  const difficulties = ["Easy", "Medium", "Hard"];
  const lengths = ["Short", "Medium", "Long"];

  useEffect(() => {
    const fetchBattles = async () => {
      try {
        const response = await fetch(
          "https://mrengineersapi.vercel.app/battles",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: localStorage.getItem("token"),
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch battles");
        }
        console.log(response);
        const json = await response.json();
        console.log(json);
        if (json.success) {
          setBattles(json.battles);
          setFilteredBattles(json.battles);
        }
      } catch (error) {
        console.error("Error fetching battles:", error);
      }
    };

    fetchBattles();
  }, []);

  useEffect(() => {
    const filterBattles = () => {
      let filtered = battles;
      if (selectedTopic) {
        filtered = filtered.filter((battle) =>
          battle.topic.toLowerCase().includes(selectedTopic.toLowerCase())
        );
      }
      if (selectedDifficulty) {
        filtered = filtered.filter(
          (battle) =>
            battle.difficulty.toLowerCase() === selectedDifficulty.toLowerCase()
        );
      }
      if (selectedLength) {
        filtered = filtered.filter(
          (battle) =>
            battle.length.toLowerCase() === selectedLength.toLowerCase()
        );
      }
      if (searchTerm) {
        filtered = filtered.filter(
          (battle) =>
            battle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            battle.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      setFilteredBattles(filtered);
    };

    filterBattles();
  }, [selectedTopic, selectedDifficulty, selectedLength, searchTerm, battles]);

  const handleTopicChange = (value) => {
    setSelectedTopic(value);
  };

  const handleDifficultyChange = (value) => {
    setSelectedDifficulty(value);
  };

  const handleLengthChange = (value) => {
    setSelectedLength(value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateBattle = () => {
    router.push("/create-battle");
  };

  return (
    <div className="bg-white w-full max-w-[90vw] dark:bg-gray-800 mx-auto p-6">
      <div className="bg-blue-50 dark:bg-gray-900 shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Battle Zone
        </h1>
        <div className="flex flex-col w-full items-center mb-4">
          <BattleTopics
            topics={topics}
            selectedTopic={selectedTopic}
            onChange={handleTopicChange}
          />
          <div className="flex flex-col md:flex-row w-full md:ml-4 mt-4 md:mt-0">
            <input
              type="text"
              placeholder="Search battles by username or title..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="flex-grow p-3 mb-4 md:mb-0 md:mr-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedDifficulty}
              onChange={(e) => handleDifficultyChange(e.target.value)}
              className="w-full md:w-40 p-3 mb-4 md:mb-0 md:mr-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Difficulty</option>
              {difficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>
            <select
              value={selectedLength}
              onChange={(e) => handleLengthChange(e.target.value)}
              className="w-full md:w-40 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Length</option>
              {lengths.map((length) => (
                <option key={length} value={length}>
                  {length}
                </option>
              ))}
            </select>
          </div>
        </div>
        {filteredBattles.length > 0 ? (
          <ul className="space-y-6">
            {filteredBattles.map((battle) => (
              <BattleCard key={battle.id} battle={battle} />
            ))}
          </ul>
        ) : (
          <p className="text-gray-700 dark:text-gray-300">
            No battles found for the selected filters.
          </p>
        )}
        <button
          onClick={handleCreateBattle}
          className="mt-6 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
        >
          Create New Battle
        </button>
      </div>
    </div>
  );
}
