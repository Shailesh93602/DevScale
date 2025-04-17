import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { BattleFilters } from '@/types/battle';

export interface Battle {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  participants: number;
  maxParticipants: number;
  startTime: string;
  endTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
}

interface BattleState {
  battles: Battle[];
  currentBattle: Battle | null;
  isLoading: boolean;
  error: string | null;
  filters: BattleFilters;
  setBattles: (battles: Battle[]) => void;
  setCurrentBattle: (battle: Battle | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<BattleFilters>) => void;
  resetFilters: () => void;
}

const initialFilters: BattleFilters = {
  search: '',
  status: 'all',
  difficulty: 'all',
  category: '',
  page: 1,
  limit: 12,
};

export const useBattleStore = create<BattleState>()(
  devtools(
    persist(
      (set) => ({
        battles: [],
        currentBattle: null,
        isLoading: false,
        error: null,
        filters: initialFilters,
        setBattles: (battles: Battle[]) => set({ battles }),
        setCurrentBattle: (battle: Battle | null) =>
          set({ currentBattle: battle }),
        setLoading: (isLoading: boolean) => set({ isLoading }),
        setError: (error: string | null) => set({ error }),
        setFilters: (newFilters) =>
          set((state) => ({
            filters: { ...state.filters, ...newFilters },
          })),
        resetFilters: () => set({ filters: initialFilters }),
      }),
      {
        name: 'battle-storage',
      },
    ),
  ),
);
