'use client';

import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useAxiosGet } from '@/hooks/useAxios';
import { useBattleStore } from '@/store/battleStore';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Battle, BattleFilters, BattleStatus } from '@/types/battle';
import { Button } from '@/components/ui/button';

// Lazy load components
const BattleCard = lazy(() => import('./BattleCard'));

interface ApiResponse {
  data: Battle[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface BattleListProps {
  initialFilters?: BattleFilters;
  onJoinBattle?: (battleId: string) => Promise<void>;
}

export const BattleList: React.FC<BattleListProps> = ({
  initialFilters,
  onJoinBattle,
}) => {
  const { toast } = useToast();
  const { filters, setFilters } = useBattleStore();
  const [searchTerm, setSearchTerm] = useState(filters.search);

  const [execute, state] = useAxiosGet<ApiResponse>('/api/battles');

  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
  }, [initialFilters, setFilters]);

  const fetchBattles = async () => {
    try {
      await execute({
        params: {
          ...filters,
          search: searchTerm,
        },
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch battles. Please try again.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchBattles();
  }, [filters]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters({ ...filters, search: value });
  };

  const handleStatusChange = (value: BattleStatus | 'all') => {
    setFilters({ ...filters, status: value });
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  const renderPagination = (data: ApiResponse) => {
    const { page, totalPages } = data.meta;
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search battles..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Battles</SelectItem>
            <SelectItem value="UPCOMING">Upcoming</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {state.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px]" />
          ))}
        </div>
      ) : state.data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {state.data.data.map((battle) => (
              <Suspense
                key={battle.id}
                fallback={<Skeleton className="h-[200px]" />}
              >
                <BattleCard battle={battle} onJoin={onJoinBattle} />
              </Suspense>
            ))}
          </div>
          {renderPagination(state.data)}
        </>
      ) : null}
    </div>
  );
};
