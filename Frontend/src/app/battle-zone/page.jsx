"use client";
import { useEffect, useState } from "react";
import BattleTopics from "../../components/BattleTopics";
import BattleCard from "../../components/BattleCard";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "@/lib/features/loader/loaderSlice";
import ChallangeCard from "../../components/ChallangeCard";
import { fetchData } from "@/utils/fetchData";

export default function BattleZonePage() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedLength, setSelectedLength] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [battles, setBattles] = useState([]);
  const [filteredBattles, setFilteredBattles] = useState([]);
  const topics = ["DSA", "Sorting Algorithms", "C", "JavaScript"];
  const difficulties = ["Easy", "Medium", "Hard"];
  const lengths = ["Short", "Medium", "Long"];
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchBattles = async () => {
      dispatch(showLoader());
      try {
        const response = await fetchData("GET", "/battles");
        if (!response.data) {
          throw new Error("Failed to fetch battles");
        }
        const data = response.data;
        if (data.success) {
          setBattles(data.battles);
          setFilteredBattles(data.battles);
        }
      } catch (error) {
        console.log("🚀 ~ file: page.jsx:38 ~ fetchBattles ~ error:", error);
      }
      dispatch(hideLoader());
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
    <div className="bg-white w-full dark:bg-gray-800 mx-auto p-6">
      <div className="bg-blue-50 dark:bg-gray-900 shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Battle Zone
        </h1>
        <ChallangeCard />
        <div className="flex flex-col items-center pt-7">
          <BattleTopics
            topics={topics}
            selectedTopic={selectedTopic}
            onChange={handleTopicChange}
          />
          <div className="flex flex-col md:flex-row w-full mt-4">
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
