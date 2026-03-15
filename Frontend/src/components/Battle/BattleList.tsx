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

// Pagination meta data structure
interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

  const [execute, state] = useAxiosGet<Battle[]>('/battles');

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

  const renderPagination = () => {
    if (!state.meta?.pagination) return null;
    const { currentPage: page, lastPage: totalPages } = state.meta.pagination;
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
      ) : state.data && state.data.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {state.data.map((battle) => (
              <Suspense
                key={battle.id}
                fallback={<Skeleton className="h-[200px]" />}
              >
                <BattleCard battle={battle} onJoin={onJoinBattle} />
              </Suspense>
            ))}
          </div>
          {renderPagination()}
        </>
      ) : (
        <div className="border-primary/20 col-span-full rounded-xl border border-dashed bg-card py-16 text-center shadow-inner">
          <div className="mx-auto flex max-w-[400px] flex-col items-center justify-center p-4">
            <div className="bg-primary/10 mb-4 flex h-20 w-20 items-center justify-center rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
                <line x1="13" y1="19" x2="19" y2="13" />
                <line x1="16" y1="16" x2="20" y2="20" />
                <line x1="19" y1="21" x2="21" y2="19" />
                <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
                <line x1="5" y1="14" x2="9" y2="18" />
                <line x1="7" y1="17" x2="4" y2="20" />
                <line x1="3" y1="19" x2="5" y2="21" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold tracking-tight">
              No battles found
            </h3>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              We couldn't find any battles matching your criteria. Be the first
              to start a new challenge!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
