'use client';
import { useEffect, useState } from 'react';
import BattleCard from './Components/BattleCard';
import { useDispatch } from 'react-redux';
import { hideLoader, showLoader } from '@/lib/features/loader/loaderSlice';
import ChallengeCard from './Components/ChallengeCard';
import { fetchData } from '@/app/services/fetchData';
import Modal from '@/components/Modal';
import CreateBattle from './Components/CreateBattle';
import { difficulties, lengths } from '@/constants';
import { Button } from '@/components/ui/button';

export default function BattleZonePage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedLength, setSelectedLength] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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
    dispatch(showLoader('fetching battles'));
    try {
      const response = await fetchData('GET', '/battles');
      if (!response.data) {
        throw new Error('Failed to fetch battles');
      }
      const data = response.data;
      if (data.success) {
        setBattles(data.battles);
        setFilteredBattles(data.battles);
      }
    } catch (error) {
      console.error(error);
    }
    dispatch(hideLoader('fetching battles'));
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
            selectedDifficulty?.toLowerCase(),
        );
      }
      if (selectedLength) {
        filtered = filtered.filter(
          (battle) =>
            battle.length?.toLowerCase() === selectedLength?.toLowerCase(),
        );
      }
      if (searchTerm) {
        filtered = filtered.filter(
          (battle) =>
            battle.title?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
            battle.username?.toLowerCase()?.includes(searchTerm?.toLowerCase()),
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
      <h1 className="mb-6 text-3xl font-bold text-dark">Battle Zone</h1>
      <div className="mx-auto flex w-max">
        <ChallengeCard />
      </div>
      <div className="mt-5 flex flex-col items-center rounded-md bg-lightSecondary px-8 py-7">
        <div className="mt-4 flex w-full flex-col md:flex-row">
          <input
            type="text"
            placeholder="Search battles by username or title..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="mb-4 flex-grow rounded-md border border-border bg-light p-3 text-dark focus:outline-none focus:ring-2 focus:ring-ring md:mb-0 md:mr-2"
          />
          <select
            value={selectedDifficulty}
            onChange={(e) => handleDifficultyChange(e.target.value)}
            className="mb-4 w-full rounded-md border border-border bg-light p-3 text-dark focus:outline-none focus:ring-2 focus:ring-ring md:mb-0 md:mr-2 md:w-40"
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
            className="w-full rounded-md border border-border bg-light p-3 text-dark focus:outline-none focus:ring-2 focus:ring-ring md:w-40"
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
          <h3 className="py-4 text-center text-xl font-bold">
            Available Battles
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {filteredBattles.map((battle) => (
              <BattleCard key={battle.id} battle={battle} />
            ))}
          </div>
          <Button
            onClick={handleCreateBattle}
            className="mt-6 self-end rounded-md bg-primary px-4 py-2 text-white transition duration-200 hover:bg-primary2"
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
