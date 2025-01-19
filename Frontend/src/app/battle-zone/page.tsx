"use client";
import { useEffect, useState } from "react";
import BattleCard from "./Components/BattleCard";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "@/lib/features/loader/loaderSlice";
import ChallengeCard from "./Components/ChallengeCard";
import { fetchData } from "@/app/services/fetchData";
import Modal from "@/components/Modal";
import CreateBattle from "./Components/CreateBattle";
import { difficulties, lengths } from "@/constants";
import { Button } from "@/components/ui/button";

export default function BattleZonePage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedLength, setSelectedLength] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [battles, setBattles] = useState<
    {
      id: string;
      username: string;
      title: string;
      description: string;
      Topic: { title: string };
      difficulty: string;
      length: string;
      date: string;
      time: string;
    }[]
  >([]);
  const [filteredBattles, setFilteredBattles] = useState<
    {
      id: string;
      username: string;
      title: string;
      description: string;
      Topic: { title: string };
      difficulty: string;
      length: string;
      date: string;
      time: string;
    }[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();

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
      console.error(error);
    }
    dispatch(hideLoader());
  };

  useEffect(() => {
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

  const handleDifficultyChange = (value: string) => {
    setSelectedDifficulty(value);
  };

  const handleLengthChange = (value: string) => {
    setSelectedLength(value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateBattle = () => {
    setIsOpen(true);
  };

  return (
    <div className="p-5 py-10">
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
      <div className="flex mx-auto w-max">
        <ChallengeCard />
      </div>
      <div className="flex flex-col items-center py-7 bg-lightSecondary px-8 rounded-md mt-5">
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
        <div className="flex flex-col bg-lightSecondary p-4">
          <h3 className="text-xl font-bold text-center py-4">
            Available Battles
          </h3>
          <div className="flex gap-4 justify-center flex-wrap">
            {filteredBattles.map((battle) => (
              <BattleCard key={battle.id} battle={battle} />
            ))}
          </div>
          <Button
            onClick={handleCreateBattle}
            className="mt-6 py-2 px-4 bg-primary text-white rounded-md hover:bg-primary2 transition duration-200 self-end"
          >
            Create New Battle
          </Button>
        </div>
      ) : (
        <p>No battles found for the selected filters.</p>
      )}
    </div>
  );
}
