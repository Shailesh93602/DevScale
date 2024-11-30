"use client";
import { useEffect, useState } from "react";
import BattleCard from "../../components/BattleCard";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "@/lib/features/loader/loaderSlice";
import ChallengeCard from "./components/ChallengeCard";
import { fetchData } from "@/app/services/fetchData";
import Modal from "@/components/Modal";
import CreateBattle from "./Components/CreateBattle";
import { difficulties, lengths } from "@/constants";

export default function BattleZonePage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedLength, setSelectedLength] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [battles, setBattles] = useState([]);
  const [filteredBattles, setFilteredBattles] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
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
      } catch (error) {}
      dispatch(hideLoader());
    };

    fetchBattles();
  }, []);

  useEffect(() => {
    const filterBattles = () => {
      let filtered = battles;
      if (selectedDifficulty) {
        filtered = filtered.filter(
          (battle) =>
            battle.difficulty?.toLowerCase() ===
            selectedDifficulty?.toLowerCase()
        );
      }
      if (selectedLength) {
        filtered = filtered.filter(
          (battle) =>
            battle.length?.toLowerCase() === selectedLength?.toLowerCase()
        );
      }
      if (searchTerm) {
        filtered = filtered.filter(
          (battle) =>
            battle.title?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
            battle.username?.toLowerCase()?.includes(searchTerm?.toLowerCase())
        );
      }
      setFilteredBattles(filtered);
    };

    filterBattles();
  }, [selectedDifficulty, selectedLength, searchTerm, battles]);

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
    setIsOpen(true);
  };

  return (
    <div className="w-full mx-auto p-6">
      <div className="bg-lightSecondary shadow-2xl rounded-lg p-6">
        {isOpen && (
          <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title="Create Battle"
          >
            <CreateBattle handleClose={() => setIsOpen(false)} />
          </Modal>
        )}
        <h1 className="text-3xl font-bold text-dark mb-6">Battle Zone</h1>
        <ChallengeCard />
        <div className="flex flex-col items-center py-7">
          <div className="flex flex-col md:flex-row w-full mt-4">
            <input
              type="text"
              placeholder="Search battles by username or title..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="flex-grow p-3 mb-4 md:mb-0 md:mr-2 border border-border rounded-md bg-light text-dark focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <select
              value={selectedDifficulty}
              onChange={(e) => handleDifficultyChange(e.target.value)}
              className="w-full md:w-40 p-3 mb-4 md:mb-0 md:mr-2 border border-border rounded-md bg-light text-dark focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select Difficulty</option>
              {Object.values(difficulties).map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>
            <select
              value={selectedLength}
              onChange={(e) => handleLengthChange(e.target.value)}
              className="w-full md:w-40 p-3 border border-border rounded-md bg-light text-dark focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select Length</option>
              {Object.values(lengths).map((length) => (
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
          <p>No battles found for the selected filters.</p>
        )}

        <button
          onClick={handleCreateBattle}
          className="mt-6 py-2 px-4 bg-primary text-white rounded-md hover:bg-primary2 transition duration-200"
        >
          Create New Battle
        </button>
      </div>
    </div>
  );
}
